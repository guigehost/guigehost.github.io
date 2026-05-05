import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";

export default function AdminArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const articleId = id ? parseInt(id, 10) : 0;

  const { data: article } = trpc.article.byId.useQuery(
    { id: articleId },
    { enabled: isEdit }
  );
  const { data: categories } = trpc.category.list.useQuery();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [originalUrl, setOriginalUrl] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setExcerpt(article.excerpt || "");
      setContent(article.content || "");
      setCoverImage(article.coverImage || "");
      setCategoryId(article.categoryId || undefined);
      setStatus(article.status as "draft" | "published");
      setOriginalUrl(article.originalUrl || "");
      setTagInput(article.tags?.map((t) => t.name).join(", ") || "");
    }
  }, [article]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && title && !slug) {
      const generated = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
        .slice(0, 100);
      setSlug(generated || "article-" + Date.now());
    }
  }, [title, slug, isEdit]);

  const createMutation = trpc.article.create.useMutation({
    onSuccess: () => {
      utils.article.list.invalidate();
      navigate("/admin/articles");
    },
  });

  const updateMutation = trpc.article.update.useMutation({
    onSuccess: () => {
      utils.article.list.invalidate();
      navigate("/admin/articles");
    },
  });

  const handleSave = () => {
    const tagNames = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (isEdit) {
      updateMutation.mutate({
        id: articleId,
        title,
        slug,
        excerpt: excerpt || undefined,
        content: content || undefined,
        coverImage: coverImage || undefined,
        categoryId,
        status,
        originalUrl: originalUrl || undefined,
        tagNames,
      });
    } else {
      createMutation.mutate({
        title,
        slug,
        excerpt: excerpt || undefined,
        content: content || undefined,
        coverImage: coverImage || undefined,
        categoryId,
        status,
        originalUrl: originalUrl || undefined,
        tagNames,
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/articles")}>
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? "编辑文章" : "新建文章"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Switch
              checked={status === "published"}
              onCheckedChange={(checked) =>
                setStatus(checked ? "published" : "draft")
              }
            />
            <Label className="text-sm">
              {status === "published" ? "已发布" : "草稿"}
            </Label>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save size={16} className="mr-2" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Label>标题</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-friendly-slug"
              className="mt-1"
            />
          </div>

          <div>
            <Label>摘要</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="文章摘要，显示在列表中"
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label>封面图 URL</Label>
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          <Tabs defaultValue="html" className="mt-4">
            <TabsList>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
            </TabsList>
            <TabsContent value="html">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="在此粘贴 HTML 内容..."
                className="min-h-[400px] font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="border rounded-lg p-4 min-h-[400px] bg-card">
                {content ? (
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-20">
                    预览区域为空
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Settings */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4 bg-card">
            <h3 className="font-semibold text-foreground">文章设置</h3>

            <div>
              <Label className="text-sm">分类</Label>
              <Select
                value={categoryId?.toString() || ""}
                onValueChange={(v) => setCategoryId(v ? parseInt(v) : undefined)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">标签（逗号分隔）</Label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="效率工具, AI, Mac"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">原文链接（微信公众号）</Label>
              <Input
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://mp.weixin.qq.com/..."
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
