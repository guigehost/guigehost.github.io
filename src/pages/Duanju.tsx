import { useState } from "react";
import { Search, Play, ExternalLink, Sparkles, Clock, AlertCircle, X, Tv, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DramaItem {
  id: string;
  title: string;
  cover: string;
  source: string;
  url: string;
  episodes: number;
  bookId?: string;
}

interface Episode {
  id: string;
  title: string;
  url: string;
  videoId?: string;
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
      const bookId = String(obj.book_id ?? obj.bookId ?? obj.id ?? "");
      if (!title) return null;
      return {
        id: String(obj.id ?? obj.video_id ?? `${idx}`),
        title,
        cover,
        source,
        url,
        episodes,
        bookId,
      };
    })
    .filter(Boolean) as DramaItem[];
}

function normalizeEpisodes(raw: unknown): Episode[] {
  if (!raw) return [];

  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.list)) list = obj.list;
    else if (Array.isArray(obj.episodes)) list = obj.episodes;
    else if (Array.isArray(obj.data)) list = obj.data;
    else {
      const possibleArray = Object.values(obj).find((v) => Array.isArray(v));
      if (possibleArray) list = possibleArray;
    }
  }

  return list
    .map((item: unknown, idx: number) => {
      if (typeof item !== "object" || item === null) return null;
      const obj = item as Record<string, unknown>;
      const title = String(obj.title ?? obj.name ?? `第${idx + 1}集`);
      const url = String(obj.url ?? obj.link ?? obj.href ?? obj.play_url ?? "");
      const videoId = String(obj.video_id ?? obj.videoId ?? "");
      if (!title && !url && !videoId) return null;
      return { id: String(obj.id ?? `${idx}`), title: title || `第${idx + 1}集`, url, videoId };
    })
    .filter(Boolean) as Episode[];
}

export default function Duanju() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DramaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [error, setError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDrama, setSelectedDrama] = useState<DramaItem | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [playerUrl, setPlayerUrl] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError("");
    setPlayerUrl("");
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

  const openDetail = async (drama: DramaItem) => {
    setSelectedDrama(drama);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setEpisodes([]);
    setPlayerUrl("");

    // If search result already contains a direct URL, try to use it
    if (drama.url && drama.url !== "#") {
      setPlayerUrl(drama.url);
    }

    // If there's a book_id, fetch episode list
    if (drama.bookId && drama.bookId !== "#") {
      try {
        const res = await fetch(
          `https://api.xingzhige.com/API/playlet/?book_id=${encodeURIComponent(drama.bookId)}`,
          { method: "GET" }
        );
        const json = (await res.json()) as ApiResponse;
        if (json.code === 200) {
          const eps = normalizeEpisodes(json.data);
          setEpisodes(eps);
          if (eps.length > 0 && !drama.url) {
            const firstPlayable = eps.find((e) => e.url) ?? eps[0];
            if (firstPlayable?.url) setPlayerUrl(firstPlayable.url);
          }
        } else {
          setDetailError(json.msg || "获取剧集列表失败");
        }
      } catch (e) {
        setDetailError("获取剧集列表失败，请检查网络");
      }
    }

    setDetailLoading(false);
  };

  const handlePlayEpisode = async (ep: Episode) => {
    if (ep.url && ep.url !== "#") {
      setPlayerUrl(ep.url);
      return;
    }
    // If only video_id is available, try to fetch the actual URL
    if (ep.videoId) {
      try {
        const res = await fetch(
          `https://api.xingzhige.com/API/playlet/?video_id=${encodeURIComponent(ep.videoId)}`,
          { method: "GET" }
        );
        const json = (await res.json()) as ApiResponse;
        if (json.code === 200) {
          const data = json.data as Record<string, unknown> | undefined;
          const url = String(data?.url ?? data?.play_url ?? data?.link ?? "");
          if (url) {
            setPlayerUrl(url);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    setDetailError(`「${ep.title}」暂无可用播放地址`);
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
            <Card
              key={drama.id}
              className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border rounded-xl cursor-pointer"
              onClick={() => openDetail(drama)}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {drama.cover ? (
                  <img src={drama.cover} alt={drama.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Film size={40} className="text-muted-foreground/30" />
                  </div>
                )}
                {drama.episodes > 0 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {drama.episodes}集
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <div className="flex items-center justify-center gap-1.5 text-white text-sm font-medium bg-primary/90 hover:bg-primary py-2.5 rounded-lg transition-colors">
                    <Play size={14} /> 查看详情
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm line-clamp-1 mb-1">{drama.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{drama.source}</span>
                  <span className="text-xs text-primary flex items-center gap-0.5">
                    详情 <ExternalLink size={10} />
                  </span>
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {selectedDrama && (
            <>
              {/* Header */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                {selectedDrama.cover ? (
                  <img src={selectedDrama.cover} alt={selectedDrama.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center">
                    <Film size={64} className="text-primary/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl">{selectedDrama.title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {selectedDrama.source} · {selectedDrama.episodes > 0 ? `${selectedDrama.episodes}集` : "集数未知"}
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </div>

              <div className="p-6 pt-2 space-y-6">
                {/* Player */}
                {playerUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Tv size={16} className="text-primary" />
                      在线播放
                    </div>
                    <div className="rounded-xl overflow-hidden border border-border bg-black aspect-video">
                      {playerUrl.match(/\.(mp4|m3u8|webm|ogg)(\?|$)/i) ? (
                        <video
                          src={playerUrl}
                          controls
                          className="w-full h-full"
                          poster={selectedDrama.cover}
                        />
                      ) : (
                        <iframe
                          src={playerUrl}
                          className="w-full h-full"
                          allow="fullscreen; autoplay"
                          sandbox="allow-scripts allow-same-origin allow-popups"
                          title={selectedDrama.title}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={playerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                      >
                        无法播放？尝试外部打开 <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Episodes */}
                {detailLoading ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">加载剧集中...</div>
                ) : detailError ? (
                  <div className="py-4 text-center text-sm text-amber-600 bg-amber-50 rounded-lg">{detailError}</div>
                ) : episodes.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Film size={16} className="text-primary" />
                      选集播放
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {episodes.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => handlePlayEpisode(ep)}
                          className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors border ${
                            playerUrl && (ep.url === playerUrl || ep.videoId === playerUrl)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted hover:bg-muted/80 text-foreground border-border"
                          }`}
                          title={ep.title}
                        >
                          <span className="line-clamp-1">{ep.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  !playerUrl && (
                    <div className="py-6 text-center text-sm text-muted-foreground bg-muted/50 rounded-lg">
                      暂无剧集列表，可能该资源暂不可用
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
