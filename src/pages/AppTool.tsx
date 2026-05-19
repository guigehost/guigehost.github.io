import { useParams, Navigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Skeleton } from "@/components/ui/skeleton";

// Tool registry - maps slug to component
// When adding a new tool page, register it here
const toolComponents: Record<string, React.FC> = {
};

export default function AppTool() {
  const { slug } = useParams<{ slug: string }>();

  const { data: tool, isLoading } = trpc.onlineTool.bySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mx-auto mb-4" />
        <Skeleton className="h-5 w-96 mx-auto mb-8" />
        <Skeleton className="h-14 w-full max-w-xl mx-auto mb-4 rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!tool || !tool.isActive) {
    return <Navigate to="/apps" replace />;
  }

  const ToolComponent = slug ? toolComponents[slug] : undefined;

  if (ToolComponent) {
    return <ToolComponent />;
  }

  // Fallback: show tool info with placeholder
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">{tool.name}</h1>
      <p className="text-muted-foreground mb-6">{tool.description}</p>
      <div className="bg-muted rounded-xl p-8">
        <p className="text-muted-foreground">
          工具页面开发中，敬请期待...
        </p>
        <p className="text-sm text-muted-foreground/60 mt-2">
          路径：{tool.route}
        </p>
      </div>
    </div>
  );
}
