import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { findAllCategories, findCategoriesWithCounts, findCategoryBySlug } from "../queries/categories";

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllCategories();
  }),

  withCounts: publicQuery.query(async () => {
    return findCategoriesWithCounts();
  }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return findCategoryBySlug(input.slug);
    }),
});
