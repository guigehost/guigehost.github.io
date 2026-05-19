import { getDb } from "./connection";
import { packages, userBalances, tutiantianOrders, usageLogs, users } from "@db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

// Packages
export async function findPackages() {
  const db = getDb();
  return db.select().from(packages).orderBy(packages.sortOrder);
}

export async function findPackageById(id: number) {
  const db = getDb();
  const rows = await db.select().from(packages).where(eq(packages.id, id)).limit(1);
  return rows[0] ?? null;
}

// Orders
export async function findOrders({
  page = 1,
  pageSize = 20,
  status,
  startDate,
  endDate,
}: {
  page?: number;
  pageSize?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const db = getDb();
  const conditions = [];

  if (status && status !== "all") {
    conditions.push(eq(tutiantianOrders.paymentStatus, status));
  }
  if (startDate) {
    conditions.push(gte(tutiantianOrders.createdAt, startDate));
  }
  if (endDate) {
    conditions.push(lte(tutiantianOrders.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tutiantianOrders)
    .where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  const orderRows = await db
    .select({
      order: tutiantianOrders,
      user: users,
      package: packages,
    })
    .from(tutiantianOrders)
    .leftJoin(users, eq(tutiantianOrders.userId, users.id))
    .leftJoin(packages, eq(tutiantianOrders.packageId, packages.id))
    .where(whereClause)
    .orderBy(desc(tutiantianOrders.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    orders: orderRows.map((r) => ({
      ...r.order,
      user: r.user ? { id: r.user.id, username: r.user.username, name: r.user.name } : null,
      package: r.package,
    })),
    total,
    page,
    pageSize,
  };
}

export async function findOrderByNo(orderNo: string) {
  const db = getDb();
  const rows = await db
    .select({
      order: tutiantianOrders,
      user: users,
      package: packages,
    })
    .from(tutiantianOrders)
    .leftJoin(users, eq(tutiantianOrders.userId, users.id))
    .leftJoin(packages, eq(tutiantianOrders.packageId, packages.id))
    .where(eq(tutiantianOrders.orderNo, orderNo))
    .limit(1);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r.order,
    user: r.user ? { id: r.user.id, username: r.user.username, name: r.user.name } : null,
    package: r.package,
  };
}

export async function updateOrderStatus(orderNo: string, status: string) {
  const db = getDb();
  await db
    .update(tutiantianOrders)
    .set({
      paymentStatus: status,
      paidAt: status === "paid" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(tutiantianOrders.orderNo, orderNo));
  return { success: true };
}

// User Balances
export async function findUserBalances({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}) {
  const db = getDb();

  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(userBalances);
  const total = totalResult[0]?.count ?? 0;

  const rows = await db
    .select({
      ub: userBalances,
      user: users,
    })
    .from(userBalances)
    .leftJoin(users, eq(userBalances.userId, users.id))
    .orderBy(desc(userBalances.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    balances: rows.map((r) => ({
      ...r.ub,
      user: r.user ? { id: r.user.id, username: r.user.username, name: r.user.name, email: r.user.email } : null,
    })),
    total,
    page,
    pageSize,
  };
}

export async function findUserBalanceByUserId(userId: number) {
  const db = getDb();
  const rows = await db
    .select({
      ub: userBalances,
      user: users,
    })
    .from(userBalances)
    .leftJoin(users, eq(userBalances.userId, users.id))
    .where(eq(userBalances.userId, userId))
    .limit(1);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r.ub,
    user: r.user ? { id: r.user.id, username: r.user.username, name: r.user.name, email: r.user.email } : null,
  };
}

export async function adjustUserBalance(userId: number, amount: number, description: string) {
  const db = getDb();

  // Get current balance
  const current = await findUserBalanceByUserId(userId);
  if (!current) {
    throw new Error("User balance record not found");
  }

  const newBalance = current.balance + amount;
  if (newBalance < 0) {
    throw new Error("Balance cannot be negative");
  }

  // Update balance
  await db
    .update(userBalances)
    .set({ balance: newBalance, updatedAt: new Date() })
    .where(eq(userBalances.userId, userId));

  // Create usage log
  await db.insert(usageLogs).values({
    userId,
    action: "admin_adjustment",
    changeAmount: amount,
    balanceBefore: current.balance,
    balanceAfter: newBalance,
    description,
    status: "success",
  });

  return { success: true, newBalance };
}

// Usage Logs
export async function findUsageLogs({
  page = 1,
  pageSize = 20,
  userId,
  action,
}: {
  page?: number;
  pageSize?: number;
  userId?: number;
  action?: string;
} = {}) {
  const db = getDb();
  const conditions = [];

  if (userId) {
    conditions.push(eq(usageLogs.userId, userId));
  }
  if (action && action !== "all") {
    conditions.push(eq(usageLogs.action, action));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(usageLogs)
    .where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  const rows = await db
    .select({
      log: usageLogs,
      user: users,
    })
    .from(usageLogs)
    .leftJoin(users, eq(usageLogs.userId, users.id))
    .where(whereClause)
    .orderBy(desc(usageLogs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    logs: rows.map((r) => ({
      ...r.log,
      user: r.user ? { id: r.user.id, username: r.user.username, name: r.user.name } : null,
    })),
    total,
    page,
    pageSize,
  };
}
