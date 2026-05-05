import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import {
  findAllOnlineTools,
  findOnlineToolBySlug,
  createOnlineTool,
  updateOnlineTool,
  deleteOnlineTool,
} from "../queries/onlineTools";

export const onlineToolRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllOnlineTools();
  }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return findOnlineToolBySlug(input.slug);
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        icon: z.string().optional(),
        route: z.string().min(1),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createOnlineTool(input);
      return { id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        route: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateOnlineTool(id, data);
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteOnlineTool(input.id);
      return { success: true };
    }),
});
