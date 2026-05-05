import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser, User } from "@db/schema";
import { getDb } from "./connection";

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number): Promise<User | undefined> {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createUser(data: InsertUser): Promise<void> {
  await getDb().insert(schema.users).values(data);
}

export async function upsertUser(data: InsertUser): Promise<void> {
  const updateSet: Partial<InsertUser> = { ...data, lastSignInAt: new Date() };
  await getDb()
    .insert(schema.users)
    .values(data)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function updateLastSignIn(id: number): Promise<void> {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, id));
}
