import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Eye, Tag, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import DOMPurify from "dompurify";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = trpc.article.bySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const incrementView = trpc.article.incrementView.useMutation();

  useEffect(() => {
    if (slug && article?.status === "published") {
      incrementView.mutate({ slug });
    }
  }, [slug, article?.status]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-8 w-1/3 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-1/4 bg-muted rounded animate-pulse mb-8" />
        <div className="h-64 bg-muted rounded-xl animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">文章未找到</h2>
        <p className="text-muted-foreground mb-6">这篇文章可能已被删除或尚未发布</p>
        <Link to="/blog">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            返回文章列表
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Reading progress */}
      <ReadingProgress />

      <Link
        to="/blog"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        返回文章列表
      </Link>

      {/* Category */}
      {article.category && (
        <Badge className="mb-4 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">
          {article.category.name}
        </Badge>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
        {article.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {article.publishedAt
            ? format(new Date(article.publishedAt), "yyyy年M月d日", { locale: zhCN })
            : format(new Date(article.createdAt), "yyyy年M月d日", { locale: zhCN })}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={14} />
          {article.viewCount} 阅读
        </span>
      </div>

      {/* Cover image */}
      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full rounded-xl mb-8 object-cover max-h-[400px]"
        />
      )}

      {/* Content */}
      <div
        className="article-content text-foreground"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content || "", { USE_PROFILES: { html: true } }) }}
      />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={16} className="text-muted-foreground" />
            {article.tags.map((tag) => (
              <Link key={tag.slug} to={`/blog?tag=${tag.slug}`}>
                <Badge variant="secondary" className="hover:bg-accent cursor-pointer">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Original link */}
      {article.originalUrl && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            原文发表于微信公众号：
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              点击查看原文
            </a>
          </p>
        </div>
      )}

      {/* WeChat CTA */}
      <div className="mt-10 p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white">
        <p className="font-medium mb-1">喜欢这篇文章？</p>
        <p className="text-sm text-green-100 mb-3">
          关注微信公众号「与兔同行」，第一时间获取更多实用内容
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-xs font-bold">QR</span>
          </div>
          <div>
            <p className="text-sm font-medium">与兔同行</p>
            <p className="text-xs text-green-100">扫码关注公众号</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(pct, 100));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-transparent">
      <div
        className="h-full bg-amber-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
