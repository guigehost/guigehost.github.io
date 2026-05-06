import { Link } from "react-router";
import {
  FileText,
  Wrench,
  Eye,
  PencilLine,
  TrendingUp,
  Users,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminDashboard() {
  const { data: articleData } = trpc.article.list.useQuery({
    status: "all",
    page: 1,
    pageSize: 100,
  });
  const { data: toolData } = trpc.tool.list.useQuery({ page: 1, pageSize: 1 });
  const { data: categoryData } = trpc.category.list.useQuery();

  const articles = articleData?.articles ?? [];
  const totalArticles = articleData?.total ?? 0;
  const publishedCount = articles.filter((a) => a.status === "published").length;
  const draftCount = articles.filter((a) => a.status === "draft").length;
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount ?? 0), 0);

  // Article trend by month (last 6 months)
  const trendData = (() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = 0;
    }
    articles.forEach((a) => {
      const d = new Date(a.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (months[key] !== undefined) months[key]++;
    });
    return Object.entries(months).map(([name, value]) => ({
      name: name.slice(5) + "月",
      value,
    }));
  })();

  // Category distribution
  const categoryDistribution = (() => {
    const counts: Record<string, number> = {};
    articles.forEach((a) => {
      const name = a.category?.name ?? "未分类";
      counts[name] = (counts[name] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

  const stats = [
    {
      label: "文章总数",
      value: totalArticles,
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      lightColor: "bg-blue-50 text-blue-600",
      href: "/admin/articles",
    },
    {
      label: "总阅读量",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "from-emerald-500 to-emerald-600",
      lightColor: "bg-emerald-50 text-emerald-600",
      href: "/admin/articles",
    },
    {
      label: "已发布",
      value: publishedCount,
      icon: TrendingUp,
      color: "from-amber-500 to-amber-600",
      lightColor: "bg-amber-50 text-amber-600",
      href: "/admin/articles",
    },
    {
      label: "草稿箱",
      value: draftCount,
      icon: PencilLine,
      color: "from-purple-500 to-purple-600",
      lightColor: "bg-purple-50 text-purple-600",
      href: "/admin/articles",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">仪表盘</h1>
        <p className="text-sm text-muted-foreground">
          欢迎回来，{new Date().toLocaleDateString("zh-CN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group overflow-hidden">
              <CardContent className="p-0">
                <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                <div className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.lightColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              文章发布趋势（近6个月）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorArticles)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChartIcon size={16} className="text-primary" />
              文章分类分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {categoryDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>最近文章</span>
              <Link to="/admin/articles" className="text-xs text-primary hover:underline font-normal">查看全部</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {articles.slice(0, 6).map((article) => (
                <Link
                  key={article.id}
                  to={`/admin/articles/edit/${article.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(article.createdAt).toLocaleDateString("zh-CN")} · {article.viewCount ?? 0} 阅读
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        article.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {article.status === "published" ? "已发布" : "草稿"}
                    </span>
                    <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
              {articles.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">暂无文章，去写一篇吧</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/articles/new">
                <Button className="w-full justify-start" variant="outline">
                  <PencilLine size={16} className="mr-2" />
                  新建文章
                </Button>
              </Link>
              <Link to="/admin/tools">
                <Button className="w-full justify-start" variant="outline">
                  <Wrench size={16} className="mr-2" />
                  管理工具
                </Button>
              </Link>
              <Link to="/admin/links"
                >
                <Button className="w-full justify-start" variant="outline">
                  <Users size={16} className="mr-2" />
                  友情链接
                </Button>
              </Link>
              <Link to="/admin/settings">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 size={16} className="mr-2" />
                  网站设置
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-amber-500 text-white">
            <CardContent className="p-5">
              <p className="font-semibold mb-1">龟兔算法</p>
              <p className="text-sm text-white/80 leading-relaxed">
                当前运行正常。保持创作，持续积累。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
