import { Link } from "react-router";
import { FileText, Wrench, Eye, PencilLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function AdminDashboard() {
  const { data: articleData } = trpc.article.list.useQuery({
    status: "all",
    page: 1,
    pageSize: 1,
  });
  const { data: toolData } = trpc.tool.list.useQuery({ page: 1, pageSize: 1 });
  const { data: recentArticles } = trpc.article.list.useQuery({
    status: "all",
    page: 1,
    pageSize: 5,
  });

  const stats = [
    {
      label: "文章总数",
      value: articleData?.total ?? 0,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "工具总数",
      value: toolData?.total ?? 0,
      icon: Wrench,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "已发布",
      value:
        recentArticles?.articles.filter((a) => a.status === "published")
          .length ?? 0,
      icon: Eye,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "草稿",
      value:
        recentArticles?.articles.filter((a) => a.status === "draft").length ??
        0,
      icon: PencilLine,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">仪表盘</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link to="/admin/articles/new">
          <Button>
            <PencilLine size={16} className="mr-2" />
            新建文章
          </Button>
        </Link>
        <Link to="/admin/tools">
          <Button variant="outline">
            <Wrench size={16} className="mr-2" />
            管理工具
          </Button>
        </Link>
      </div>

      {/* Recent articles */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">最近文章</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  标题
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  状态
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  日期
                </th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {recentArticles?.articles.map((article) => (
                <tr key={article.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-foreground font-medium truncate max-w-[200px]">
                    {article.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        article.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {article.status === "published" ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(article.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/articles/edit/${article.id}`}>
                      <Button variant="ghost" size="sm">
                        编辑
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {!recentArticles?.articles.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    暂无文章，去写一篇吧
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
