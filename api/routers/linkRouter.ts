import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import { findLinks, createLink, updateLink, deleteLink } from "../queries/links";

export const linkRouter = createRouter({
  list: publicQuery
    .input(z.object({ activeOnly: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      return findLinks(input?.activeOnly ?? true);
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        url: z.string().url(),
        description: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createLink(input);
      return { id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        url: z.string().url().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateLink(id, data);
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteLink(input.id);
      return { success: true };
    }),
});
