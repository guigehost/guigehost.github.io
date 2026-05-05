import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { categories, tags, articles, articleTags, tools } from "./schema";
import { eq } from "drizzle-orm";

async function importWechatArticles() {
  const db = getDb();

  // Get category IDs
  const catMap: Record<string, number> = {};
  const allCats = await db.select().from(categories);
  for (const c of allCats) {
    catMap[c.slug] = c.id;
  }

  const articleData = [
    {
      title: "🎨 免费的涂色素材！Colorcraft涂色书：5分钟搞定熊孩子",
      slug: "colorcraft-coloring-book-free",
      excerpt: "娃闹腾时手机塞过去怕伤眼？这款涂色APP让我家神兽安静如鸡！已经打包好的涂色素材，直接下载就用。",
      content: `<p>🎨 免费的涂色素材！Colorcraft涂色书：5分钟搞定熊孩子，赶紧来看看吧！👶</p>
<p>😩 娃闹腾时手机塞过去怕伤眼？这款涂色APP让我家神兽安静如鸡！</p>
<h2>💡 这是什么？</h2>
<p>已经打包好的涂色素材，直接下载就用</p>
<p><strong>划重点：黑白打印哦</strong></p>
<h2>🔗 获取方式</h2>
<p>名称：免费涂色素材</p>
<p>获取方式：微信搜公众号「与兔同行」或者扫描文末二维码</p>
<p>关注后回复：<strong>20250622</strong></p>
<p>如果需要将网络下载的图片转为涂色素材，就看小编往期的转线稿SOP教材吧！！！</p>
<p>💬 悄悄说：自从给娃玩上涂色，我一下子轻松极了…</p>
<p>你们家娃最爱涂什么图案？👇 评论区见！</p>`,
      coverImage: "https://picsum.photos/seed/colorcraft2/800/500",
      categoryId: catMap["parenting"],
      status: "published" as const,
      viewCount: 312,
      tagSlugs: ["free-resources", "diy", "parenting-edu"],
      publishedAt: new Date("2025-06-22"),
    },
    {
      title: "🌟 开发者必备！MooTool：一个工具箱搞定所有开发小需求！",
      slug: "mootool-dev-toolbox-full",
      excerpt: "写代码时总被琐碎工具打断？JSON格式化、时间戳转换、Base64编码…80%的开发辅助工具其实都是重复需求！",
      content: `<p>🌟 开发者必备！MooTool：一个工具箱搞定所有开发小需求！🚀</p>
<p>🔍 写代码时总被琐碎工具打断？我也烦透了频繁切换网页查编码、调时间戳的日子…😤</p>
<p>JSON格式化、时间戳转换、Base64编码…突然发现：</p>
<p><strong>「80% 的开发辅助工具，其实都是重复需求！」</strong></p>
<p>👇直到遇见「MooTool」——这个开源工具箱把我常用的 N 种工具都塞进了1个桌面应用！</p>
<h2>💡 这是什么？</h2>
<p>开发者专属的瑞士军刀！把编码转换、正则测试、文本处理等高频工具打包成轻量级应用，支持Win/Mac双平台。</p>
<h2>✨ 让我力荐的3大理由</h2>
<p><strong>❗️ 聚合高频工具</strong></p>
<p>JSON/XML格式化、URL编解码、哈希生成、二维码生成等12+工具随用随点</p>
<p><strong>✅ 完全离线使用</strong></p>
<p>再也不用担心调试时突然断网，敏感数据也不怕外传</p>
<p><strong>🚀 极致轻量化</strong></p>
<p>100MB 左右的安装包，启动速度比浏览器快3倍，老旧电脑也能流畅跑</p>
<h2>⭐️ 核心功能介绍</h2>
<ul>
<li>⚙️ 编码转换：Base64、URL、Hex、Unicode</li>
<li>📅 时间戳转换：Unix时间戳 ↔ 日期格式</li>
<li>🔍 正则测试：实时匹配、替换测试</li>
<li>📊 JSON格式化：美化、压缩、校验</li>
<li>🎨 二维码生成：文本/URL转二维码</li>
<li>🔐 哈希生成：MD5、SHA1、SHA256</li>
</ul>
<h2>🔗 获取方式</h2>
<p>名称：MooTool</p>
<p>获取方式：微信搜公众号「与兔同行」或者扫描文末二维码</p>
<p>关注后回复：<strong>20250622</strong></p>
<p>💬 自从用了它，我的浏览器标签页从20+降到5个！你也来试试吧~</p>`,
      coverImage: "https://picsum.photos/seed/mootool2/800/500",
      categoryId: catMap["windows"],
      status: "published" as const,
      viewCount: 189,
      tagSlugs: ["open-source", "windows-software", "efficiency"],
      publishedAt: new Date("2025-06-22"),
    },
    {
      title: "💾 Mac必备小工具！一键管理外接硬盘，告别繁琐操作！",
      slug: "mountmate-mac-disk-manager",
      excerpt: "还在为mac系统无法与Windows系统共用一个U盘发愁？MountMate常驻菜单栏的硬盘管家，把复杂的磁盘操作变成一键搞定！",
      content: `<p>🌟 Mac必备小工具！一键管理外接硬盘，告别繁琐操作！💾</p>
<p>💻 还在为 mac 系统无法与 Windows 系统共用一个「U 盘」发愁？</p>
<p>这个隐藏神器让你解决这个问题！</p>
<p>MountMate - 常驻菜单栏的硬盘管家！把复杂的磁盘操作变成「一键搞定」✨</p>
<h2>✨ 让我力荐的3大理由</h2>
<p><strong>❗️ 极简操作</strong></p>
<p>插硬盘自动识别，点图标就能弹出/挂载</p>
<p><strong>✅ 状态可视</strong></p>
<p>菜单栏图标实时显示硬盘连接状态（绿色=已挂载，灰色=未挂载）</p>
<p><strong>🚀 完全免费</strong></p>
<p>开源工具无广告，不占系统资源</p>
<h2>🔥 功能介绍</h2>
<ul>
<li>自动识别外接硬盘和U盘</li>
<li>一键弹出/安全卸载</li>
<li>NTFS格式硬盘读写支持</li>
<li>常驻菜单栏，随时可用</li>
</ul>
<h2>🔗 获取方式</h2>
<p>名称：Mountmate</p>
<p>获取方式：微信搜公众号「与兔同行」或者扫描文末二维码</p>
<p>关注后回复：<strong>20250622</strong></p>
<p>💬 从此告别硬盘管理焦虑！试过的朋友都说回不去了~</p>
<p>现在是永久会员限免时间哦，快去试试看~</p>
<p>👇 你在用什么效率工具？评论区交换宝藏吧！</p>`,
      coverImage: "https://picsum.photos/seed/mountmate/800/500",
      categoryId: catMap["mac-ios"],
      status: "published" as const,
      viewCount: 245,
      tagSlugs: ["mac-tools", "efficiency", "free-resources"],
      publishedAt: new Date("2025-06-22"),
    },
    {
      title: "📸 一键去水印神器！从此告别烦人水印，照片秒变干净！",
      slug: "ai-watermark-remover",
      excerpt: "好不容易找到张好图，却被水印毁了心情？AI自动识别+消除水印，连复杂背景都能处理干净！",
      content: `<p>📸 一键去水印神器！从此告别烦人水印，照片秒变干净！✨</p>
<p>😩 好不容易找到张好图，却被水印毁了心情？这个工具让我彻底解脱！</p>
<h2>🔍 我的真实困境</h2>
<p>上周做网站找配图，10张有8张带水印！</p>
<p>要么忍痛放弃，要么花半小时PS…</p>
<p>直到发现这个宝藏App！</p>
<h2>💡 这是什么？</h2>
<p>傻瓜级去水印工具！AI自动识别+消除水印，连复杂背景都能处理干净，手机电脑都能用~</p>
<h2>✨ 让我力荐的3大理由</h2>
<p><strong>❗️ 精准识别</strong></p>
<p>连半透明水印/文字LOGO都能检测，不用手动框选！</p>
<p><strong>✅ 无损画质</strong></p>
<p>处理后几乎看不出痕迹，不像某些软件会糊成马赛克</p>
<p><strong>🚀 3秒出图</strong></p>
<p>上传→AI处理→下载，全程不超过点击5次</p>
<h2>📚 工具介绍</h2>
<p>🈯️ 操作说明：</p>
<ul>
<li>上传需要去水印的图片</li>
<li>AI自动识别水印区域</li>
<li>一键处理，下载高清原图</li>
</ul>
<h2>🔗 获取方式</h2>
<p>名称：图片AI去水印</p>
<p>获取方式：微信搜公众号「与兔同行」或者扫描文末二维码</p>
<p>关注后回复：<strong>20250622</strong></p>
<p>💬 亲测拯救了我100+张素材图！你也遇到过水印烦恼吗？</p>
<p>现在是永久会员限免时间哦，快去试试看~</p>
<p>👇 评论区等你晒成果！</p>`,
      coverImage: "https://picsum.photos/seed/watermark/800/500",
      categoryId: catMap["ai-tools"],
      status: "published" as const,
      viewCount: 378,
      tagSlugs: ["ai-tools", "free-resources", "efficiency"],
      publishedAt: new Date("2025-06-22"),
    },
    {
      title: "📱 截图翻译神器！1秒搞定外语图片，阅读无障碍！",
      slug: "screenshot-translator-ai",
      excerpt: "看到满屏外文就头大？截图翻译工具让你秒懂全世界！能直接翻译手机截图、照片里的外语文字，不用手动输入，拍照即翻！",
      content: `<p>📱 截图翻译神器！1秒搞定外语图片，阅读无障碍！✨</p>
<p>🔍 看到满屏外文就头大？截图翻译工具让你秒懂全世界！</p>
<p>对于我这个只对技术感兴趣的偏科男来讲，经常查看英文材料特别头疼，虽然在浏览器上各种插件已经帮我搞定了这一切，但对于图片和PDF上的英文内容还是不太方便…😅</p>
<p>直到发现这个「截图秒翻」神器，从此看外文资料像看中文一样顺滑！</p>
<h2>💡 这是什么？</h2>
<p>就是能直接翻译「手机截图｜照片」里的外语文字的工具！</p>
<p>不用手动输入，拍照即翻，准确率超高！</p>
<p><strong>划重点：牛的是可以直接将结果保存为图片➡️这是我最需要的</strong></p>
<h2>🕑 产品特色</h2>
<ul>
<li>支持多种语言互译</li>
<li>保留原图排版格式</li>
<li>翻译结果可保存为图片</li>
<li>支持批量处理</li>
</ul>
<h2>🔗 获取方式</h2>
<p>名称：AI图像识别翻译</p>
<p>获取方式：微信搜公众号「与兔同行」或者扫描文末二维码</p>
<p>关注后回复：<strong>20250622</strong></p>
<p>💬 从此看外文资料再也不求人！你最近遇到什么翻译难题？快来试试这个神器吧~</p>
<p>现在是永久会员限免时间哦，快去试试看~</p>
<p>👇 评论区聊聊你的日常痛点，小编可以帮忙找找适合你的那款神器～</p>`,
      coverImage: "https://picsum.photos/seed/translate/800/500",
      categoryId: catMap["ai-tools"],
      status: "published" as const,
      viewCount: 267,
      tagSlugs: ["ai-tools", "free-resources", "efficiency"],
      publishedAt: new Date("2025-06-22"),
    },
    {
      title: "📝 灵感卡片：一款终身免费、极简高效的笔记神器！",
      slug: "inspiration-cards-note-app",
      excerpt: "灵感总在洗澡时闪现？开会时想法乱飞？这款真正不折腾的笔记APP，让我从此告别「啊我刚才想到啥来着」的抓狂时刻！",
      content: `<p>📝 灵感卡片：一款终身免费、极简高效的笔记神器！解放你的碎片化记录！✨</p>
<p>😩 灵感总在洗澡时闪现？开会时想法乱飞？这款真正不折腾的笔记APP，让我从此告别「啊我刚才想到啥来着」的抓狂时刻！</p>
<h2>💡 这是什么？</h2>
<p>灵感卡片是一款极简风格的快速记录工具，专为碎片化灵感设计。</p>
<ul>
<li>打开即写，无需等待</li>
<li>卡片式组织，一目了然</li>
<li>支持标签分类和全文搜索</li>
<li>数据本地存储，隐私安全</li>
</ul>
<h2>✨ 核心亮点</h2>
<p><strong>⚡ 极速记录</strong></p>
<p>从打开到记录只需要1秒，比打开备忘录快3倍</p>
<p><strong>🏷️ 智能标签</strong></p>
<p>自动识别内容关键词，智能推荐标签</p>
<p><strong>🔒 本地优先</strong></p>
<p>数据存在本地，不上传云端，保护隐私</p>
<h2>🔗 获取方式</h2>
<p>名称：灵感卡片</p>
<p>获取方式：微信搜公众号「与兔同行」或者扫描文末二维码</p>
<p>关注后回复：<strong>20250622</strong></p>
<p>💬 自从用了它，我再也没有丢失过任何一个灵感！</p>`,
      coverImage: "https://picsum.photos/seed/inspiration/800/500",
      categoryId: catMap["mac-ios"],
      status: "published" as const,
      viewCount: 156,
      tagSlugs: ["quick-notes", "efficiency", "mac-tools"],
      publishedAt: new Date("2025-06-20"),
    },
    {
      title: "📸 AI图像识别翻译：拍照即翻，准确率超高！",
      slug: "ai-image-ocr-translator",
      excerpt: "不用手动输入，拍照即翻，准确率超高！牛的是可以直接将结果保存为图片。",
      content: `<p>📸 AI图像识别翻译：拍照即翻，准确率超高！</p>
<p>不用手动输入，拍照即翻，准确率超高！</p>
<p><strong>划重点：牛的是可以直接将结果保存为图片➡️这是我最需要的</strong></p>
<p>对于我这个只对技术感兴趣的偏科男来讲，经常查看英文材料特别头疼，虽然在浏览器上各种插件已经帮我搞定了这一切，但对于图片和PDF上的英文内容还是不太方便…</p>
<p>直到发现这个「截图秒翻」神器，从此看外文资料像看中文一样顺滑！</p>
<h2>🕑 产品特色</h2>
<ul>
<li>支持截图/拍照翻译</li>
<li>保留原文排版格式</li>
<li>翻译结果可导出为图片</li>
<li>支持多语言互译</li>
</ul>
<h2>🔗 获取方式</h2>
<p>名称：AI图像识别翻译</p>
<p>获取方式：微信搜公众号「与兔同行」</p>
<p>关注后回复：<strong>20250622</strong></p>`,
      coverImage: "https://picsum.photos/seed/aiocr/800/500",
      categoryId: catMap["ai-tools"],
      status: "published" as const,
      viewCount: 198,
      tagSlugs: ["ai-tools", "efficiency"],
      publishedAt: new Date("2025-06-18"),
    },
    {
      title: "🌟 2025年度总结：龟速积累，兔跃突破",
      slug: "2025-year-review-growth",
      excerpt: "2025年还有10余天，回首一年，钱袋空了，脑袋满了。今年年初被DeepSeek惊艳到了，开启了疯狂挖掘自己的旅程。",
      content: `<p>2025 年还有 10 余天，回首一年，钱袋空了，脑袋满了～～～</p>
<p>今年年初，小编被 DeepSeek 惊艳到了，开启了疯狂挖掘自己的旅程，而正是有了 DeepSeek 的帮助，效率数倍的增长，也开启了自己的公众号写作之旅。</p>
<h2>初入公众号写作</h2>
<p>一开始，刚接触公众号写作，走进了一个误区，一味地追求公众号的排版。围绕如何做出比较好看的公众号，从排版工具、图片工具、图床、封面制作、表情包，甚至自己用 Python 写了一键加水印加上传微博图床，也整了 html 格式的排版转成图片再上传发布，花里胡哨的事儿做的真不少。到最后，虽然看上去像那么回事，但文章写的任务反而全交给了 AI，对于文章的选题研究更是没上心。</p>
<h2>停刊的纠结</h2>
<p>就这样稀里糊涂地写了两个月左右，也发布了很多篇，在此十分感谢关注小编的家人们。直到 4 月前后，因为工作的原因，被全职抽调了，时间上更少了，渐渐地更新频次就降低了，到最后也就暂停发布了。</p>
<h2>重新开始</h2>
<p>现在重新出发，建立了自己的独立站点 guige.host，不再受制于平台。也希望通过这个站点，把之前零散的内容沉淀下来，形成一个真正属于自己的数字花园。</p>
<p>龟速积累，终将迎来兔跃突破。</p>`,
      coverImage: "https://picsum.photos/seed/year2025b/800/500",
      categoryId: catMap["editor-notes"],
      status: "published" as const,
      viewCount: 356,
      tagSlugs: ["year-review", "mind-journey", "cognitive-science"],
      publishedAt: new Date("2025-12-20"),
    },
    {
      title: "✨ 这款「灵感收纳神器 Bleep」让书签、笔记一键变整洁",
      slug: "bleep-inspiration-organizer-full",
      excerpt: "刷到干货链接想收藏，结果散落在各个APP？突发的创意想法随手记在备忘录，回头找时翻半天？Bleep专为视觉思考者打造。",
      content: `<p>你是否也有过这样的困扰：刷到干货链接想收藏，结果散落在各个 APP；突发的创意想法随手记在备忘录，回头找时翻半天；收集的设计灵感图杂乱无章，想整理却无从下手？今天给大家安利一款专为视觉思考者打造的宝藏 APP——Bleep，让书签、笔记和灵感想法在视觉网格中有序归位，从此告别混乱！</p>
<h2>核心亮点</h2>
<p><strong>一是快速保存，灵感不落地。</strong>无需切换应用，轻点一下就能将网页链接、图片素材一键添加至 Bleep，无论是刷社交平台时看到的干货内容，还是工作中遇到的参考资料，都能即时捕捉，再也不怕灵感悄悄溜走。</p>
<p><strong>二是视觉网格，拖放自由排序。</strong>区别于传统的线性记录方式，Bleep 采用灵活的网格布局，所有内容都能通过拖放自由排列组合。你可以根据自己的使用习惯和内容分类，打造专属的视觉化整理界面，一眼就能找到需要的信息，效率直接拉满。</p>
<p><strong>三是分类董事会，目标爱好各归其位。</strong>支持为不同项目、爱好或目标创建专属董事会，比如 "职场工作项目""旅行计划""设计灵感集""学习笔记" 等，让各类内容分门别类、清晰规整，再也不用在杂乱的文件夹中翻找，管理更具针对性。</p>
<h2>🔗 获取方式</h2>
<p>名称：Bleep</p>
<p>获取方式：微信搜公众号「与兔同行」</p>
<p>💬 用过 Bleep 后，我的浏览器书签从300+降到了50个精华！</p>`,
      coverImage: "https://picsum.photos/seed/bleep2/800/500",
      categoryId: catMap["mac-ios"],
      status: "published" as const,
      viewCount: 228,
      tagSlugs: ["bleep", "efficiency", "quick-notes", "icloud"],
      publishedAt: new Date("2025-03-15"),
    },
    {
      title: "🎨 转线稿SOP：把任意图片变成涂色素材",
      slug: "image-to-lineart-sop",
      excerpt: "如何将网络下载的图片转为涂色素材？这篇SOP教材教你一步步操作，让任何图片都能变成孩子的涂色线稿。",
      content: `<p>🎨 转线稿SOP：把任意图片变成涂色素材</p>
<p>很多家长问我：网上找到的好图片，怎么转成适合孩子涂色的线稿？</p>
<p>今天分享一个简单的方法，不需要专业设计软件，几分钟就能搞定。</p>
<h2>方法一：在线工具（推荐）</h2>
<p>使用在线线稿转换工具，上传图片后自动提取轮廓：</p>
<ul>
<li>支持多种图片格式</li>
<li>可调节线条粗细</li>
<li>自动去除颜色保留轮廓</li>
<li>免费使用</li>
</ul>
<h2>方法二：Photoshop/GIMP</h2>
<ol>
<li>打开图片，复制图层</li>
<li>去色（Ctrl+Shift+U）</li>
<li>反相（Ctrl+I）</li>
<li>混合模式改为「颜色减淡」</li>
<li>应用最小值滤镜（半径1-2px）</li>
</ol>
<h2>打印建议</h2>
<ul>
<li>使用A4纸打印</li>
<li>线条不要太细（方便孩子涂）</li>
<li>复杂图案可以适当简化</li>
</ul>
<p>💬 你家娃最喜欢涂什么？评论区告诉我，我可以帮找素材！</p>`,
      coverImage: "https://picsum.photos/seed/lineart/800/500",
      categoryId: catMap["parenting"],
      status: "published" as const,
      viewCount: 145,
      tagSlugs: ["diy", "parenting-edu", "free-resources"],
      publishedAt: new Date("2025-05-10"),
    },
    {
      title: "🔐 隐私保护工具推荐：数字时代的自我防护",
      slug: "privacy-tools-digital-protection",
      excerpt: "在数字时代，隐私泄露无处不在。分享几款我亲测的隐私保护工具，从密码管理到加密通讯，全方位守护你的数字安全。",
      content: `<p>🔐 隐私保护工具推荐：数字时代的自我防护</p>
<p>在数字时代，隐私泄露无处不在。从社交平台的过度收集，到各种APP的权限滥用，我们的个人信息正在以惊人的速度外流。</p>
<h2>密码管理</h2>
<p><strong>Bitwarden</strong> — 开源免费的密码管理器</p>
<ul>
<li>支持全平台同步</li>
<li>端到端加密</li>
<li>可自建服务器</li>
<li>完全免费</li>
</ul>
<h2>加密通讯</h2>
<p><strong>Signal</strong> — 最安全的即时通讯工具</p>
<ul>
<li>开源协议</li>
<li>端到端加密</li>
<li>元数据保护</li>
<li>非营利运营</li>
</ul>
<h2>浏览器隐私</h2>
<ul>
<li>Brave 浏览器 — 内置广告拦截和追踪保护</li>
<li>DuckDuckGo 搜索引擎 — 不记录搜索历史</li>
<li>uBlock Origin 插件 — 最强广告拦截</li>
</ul>
<h2>文件加密</h2>
<p><strong>VeraCrypt</strong> — 创建加密磁盘卷</p>
<ul>
<li>军工级加密算法</li>
<li>隐藏卷功能</li>
<li>开源免费</li>
</ul>
<p>💬 你用什么工具保护自己的隐私？欢迎分享！</p>`,
      coverImage: "https://picsum.photos/seed/privacy/800/500",
      categoryId: catMap["discovery"],
      status: "published" as const,
      viewCount: 198,
      tagSlugs: ["privacy", "open-source", "free-resources"],
      publishedAt: new Date("2025-04-20"),
    },
    {
      title: "🚀 DeepSeek 使用指南：国产最强AI的正确打开方式",
      slug: "deepseek-ai-guide",
      excerpt: "DeepSeek 是2025年最让我惊艳的国产AI大模型。推理能力超强，支持长文本与代码生成。这篇指南分享我的使用心得和高效Prompt技巧。",
      content: `<p>🚀 DeepSeek 使用指南：国产最强AI的正确打开方式</p>
<p>DeepSeek 是2025年最让我惊艳的国产AI大模型。从第一次使用就被它的推理能力震撼到了——不是简单的信息检索，而是真正的逻辑推理和创造性输出。</p>
<h2>为什么选择 DeepSeek？</h2>
<p><strong>1. 推理能力超强</strong></p>
<p>不同于其他模型的「模式匹配」，DeepSeek 能进行多步推理，特别适合编程、数学和复杂分析。</p>
<p><strong>2. 长文本支持</strong></p>
<p>支持超长上下文，可以一次性分析整篇论文或大量代码。</p>
<p><strong>3. 代码能力</strong></p>
<p>编程辅助效果极佳，不仅能写代码，还能解释逻辑、优化性能。</p>
<h2>高效 Prompt 技巧</h2>
<ol>
<li><strong>角色设定</strong>：告诉AI它是什么专家</li>
<li><strong>输出格式</strong>：明确期望的格式（表格、列表、代码）</li>
<li><strong>分步思考</strong>：复杂任务让AI分步骤完成</li>
<li><strong>示例引导</strong>：给1-2个例子让AI理解风格</li>
</ol>
<h2>我的使用场景</h2>
<ul>
<li>公众号文章初稿生成</li>
<li>代码review和优化建议</li>
<li>技术方案设计</li>
<li>数据分析报告</li>
</ul>
<p>💬 你用 DeepSeek 解决了什么问题？评论区交流！</p>`,
      coverImage: "https://picsum.photos/seed/deepseek/800/500",
      categoryId: catMap["ai-tools"],
      status: "published" as const,
      viewCount: 512,
      tagSlugs: ["ai-coding", "ai-tools", "efficiency"],
      publishedAt: new Date("2025-02-10"),
    },
  ];

  let imported = 0;
  for (const a of articleData) {
    const existing = await db.query.articles.findFirst({
      where: eq(articles.slug, a.slug),
    });
    if (existing) continue;

    const [{ id: articleId }] = await db
      .insert(articles)
      .values({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        coverImage: a.coverImage,
        categoryId: a.categoryId,
        status: a.status,
        viewCount: a.viewCount,
        publishedAt: a.publishedAt,
      })
      .$returningId();

    for (const tagSlug of a.tagSlugs) {
      const tag = await db.query.tags.findFirst({
        where: eq(tags.slug, tagSlug),
      });
      if (tag) {
        await db
          .insert(articleTags)
          .values({ articleId, tagId: tag.id })
          .onDuplicateKeyUpdate({ set: {} });
      }
    }

    imported++;
  }

  // Also import some tools from the articles
  const newTools = [
    {
      name: "MountMate",
      description: "Mac菜单栏硬盘管家，一键管理外接硬盘和U盘",
      icon: "HardDrive",
      url: "https://mountmate.app",
      platform: "mac" as const,
      category: "系统工具",
      isFree: true,
      sortOrder: 4,
    },
    {
      name: "AI图像识别翻译",
      description: "截图/拍照翻译神器，支持保存翻译结果为图片",
      icon: "ScanText",
      url: "https://ai-translate.example",
      platform: "all" as const,
      category: "AI工具",
      isFree: true,
      sortOrder: 5,
    },
    {
      name: "灵感卡片",
      description: "终身免费极简笔记工具，专为碎片化灵感设计",
      icon: "StickyNote",
      url: "https://inspiration-cards.app",
      platform: "all" as const,
      category: "效率工具",
      isFree: true,
      sortOrder: 6,
    },
    {
      name: "AI去水印",
      description: "AI自动识别并消除图片水印，支持复杂背景",
      icon: "Eraser",
      url: "https://ai-watermark-remover.example",
      platform: "web" as const,
      category: "AI工具",
      isFree: true,
      sortOrder: 7,
    },
    {
      name: "Bitwarden",
      description: "开源免费密码管理器，支持全平台同步和自建服务器",
      icon: "Shield",
      url: "https://bitwarden.com",
      platform: "all" as const,
      category: "隐私安全",
      isFree: true,
      sortOrder: 8,
    },
    {
      name: "Signal",
      description: "最安全的即时通讯工具，端到端加密，开源协议",
      icon: "MessageCircle",
      url: "https://signal.org",
      platform: "all" as const,
      category: "隐私安全",
      isFree: true,
      sortOrder: 9,
    },
  ];

  let toolsImported = 0;
  for (const t of newTools) {
    const existing = await db.query.tools.findFirst({
      where: eq(tools.name, t.name),
    });
    if (!existing) {
      await db.insert(tools).values(t);
      toolsImported++;
    }
  }

  console.log(`Imported ${imported} articles and ${toolsImported} tools.`);
}

importWechatArticles().catch(console.error);
