#!/bin/bash
set -e

echo "🚀 开始部署 顺手送 v2..."

# 1. 检查环境
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 2. 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm ci --omit=dev
npx prisma generate
cd ..

# 3. 创建环境变量
echo "⚙️  创建环境变量..."
cat > backend/.env <<EOF
NODE_ENV=production
DATABASE_URL="postgresql://shunshousong:ShunShou2026!@#@localhost:5432/shunshousong"
JWT_SECRET="shunshousong-v2-jwt-secret-$(date +%s)"
JWT_EXPIRATION="30d"
PORT=3000
REDIS_HOST="localhost"
REDIS_PORT=6379
EOF

# 4. 安装 PM2（如果没有）
if ! command -v pm2 &> /dev/null; then
    echo "📥 安装 PM2..."
    npm install -g pm2
fi

# 5. 启动数据库（如果未运行）
echo "🗄️  检查数据库..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL 未运行，请手动启动"
    echo "   sudo systemctl start postgresql"
fi

# 6. 数据库迁移
echo "🔄 执行数据库迁移..."
cd backend
npx prisma migrate deploy
cd ..

# 7. 启动应用
echo "🚀 启动应用..."
pm2 delete shunshousong-backend 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# 8. 保存 PM2 配置
pm2 save

# 9. 设置开机自启
pm2 startup

echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 查看状态：pm2 status"
echo "📝 查看日志：pm2 logs shunshousong-backend"
echo "🔄 重启应用：pm2 restart shunshousong-backend"
echo "🌐 API 地址：http://localhost:3000"
echo "📚 Swagger: http://localhost:3000/api"
