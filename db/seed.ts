import { getDb } from "../api/queries/connection";
import { categories, tags, articles, articleTags, tools, onlineTools } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();

  // --- Categories ---
  const categoryData = [
    { name: "小编爱叨叨", slug: "editor-notes", description: "小编的日常碎碎念", sortOrder: 0 },
    { name: "Mac/iOS分享", slug: "mac-ios", description: "苹果生态效率工具", sortOrder: 1 },
    { name: "Windows分享", slug: "windows", description: "Windows平台精品软件", sortOrder: 2 },
    { name: "AI工具分享", slug: "ai-tools", description: "人工智能相关工具推荐", sortOrder: 3 },
    { name: "探索发现", slug: "discovery", description: "新奇有趣的发现", sortOrder: 4 },
    { name: "遛娃分享", slug: "parenting", description: "亲子育儿与遛娃经验", sortOrder: 5 },
  ];

  for (const c of categoryData) {
    const existing = await db.query.categories.findFirst({ where: eq(categories.slug, c.slug) });
    if (!existing) {
      await db.insert(categories).values(c);
    }
  }

  // --- Tags ---
  const tagData = [
    { name: "效率工具", slug: "efficiency" },
    { name: "快速笔记", slug: "quick-notes" },
    { name: "iCloud同步", slug: "icloud" },
    { name: "标签", slug: "tags" },
    { name: "Bleep", slug: "bleep" },
    { name: "认知科学", slug: "cognitive-science" },
    { name: "年度总结", slug: "year-review" },
    { name: "心灵之旅", slug: "mind-journey" },
    { name: "亲子教育", slug: "parenting-edu" },
    { name: "DIY创意", slug: "diy" },
    { name: "免费资源", slug: "free-resources" },
    { name: "开源免费", slug: "open-source" },
    { name: "AI编程", slug: "ai-coding" },
    { name: "Windows软件", slug: "windows-software" },
    { name: "Mac工具", slug: "mac-tools" },
    { name: "文本处理", slug: "text-processing" },
    { name: "视频下载", slug: "video-download" },
    { name: "隐私保护", slug: "privacy" },
  ];

  for (const t of tagData) {
    const existing = await db.query.tags.findFirst({ where: eq(tags.slug, t.slug) });
    if (!existing) {
      await db.insert(tags).values(t);
    }
  }

  // --- Articles ---
  const articleData = [
    {
      title: "这款「灵感收纳神器 Bleep」让书签、笔记一键变整洁",
      slug: "bleep-inspiration-organizer",
      excerpt: "你是否也有过这样的困扰：刷到干货链接想收藏，结果散落在各个 APP；突发的创意想法随手记在备忘录，回头找时翻半天？今天给大家安利一款专为视觉思考者打造的宝藏 APP——Bleep。",
      content: `<p>你是否也有过这样的困扰：刷到干货链接想收藏，结果散落在各个 APP；突发的创意想法随手记在备忘录，回头找时翻半天；收集的设计灵感图杂乱无章，想整理却无从下手？今天给大家安利一款专为视觉思考者打造的宝藏 APP——Bleep，让书签、笔记和灵感想法在视觉网格中有序归位，从此告别混乱！</p>
<h2>核心亮点</h2>
<p><strong>一是快速保存，灵感不落地。</strong>无需切换应用，轻点一下就能将网页链接、图片素材一键添加至 Bleep，无论是刷社交平台时看到的干货内容，还是工作中遇到的参考资料，都能即时捕捉，再也不怕灵感悄悄溜走。</p>
<p><strong>二是视觉网格，拖放自由排序。</strong>区别于传统的线性记录方式，Bleep 采用灵活的网格布局，所有内容都能通过拖放自由排列组合。你可以根据自己的使用习惯和内容分类，打造专属的视觉化整理界面，一眼就能找到需要的信息，效率直接拉满。</p>
<p><strong>三是分类董事会，目标爱好各归其位。</strong>支持为不同项目、爱好或目标创建专属董事会，比如 "职场工作项目""旅行计划""设计灵感集""学习笔记" 等，让各类内容分门别类、清晰规整，再也不用在杂乱的文件夹中翻找，管理更具针对性。</p>`,
      coverImage: "https://picsum.photos/seed/bleep/800/500",
      categorySlug: "mac-ios",
      status: "published" as const,
      viewCount: 128,
      tagSlugs: ["efficiency", "quick-notes", "icloud", "bleep"],
    },
    {
      title: "2025年开了一个头，快年底再收个尾吧",
      slug: "2025-year-wrap",
      excerpt: "2025 年还有 10 余天，回首一年，钱袋空了，脑袋满了～～～今年年初，小编被 DeepSeek 惊艳到了，开启了疯狂挖掘自己的旅程。",
      content: `<p>2025 年还有 10 余天，回首一年，钱袋空了，脑袋满了～～～</p>
<p>今年年初，小编被 DeepSeek 惊艳到了，开启了疯狂挖掘自己的旅程，而正是有了 DeepSeek 的帮助，效率数倍的增长，也开启了自己的公众号写作之旅。</p>
<h2>初入公众号写作</h2>
<p>一开始，刚接触公众号写作，走进了一个误区，一味地追求公众号的排版。围绕如何做出比较好看的公众号，从排版工具、图片工具、图床、封面制作、表情包，甚至自己用 Python 写了一键加水印加上传微博图床，也整了 html 格式的排版转成图片再上传发布，花里胡哨的事儿做的真不少。到最后，虽然看上去像那么回事，但文章写的任务反而全交给了 AI，对于文章的选题研究更是没上心。</p>
<h2>停刊的纠结</h2>
<p>就这样稀里糊涂地写了两个月左右，也发布了很多篇，在此十分感谢关注小编的家人们。直到 4 月前后，因为工作的原因，被全职抽调了，时间上更少了，渐渐地更新频次就降低了，到最后也就暂停发布了。</p>`,
      coverImage: "https://picsum.photos/seed/year2025/800/500",
      categorySlug: "editor-notes",
      status: "published" as const,
      viewCount: 256,
      tagSlugs: ["cognitive-science", "year-review", "mind-journey"],
    },
    {
      title: "开发者必备！MooTool一个工具箱搞定所有开发小需求",
      slug: "mootool-dev-toolbox",
      excerpt: "MooTool 是一款开源免费的开发者百宝箱，集成了文本处理、JSON格式化、时间戳转换、Base64编解码等数十种实用小工具。",
      content: `<p>MooTool 是一款开源免费的开发者百宝箱，集成了文本处理、JSON格式化、时间戳转换、Base64编解码等数十种实用小工具。</p>
<h2>功能亮点</h2>
<ul>
<li><strong>文本处理：</strong>正则测试、Diff对比、文本去重、大小写转换</li>
<li><strong>编码解码：</strong>Base64、URL编码、MD5/SHA计算</li>
<li><strong>开发辅助：</strong>JSON格式化、SQL美化、Cron表达式解析</li>
<li><strong>实用工具：</strong>二维码生成、颜色转换、密码生成</li>
</ul>
<p>完全开源免费，Windows 平台即用即走，是程序员桌面不可或缺的小助手。</p>`,
      coverImage: "https://picsum.photos/seed/mootool/800/500",
      categorySlug: "windows",
      status: "published" as const,
      viewCount: 89,
      tagSlugs: ["efficiency", "open-source", "windows-software", "text-processing"],
    },
    {
      title: "免费的涂色素材！Colorcraft涂色书：5分钟搞定熊孩子",
      slug: "colorcraft-coloring-book",
      excerpt: "Colorcraft 提供海量免费涂色线稿，从简单几何图形到复杂风景画，适合各年龄段孩子。打印即用，培养专注力与创造力。",
      content: `<p>Colorcraft 提供海量免费涂色线稿，从简单几何图形到复杂风景画，适合各年龄段孩子。打印即用，培养专注力与创造力。</p>
<h2>为什么选择 Colorcraft？</h2>
<p>市面上的涂色书价格不菲，而且主题单一。Colorcraft 的优势在于：</p>
<ul>
<li>完全免费，可无限次打印</li>
<li>分类丰富：动物、植物、建筑、交通工具、节日主题等</li>
<li>难度分级，从 3 岁到成人都能找到合适的图案</li>
<li>高清线稿，打印效果清晰</li>
</ul>
<p>周末遛娃不知道做什么？打开 Colorcraft，选几张喜欢的图案打印出来，准备好彩笔，一个安静的下午就有了。</p>`,
      coverImage: "https://picsum.photos/seed/colorcraft/800/500",
      categorySlug: "parenting",
      status: "published" as const,
      viewCount: 312,
      tagSlugs: ["parenting-edu", "diy", "free-resources"],
    },
  ];

  for (const a of articleData) {
    const existing = await db.query.articles.findFirst({ where: eq(articles.slug, a.slug) });
    if (existing) continue;

    const cat = await db.query.categories.findFirst({ where: eq(categories.slug, a.categorySlug) });
    if (!cat) continue;

    const [{ id: articleId }] = await db.insert(articles).values({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.content,
      coverImage: a.coverImage,
      categoryId: cat.id,
      status: a.status,
      viewCount: a.viewCount,
      publishedAt: new Date(),
    }).$returningId();

    for (const tagSlug of a.tagSlugs) {
      const tag = await db.query.tags.findFirst({ where: eq(tags.slug, tagSlug) });
      if (tag) {
        await db.insert(articleTags).values({
          articleId,
          tagId: tag.id,
        }).onDuplicateKeyUpdate({ set: {} });
      }
    }
  }

  // --- Tools ---
  const toolData = [
    {
      name: "Bleep",
      description: "灵感收纳神器，书签笔记一键变整洁，支持 iCloud 同步",
      icon: "Bookmark",
      url: "https://bleep.io",
      platform: "mac" as const,
      category: "效率工具",
      isFree: true,
      sortOrder: 0,
    },
    {
      name: "MooTool",
      description: "开发者必备工具箱，JSON格式化、文本处理、编码解码一站搞定",
      icon: "Wrench",
      url: "https://github.com/rememberber/MooTool",
      platform: "windows" as const,
      category: "开发工具",
      isFree: true,
      sortOrder: 1,
    },
    {
      name: "DeepSeek",
      description: "国产最强AI大模型，推理能力惊艳，支持长文本与代码生成",
      icon: "Brain",
      url: "https://deepseek.com",
      platform: "web" as const,
      category: "AI工具",
      isFree: true,
      sortOrder: 2,
    },
    {
      name: "Colorcraft",
      description: "免费涂色线稿素材库，海量主题打印即用",
      icon: "Palette",
      url: "https://colorcraft.com",
      platform: "web" as const,
      category: "亲子教育",
      isFree: true,
      sortOrder: 3,
    },
  ];

  for (const t of toolData) {
    const existing = await db.query.tools.findFirst({ where: eq(tools.name, t.name) });
    if (!existing) {
      await db.insert(tools).values(t);
    }
  }

  // --- Online Tools ---

  for (const ot of onlineToolData) {
    const existing = await db.query.onlineTools.findFirst({ where: eq(onlineTools.slug, ot.slug) });
    if (!existing) {
      await db.insert(onlineTools).values(ot);
    }
  }

  console.log("Seed completed.");
}

seed().catch(console.error);
