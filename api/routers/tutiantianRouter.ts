import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import {
  findOrders,
  findOrderByNo,
  updateOrderStatus,
  findUserBalances,
  findUserBalanceByUserId,
  adjustUserBalance,
  findUsageLogs,
  findPackages,
} from "../queries/tutiantian";

export const tutiantianRouter = createRouter({
  // Packages
  listPackages: adminQuery.query(async () => {
    return findPackages();
  }),

  // Orders
  listOrders: adminQuery
    .input(
      z
        .object({
          page: z.number().min(1).optional(),
          pageSize: z.number().min(1).max(100).optional(),
          status: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return findOrders({
        page: input?.page ?? 1,
        pageSize: input?.pageSize ?? 20,
        status: input?.status,
        startDate: input?.startDate,
        endDate: input?.endDate,
      });
    }),

  getOrder: adminQuery
    .input(z.object({ orderNo: z.string() }))
    .query(async ({ input }) => {
      const order = await findOrderByNo(input.orderNo);
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    }),

  confirmOrder: adminQuery
    .input(z.object({ orderNo: z.string() }))
    .mutation(async ({ input }) => {
      return updateOrderStatus(input.orderNo, "paid");
    }),

  cancelOrder: adminQuery
    .input(z.object({ orderNo: z.string() }))
    .mutation(async ({ input }) => {
      return updateOrderStatus(input.orderNo, "cancelled");
    }),

  // User Balances
  listUserBalances: adminQuery
    .input(
      z
        .object({
          page: z.number().min(1).optional(),
          pageSize: z.number().min(1).max(100).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return findUserBalances({
        page: input?.page ?? 1,
        pageSize: input?.pageSize ?? 20,
      });
    }),

  getUserBalance: adminQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const balance = await findUserBalanceByUserId(input.userId);
      if (!balance) {
        throw new Error("User balance not found");
      }
      return balance;
    }),

  adjustBalance: adminQuery
    .input(
      z.object({
        userId: z.number(),
        amount: z.number(),
        description: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return adjustUserBalance(input.userId, input.amount, input.description);
    }),

  // Usage Logs
  listUsageLogs: adminQuery
    .input(
      z
        .object({
          page: z.number().min(1).optional(),
          pageSize: z.number().min(1).max(100).optional(),
          userId: z.number().optional(),
          action: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return findUsageLogs({
        page: input?.page ?? 1,
        pageSize: input?.pageSize ?? 20,
        userId: input?.userId,
        action: input?.action,
      });
    }),
});
