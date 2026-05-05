import { useState } from "react";
import { Plus, Pencil, Trash2, Search, AppWindow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/providers/trpc";

export default function AdminTools() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formRoute, setFormRoute] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formOrder, setFormOrder] = useState(0);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.onlineTool.list.useQuery();

  const createMutation = trpc.onlineTool.create.useMutation({
    onSuccess: () => {
      utils.onlineTool.list.invalidate();
      closeDialog();
    },
  });

  const updateMutation = trpc.onlineTool.update.useMutation({
    onSuccess: () => {
      utils.onlineTool.list.invalidate();
      closeDialog();
    },
  });

  const deleteMutation = trpc.onlineTool.delete.useMutation({
    onSuccess: () => {
      utils.onlineTool.list.invalidate();
    },
  });

  const filtered = data?.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormRoute("");
    setFormIcon("");
    setFormActive(true);
    setFormOrder(0);
    setIsDialogOpen(true);
  };

  const openEdit = (tool: NonNullable<typeof data>[number]) => {
    setEditingId(tool.id);
    setFormName(tool.name);
    setFormSlug(tool.slug);
    setFormDesc(tool.description || "");
    setFormRoute(tool.route);
    setFormIcon(tool.icon || "");
    setFormActive(tool.isActive ?? true);
    setFormOrder(tool.sortOrder ?? 0);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formName.trim() || !formSlug.trim() || !formRoute.trim()) return;

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formName,
        slug: formSlug,
        description: formDesc || undefined,
        route: formRoute,
        icon: formIcon || undefined,
        isActive: formActive,
        sortOrder: formOrder,
      });
    } else {
      createMutation.mutate({
        name: formName,
        slug: formSlug,
        description: formDesc || undefined,
        route: formRoute,
        icon: formIcon || undefined,
        isActive: formActive,
        sortOrder: formOrder,
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">在线工具管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理大厅中展示的在线工具，新增工具后需开发对应前端页面组件
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          新增工具
        </Button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <p className="font-medium mb-1 flex items-center gap-1">
          <AppWindow size={14} />
          工具扩展指南
        </p>
        <p className="text-blue-700/80 leading-relaxed">
          新增在线工具的步骤：1）在此添加工具配置（名称、slug、路由等）；
          2）在 <code className="bg-blue-100 px-1 rounded text-xs">src/pages/tools/</code> 目录创建新的工具页面组件；
          3）在 <code className="bg-blue-100 px-1 rounded text-xs">AppTool.tsx</code> 的 toolComponents 中注册映射；
          4）重新构建部署。
        </p>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索工具..."
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">名称</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">路由</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">排序</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map((tool) => (
              <tr key={tool.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{tool.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{tool.description}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{tool.slug}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{tool.route}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    tool.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {tool.isActive ? "已上线" : "已下线"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{tool.sortOrder}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(tool)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`确定要删除「${tool.name}」吗？`)) {
                          deleteMutation.mutate({ id: tool.id });
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
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  加载中...
                </td>
              </tr>
            )}
            {!isLoading && !filtered?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  暂无在线工具
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "编辑在线工具" : "新增在线工具"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>名称</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="短剧搜索" />
            </div>
            <div>
              <Label>Slug（唯一标识）</Label>
              <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="duanju" />
            </div>
            <div>
              <Label>描述</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="一句话描述用途" />
            </div>
            <div>
              <Label>路由路径</Label>
              <Input value={formRoute} onChange={(e) => setFormRoute(e.target.value)} placeholder="/apps/duanju" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>图标（Lucide 名称）</Label>
                <Input value={formIcon} onChange={(e) => setFormIcon(e.target.value)} placeholder="Search" />
              </div>
              <div>
                <Label>排序数字</Label>
                <Input type="number" value={formOrder} onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formActive} onCheckedChange={setFormActive} />
              <Label className="cursor-pointer">上线状态</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
