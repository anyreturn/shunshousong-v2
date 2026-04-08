#!/bin/bash
# 顺手送 v2 - GitHub 推送脚本
# 使用方法：在本地电脑运行此脚本

set -e

REPO_URL="https://github.com/anyreturn/shunshousong-v2.git"
TEMP_DIR="/tmp/shunshousong-v2-deploy"

echo "🚀 开始推送 顺手送 v2 到 GitHub..."

# 1. 克隆仓库
echo "📥 克隆仓库..."
rm -rf $TEMP_DIR
git clone $REPO_URL $TEMP_DIR
cd $TEMP_DIR

# 2. 下载源代码包
echo "📦 下载源代码..."
# 请从服务器下载 /tmp/source-code.tar.gz 到此目录
# scp admin@your-server:/tmp/source-code.tar.gz /tmp/

# 3. 解压
echo "📂 解压源代码..."
tar -xzf /tmp/source-code.tar.gz

# 4. 提交并推送
echo "📤 提交并推送..."
git add -A
git commit -m "feat: 顺手送 v2 - 同城互助配送平台

- 后端：NestJS + PostgreSQL + Prisma + Socket.IO
- 移动端：React Native (Expo) + Zustand
- 功能：订单管理、实时聊天、支付钱包、推送通知、地图定位
- 文档：产品规范、API 文档、部署指南

使用 Spec Kit 规范驱动开发方式构建"
git push origin main

echo "✅ 推送完成！"
echo "🌐 查看仓库：https://github.com/anyreturn/shunshousong-v2"
