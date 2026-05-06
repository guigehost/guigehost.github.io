import { eq } from "drizzle-orm";
import { getDb } from "./connection";
import { settings } from "@db/schema";

export async function getAllSettings() {
  const db = getDb();
  return db.select().from(settings);
}

export async function getSetting(key: string): Promise<string | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return rows[0]?.value ?? undefined;
}

export async function setSetting(key: string, value: string, description?: string) {
  const db = getDb();
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({
      key,
      value,
      description,
      updatedAt: new Date(),
    });
  }
}

export async function deleteSetting(key: string) {
  const db = getDb();
  await db.delete(settings).where(eq(settings.key, key));
}
