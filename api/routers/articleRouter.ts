import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "../middleware";
import {
  findArticles,
  findArticleBySlug,
  findArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  incrementArticleView,
} from "../queries/articles";
import { findOrCreateTagsByNames } from "../queries/tags";

export const articleRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          categorySlug: z.string().optional(),
          tagSlug: z.string().optional(),
          search: z.string().optional(),
          status: z.enum(["draft", "published", "all"]).optional(),
          page: z.number().min(1).optional(),
          pageSize: z.number().min(1).max(50).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return findArticles({
        categorySlug: input?.categorySlug,
        tagSlug: input?.tagSlug,
        search: input?.search,
        status: input?.status ?? "published",
        page: input?.page ?? 1,
        pageSize: input?.pageSize ?? 12,
      });
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const article = await findArticleBySlug(input.slug);
      if (!article) {
        throw new Error("Article not found");
      }
      return article;
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const article = await findArticleById(input.id);
      if (!article) {
        throw new Error("Article not found");
      }
      return article;
    }),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        coverImage: z.string().optional(),
        categoryId: z.number().optional(),
        status: z.enum(["draft", "published"]),
        originalUrl: z.string().optional(),
        publishedAt: z.date().optional(),
        tagNames: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      let tagIds: number[] = [];
      if (input.tagNames && input.tagNames.length > 0) {
        const tags = await findOrCreateTagsByNames(input.tagNames);
        tagIds = tags.map((t) => t.id);
      }
      const id = await createArticle({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content: input.content,
        coverImage: input.coverImage,
        categoryId: input.categoryId,
        status: input.status,
        originalUrl: input.originalUrl,
        publishedAt: input.publishedAt ?? (input.status === "published" ? new Date() : undefined),
        tagIds,
      });
      return { id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        coverImage: z.string().optional(),
        categoryId: z.number().optional(),
        status: z.enum(["draft", "published"]).optional(),
        originalUrl: z.string().optional(),
        publishedAt: z.date().optional(),
        tagNames: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, tagNames, ...rest } = input;
      let tagIds: number[] | undefined;
      if (tagNames !== undefined) {
        const tags = await findOrCreateTagsByNames(tagNames);
        tagIds = tags.map((t) => t.id);
      }
      await updateArticle(id, {
        ...rest,
        tagIds,
      });
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteArticle(input.id);
      return { success: true };
    }),

  incrementView: publicQuery
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input }) => {
      await incrementArticleView(input.slug);
      return { success: true };
    }),
});
