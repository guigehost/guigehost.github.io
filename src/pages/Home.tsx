import { Link } from "react-router";
import {
  ArrowRight,
  Zap,
  BookOpen,
  Compass,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import ArticleCard from "@/sections/ArticleCard";
import ToolCard from "@/sections/ToolCard";
import AnimatedSection from "@/sections/AnimatedSection";

export default function Home() {
  const { data: articleData } = trpc.article.list.useQuery({
    status: "published",
    page: 1,
    pageSize: 6,
  });
  const { data: toolData } = trpc.tool.list.useQuery({
    page: 1,
    pageSize: 4,
  });
  const { data: onlineToolsData } = trpc.onlineTool.list.useQuery();

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary/[0.03] rounded-full blur-[80px] animate-float" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-amber-500/[0.04] rounded-full blur-[80px] animate-float-delayed" />
        </div>

        <div className="relative z-10 text-center px-5 max-w-5xl mx-auto">
          {/* Brand badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-border/40 text-sm font-medium mb-8 animate-fade-up shadow-soft"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>微信公众号「与兔同行」同名站点</span>
          </div>

          {/* Main title */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 animate-fade-up text-foreground drop-shadow-sm">
            龟兔算法
          </h1>

          {/* Value proposition */}
          <p
            className="text-2xl sm:text-3xl font-semibold mb-4 animate-fade-up text-primary"
            style={{ animationDelay: "150ms" }}
          >
            发现效率工具 · 记录成长轨迹
          </p>

          {/* Description */}
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            一个非技术奶爸的数字花园。帮你
            <span className="text-foreground font-medium">挖掘让工作事半功倍的宝藏工具</span>
            ，也分享
            <span className="text-foreground font-medium">育儿路上的实用经验与认知收获</span>
            。
          </p>

          {/* Stats bar */}
          <div
            className="flex items-center justify-center gap-8 sm:gap-12 text-sm text-muted-foreground mb-10 animate-fade-up"
            style={{ animationDelay: "380ms" }}
          >
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Zap size={15} className="text-blue-600 dark:text-blue-400" />
              </div>
              效率工具实测
            </span>
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <BookOpen size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              深度长文
            </span>
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Compass size={15} className="text-amber-600 dark:text-amber-400" />
              </div>
              自研在线工具
            </span>
          </div>

          {/* CTAs */}
          <div
            className="flex items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "450ms" }}
          >
            <Link to="/blog">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                浏览文章
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link to="/tools">
              <Button
                size="lg"
                variant="outline"
                className="h-14 text-base px-8 rounded-xl border-2 border-border hover:bg-muted/80"
              >
                探索工具
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={20} className="animate-bounce" />
        </div>
      </section>

      {/* ===== FEATURES / WHAT YOU GET ===== */}
      <section className="py-24 sm:py-32 bg-muted/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
                你能获得什么
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-5 tracking-tight">
                不追数量，只荐精品
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                每一款工具都经过真实工作场景验证，每一篇文章都来自亲身实践
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "效率工具实测",
                desc: "Mac、Windows、AI 工具亲测推荐，每一款都经过真实工作场景验证，帮你省下踩坑时间。",
                bg: "from-blue-500/10 to-blue-600/5",
                iconColor: "text-blue-600",
                border: "border-blue-200/50",
              },
              {
                icon: Users,
                title: "遛娃育儿经验",
                desc: "作为两个孩子的宝爸，分享亲子教育、免费资源和遛娃攻略，让育儿之路更从容。",
                bg: "from-emerald-500/10 to-emerald-600/5",
                iconColor: "text-emerald-600",
                border: "border-emerald-200/50",
              },
              {
                icon: Zap,
                title: "自研在线工具",
                desc: "遇到重复性需求就自己动手做工具，即开即用，持续迭代，也开放给有需要的人。",
                bg: "from-amber-500/10 to-amber-600/5",
                iconColor: "text-amber-600",
                border: "border-amber-200/50",
              },
            ].map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 150}>
                <div
                  className={`relative group bg-gradient-to-br ${feature.bg} border ${feature.border} rounded-2xl p-8 hover:shadow-soft-lg hover:-translate-y-2 transition-all duration-500 h-full`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-white dark:bg-white/5 shadow-soft flex items-center justify-center mb-6 ${feature.iconColor}`}
                  >
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LATEST ARTICLES ===== */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
                  最新发布
                </p>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                  文章博客
                </h2>
              </div>
              <Link
                to="/blog"
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 shrink-0 mb-2 font-medium transition-colors"
              >
                查看全部 <ArrowRight size={14} />
              </Link>
            </div>
          </AnimatedSection>

          {articleData?.articles && articleData.articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articleData.articles.map((article, i) => (
                <ArticleCard key={article.id} article={article} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
              <p>暂无文章，敬请期待</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURED TOOLS ===== */}
      <section className="py-24 sm:py-32 bg-muted/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
                亲测推荐
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-5">
                精选工具
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                每一款都经过真实工作场景验证，帮你省下踩坑时间，直接找到最适合自己的工具
              </p>
            </div>
          </AnimatedSection>

          {toolData?.tools && toolData.tools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {toolData.tools.slice(0, 4).map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              暂无工具推荐
            </div>
          )}

          <AnimatedSection delay={300}>
            <div className="text-center mt-12">
              <Link to="/tools">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-8 h-12 border-2"
                >
                  查看全部工具
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== ONLINE TOOLS CTA ===== */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/hero-tools.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-primary/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <AnimatedSection>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white/90 mb-6">
                <Zap size={14} />
                即开即用
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">
                在线工具
              </h2>
              <p className="text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
                遇到日常痛点就动手解决。无需安装、打开即用，持续迭代的小工具集合。
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {onlineToolsData?.map((tool) => (
              <Link
                key={tool.id}
                to={tool.route}
                className="group bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 border border-white/10 hover:border-white/20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <Search size={22} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-lg">{tool.name}</h3>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  {tool.description}
                </p>
                <div className="flex items-center gap-1 text-sm text-amber-300 group-hover:translate-x-1 transition-transform duration-300">
                  立即使用 <ArrowRight size={14} />
                </div>
              </Link>
            ))}
            {!onlineToolsData?.length && (
              <div className="col-span-full text-center py-4 text-white/50">
                工具开发中...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== WECHAT CTA ===== */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12">
          <AnimatedSection>
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-3xl p-8 sm:p-12 shadow-soft-lg">
              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                <div className="shrink-0">
                  <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-2xl">
                    <img
                      src="/wechat-qr.jpg"
                      alt="微信公众号「与兔同行」二维码"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    关注「与兔同行」公众号
                  </h3>
                  <p className="text-green-100 leading-relaxed mb-6">
                    扫码关注，第一时间获取最新工具推荐和文章更新。内容同步推送，不错过任何有价值的信息。
                  </p>
                  <div className="flex items-center gap-5 text-sm text-green-200">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp size={14} />
                      效率工具实测
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} />
                      认知与成长
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      遛娃育儿
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
