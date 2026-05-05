import { useState } from "react";
import { Link } from "react-router";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";

export default function AdminArticles() {
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.article.list.useQuery({
    status: "all",
    search: search || undefined,
    page: 1,
    pageSize: 50,
  });

  const deleteMutation = trpc.article.delete.useMutation({
    onSuccess: () => {
      utils.article.list.invalidate();
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">文章管理</h1>
        <Link to="/admin/articles/new">
          <Button>
            <Plus size={16} className="mr-2" />
            新建文章
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">标题</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">分类</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">日期</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {data?.articles.map((article) => (
              <tr key={article.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground truncate max-w-[250px]">{article.title}</p>
                  <p className="text-xs text-muted-foreground">/{article.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {article.category?.name || "-"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    article.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {article.status === "published" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(article.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/admin/articles/edit/${article.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("确定要删除这篇文章吗？")) {
                          deleteMutation.mutate({ id: article.id });
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  加载中...
                </td>
              </tr>
            )}
            {!isLoading && !data?.articles.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  暂无文章
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
