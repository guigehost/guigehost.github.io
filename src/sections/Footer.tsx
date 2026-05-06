import { Link } from "react-router";
import LogoIcon from "@/components/LogoIcon";
import { FileText, Wrench, AppWindow, User, ArrowUpRight, Shield, ExternalLink } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function Footer() {
  const { data: links } = trpc.link.list.useQuery({ activeOnly: true });
  const { data: settings } = trpc.setting.list.useQuery();

  const siteTitle = settings?.siteTitle || "龟兔算法";
  const siteAuthor = settings?.siteAuthor || "光影876";
  const icpBeian = settings?.icpBeian || "苏ICP备2025160633号-1";
  const gonganBeian = settings?.gonganBeian || "苏公网安备32070602010179号";

  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <LogoIcon size={32} />
              <h3 className="text-lg font-bold text-foreground">{siteTitle}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              发现效率工具，记录成长轨迹。一个非技术奶爸的数字花园，专门帮你挖掘那些能让生活更轻松的宝藏工具。
            </p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white rounded-xl p-1 shadow-sm border border-border">
                <img src="/wechat-qr.jpg" alt="公众号二维码" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">关注「与兔同行」</p>
                <p className="text-xs text-muted-foreground">扫码关注公众号</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-foreground mb-5">站点导航</h4>
            <ul className="space-y-3">
              {[
                { to: "/blog", icon: FileText, label: "文章博客" },
                { to: "/tools", icon: Wrench, label: "工具推荐" },
                { to: "/apps", icon: AppWindow, label: "在线工具" },
                { to: "/about", icon: User, label: "关于本站" },
              ].map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                    <item.icon size={14} />
                    {item.label}
                    <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-foreground mb-5">友情链接</h4>
            {links && links.length > 0 ? (
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <ExternalLink size={14} />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">暂无友链</p>
            )}
          </div>

          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold text-foreground mb-5">公众号「与兔同行」</h4>
            <div className="bg-gradient-to-r from-green-500/90 to-green-600/90 rounded-xl p-5 text-white">
              <p className="text-sm font-medium mb-1">与兔同行</p>
              <p className="text-xs text-green-100 leading-relaxed">
                内容首发阵地。工具推荐、深度长文、遛娃攻略——第一时间推送，不错过任何有价值的信息。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60 bg-muted/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <p>©2025 - 2026 By <span className="font-medium">{siteAuthor}</span> · {siteTitle}</p>
              <span className="hidden sm:inline text-border">|</span>
              <p className="flex items-center gap-1.5">
                <Shield size={11} />
                <a href={`mailto:${settings?.contactEmail}`} className="hover:text-primary transition-colors">{settings?.contactEmail}</a>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {icpBeian}
              </a>
              <span className="text-border">|</span>
              <a
                href="https://beian.mps.gov.cn/#/query/webSearch?code=32070602010179"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {gonganBeian}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
