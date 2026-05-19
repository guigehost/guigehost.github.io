import { eq, and, gte, sql } from "drizzle-orm";
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

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
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

export async function updateVerificationCode(
  email: string,
  code: string,
  expiresAt: Date
): Promise<void> {
  await getDb()
    .update(schema.users)
    .set({ emailCode: code, emailCodeExpires: expiresAt, emailVerified: false })
    .where(eq(schema.users.email, email.toLowerCase()));
}

export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  if (!user || !user.emailCode || !user.emailCodeExpires) return false;
  if (user.emailCode !== code) return false;
  if (new Date() > user.emailCodeExpires) return false;
  return true;
}

export async function activateUser(email: string): Promise<void> {
  await getDb()
    .update(schema.users)
    .set({
      emailVerified: true,
      emailCode: null,
      emailCodeExpires: null,
      registeredAt: new Date(),
    })
    .where(eq(schema.users.email, email.toLowerCase()));
}

export async function updatePassword(userId: number, passwordHash: string): Promise<void> {
  await getDb()
    .update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, userId));
}

export async function deductTuPoints(userId: number, amount: number): Promise<{ success: boolean; newBalance: number }> {
  const user = await findUserById(userId);
  if (!user) return { success: false, newBalance: 0 };
  if (user.tuPoints < amount) return { success: false, newBalance: user.tuPoints };

  const newBalance = user.tuPoints - amount;
  await getDb()
    .update(schema.users)
    .set({ tuPoints: newBalance })
    .where(eq(schema.users.id, userId));

  return { success: true, newBalance };
}

export async function addTuPoints(userId: number, amount: number): Promise<number> {
  const user = await findUserById(userId);
  if (!user) return 0;

  const newBalance = user.tuPoints + amount;
  await getDb()
    .update(schema.users)
    .set({ tuPoints: newBalance })
    .where(eq(schema.users.id, userId));

  return newBalance;
}

export async function setTuPoints(userId: number, points: number): Promise<void> {
  await getDb()
    .update(schema.users)
    .set({ tuPoints: points })
    .where(eq(schema.users.id, userId));
}
