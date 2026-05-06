import { eq, desc, asc } from "drizzle-orm";
import { getDb } from "./connection";
import { links } from "@db/schema";

export async function findLinks(activeOnly = true) {
  const db = getDb();
  const conditions = activeOnly ? [eq(links.isActive, true)] : [];
  return db
    .select()
    .from(links)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(asc(links.sortOrder), desc(links.createdAt));
}

export async function createLink(data: {
  name: string;
  url: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const db = getDb();
  const [result] = await db.insert(links).values({
    name: data.name,
    url: data.url,
    description: data.description,
    icon: data.icon,
    sortOrder: data.sortOrder ?? 0,
    isActive: data.isActive ?? true,
  });
  return Number(result.insertId);
}

export async function updateLink(
  id: number,
  data: {
    name?: string;
    url?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  const db = getDb();
  await db.update(links).set(data).where(eq(links.id, id));
}

export async function deleteLink(id: number) {
  const db = getDb();
  await db.delete(links).where(eq(links.id, id));
}
