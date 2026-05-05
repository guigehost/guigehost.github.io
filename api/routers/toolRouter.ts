import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import {
  findTools,
  createTool,
  updateTool,
  deleteTool,
} from "../queries/tools";

export const toolRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          platform: z.string().optional(),
          category: z.string().optional(),
          search: z.string().optional(),
          page: z.number().min(1).optional(),
          pageSize: z.number().min(1).max(50).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return findTools({
        platform: input?.platform,
        category: input?.category,
        search: input?.search,
        page: input?.page ?? 1,
        pageSize: input?.pageSize ?? 12,
      });
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        icon: z.string().optional(),
        url: z.string().url(),
        platform: z.string(),
        category: z.string().optional(),
        isFree: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createTool(input as { name: string; description?: string; icon?: string; url: string; platform: "mac" | "windows" | "ios" | "android" | "web" | "all"; category?: string; isFree?: boolean; sortOrder?: number });
      return { id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        url: z.string().url().optional(),
        platform: z.string().optional(),
        category: z.string().optional(),
        isFree: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateTool(id, data as Partial<{ name: string; description: string; icon: string; url: string; platform: "mac" | "windows" | "ios" | "android" | "web" | "all"; category: string; isFree: boolean; sortOrder: number }>);
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteTool(input.id);
      return { success: true };
    }),
});
