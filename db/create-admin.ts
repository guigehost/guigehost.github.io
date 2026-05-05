/**
 * 创建/更新管理员账号
 *
 * 用法:
 *   npx tsx db/create-admin.ts --username=admin --password=YOUR_STRONG_PASSWORD
 *
 * 行为:
 *   - 如果用户名不存在 → 创建,role='admin'
 *   - 如果用户名已存在 → 更新密码哈希,并把 role 提升到 'admin'
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { users } from "./schema";

function parseArgs(): { username: string; password: string } {
  const argv = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (const arg of argv) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  if (!out.username || !out.password) {
    console.error(
      "Usage: npx tsx db/create-admin.ts --username=admin --password=xxxx",
    );
    process.exit(1);
  }
  return { username: out.username, password: out.password };
}

async function main() {
  const { username, password } = parseArgs();
  const db = getDb();

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash, role: "admin", updatedAt: new Date() })
      .where(eq(users.username, username));
    console.log(`✓ 已更新管理员 "${username}" 的密码 (id=${existing.id})`);
  } else {
    await db.insert(users).values({
      username,
      passwordHash,
      name: username,
      role: "admin",
    });
    console.log(`✓ 已创建管理员 "${username}"`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("✗ 创建管理员失败:", e);
  process.exit(1);
});
