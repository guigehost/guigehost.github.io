import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LogoIcon from "@/components/LogoIcon";
import {
  Menu,
  Sun,
  Moon,
  Home,
  FileText,
  Wrench,
  AppWindow,
  User,
} from "lucide-react";

const navLinks = [
  { label: "首页", path: "/", icon: Home },
  { label: "文章", path: "/blog", icon: FileText },
  { label: "工具推荐", path: "/tools", icon: Wrench },
  { label: "在线工具", path: "/apps", icon: AppWindow },
  { label: "关于", path: "/about", icon: User },
];

export default function Header() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setIsDark(true);
    else if (saved === "light") setIsDark(false);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
    }
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-[68px]">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <LogoIcon size={32} className="group-hover:shadow-primary/40" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              龟兔算法
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-[15px] font-medium rounded-xl transition-all duration-300 ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2 ml-1">
                {user.role === "admin" && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      管理
                    </Button>
                  </Link>
                )}
              </div>
            ) : null}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-l border-border/50">
                <div className="flex flex-col gap-1 mt-8">
                  {navLinks.map((link) => {
                    const active = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        }`}
                      >
                        <link.icon size={18} />
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="border-t border-border my-3" />
                  {isAuthenticated && user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    >
                      <AppWindow size={18} />
                      管理后台
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
