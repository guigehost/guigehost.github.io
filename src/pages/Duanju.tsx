import { useState } from "react";
import { Search, Play, ExternalLink, Sparkles, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DramaItem {
  id: string;
  title: string;
  cover: string;
  source: string;
  url: string;
  episodes: number;
}

interface ApiResponse {
  code: number;
  msg: string;
  data?: unknown;
}

function normalizeResults(raw: unknown): DramaItem[] {
  if (!raw) return [];

  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.list)) list = obj.list;
    else if (Array.isArray(obj.data)) list = obj.data;
    else if (Array.isArray(obj.results)) list = obj.results;
    else {
      const possibleArray = Object.values(obj).find((v) => Array.isArray(v));
      if (possibleArray) list = possibleArray;
    }
  }

  return list
    .map((item: unknown, idx: number) => {
      if (typeof item !== "object" || item === null) return null;
      const obj = item as Record<string, unknown>;
      const title = String(obj.title ?? obj.name ?? obj.drama_name ?? obj.video_name ?? "");
      const cover = String(obj.cover ?? obj.img ?? obj.pic ?? obj.thumb ?? obj.image ?? "");
      const url = String(obj.url ?? obj.link ?? obj.href ?? obj.play_url ?? "");
      const source = String(obj.source ?? obj.platform ?? obj.from ?? "星之阁");
      const episodes = Number(obj.episodes ?? obj.episode_count ?? obj.count ?? obj.num ?? obj.total ?? 0);
      if (!title) return null;
      return {
        id: String(obj.id ?? obj.book_id ?? obj.video_id ?? `${idx}`),
        title,
        cover,
        source,
        url,
        episodes,
      };
    })
    .filter(Boolean) as DramaItem[];
}

export default function Duanju() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DramaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError("");
    const start = performance.now();

    try {
      const res = await fetch(
        `https://api.xingzhige.com/API/playlet/?keyword=${encodeURIComponent(query.trim())}`,
        { method: "GET" }
      );
      const json = (await res.json()) as ApiResponse;

      if (json.code !== 200) {
        setError(json.msg || "搜索失败，请稍后重试");
        setResults([]);
      } else {
        const items = normalizeResults(json.data);
        setResults(items);
        if (items.length === 0) {
          setError("未找到相关短剧");
        }
      }
    } catch (e) {
      setError("网络请求失败，请检查网络连接");
      setResults([]);
    } finally {
      setSearchTime((performance.now() - start) / 1000);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-12">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-sm mb-5">
          <Sparkles size={14} />
          自研在线工具
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight mb-4">短剧搜索</h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          快速聚合多个短剧资源站，一键搜索，省去反复切换网站的烦恼
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="输入短剧名称，如：绝世神皇..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="rounded-xl pl-11 h-14 text-base shadow-sm"
            />
          </div>
          <Button
            className="rounded-xl px-8 h-14 shadow-sm"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "搜索中..." : "搜索"}
          </Button>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mb-12">
        支持模糊搜索，可同时检索多个资源站点
      </p>

      {searched && !loading && results.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            找到 <span className="text-foreground font-medium">{results.length}</span> 个相关资源
            <span className="ml-2 text-xs flex items-center gap-1 inline-flex">
              <Clock size={10} /> 耗时 {searchTime.toFixed(2)}s
            </span>
          </p>
        </div>
      )}

      {searched && !loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {results.map((drama) => (
            <Card key={drama.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border rounded-xl">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={drama.cover} alt={drama.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {drama.episodes}集
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <a href={drama.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-white text-sm font-medium bg-primary/90 hover:bg-primary py-2.5 rounded-lg transition-colors">
                    <Play size={14} /> 立即观看
                  </a>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm line-clamp-1 mb-1">{drama.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{drama.source}</span>
                  <a href={drama.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
                    打开 <ExternalLink size={10} />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searched && !loading && error && (
        <div className="text-center py-20">
          <AlertCircle size={56} className="mx-auto mb-5 text-amber-500/60" />
          <p className="text-lg text-muted-foreground font-medium">{error}</p>
          <p className="text-sm text-muted-foreground/60 mt-1">换个关键词试试</p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-20 text-muted-foreground/40">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <Search size={32} />
          </div>
          <p className="text-lg font-medium">输入关键词，开始探索短剧世界</p>
          <p className="text-sm mt-1">聚合多站点资源，让找剧更简单</p>
        </div>
      )}

      <div className="mt-16 pt-8 border-t border-border text-center">
        <p className="text-xs text-muted-foreground/50">
          本工具仅供学习交流使用，请支持正版内容。资源来源于网络聚合，如有侵权请联系删除。
        </p>
      </div>
    </div>
  );
}
