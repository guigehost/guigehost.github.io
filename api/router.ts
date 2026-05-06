import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { categoryRouter } from "./routers/categoryRouter";
import { tagRouter } from "./routers/tagRouter";
import { articleRouter } from "./routers/articleRouter";
import { toolRouter } from "./routers/toolRouter";
import { onlineToolRouter } from "./routers/onlineToolRouter";
import { linkRouter } from "./routers/linkRouter";
import { settingRouter } from "./routers/settingRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  category: categoryRouter,
  tag: tagRouter,
  article: articleRouter,
  tool: toolRouter,
  onlineTool: onlineToolRouter,
  link: linkRouter,
  setting: settingRouter,
});

export type AppRouter = typeof appRouter;
