import { useState } from "react";
import { Link } from "react-router";
import { Plus, Pencil, Trash2, ExternalLink, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";

export default function AdminLinks() {
  const utils = trpc.useUtils();
  const { data: links, isLoading } = trpc.link.list.useQuery({ activeOnly: false });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const createMutation = trpc.link.create.useMutation({
    onSuccess: () => {
      utils.link.list.invalidate();
      closeDialog();
    },
  });

  const updateMutation = trpc.link.update.useMutation({
    onSuccess: () => {
      utils.link.list.invalidate();
      closeDialog();
    },
  });

  const deleteMutation = trpc.link.delete.useMutation({
    onSuccess: () => utils.link.list.invalidate(),
  });

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setUrl("");
    setDescription("");
    setIcon("");
    setSortOrder(0);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (link: typeof links extends Array<infer T> ? T : never) => {
    if (!link) return;
    setEditingId(link.id);
    setName(link.name);
    setUrl(link.url);
    setDescription(link.description || "");
    setIcon(link.icon || "");
    setSortOrder(link.sortOrder ?? 0);
    setIsActive(link.isActive ?? true);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name.trim() || !url.trim()) return;
    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        name,
        url,
        description: description || undefined,
        icon: icon || undefined,
        sortOrder,
        isActive,
      });
    } else {
      createMutation.mutate({
        name,
        url,
        description: description || undefined,
        icon: icon || undefined,
        sortOrder,
        isActive,
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">友情链接</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          添加链接
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-10"></th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">名称</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">链接</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">状态</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {links?.map((link) => (
              <tr key={link.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">
                  <GripVertical size={14} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{link.name}</p>
                  {link.description && (
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                  >
                    {link.url.slice(0, 40)}
                    {link.url.length > 40 ? "..." : ""}
                    <ExternalLink size={10} />
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      link.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {link.isActive ? "显示中" : "已隐藏"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(link)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`确定要删除「${link.name}」吗？`)) {
                          deleteMutation.mutate({ id: link.id });
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
            {!isLoading && !links?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  暂无友情链接，去添加一个吧
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "编辑链接" : "添加链接"}</DialogTitle>
            <DialogDescription>管理网站底部的友情链接展示</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>名称</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="站点名称" />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>描述</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简短描述"
              />
            </div>
            <div>
              <Label>图标 URL（可选）</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>排序</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label className="text-sm">显示</Label>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
