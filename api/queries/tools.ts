import { getDb } from "./connection";
import { tools } from "@db/schema";
import { eq, and, like, sql } from "drizzle-orm";

type ToolPlatform = "mac" | "windows" | "ios" | "android" | "web" | "all";

export async function findTools({
  platform,
  category,
  search,
  page = 1,
  pageSize = 12,
}: {
  platform?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const db = getDb();
  const conditions = [];

  if (platform && platform !== "all") {
    conditions.push(eq(tools.platform, platform as any));
  }
  if (category) {
    conditions.push(eq(tools.category, category));
  }
  if (search) {
    conditions.push(
      sql`(${like(tools.name, `%${search}%`)} OR ${like(tools.description, `%${search}%`)})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = await db.select({ count: sql<number>`COUNT(*)` }).from(tools).where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  const toolRows = await db.select().from(tools)
    .where(whereClause)
    .orderBy(tools.sortOrder, tools.createdAt)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { tools: toolRows, total, page, pageSize };
}

export async function findToolById(id: number) {
  return getDb().query.tools.findFirst({ where: eq(tools.id, id) });
}

export async function createTool(data: {
  name: string;
  description?: string;
  icon?: string;
  url: string;
  platform: ToolPlatform;
  category?: string;
  isFree?: boolean;
  sortOrder?: number;
}) {
  const db = getDb();
  const [{ id }] = await db.insert(tools).values(data).$returningId();
  return id;
}

export async function updateTool(
  id: number,
  data: Partial<{
    name: string;
    description: string;
    icon: string;
    url: string;
    platform: ToolPlatform;
    category: string;
    isFree: boolean;
    sortOrder: number;
  }>
) {
  await getDb().update(tools).set(data).where(eq(tools.id, id));
}

export async function deleteTool(id: number) {
  await getDb().delete(tools).where(eq(tools.id, id));
}
