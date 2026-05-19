import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, FileText, Zap, Shield } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function ToolLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { data: onlineTools, isLoading } = trpc.onlineTool.list.useQuery();

  const tool = onlineTools?.find((t) => t.slug === slug);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">工具不存在</h1>
        <Button onClick={() => navigate("/tools")}>返回工具列表</Button>
      </div>
    );
  }

  const handleUse = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate(tool.route);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-50/30 to-background" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Zap size={14} />
                自研工具
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-6 tracking-tight">{tool.name}</h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{tool.description}</p>
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleUse}
                  className="gradient-primary text-white border-none"
                  style={{ height: 56, paddingInline: 32, borderRadius: 14 }}
                >
                  立即使用
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Shield size={14} />
                  消耗 1 兔点/次
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 to-purple-100 border border-border/50 flex items-center justify-center"
                style={{ boxShadow: "0 8px 40px -6px rgba(0,0,0,0.12)" }}
              >
                <FileText size={64} className="text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-3xl font-bold text-center mb-12">功能特点</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Word模板填充",
                desc: "支持 Word 文档模板标签，自动填充数据，告别重复复制粘贴",
              },
              {
                icon: Zap,
                title: "批量处理",
                desc: "一键批量填充多个文档，效率提升百倍",
              },
              {
                icon: Shield,
                title: "数据安全",
                desc: "本地处理，数据不上传服务器，保障您的隐私安全",
              },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-3xl font-bold text-center mb-12">如何使用</h2>
          <div className="space-y-6">
            {[
              { step: "01", title: "上传 Word 模板", desc: "上传包含 {{标签}} 的 Word 文档模板" },
              { step: "02", title: "填写数据", desc: "按照模板格式填写或导入数据" },
              { step: "03", title: "一键生成", desc: "点击生成，自动填充所有文档" },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
          <div className="space-y-4">
            {[
              { q: "兔点是什么？如何获得？", a: "兔点是网站的虚拟货币，注册即送100兔点，每日签到可获得10兔点。" },
              { q: "如何上传模板？", a: "在工具页面点击上传按钮，选择本地 Word 文档即可。模板中使用 {{字段名}} 作为占位符。" },
              { q: "支持哪些格式？", a: "目前支持 .docx 格式的 Word 文档。" },
              { q: "数据安全吗？", a: "所有处理在本地完成，文件不会上传到服务器。" },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-bold mb-4">开始使用</h2>
          <p className="text-muted-foreground mb-8">告别重复工作，让 {tool.name} 帮你自动化</p>
          <Button
            size="lg"
            onClick={handleUse}
            className="gradient-primary text-white border-none"
            style={{ height: 56, paddingInline: 48, borderRadius: 14 }}
          >
            立即体验 · 消耗 1 兔点
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
