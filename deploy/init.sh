#!/bin/bash
set -e

# ==========================================
# 🚀 服务器初始化部署脚本(Debian / Ubuntu / RHEL / OpenCloudOS)
# ==========================================

echo "=== 🐢 龟兔算法 服务器初始化 ==="

INSTALL_DIR="${INSTALL_DIR:-/opt/guige-host}"
GITHUB_REPO="${GITHUB_REPO:-}"
BRANCH="${BRANCH:-main}"

if [ "$EUID" -ne 0 ]; then
  echo "⚠️ 请用 root 权限运行"
  exit 1
fi

# 自动识别包管理器
if command -v apt-get >/dev/null 2>&1; then
  PM=apt
elif command -v yum >/dev/null 2>&1; then
  PM=yum
elif command -v dnf >/dev/null 2>&1; then
  PM=dnf
else
  echo "✗ 未识别的包管理器(需要 apt/yum/dnf)"; exit 1
fi

echo "📦 安装基础依赖..."
case "$PM" in
  apt)
    apt-get update -qq
    apt-get install -y -qq curl wget git nginx
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    apt-get install -y -qq nodejs
    ;;
  yum|dnf)
    $PM install -y -q curl wget git nginx
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    $PM install -y -q nodejs
    ;;
esac

echo "📦 安装 PM2..."
npm install -g pm2 --quiet

echo "📥 克隆代码..."
if [ -n "$GITHUB_REPO" ]; then
  if [ -d "$INSTALL_DIR/.git" ]; then
    cd "$INSTALL_DIR" && git pull origin "$BRANCH"
  else
    git clone --depth 1 -b "$BRANCH" "$GITHUB_REPO" "$INSTALL_DIR"
  fi
else
  echo "⚠️ 请设置 GITHUB_REPO 环境变量"
  exit 1
fi

cd "$INSTALL_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  已生成 .env,请填入 DATABASE_URL 和 SESSION_SECRET 后重跑"
  exit 0
fi

echo "📦 安装依赖..."
npm install --prefer-offline --no-audit --silent

echo "🔨 构建..."
npm run build

echo "🚀 启动服务..."
pm2 start npm --name "guige-host" -- start
pm2 save

echo "✅ 初始化完成!"
echo "站点: http://$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
