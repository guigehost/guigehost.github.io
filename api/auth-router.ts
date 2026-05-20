import "dotenv/config";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery, adminQuery } from "./middleware";
import {
  findUserByUsername,
  findUserByEmail,
  updateLastSignIn,
  createUser,
  updateVerificationCode,
  verifyEmailCode,
  activateUser,
  updatePassword,
  findUserById,
  deductTuPoints,
  addTuPoints,
} from "./queries/users";
import {
  createPointLog,
  getPointLogsByUser,
  getTodayCheckin,
  createCheckinLog,
  getCheckinStats,
} from "./queries/pointLogs";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";
import {
  generateVerificationCode,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./lib/email";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";

async function setSessionCookie(ctx: any, userId: number) {
  const token = await signSessionToken({ userId });
  const opts = getSessionCookieOptions(ctx.req.headers);
  ctx.resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Math.floor(Session.maxAgeMs / 1000),
    })
  );
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => {
    const u = opts.ctx.user;
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
      role: u.role,
      emailVerified: u.emailVerified,
      tuPoints: u.tuPoints,
      registeredAt: u.registeredAt,
    };
  }),

  // --- Register: Step 1 - send verification code ---
  register: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6).max(128),
        nickname: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await findUserByEmail(input.email);
      if (existing?.emailVerified) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "该邮箱已注册，请直接登录",
        });
      }

      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      if (existing) {
        await updateVerificationCode(input.email, code, expiresAt);
      } else {
        const passwordHash = await bcrypt.hash(input.password, 12);
        await createUser({
          username: input.email.split("@")[0] + "_" + Date.now(),
          email: input.email.toLowerCase(),
          passwordHash,
          name: input.nickname,
          emailVerified: false,
          tuPoints: 0,
        });
        await updateVerificationCode(input.email, code, expiresAt);
      }

      try {
        await sendVerificationEmail(input.email, code);
      } catch (err) {
        console.error("Failed to send verification email:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "发送验证码失败，请稍后重试",
        });
      }

      return { success: true, message: "验证码已发送到您的邮箱" };
    }),

  // --- Verify Email: Step 2 - activate account ---
  verifyEmail: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isValid = await verifyEmailCode(input.email, input.code);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "验证码错误或已过期",
        });
      }

      await activateUser(input.email);
      const user = await findUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "激活失败，请稍后重试",
        });
      }

      // Credit registration bonus
      const db = getDb();
      await db
        .update(schema.users)
        .set({ tuPoints: env.registrationBonus })
        .where(eq(schema.users.id, user.id));

      await createPointLog({
        userId: user.id,
        action: "register_bonus",
        changeAmount: env.registrationBonus,
        balanceBefore: 0,
        balanceAfter: env.registrationBonus,
        description: `注册赠送${env.registrationBonus}兔点`,
      });

      await setSessionCookie(ctx, user.id);

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          tuPoints: env.registrationBonus,
        },
      };
    }),

  // --- Resend verification code ---
  resendCode: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        return { success: true, message: "如果邮箱已注册，验证码已发送" };
      }
      if (user.emailVerified) {
        throw new TRPCError({ code: "CONFLICT", message: "该邮箱已验证，请直接登录" });
      }

      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await updateVerificationCode(input.email, code, expiresAt);

      try {
        await sendVerificationEmail(input.email, code);
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "发送验证码失败" });
      }

      return { success: true, message: "验证码已重新发送" };
    }),

  // --- Login (email or username) ---
  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1).max(255).describe("username or email"),
        password: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let user = await findUserByEmail(input.username);
      if (!user) user = await findUserByUsername(input.username);

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });
      }

      if (!user.emailVerified) {
        throw new TRPCError({ code: "FORBIDDEN", message: "请先验证邮箱后再登录" });
      }

      const ok = await bcrypt.compare(input.password, user.passwordHash);
      if (!ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "用户名或密码错误" });
      }

      await updateLastSignIn(user.id);
      await setSessionCookie(ctx, user.id);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
        tuPoints: user.tuPoints,
      };
    }),

  // --- Forgot password ---
  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        return { success: true, message: "如果邮箱已注册，验证码已发送" };
      }

      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await updateVerificationCode(input.email, code, expiresAt);

      try {
        await sendPasswordResetEmail(input.email, code);
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "发送验证码失败" });
      }

      return { success: true, message: "如果邮箱已注册，验证码已发送" };
    }),

  // --- Reset password ---
  resetPassword: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
        newPassword: z.string().min(6).max(128),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isValid = await verifyEmailCode(input.email, input.code);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "验证码错误或已过期" });
      }

      const user = await findUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await updatePassword(user.id, passwordHash);

      return { success: true, message: "密码重置成功，请使用新密码登录" };
    }),

  // --- Check-in ---
  checkin: authedQuery.mutation(async ({ ctx }) => {
    const user = ctx.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await getTodayCheckin(user.id, today);
    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "今日已签到，明天再来吧！" });
    }

    const newBalance = await addTuPoints(user.id, env.checkinBonus);
    await createCheckinLog(user.id, today, env.checkinBonus);
    await createPointLog({
      userId: user.id,
      action: "checkin",
      changeAmount: env.checkinBonus,
      balanceBefore: user.tuPoints,
      balanceAfter: newBalance,
      description: `每日签到赠送${env.checkinBonus}兔点`,
    });

    return { success: true, pointsEarned: env.checkinBonus, newBalance };
  }),

  // --- Check-in status ---
  getCheckinStatus: authedQuery.query(async ({ ctx }) => {
    const user = ctx.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkedIn = !!(await getTodayCheckin(user.id, today));
    const stats = await getCheckinStats(user.id);

    return {
      checkedInToday: checkedIn,
      totalCheckins: stats.total,
    };
  }),

  // --- Get balance ---
  getBalance: authedQuery.query(async ({ ctx }) => {
    return { tuPoints: ctx.user.tuPoints };
  }),

  // --- Get point logs ---
  getPointLogs: authedQuery.query(async ({ ctx }) => {
    const logs = await getPointLogsByUser(ctx.user.id, 50);
    return logs;
  }),

  // --- Get point statistics ---
  getPointStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    // Get all point logs for statistics
    const logs = await getPointLogsByUser(userId, 100);

    let totalAcquired = 0;
    let totalConsumed = 0;
    const acquisitionBySource: Record<string, number> = {};
    const consumptionByTool: Record<string, number> = {};

    for (const log of logs) {
      if (log.changeAmount > 0) {
        totalAcquired += log.changeAmount;
        const source = log.action || "other";
        acquisitionBySource[source] = (acquisitionBySource[source] || 0) + log.changeAmount;
      } else {
        totalConsumed += Math.abs(log.changeAmount);
        const tool = log.toolSlug || "other";
        consumptionByTool[tool] = (consumptionByTool[tool] || 0) + Math.abs(log.changeAmount);
      }
    }

    return {
      totalAcquired,
      totalConsumed,
      currentBalance: ctx.user.tuPoints,
      acquisitionBySource,
      consumptionByTool,
    };
  }),

  // --- Consume points (for tools) ---
  consumePoints: authedQuery
    .input(
      z.object({
        amount: z.number().int().positive(),
        toolSlug: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      const result = await deductTuPoints(user.id, input.amount);
      if (!result.success) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "兔点不足，请先充值",
        });
      }

      await createPointLog({
        userId: user.id,
        action: "consume",
        changeAmount: -input.amount,
        balanceBefore: user.tuPoints,
        balanceAfter: result.newBalance,
        description: input.description,
        toolSlug: input.toolSlug,
      });

      return { success: true, newBalance: result.newBalance };
    }),

  // --- Get point packages ---
  listPointPackages: publicQuery.query(async () => {
    const db = getDb();
    const packages = await db.query.pointPackages.findMany({
      where: eq(schema.pointPackages.status, "active"),
      orderBy: (pkg, { asc }) => [asc(pkg.sortOrder)],
    });
    return packages;
  }),

  // --- Create recharge order ---
  createRechargeOrder: authedQuery
    .input(z.object({ packageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const pkg = await db.query.pointPackages.findFirst({
        where: eq(schema.pointPackages.id, input.packageId),
      });
      if (!pkg || pkg.status !== "active") {
        throw new TRPCError({ code: "NOT_FOUND", message: "套餐不存在" });
      }

      const orderNo = `TP${crypto.randomUUID().replace(/-/g, "").substring(0, 12).toUpperCase()}`;
      const user = ctx.user;

      await db.insert(schema.pointOrders).values({
        userId: user.id,
        orderNo,
        packageId: pkg.id,
        points: pkg.points,
        price: pkg.price,
        paymentStatus: "pending",
      });

      return {
        success: true,
        orderNo,
        message: "请使用微信扫描下方收款码转账，转账时备注您的邮箱以便核实",
        qrCodeUrl: "/assets/wechat_qr.jpg",
        contact: {
          wechat: "openclaw876",
          email: "guige20231@outlook.com",
        },
        package: {
          name: pkg.name,
          points: pkg.points,
          price: pkg.price,
        },
      };
    }),

  // --- Get recharge orders ---
  getRechargeOrders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const orders = await db.query.pointOrders.findMany({
      where: eq(schema.pointOrders.userId, ctx.user.id),
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit: 20,
    });
    return orders;
  }),

  // --- Submit recharge payment notification (user claims to have paid) ---
  submitRecharge: authedQuery
    .input(z.object({ orderNo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;

      const order = await db.query.pointOrders.findFirst({
        where: eq(schema.pointOrders.orderNo, input.orderNo),
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "订单不存在" });
      }

      if (order.userId !== user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权操作此订单" });
      }

      if (order.paymentStatus === "paid") {
        throw new TRPCError({ code: "CONFLICT", message: "订单已支付" });
      }

      if (order.paymentStatus === "submitted") {
        throw new TRPCError({ code: "CONFLICT", message: "已提交转账证明，请等待管理员确认" });
      }

      // Mark as submitted - admin will verify and confirm
      await db
        .update(schema.pointOrders)
        .set({ paymentStatus: "submitted" })
        .where(eq(schema.pointOrders.orderNo, input.orderNo));

      return { success: true, message: "已提交转账证明，请等待管理员确认，兔点将在核实后到账" };
    }),

  // --- Cancel recharge order (user cancels their own pending order) ---
  cancelRecharge: authedQuery
    .input(z.object({ orderNo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const user = ctx.user;

      const order = await db.query.pointOrders.findFirst({
        where: eq(schema.pointOrders.orderNo, input.orderNo),
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "订单不存在" });
      }

      if (order.userId !== user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "无权操作此订单" });
      }

      if (order.paymentStatus === "paid") {
        throw new TRPCError({ code: "CONFLICT", message: "订单已支付，无法取消" });
      }

      if (order.paymentStatus === "cancelled") {
        throw new TRPCError({ code: "CONFLICT", message: "订单已取消" });
      }

      // Mark as cancelled
      await db
        .update(schema.pointOrders)
        .set({ paymentStatus: "cancelled" })
        .where(eq(schema.pointOrders.orderNo, input.orderNo));

      return { success: true, message: "订单已取消" };
    }),


  // --- Admin confirm recharge (credits points after verification) ---
  adminConfirmRecharge: adminQuery
    .input(z.object({ orderNo: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const order = await db.query.pointOrders.findFirst({
        where: eq(schema.pointOrders.orderNo, input.orderNo),
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "订单不存在" });
      }

      if (order.paymentStatus === "paid") {
        throw new TRPCError({ code: "CONFLICT", message: "订单已支付" });
      }

      const pkg = await db.query.pointPackages.findFirst({
        where: eq(schema.pointPackages.id, order.packageId!),
      });

      // Get user for balance update
      const userResult = await db.query.users.findFirst({
        where: eq(schema.users.id, order.userId),
      });

      if (!userResult) {
        throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
      }

      // Update order status
      await db
        .update(schema.pointOrders)
        .set({ paymentStatus: "paid", paidAt: new Date() })
        .where(eq(schema.pointOrders.orderNo, input.orderNo));

      // Add points to user
      const newBalance = await addTuPoints(order.userId, order.points);

      // Create point log
      await createPointLog({
        userId: order.userId,
        action: "purchase",
        changeAmount: order.points,
        balanceBefore: userResult.tuPoints,
        balanceAfter: newBalance,
        description: `管理员确认充值${order.points}兔点，购买${pkg?.name || "套餐"}`,
        relatedOrder: input.orderNo,
      });

      return { success: true, newBalance };
    }),

  // --- Admin reject recharge ---
  adminRejectRecharge: adminQuery
    .input(z.object({ orderNo: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const order = await db.query.pointOrders.findFirst({
        where: eq(schema.pointOrders.orderNo, input.orderNo),
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "订单不存在" });
      }

      if (order.paymentStatus === "paid") {
        throw new TRPCError({ code: "CONFLICT", message: "订单已支付，无法驳回" });
      }

      // Mark as cancelled
      await db
        .update(schema.pointOrders)
        .set({ paymentStatus: "cancelled" })
        .where(eq(schema.pointOrders.orderNo, input.orderNo));

      return { success: true, message: "已驳回充值申请" };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      })
    );
    return { success: true };
  }),
});
