#!/bin/bash
# 在消费者项目目录下运行此脚本，一键安装本地构建的 @heart/interaction
#
# 用法：
#   cd /path/to/your-project
#   bash /path/to/heart-interaction/scripts/link-local.sh
#
# 或设置 alias：
#   alias link-interaction="/path/to/heart-interaction/scripts/link-local.sh"

set -e

# 获取 heart-interaction 根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="$(dirname "$SCRIPT_DIR")"
PKG_NAME="@heart/interaction"

# 获取消费者项目目录（当前工作目录）
CONSUMER_DIR="$(pwd)"

# 检查是否在 heart-interaction 目录内运行
if [[ "$CONSUMER_DIR" == "$PKG_DIR"* ]]; then
  echo "❌ 错误：请在消费者项目目录下运行此脚本"
  echo "   当前目录: $CONSUMER_DIR"
  echo "   用法: cd /path/to/your-project && bash $0"
  exit 1
fi

# 检查消费者项目是否有 package.json
if [[ ! -f "$CONSUMER_DIR/package.json" ]]; then
  echo "❌ 错误：当前目录不是有效的 npm 项目（未找到 package.json）"
  exit 1
fi

echo "📦 构建 $PKG_NAME..."
cd "$PKG_DIR"
npm run build --silent

echo "📦 打包..."
TARBALL=$(npm pack --silent)

if [[ -z "$TARBALL" ]]; then
  echo "❌ 打包失败"
  exit 1
fi

TARBALL_PATH="$PKG_DIR/$TARBALL"

echo "📦 安装到 $CONSUMER_DIR..."
cd "$CONSUMER_DIR"
npm install "$TARBALL_PATH"

# 清理 tarball
rm -f "$TARBALL_PATH"

echo ""
echo "✅ 完成！$PKG_NAME 已安装到当前项目"
echo "   版本: 本地构建 ($(cd "$PKG_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown"))"

