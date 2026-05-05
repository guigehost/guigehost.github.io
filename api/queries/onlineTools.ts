import { getDb } from "./connection";
import { onlineTools } from "@db/schema";
import { eq } from "drizzle-orm";

export async function findAllOnlineTools() {
  return getDb().query.onlineTools.findMany({
    where: eq(onlineTools.isActive, true),
    orderBy: (onlineTools, { asc }) => [asc(onlineTools.sortOrder)],
  });
}

export async function findOnlineToolBySlug(slug: string) {
  return getDb().query.onlineTools.findFirst({
    where: eq(onlineTools.slug, slug),
  });
}

export async function createOnlineTool(data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  route: string;
  isActive?: boolean;
  sortOrder?: number;
}) {
  const db = getDb();
  const [{ id }] = await db.insert(onlineTools).values(data).$returningId();
  return id;
}

export async function updateOnlineTool(
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    icon: string;
    route: string;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  await getDb().update(onlineTools).set(data).where(eq(onlineTools.id, id));
}

export async function deleteOnlineTool(id: number) {
  await getDb().delete(onlineTools).where(eq(onlineTools.id, id));
}
