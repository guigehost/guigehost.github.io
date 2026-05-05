# 龟兔算法 — 全栈个人博客与工具站

一个非技术奶爸的数字花园。发现效率工具,记录成长轨迹。

- 📝 **博客文章** — 同步自公众号「与兔同行」
- 🧰 **工具推荐** — 亲测的效率工具推荐
- ⚡ **在线工具** — 自研小工具,即开即用

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Tailwind CSS + shadcn/ui |
| 后端 | Hono + tRPC 11.x + Zod |
| 数据库 | Drizzle ORM + MySQL |
| 认证 | 本地账号密码 (bcrypt) + 会话 JWT (jose) |

## 快速开始

```bash
npm install
cp .env.example .env       # 填入 DATABASE_URL 和 SESSION_SECRET
npm run dev                # 开发模式 http://localhost:3000
npm run build              # 生产构建
npm start                  # 启动生产服务
```

### 初始化数据库

```bash
npx drizzle-kit push                                    # 创建表
npx tsx db/seed.ts                                      # 写入分类/标签/示例数据
npx tsx db/create-admin.ts --username=admin --password=YourStrongPwd
npx tsx db/import-hexo.ts /path/to/hexo/source/_posts   # (可选) 迁移旧 Hexo 文章
```

## 部署

见 [DEPLOY.md](DEPLOY.md) 获取完整的 GitHub Actions 自动部署指南。

支持两种部署方式:
1. **PM2 + Nginx** — 推荐,最简单
2. **Docker** — 完全隔离

## 许可证

MIT © 2025 龟兔算法
