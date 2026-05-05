/**
 * 把 Hexo 旧文章批量导入到新数据库
 *
 * 用法:
 *   npx tsx db/import-hexo.ts /www/wwwroot/hexo-source/source/_posts
 *
 * 行为:
 *   - 递归读取目录下所有 .md 文件
 *   - 解析 YAML frontmatter,映射到 articles 表
 *   - 自动 upsert categories/tags(seed.ts 里没有的会用 slug 自动生成)
 *   - slug 优先用 abbrlink,缺失则用文件名 hash
 *   - 基于 slug 唯一约束做幂等,重跑只更新不重复
 */
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import matter from "gray-matter";
import { getDb } from "../api/queries/connection";
import { articles, articleTags, categories, tags } from "./schema";

const HEXO_TO_SEED_CATEGORY: Record<string, { slug: string; name: string }> = {
  小编爱叨叨: { slug: "editor-notes", name: "小编爱叨叨" },
  Macios分享: { slug: "mac-ios", name: "Mac/iOS分享" },
  "Mac/iOS分享": { slug: "mac-ios", name: "Mac/iOS分享" },
  Windows分享: { slug: "windows", name: "Windows分享" },
  AI工具分享: { slug: "ai-tools", name: "AI工具分享" },
  探索发现: { slug: "discovery", name: "探索发现" },
  遛娃分享: { slug: "parenting", name: "遛娃分享" },
};

const TAG_NAME_TO_SLUG: Record<string, string> = {
  效率工具: "efficiency",
  快速笔记: "quick-notes",
  iCloud同步: "icloud",
  标签: "tags",
  Bleep: "bleep",
  认知科学: "cognitive-science",
  年度总结: "year-review",
  心灵之旅: "mind-journey",
  亲子教育: "parenting-edu",
  DIY创意: "diy",
  免费资源: "free-resources",
  开源免费: "open-source",
  AI编程: "ai-coding",
  Windows软件: "windows-software",
  Mac工具: "mac-tools",
  文本处理: "text-processing",
  视频下载: "video-download",
  隐私保护: "privacy",
};

function pinyinSlug(input: string): string {
  // 简易 slug:保留 ASCII 字母数字,中文用其 charCode 折成短串
  const ascii = input
    .toLowerCase()
    .replace(/[^\w一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (/^[a-z0-9-]+$/.test(ascii) && ascii.length > 0) return ascii;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return `post-${hash.toString(36)}`;
}

function parseDate(raw: unknown, fallbackDir: string | null): Date {
  if (raw instanceof Date) return raw;
  const s = typeof raw === "string" ? raw.trim() : "";
  if (s) {
    const cn = s.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (cn) {
      return new Date(Number(cn[1]), Number(cn[2]) - 1, Number(cn[3]), 12, 0, 0);
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
  }
  if (fallbackDir) {
    const m = fallbackDir.match(/(\d{4})(\d{2})(\d{2})/);
    if (m) {
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
    }
  }
  return new Date();
}

function cleanCover(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.replace(/\s+/g, "").trim();
  return trimmed || null;
}

async function findOrCreateCategory(
  db: ReturnType<typeof getDb>,
  hexoName: string,
): Promise<number | null> {
  const mapping = HEXO_TO_SEED_CATEGORY[hexoName];
  const slug = mapping?.slug ?? pinyinSlug(hexoName);
  const name = mapping?.name ?? hexoName;

  const existing = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
  if (existing) return Number(existing.id);

  const [{ id }] = await db.insert(categories).values({ name, slug }).$returningId();
  console.log(`  + 新增分类 "${name}" (${slug})`);
  return Number(id);
}

async function findOrCreateTag(
  db: ReturnType<typeof getDb>,
  tagName: string,
): Promise<number | null> {
  const slug = TAG_NAME_TO_SLUG[tagName] ?? pinyinSlug(tagName);
  const existing = await db.query.tags.findFirst({ where: eq(tags.slug, slug) });
  if (existing) return Number(existing.id);

  const [{ id }] = await db.insert(tags).values({ name: tagName, slug }).$returningId();
  console.log(`  + 新增标签 "${tagName}" (${slug})`);
  return Number(id);
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

async function importPost(
  db: ReturnType<typeof getDb>,
  filePath: string,
): Promise<"created" | "updated" | "skipped"> {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;
  const body = parsed.content;

  const title = typeof fm.title === "string" ? fm.title.trim() : path.basename(filePath, ".md");
  const parentDir = path.basename(path.dirname(filePath));
  const publishedAt = parseDate(fm.date, parentDir);
  const cover = cleanCover(fm.cover);
  const excerpt = typeof fm.excerpt === "string" ? fm.excerpt.trim() : null;

  const slugRaw = fm.abbrlink ? String(fm.abbrlink) : pinyinSlug(title);
  const slug = slugRaw.slice(0, 240);

  const categoryNames = Array.isArray(fm.categories) ? fm.categories : [];
  const tagNames = Array.isArray(fm.tags) ? fm.tags : [];

  const primaryCategory = categoryNames[0];
  const categoryId =
    typeof primaryCategory === "string"
      ? await findOrCreateCategory(db, primaryCategory)
      : null;

  const existing = await db.query.articles.findFirst({
    where: eq(articles.slug, slug),
  });

  let articleId: number;
  let action: "created" | "updated";

  if (existing) {
    await db
      .update(articles)
      .set({
        title,
        excerpt,
        content: body,
        coverImage: cover,
        categoryId,
        status: "published",
        publishedAt,
      })
      .where(eq(articles.id, existing.id));
    articleId = Number(existing.id);
    action = "updated";
  } else {
    const [inserted] = await db
      .insert(articles)
      .values({
        title,
        slug,
        excerpt,
        content: body,
        coverImage: cover,
        categoryId,
        status: "published",
        publishedAt,
      })
      .$returningId();
    articleId = Number(inserted.id);
    action = "created";
  }

  for (const tagName of tagNames) {
    if (typeof tagName !== "string") continue;
    const tagId = await findOrCreateTag(db, tagName.trim());
    if (!tagId) continue;
    try {
      await db.insert(articleTags).values({ articleId, tagId });
    } catch {
      // 主键冲突,说明已关联,忽略
    }
  }

  return action;
}

async function main() {
  const root = process.argv[2];
  if (!root) {
    console.error("Usage: npx tsx db/import-hexo.ts <_posts_directory>");
    process.exit(1);
  }
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`✗ 目录不存在: ${root}`);
    process.exit(1);
  }

  const db = getDb();
  const files = walk(root);
  console.log(`▶ 发现 ${files.length} 篇 Markdown 文件`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const file of files) {
    const rel = path.relative(root, file);
    try {
      const action = await importPost(db, file);
      if (action === "created") created++;
      else if (action === "updated") updated++;
      console.log(`✓ [${action}] ${rel}`);
    } catch (e) {
      failed++;
      console.error(`✗ [failed] ${rel}:`, e instanceof Error ? e.message : e);
    }
  }

  console.log(`\n=== 完成 ===\n  新增 ${created} | 更新 ${updated} | 失败 ${failed}`);
  process.exit(failed > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error("✗ 导入失败:", e);
  process.exit(1);
});
