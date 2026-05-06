import { useState } from "react";
import { Search, Zap, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import ToolCard from "@/sections/ToolCard";
import AnimatedSection from "@/sections/AnimatedSection";
import AdBanner from "@/components/AdBanner";

const platforms = [
  { label: "全部", value: "" },
  { label: "Mac", value: "mac" },
  { label: "Windows", value: "windows" },
  { label: "iOS", value: "ios" },
  { label: "Web", value: "web" },
  { label: "全平台", value: "all" },
];

export default function Tools() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: toolData, isLoading } = trpc.tool.list.useQuery({
    platform: platform || undefined,
    search: debouncedSearch || undefined,
    page: 1,
    pageSize: 24,
  });

  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  });

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12">
      <AnimatedSection>
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-sm mb-5">
            <Zap size={14} /> 亲测推荐
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight mb-4">
            效率工具推荐
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            每一款都经过真实工作场景验证，帮你省下踩坑时间
          </p>
        </div>
      </AnimatedSection>

      <div className="flex flex-col sm:flex-row gap-4 mb-10 sticky top-16 z-30 bg-background/90 backdrop-blur-2xl py-4 -mx-5 px-5 sm:mx-0 sm:px-0 border-b border-border/60">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索工具名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-12"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-muted-foreground shrink-0 hidden sm:block" />
          {platforms.map((p) => (
            <Button
              key={p.value}
              variant={platform === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPlatform(p.value)}
              className="shrink-0 rounded-full"
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : toolData?.tools && toolData.tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toolData.tools.map((tool, i) => (
            <>
              <ToolCard key={tool.id} tool={tool} index={i} />
              {i === 2 && <AdBanner key="ad-1" className="col-span-full" />}
            </>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <Search size={56} className="mx-auto mb-5 text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground">没有找到匹配的工具</p>
        </div>
      )}
    </div>
  );
}
