import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";

interface ToolCardProps {
  tool: {
    id: number;
    name: string;
    description?: string | null;
    icon?: string | null;
    url: string;
    platform: string;
    category?: string | null;
    isFree: boolean | null;
  };
  index?: number;
}

const platformLabels: Record<string, string> = {
  mac: "Mac",
  windows: "Windows",
  ios: "iOS",
  android: "Android",
  web: "Web",
  all: "全平台",
};

export default function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card className="group h-full hover:shadow-soft-lg hover:-translate-y-2 transition-all duration-500 border-border rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-amber-500/10 flex items-center justify-center text-primary text-xl font-bold border border-primary/10 group-hover:border-primary/20 transition-colors">
              {tool.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-semibold text-foreground truncate">
                  {tool.name}
                </h3>
                {tool.isFree !== false && (
                  <Badge variant="outline" className="text-[11px] shrink-0 rounded-md">
                    免费
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <Badge variant="secondary" className="text-[10px] rounded-md">
                  {platformLabels[tool.platform] || tool.platform}
                </Badge>
                {tool.category && (
                  <Badge variant="secondary" className="text-[10px] rounded-md">
                    {tool.category}
                  </Badge>
                )}
              </div>
              {tool.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              )}
            </div>
          </div>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium w-full py-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            直达官网
            <ExternalLink size={14} />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
