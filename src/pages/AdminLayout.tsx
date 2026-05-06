import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import LogoIcon from "@/components/LogoIcon";
import {
  LayoutDashboard,
  FileText,
  AppWindow,
  Link2,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    label: "内容管理",
    items: [
      { label: "仪表盘", path: "/admin", icon: LayoutDashboard },
      { label: "文章管理", path: "/admin/articles", icon: FileText },
      { label: "在线工具", path: "/admin/tools", icon: AppWindow },
    ],
  },
  {
    label: "站点配置",
    items: [
      { label: "友情链接", path: "/admin/links", icon: Link2 },
      { label: "网站设置", path: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
    if (!isLoading && isAuthenticated && user?.role !== "admin") {
      navigate("/");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-56 bg-primary text-primary-foreground shrink-0">
        <div className="p-4 border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-bold">
            <LogoIcon size={28} />
            龟兔算法
          </Link>
        </div>
        <nav className="p-2 space-y-4 flex-1 overflow-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-semibold text-primary-foreground/40 uppercase tracking-wider mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        active
                          ? "bg-primary-foreground/15 text-white shadow-sm"
                          : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-white"
                      }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-primary-foreground/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="text-sm">
              <p className="font-medium">{user?.name || "Admin"}</p>
              <p className="text-xs text-primary-foreground/60">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-primary-foreground/70 hover:text-white hover:bg-primary-foreground/10"
            onClick={logout}
          >
            <LogOut size={14} className="mr-2" />
            退出登录
          </Button>
          <Link
            to="/"
            className="mt-2 flex items-center justify-center gap-1 text-xs text-primary-foreground/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            返回网站
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-background overflow-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
