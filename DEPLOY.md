# 🚀 龟兔算法 — GitHub Actions 自动部署指南

## 部署方案选择

| 方案 | 适用场景 | 复杂度 | 维护难度 |
|------|---------|--------|---------|
| **方案一: PM2 + Nginx** | 已有 Node.js 环境的服务器 | 低 | 低 |
| **方案二: Docker** | 需要完全隔离、快速回滚 | 中 | 低 |

> 💡 **推荐方案一 (PM2)**:如果你当前服务器已经有 Node.js 环境,用 PM2 最简单。

---

## 🛠️ 方案一: PM2 + Nginx (推荐)

### 1. 服务器初始化(只需执行一次)

```bash
# 登录服务器
ssh root@你的服务器IP

# 创建项目目录
mkdir -p /opt/guige-host
cd /opt/guige-host

# 克隆仓库(替换为你的 GitHub 仓库地址)
git clone https://github.com/你的用户名/你的仓库.git .
```

### 2. 安装环境

```bash
# Debian/Ubuntu
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# RHEL/OpenCloudOS/CentOS
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# 安装 PM2
npm install -g pm2

# 安装项目依赖
npm install

# 构建项目
npm run build
```

### 3. 配置环境变量

```bash
cp .env.example .env
nano .env
```

最少要填:
- `DATABASE_URL=mysql://用户名:密码@127.0.0.1:3306/guige_host`
- `SESSION_SECRET=$(openssl rand -base64 48)`

### 4. 初始化数据库

```bash
# 推送数据库结构(基于 db/schema.ts)
npx drizzle-kit push

# 导入种子数据(分类、标签、示例文章)
npx tsx db/seed.ts

# 创建管理员账号(请把密码换成强密码并妥善保存)
npx tsx db/create-admin.ts --username=admin --password=YourStrongPwd

# (可选) 把旧 Hexo 站点的 _posts 文章批量迁移到数据库
npx tsx db/import-hexo.ts /www/wwwroot/hexo-source/source/_posts
```

### 5. 启动服务

```bash
pm2 start npm --name "guige-host" -- start
pm2 save
pm2 startup systemd
```

### 6. 配置 Nginx

```bash
cat > /etc/nginx/conf.d/guige.host.conf << 'EOF'
server {
    listen 80;
    server_name guige.host www.guige.host;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

nginx -t && systemctl reload nginx
```

### 7. 配置 SSL (HTTPS)

```bash
# 任选一种方式
# 方式一: certbot
yum install -y certbot python3-certbot-nginx
certbot --nginx -d guige.host -d www.guige.host

# 方式二: 宝塔面板
# 站点 → SSL → Let's Encrypt → 申请 → 强制 HTTPS
```

---

## 🐳 方案二: Docker 部署

### 1. 服务器初始化

```bash
curl -fsSL https://get.docker.com | sh
mkdir -p /opt/guige-host && cd /opt/guige-host
git clone https://github.com/你的用户名/你的仓库.git .
```

### 2. 配置环境变量

```bash
cp .env.example .env
nano .env
```

### 3. 启动

```bash
docker compose up --build -d
```

---

## 🔐 GitHub Actions 配置

### 需要配置的 GitHub Secrets

进入你的 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `SSH_PRIVATE_KEY` | 服务器的 SSH 私钥(完整内容) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_HOST` | 服务器 IP 或域名 | `122.51.205.39` |
| `SSH_USER` | SSH 登录用户名 | `root` |
| `SSH_PORT` | SSH 端口(可选,默认 22) | `22` |

### 如何生成 SSH 密钥对

```bash
# 在服务器上生成专用的部署密钥
ssh-keygen -t ed25519 -C "github-actions" -f /root/.ssh/github_deploy -N ""

# 把公钥写入 authorized_keys,允许 Actions 用此私钥登录
cat /root/.ssh/github_deploy.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

# 把私钥内容(整段)粘贴到 GitHub Secrets 的 SSH_PRIVATE_KEY
cat /root/.ssh/github_deploy
```

### 启用自动部署

1. 推送代码到 GitHub 的 `main` 分支
2. 每次 push 都会自动触发 `.github/workflows/deploy.yml`
3. 也可以在 GitHub 仓库页面 → Actions → 手动触发部署

---

## 📋 项目结构说明

```
guige-host/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions 部署脚本
├── api/                    # 后端 API (Hono + tRPC)
│   ├── auth-router.ts      # 登录/登出/me
│   ├── kimi/auth.ts        # 会话校验中间件
│   ├── kimi/session.ts     # JWT 签发与校验
│   ├── queries/            # 数据库查询
│   └── router.ts           # 路由聚合
├── db/
│   ├── schema.ts           # 数据库表定义
│   ├── seed.ts             # 种子数据
│   ├── create-admin.ts     # 创建/重置管理员账号
│   └── import-hexo.ts      # 导入旧 Hexo 文章
├── src/
│   ├── pages/              # 前端页面(含 Login.tsx 用户名密码登录)
│   ├── components/         # UI 组件 (shadcn/ui)
│   └── hooks/              # 自定义 Hooks
├── public/                 # 静态资源
├── contracts/              # 前后端共享类型
└── package.json
```

---

## 🔄 日常维护

### 更新代码(自动)

GitHub push 后自动部署,无需手动操作。

### 手动重启服务

```bash
pm2 restart guige-host
```

### 查看日志

```bash
pm2 logs guige-host
pm2 logs guige-host --err   # 只看错误
```

### 备份数据库

```bash
mysqldump -u guige_host -p guige_host > backup-$(date +%Y%m%d).sql
```

### 重置管理员密码

```bash
cd /opt/guige-host
npx tsx db/create-admin.ts --username=admin --password=新密码
```

---

## 🆘 常见问题

### Q: 部署后页面显示空白?
A: `pm2 logs guige-host` 看启动错误,通常是 `.env` 中 `DATABASE_URL` 或 `SESSION_SECRET` 没填。

### Q: 登录后立刻被踢回登录页?
A: 检查 `SESSION_SECRET` 在所有部署节点上一致;并确认浏览器 cookie `kimi_sid` 是否被写入。

### Q: 数据库连接失败?
A: 检查 `DATABASE_URL` 是否正确,数据库用户是否被授予了对应数据库的访问权限,MySQL 是否监听 127.0.0.1。

### Q: 如何更新数据库结构?
A: 修改 `db/schema.ts` 后,在服务器上运行 `npx drizzle-kit push`。

### Q: 如何在本地开发?
A: `npm install` → `npm run dev`,访问 `http://localhost:3000`。

---

## 📞 联系方式

- 公众号:与兔同行
- 站点:guige.host
