# 🚀 顺手送 v2 - 一键部署到线上

## 当前环境检查

✅ **已准备**:
- Node.js 环境
- 后端代码 (生产模式优化)
- Docker Compose 配置
- PM2 生态系统配置
- Nginx 反向代理配置
- 一键部署脚本

---

## 选择部署方式

### 方式 1: Docker Compose (推荐)

**适合**: 全新部署，隔离环境

```bash
cd /home/admin/openclaw/workspace/shunshousong-v2

# 1. 检查 Docker
docker --version
docker-compose --version

# 2. 启动所有服务
docker-compose up -d

# 3. 查看状态
docker-compose ps
docker-compose logs -f backend
```

**访问**: http://localhost:3000

---

### 方式 2: PM2 直接部署

**适合**: 已有 PostgreSQL 环境

```bash
cd /home/admin/openclaw/workspace/shunshousong-v2

# 1. 运行部署脚本
chmod +x deploy.sh
./deploy.sh

# 2. 查看状态
pm2 status
pm2 logs shunshousong-backend
```

**访问**: http://localhost:3000

---

### 方式 3: 手动部署

```bash
cd /home/admin/openclaw/workspace/shunshousong-v2/backend

# 1. 安装依赖（已完成）
npm ci --omit=dev

# 2. 生成 Prisma
npx prisma generate

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env

# 4. 数据库迁移
npx prisma migrate deploy

# 5. 启动服务
npx prisma migrate deploy && npm run start:prod
```

---

## 线上环境检查清单

### 必需项

- [ ] 域名解析配置
- [ ] SSL 证书（HTTPS）
- [ ] 数据库备份策略
- [ ] 防火墙配置
- [ ] 监控告警设置

### 可选项

- [ ] CDN 加速
- [ ] 负载均衡
- [ ] 自动扩容
- [ ] 日志聚合

---

## 快速测试

```bash
# 测试 API
curl http://localhost:3000/health

# 测试 Swagger
curl http://localhost:3000/api

# 测试注册
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'

# 测试登录
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'
```

---

## 下一步

1. **选择部署方式** (Docker / PM2 / 手动)
2. **配置生产环境变量**
3. **设置域名和 SSL**
4. **配置数据库备份**
5. **设置监控告警**

---

## 常用命令速查

```bash
# Docker
docker-compose up -d          # 启动
docker-compose down           # 停止
docker-compose logs -f        # 日志
docker-compose restart        # 重启

# PM2
pm2 start ecosystem.config.js # 启动
pm2 stop all                  # 停止
pm2 restart all               # 重启
pm2 logs                      # 日志
pm2 monit                     # 监控

# 数据库
npx prisma migrate deploy     # 迁移
npx prisma studio             # 可视化

# Git
git pull                      # 更新代码
git status                    # 状态
```

---

## 需要我帮您执行哪个部署方式？

- 回复 **1** 使用 Docker Compose
- 回复 **2** 使用 PM2
- 回复 **3** 手动部署
- 回复 **帮助** 查看更多选项
