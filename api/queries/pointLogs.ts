import { eq, and, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function createPointLog(data: {
  userId: number;
  action: string;
  changeAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  relatedOrder?: string;
  toolSlug?: string;
}): Promise<void> {
  await getDb().insert(schema.pointLogs).values({
    userId: data.userId,
    action: data.action,
    changeAmount: data.changeAmount,
    balanceBefore: data.balanceBefore,
    balanceAfter: data.balanceAfter,
    description: data.description ?? null,
    relatedOrder: data.relatedOrder ?? null,
    toolSlug: data.toolSlug ?? null,
  });
}

export async function getPointLogsByUser(
  userId: number,
  limit = 50
): Promise<schema.PointLog[]> {
  const rows = await getDb()
    .select()
    .from(schema.pointLogs)
    .where(eq(schema.pointLogs.userId, userId))
    .orderBy(desc(schema.pointLogs.createdAt))
    .limit(limit);
  return rows;
}

export async function getTodayCheckin(userId: number, date: Date): Promise<schema.CheckinLog | undefined> {
  const rows = await getDb()
    .select()
    .from(schema.checkinLogs)
    .where(
      and(
        eq(schema.checkinLogs.userId, userId),
        eq(schema.checkinLogs.checkinDate, date)
      )
    )
    .limit(1);
  return rows.at(0);
}

export async function createCheckinLog(userId: number, date: Date, pointsEarned: number): Promise<void> {
  await getDb().insert(schema.checkinLogs).values({
    userId,
    checkinDate: date,
    pointsEarned,
  });
}

export async function getCheckinStats(userId: number): Promise<{ total: number; consecutive: number }> {
  const logs = await getDb()
    .select()
    .from(schema.checkinLogs)
    .where(eq(schema.checkinLogs.userId, userId))
    .orderBy(desc(schema.checkinLogs.checkinDate));

  return {
    total: logs.length,
    consecutive: 0, // simplified for now
  };
}
