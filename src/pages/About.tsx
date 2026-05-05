import { FileText, Wrench, Clock, Heart, MapPin, Coffee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import AnimatedSection from "@/sections/AnimatedSection";

export default function About() {
  const { data: articleData } = trpc.article.list.useQuery({
    status: "published",
    page: 1,
    pageSize: 1,
  });
  const { data: toolData } = trpc.tool.list.useQuery({ page: 1, pageSize: 1 });

  const articleCount = articleData?.total ?? 0;
  const toolCount = toolData?.total ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 py-12">
      {/* Profile */}
      <AnimatedSection>
        <div className="text-center mb-14">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary via-primary/80 to-amber-500 mx-auto mb-5 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-amber-500/20 shadow-xl">
            龟
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">龟兔算法</h1>
          <p className="text-muted-foreground text-lg">龟速积累，兔跃突破</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            微信公众号「与兔同行」同名独立站点
          </p>
        </div>
      </AnimatedSection>

      {/* Story */}
      <AnimatedSection delay={100}>
        <div className="bg-card border border-border rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            关于这个站点
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              这个网站是我在 2025 年初做的一个决定——不再让好的工具推荐和文章散落在各个平台，而是给自己建一个
              <strong className="text-foreground">真正属于我的小世界</strong>。
            </p>
            <p>
              我叫自己「龟兔算法」，因为我深信<strong className="text-foreground">「龟速积累，兔跃突破」</strong>。每天前进一点点，看似很慢，但持续积累终会带来质变。
            </p>
            <p>
              我是两个孩子的宝爸，一个沉迷于效率工具的创作者。日常最大的乐趣就是挖掘能让生活更轻松的软件和方法论，然后分享给有需要的人。
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={200}>
        <div className="grid grid-cols-3 gap-5 mb-10">
          <Card>
            <CardContent className="p-5 text-center">
              <FileText size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">{articleCount}</p>
              <p className="text-xs text-muted-foreground mt-1">篇精选文章</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <Wrench size={24} className="mx-auto mb-2 text-amber-600" />
              <p className="text-3xl font-bold text-foreground">{toolCount}</p>
              <p className="text-xs text-muted-foreground mt-1">个亲测工具</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <Clock size={24} className="mx-auto mb-2 text-emerald-600" />
              <p className="text-3xl font-bold text-foreground">300+</p>
              <p className="text-xs text-muted-foreground mt-1">天持续更新</p>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>

      {/* What I write */}
      <AnimatedSection delay={300}>
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-5">这里写什么？</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Wrench, title: "效率工具实测", desc: "Mac / Windows / AI 工具推荐", color: "text-blue-600 bg-blue-50" },
              { icon: MapPin, title: "遛娃育儿", desc: "亲子教育与遛娃经验分享", color: "text-emerald-600 bg-emerald-50" },
              { icon: Coffee, title: "认知与成长", desc: "年度总结与学习心得", color: "text-amber-600 bg-amber-50" },
              { icon: FileText, title: "探索发现", desc: "新奇有趣的互联网发现", color: "text-purple-600 bg-purple-50" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:shadow-soft transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* WeChat CTA */}
      <AnimatedSection delay={400}>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <div className="w-28 h-28 bg-white rounded-xl p-1.5 shadow-lg">
                <img
                  src="/wechat-qr.jpg"
                  alt="微信公众号「与兔同行」二维码"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-medium text-lg">关注「与兔同行」公众号</p>
              <p className="text-sm text-green-100 leading-relaxed mt-2">
                内容首发于公众号，网站同步归档。扫码关注，第一时间收到更新推送。
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
