import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { compress } from "hono/compress";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(compress());
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Sitemap endpoint
app.get("/sitemap.xml", async (c) => {
  const baseUrl = "https://guige.host";
  const { getDb } = await import("./queries/connection");
  const db = getDb();

  // Fetch published articles
  const { eq, desc } = await import("drizzle-orm");
  const { articles } = await import("@db/schema");

  const publishedArticles = await db
    .select({
      slug: articles.slug,
      updatedAt: articles.updatedAt,
    })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(100);

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/blog", priority: "0.9", changefreq: "daily" },
    { loc: "/tools", priority: "0.8", changefreq: "weekly" },
    { loc: "/apps/tutiantian", priority: "0.9", changefreq: "weekly" },
  ];

  const articleUrls = publishedArticles.map((a) => ({
    loc: `/blog/${a.slug}`,
    lastmod: a.updatedAt ? new Date(a.updatedAt).toISOString().split("T")[0] : undefined,
    priority: "0.7",
    changefreq: "monthly",
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map((p) => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <priority>${p.priority}</priority>
    <changefreq>${p.changefreq}</changefreq>
  </url>`).join("\n")}
${articleUrls.map((a) => `  <url>
    <loc>${baseUrl}${a.loc}</loc>${a.lastmod ? `\n    <lastmod>${a.lastmod}</lastmod>` : ""}
    <priority>${a.priority}</priority>
    <changefreq>${a.changefreq}</changefreq>
  </url>`).join("\n")}
</urlset>`;

  c.header("Content-Type", "application/xml");
  return c.body(sitemap);
});

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
