import { getDb } from "./connection";
import { categories } from "@db/schema";
import { eq, sql } from "drizzle-orm";

export async function findAllCategories() {
  return getDb().query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  });
}

export async function findCategoriesWithCounts() {
  const db = getDb();
  return db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    description: categories.description,
    sortOrder: categories.sortOrder,
    articleCount: sql<number>`(SELECT COUNT(*) FROM articles WHERE articles.category_id = ${categories.id} AND articles.status = 'published')`.mapWith(Number),
  }).from(categories).orderBy(categories.sortOrder);
}

export async function findCategoryBySlug(slug: string) {
  return getDb().query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
}
