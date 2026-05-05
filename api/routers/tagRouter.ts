import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { findAllTags, findPopularTags, findTagBySlug, findOrCreateTagsByNames } from "../queries/tags";

export const tagRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllTags();
  }),

  popular: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return findPopularTags(input?.limit ?? 20);
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return findTagBySlug(input.slug);
    }),

  findOrCreate: publicQuery
    .input(z.object({ names: z.array(z.string()) }))
    .query(async ({ input }) => {
      return findOrCreateTagsByNames(input.names);
    }),
});
