# 🚀 顺手送 v2 - 部署指南

## 部署方式选择

### 方式 1: Docker Compose 部署 ⭐ 推荐

适合：有 Docker 环境的服务器

### 方式 2: PM2 部署

适合：已有 Node.js + PostgreSQL 环境

### 方式 3: 云平台部署

适合：阿里云/腾讯云等云服务

---

## 方式 1: Docker Compose 部署

### 前置要求

- Docker 20+
- Docker Compose 2.0+
- 2GB+ 内存
- 10GB+ 磁盘空间

### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/anyreturn/shunshousong-v2.git
cd shunshousong-v2

# 2. 创建 SSL 目录（可选，用于 HTTPS）
mkdir -p nginx/ssl
# 将 SSL 证书放入 nginx/ssl/

# 3. 启动所有服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f backend

# 5. 检查服务状态
docker-compose ps
```

### 访问地址

- **API**: http://your-domain.com/api
- **Swagger**: http://your-domain.com/api/docs
- **WebSocket**: ws://your-domain.com/messages

### 常用命令

```bash
# 查看日志
docker-compose logs -f

# 重启后端
docker-compose restart backend

# 数据库迁移
docker-compose exec backend npx prisma migrate deploy

# 停止服务
docker-compose down

# 更新代码
git pull
docker-compose up -d --build
```

---

## 方式 2: PM2 部署

### 前置要求

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Redis 6+ (可选)
- PM2

### 部署步骤

```bash
# 1. 安装依赖
npm install -g pm2

# 2. 克隆项目
git clone https://github.com/anyreturn/shunshousong-v2.git
cd shunshousong-v2

# 3. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 手动部署

```bash
# 1. 安装后端依赖
cd backend
npm ci --omit=dev
npx prisma generate

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 配置数据库等

# 3. 数据库迁移
npx prisma migrate deploy

# 4. 启动应用
pm2 start ecosystem.config.js --env production

# 5. 设置开机自启
pm2 save
pm2 startup
```

### 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs shunshousong-backend

# 重启应用
pm2 restart shunshousong-backend

# 停止应用
pm2 stop shunshousong-backend

# 删除应用
pm2 delete shunshousong-backend
```

---

## 方式 3: 云平台部署

### 阿里云

#### 使用 ECS + RDS

```bash
# 1. 创建 ECS 实例（2 核 4G+）
# 2. 创建 RDS PostgreSQL 实例
# 3. 配置安全组（开放 80/443/3000 端口）
# 4. 连接 ECS，执行部署脚本

# 安装 Docker
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 部署
git clone https://github.com/anyreturn/shunshousong-v2.git
cd shunshousong-v2
docker-compose up -d
```

#### 使用 Serverless 应用引擎 (SAE)

1. 创建 SAE 应用
2. 选择 Docker 镜像部署
3. 配置环境变量
4. 绑定 RDS 数据库

### 腾讯云

#### 使用 CVM + CDB

类似阿里云流程

#### 使用云开发 CloudBase

```bash
# 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 初始化项目
tcb init

# 部署
tcb deploy
```

---

## 环境变量配置

### 必需配置

```env
# 数据库
DATABASE_URL="postgresql://user:password@host:5432/shunshousong"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="30d"

# 服务器
NODE_ENV="production"
PORT=3000
```

### 可选配置

```env
# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# 支付宝
ALIPAY_APP_ID="your-app-id"
ALIPAY_PRIVATE_KEY="your-private-key"
ALIPAY_PUBLIC_KEY="your-public-key"

# 微信支付
WECHAT_APP_ID="your-app-id"
WECHAT_MCH_ID="your-mch-id"
WECHAT_API_KEY="your-api-key"

# 高德地图
AMAP_API_KEY="your-amap-key"

# OSS
OSS_BUCKET="your-bucket"
OSS_ACCESS_KEY="your-access-key"
OSS_SECRET="your-secret"
```

---

## HTTPS 配置

### 使用 Let's Encrypt

```bash
# 安装 Certbot
apt-get install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

### 配置 Nginx

编辑 `nginx/nginx.conf`，启用 HTTPS 配置部分。

---

## 性能优化

### 后端优化

```env
# 启用集群模式（PM2）
instances: 'max'
exec_mode: 'cluster'

# 数据库连接池
DATABASE_CONNECTION_POOL=10
DATABASE_CONNECTION_TIMEOUT=5000
```

### 数据库优化

```sql
-- 创建索引
CREATE INDEX "idx_order_status" ON "Order"("status");
CREATE INDEX "idx_order_created" ON "Order"("createdAt");
CREATE INDEX "idx_user_phone" ON "User"("phone");

-- 定期清理
VACUUM ANALYZE;
```

### Nginx 优化

```nginx
# 启用 Gzip
gzip on;
gzip_types text/plain application/json application/javascript text/css;

# 缓存静态资源
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 监控与日志

### 应用监控

```bash
# PM2 监控
pm2 monit

# 启用 PM2 Plus
pm2 plus
```

### 日志管理

```bash
# 查看日志
pm2 logs shunshousong-backend --lines 1000

# 日志轮转（PM2）
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 数据库监控

```sql
-- 查看慢查询
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- 查看连接数
SELECT count(*) FROM pg_stat_activity;
```

---

## 备份策略

### 数据库备份

```bash
# 每日备份
0 2 * * * pg_dump -U shunshousong shunshousong > /backup/shunshousong_$(date +\%Y\%m\%d).sql

# 恢复
psql -U shunshousong shunshousong < /backup/shunshousong_20260409.sql
```

### 代码备份

```bash
# Git 备份
git remote add backup git@backup-server:shunshousong-v2.git
git push backup main
```

---

## 故障排查

### 常见问题

**1. 数据库连接失败**
```bash
# 检查 PostgreSQL 状态
systemctl status postgresql

# 检查连接
psql -U shunshousong -d shunshousong -h localhost
```

**2. 端口被占用**
```bash
# 查看端口占用
netstat -tulpn | grep 3000

# 修改端口
# 编辑 ecosystem.config.js 或 docker-compose.yml
```

**3. 内存不足**
```bash
# 查看内存使用
free -h

# 限制 PM2 内存
# 编辑 ecosystem.config.js
max_memory_restart: '512M'
```

**4. WebSocket 连接失败**
```bash
# 检查 Nginx 配置
# 确保配置了 proxy_set_header Upgrade

# 检查防火墙
ufw allow 3000/tcp
```

---

## 安全加固

### 防火墙配置

```bash
# UFW
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# 或者使用安全组（云平台）
```

### 数据库安全

```sql
-- 限制远程访问
ALTER SYSTEM SET listen_addresses = 'localhost';

-- 创建专用用户
CREATE USER shunshousong WITH PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE shunshousong TO shunshousong;
```

### 应用安全

```env
# 强密码 JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)

# 限制上传大小
# nginx.conf: client_max_body_size 10M;

# 启用 HTTPS
# 强制 301 重定向
```

---

## 持续集成/持续部署 (CI/CD)

### GitHub Actions

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/shunshousong-v2
            git pull
            docker-compose up -d --build
```

---

## 回滚方案

```bash
# Docker 回滚
docker-compose down
git checkout <previous-commit>
docker-compose up -d

# PM2 回滚
pm2 restart shunshousong-backend
git revert HEAD
pm2 restart shunshousong-backend
```

---

## 联系支持

遇到问题？

- 📧 Email: support@shunshousong.com
- 📱 GitHub Issues: https://github.com/anyreturn/shunshousong-v2/issues
- 📚 文档：https://github.com/anyreturn/shunshousong-v2/wiki

---

**祝部署顺利！** 🎉
