import { getDb } from "./connection";
import { tags, articleTags, articles } from "@db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function findAllTags() {
  return getDb().query.tags.findMany({
    orderBy: (tags, { asc }) => [asc(tags.name)],
  });
}

export async function findPopularTags(limit: number = 20) {
  const db = getDb();
  return db.select({
    id: tags.id,
    name: tags.name,
    slug: tags.slug,
    articleCount: sql<number>`COUNT(${articleTags.articleId})`.mapWith(Number),
  })
  .from(tags)
  .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
  .leftJoin(articles, eq(articleTags.articleId, articles.id))
  .where(eq(articles.status, "published"))
  .groupBy(tags.id)
  .orderBy(desc(sql`COUNT(${articleTags.articleId})`))
  .limit(limit);
}

export async function findTagBySlug(slug: string) {
  return getDb().query.tags.findFirst({
    where: eq(tags.slug, slug),
  });
}

export async function findOrCreateTagsByNames(names: string[]) {
  const db = getDb();
  const result = [];
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const slug = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "");
    let tag = await db.query.tags.findFirst({ where: eq(tags.slug, slug) });
    if (!tag) {
      const [{ id }] = await db.insert(tags).values({ name: trimmed, slug }).$returningId();
      tag = await db.query.tags.findFirst({ where: eq(tags.id, id) });
    }
    if (tag) result.push(tag);
  }
  return result;
}
