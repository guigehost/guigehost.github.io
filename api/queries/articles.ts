import { getDb } from "./connection";
import { articles, categories, tags, articleTags } from "@db/schema";
import { eq, and, like, desc, sql, inArray, or } from "drizzle-orm";

export async function findArticles({
  categorySlug,
  tagSlug,
  search,
  status = "published",
  page = 1,
  pageSize = 12,
}: {
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  status?: "draft" | "published" | "all";
  page?: number;
  pageSize?: number;
}) {
  const db = getDb();
  const conditions = [];

  if (status !== "all") {
    conditions.push(sql`${articles.status} = ${status}`);
  }

  if (categorySlug) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
    });
    if (cat) {
      conditions.push(eq(articles.categoryId, cat.id));
    }
  }

  if (tagSlug) {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.slug, tagSlug),
    });
    if (tag) {
      const linked = await db.select({ articleId: articleTags.articleId })
        .from(articleTags)
        .where(eq(articleTags.tagId, tag.id));
      if (linked.length > 0) {
        conditions.push(inArray(articles.id, linked.map((l) => l.articleId)));
      } else {
        conditions.push(sql`1=0`); // no results
      }
    }
  }

  if (search) {
    conditions.push(
      or(
        like(articles.title, `%${search}%`),
        like(articles.excerpt, `%${search}%`),
        like(articles.content, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = await db.select({ count: sql<number>`COUNT(*)` }).from(articles).where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  const articleRows = await db.select()
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(whereClause)
    .orderBy(desc(articles.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Fetch tags for each article
  const articleIds = articleRows.map((r) => r.articles.id);
  let tagMap = new Map<number, typeof tags.$inferSelect[]>();
  if (articleIds.length > 0) {
    const tagRows = await db.select({
      articleId: articleTags.articleId,
      tagId: tags.id,
      tagName: tags.name,
      tagSlug: tags.slug,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(inArray(articleTags.articleId, articleIds));

    for (const row of tagRows) {
      const list = tagMap.get(row.articleId) ?? [];
      list.push({ id: row.tagId, name: row.tagName, slug: row.tagSlug, createdAt: new Date() });
      tagMap.set(row.articleId, list);
    }
  }

  const result = articleRows.map((r) => ({
    ...r.articles,
    category: r.categories,
    tags: tagMap.get(r.articles.id) ?? [],
  }));

  return { articles: result, total, page, pageSize };
}

export async function findArticleBySlug(slug: string) {
  const db = getDb();
  const row = await db.select()
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  if (row.length === 0) return null;

  const article = row[0].articles;
  const category = row[0].categories;

  const tagRows = await db.select({
    id: tags.id,
    name: tags.name,
    slug: tags.slug,
    createdAt: tags.createdAt,
  })
  .from(articleTags)
  .innerJoin(tags, eq(articleTags.tagId, tags.id))
  .where(eq(articleTags.articleId, article.id));

  return { ...article, category, tags: tagRows };
}

export async function findArticleById(id: number) {
  const db = getDb();
  const row = await db.select()
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id))
    .limit(1);

  if (row.length === 0) return null;

  const article = row[0].articles;
  const category = row[0].categories;

  const tagRows = await db.select({
    id: tags.id,
    name: tags.name,
    slug: tags.slug,
    createdAt: tags.createdAt,
  })
  .from(articleTags)
  .innerJoin(tags, eq(articleTags.tagId, tags.id))
  .where(eq(articleTags.articleId, article.id));

  return { ...article, category, tags: tagRows };
}

export async function createArticle(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  categoryId?: number;
  status: "draft" | "published";
  originalUrl?: string;
  publishedAt?: Date;
  tagIds?: number[];
}) {
  const db = getDb();
  const [{ id }] = await db.insert(articles).values({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.coverImage,
    categoryId: data.categoryId,
    status: data.status,
    originalUrl: data.originalUrl,
    publishedAt: data.publishedAt,
  }).$returningId();

  if (data.tagIds && data.tagIds.length > 0) {
    await db.insert(articleTags).values(
      data.tagIds.map((tagId) => ({ articleId: id, tagId }))
    );
  }

  return id;
}

export async function updateArticle(
  id: number,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    categoryId?: number;
    status?: "draft" | "published";
    originalUrl?: string;
    publishedAt?: Date;
    tagIds?: number[];
  }
) {
  const db = getDb();
  await db.update(articles).set({
    ...(data.title !== undefined && { title: data.title }),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
    ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.originalUrl !== undefined && { originalUrl: data.originalUrl }),
    ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt }),
    updatedAt: new Date(),
  }).where(eq(articles.id, id));

  if (data.tagIds !== undefined) {
    await db.delete(articleTags).where(eq(articleTags.articleId, id));
    if (data.tagIds.length > 0) {
      await db.insert(articleTags).values(
        data.tagIds.map((tagId) => ({ articleId: id, tagId }))
      );
    }
  }
}

export async function deleteArticle(id: number) {
  const db = getDb();
  await db.delete(articleTags).where(eq(articleTags.articleId, id));
  await db.delete(articles).where(eq(articles.id, id));
}

export async function incrementArticleView(slug: string) {
  const db = getDb();
  await db.update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.slug, slug));
}
