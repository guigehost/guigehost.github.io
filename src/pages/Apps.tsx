import { Link } from "react-router";
import { AppWindow, ArrowRight, Plus, Code, Globe } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AnimatedSection from "@/sections/AnimatedSection";
import { Card, CardContent } from "@/components/ui/card";

export default function Apps() {
  const { data: onlineTools } = trpc.onlineTool.list.useQuery();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedSection>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
            <Code size={14} />
            自研工具
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">在线工具大厅</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            遇到日常痛点就动手解决。所有工具无需安装、打开即用，持续迭代优化。
            <br className="hidden sm:block" />
            如果你有需求，也欢迎告诉我，说不定下一个工具就是为你做的。
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {onlineTools?.map((tool, i) => (
          <AnimatedSection key={tool.id} delay={i * 100}>
            <Link to={tool.route} className="block h-full">
              <Card className="group h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border cursor-pointer overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                      <AppWindow size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {tool.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
                          立即使用 <ArrowRight size={12} />
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe size={10} />
                          在线工具
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </AnimatedSection>
        ))}

        {/* Add tool teaser */}
        <AnimatedSection delay={(onlineTools?.length || 0) * 100}>
          <div className="h-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors cursor-default">
            <Plus size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">更多工具开发中</p>
            <p className="text-xs mt-1">有需求就告诉我</p>
          </div>
        </AnimatedSection>
      </div>

      {/* How to add tools */}
      <AnimatedSection delay={300}>
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-muted/50 rounded-2xl p-6 sm:p-8 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Code size={18} className="text-primary" />
              关于工具扩展
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                这个站点的在线工具模块是<strong className="text-foreground">可扩展的</strong>。每当发现新的日常痛点，我就会开发一个小工具并挂到这个大厅。
              </p>
              <p>
                目前工具通过管理后台动态配置，新增工具只需在后台添加名称、描述、路由等信息，即可自动出现在大厅和导航中。
              </p>
              <p>
                如果你有想做的工具点子，或者需要将自己的程序接入，欢迎通过公众号「与兔同行」私信交流。
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
