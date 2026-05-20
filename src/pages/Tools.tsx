import { Link } from "react-router";
import { ArrowRight, FileText, Zap, Shield, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection from "@/sections/AnimatedSection";

const features = [
  {
    icon: FileText,
    title: "Word模板填充",
    description: "支持{.标记}语法，批量填充Word文档模板",
  },
  {
    icon: Zap,
    title: "批量处理",
    description: "Excel数据一键批量生成多个文档",
  },
  {
    icon: Shield,
    title: "格式保留",
    description: "完美保留原文的字体、颜色、排版格式",
  },
  {
    icon: Clock,
    title: "高效快速",
    description: "100个文档仅需几秒即可生成",
  },
];

const useCases = [
  "批量生成合同/协议",
  "学生成绩单批量打印",
  "员工信息表批量生成",
  "信封/标签批量打印",
  "报表自动生成",
];

export default function Tools() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12">
      <AnimatedSection>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap size={14} /> 自研工具
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight mb-6">
            兔填填
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Word模板填充神器 - 上传模板，导入数据，自动填充。告别重复工作，让效率倍增。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/apps/tutiantian">
              <Button size="lg" className="rounded-2xl text-base px-8 h-14">
                立即使用
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link to="/tools/tutiantian">
              <Button variant="outline" size="lg" className="rounded-2xl text-base px-8 h-14">
                了解更多
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Feature Cards */}
      <AnimatedSection delay={100}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, i) => (
            <Card key={i} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedSection>

      {/* Use Cases */}
      <AnimatedSection delay={200}>
        <Card className="border-border/50 mb-16">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              适用场景
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {useCases.map((useCase, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm"
                >
                  <CheckCircle size={16} className="text-primary" />
                  {useCase}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Pricing Preview */}
      <AnimatedSection delay={300}>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            如何计费
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            兔填填使用龟兔算法的兔点进行计费，每生成一个文档消耗1兔点
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          <Card className="border-border/50 text-center">
            <CardContent className="pt-8 pb-6">
              <div className="text-4xl font-bold text-foreground mb-2">100</div>
              <div className="text-sm text-muted-foreground mb-4">兔点</div>
              <div className="text-2xl font-bold text-primary mb-1">¥6</div>
              <div className="text-xs text-muted-foreground mb-4">首充特惠</div>
              <Link to="/user?tab=recharge">
                <Button variant="outline" size="sm" className="rounded-xl w-full">
                  前往充值
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-border/50 text-center">
            <CardContent className="pt-8 pb-6">
              <div className="text-4xl font-bold text-foreground mb-2">500</div>
              <div className="text-sm text-muted-foreground mb-4">兔点</div>
              <div className="text-2xl font-bold text-primary mb-1">¥28</div>
              <div className="text-xs text-muted-foreground mb-4">约5.6分/兔点</div>
              <Link to="/user?tab=recharge">
                <Button variant="outline" size="sm" className="rounded-xl w-full">
                  前往充值
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-border/50 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 bg-primary/10 text-primary text-xs font-medium py-1">
              推荐
            </div>
            <CardContent className="pt-10 pb-6">
              <div className="text-4xl font-bold text-foreground mb-2">1000</div>
              <div className="text-sm text-muted-foreground mb-4">兔点</div>
              <div className="text-2xl font-bold text-primary mb-1">¥50</div>
              <div className="text-xs text-muted-foreground mb-4">约5分/兔点</div>
              <Link to="/user?tab=recharge">
                <Button size="sm" className="rounded-xl w-full">
                  前往充值
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <div className="text-center">
          <Link to="/user">
            <Button variant="outline" size="lg" className="rounded-2xl">
              前往会员中心
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection delay={400}>
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-700 text-sm font-medium mb-6">
            <CheckCircle size={14} /> 注册即送100兔点
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            立即开始使用
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            告别重复性的文档填充工作，把时间花在更有价值的事情上
          </p>
          <Link to="/apps/tutiantian">
            <Button size="lg" className="rounded-2xl text-base px-10 h-14 gradient-primary text-white border-none">
              开始使用兔填填
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}
