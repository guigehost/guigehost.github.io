import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import ArticleCard from "@/sections/ArticleCard";
import AnimatedSection from "@/sections/AnimatedSection";

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const categorySlug = searchParams.get("category") || undefined;

  const { data: categoryData } = trpc.category.list.useQuery();
  const { data: articleData, isLoading } = trpc.article.list.useQuery({
    categorySlug,
    search: debouncedSearch || undefined,
    status: "published",
    page: 1,
    pageSize: 12,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const setCategory = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set("category", slug);
    else params.delete("category");
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12">
      <AnimatedSection>
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
            知识沉淀
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight mb-4">
            文章博客
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            来自公众号「与兔同行」的精选内容
          </p>
        </div>
      </AnimatedSection>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-2xl py-5 border-b border-border/60 mb-12 -mx-5 px-5 sm:mx-0 sm:px-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索文章标题或内容..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl h-12"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={!categorySlug ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(null)}
              className="shrink-0 rounded-full"
            >
              全部
            </Button>
            {categoryData?.map((cat) => (
              <Button
                key={cat.slug}
                variant={categorySlug === cat.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat.slug)}
                className="shrink-0 rounded-full"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Article grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : articleData?.articles && articleData.articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articleData.articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <SlidersHorizontal size={56} className="mx-auto mb-5 text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground mb-2">没有找到匹配的文章</p>
          <p className="text-sm text-muted-foreground/60 mb-6">
            换个关键词试试，或者去首页逛逛
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setCategory(null);
            }}
          >
            清除筛选
          </Button>
        </div>
      )}
    </div>
  );
}
