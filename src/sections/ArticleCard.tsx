import { Link } from "react-router";
import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    viewCount: number | null;
    publishedAt: Date | null;
    category?: { name: string; slug: string } | null;
    tags?: { name: string; slug: string }[];
  };
  index?: number;
}

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Link to={`/blog/${article.slug}`} className="block h-full group">
        <article className="bg-card border border-border rounded-2xl overflow-hidden h-full flex flex-col hover:shadow-soft-lg hover:-translate-y-2 transition-all duration-500">
          {article.coverImage && (
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          )}
          <div className="p-6 flex flex-col flex-1">
            {article.category && (
              <Badge
                variant="secondary"
                className="self-start mb-3 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 rounded-lg"
              >
                {article.category.name}
              </Badge>
            )}
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/40">
              <div className="flex items-center gap-4">
                {article.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(article.publishedAt), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Eye size={12} />
                  {article.viewCount ?? 0}
                </span>
              </div>
              <span className="text-primary group-hover:translate-x-1 transition-transform duration-300 font-medium">
                阅读 →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
