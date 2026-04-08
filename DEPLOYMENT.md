# 顺手送 - 部署指南

## 环境要求

### 后端
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6 (可选，用于缓存)
- Docker (推荐)

### 移动端
- Node.js >= 18
- Expo CLI
- iOS: Xcode (macOS)
- Android: Android Studio

## 后端部署

### 1. 使用 Docker Compose (推荐)

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: shunshousong
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/shunshousong
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

部署命令:
```bash
docker-compose up -d
```

### 2. 手动部署

```bash
# 安装依赖
cd backend
npm install --production

# 构建 Prisma Client
npx prisma generate

# 数据库迁移
npx prisma migrate deploy

# 启动服务
npm run start:prod
```

### 3. 环境变量配置

生产环境 `.env`:
```env
# 数据库
DATABASE_URL="postgresql://user:password@host:5432/shunshousong"

# JWT
JWT_SECRET="strong-random-secret-key"
JWT_EXPIRATION="7d"

# 服务器
PORT=3000
NODE_ENV="production"

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

# 对象存储 (OSS)
OSS_BUCKET="your-bucket"
OSS_ACCESS_KEY="your-access-key"
OSS_SECRET="your-secret"
OSS_REGION="oss-cn-hangzhou"
```

## 移动端部署

### 1. 构建 Android APK

```bash
cd mobile

# 安装 EAS CLI
npm install -g eas-cli

# 配置 EAS
eas build:configure

# 构建 APK
eas build --platform android --profile preview

# 或构建 AAB (Google Play)
eas build --platform android --profile production
```

### 2. 构建 iOS

```bash
# 需要 Apple Developer 账号
eas build --platform ios --profile production
```

### 3. 发布到应用商店

#### Android
1. 下载构建的 APK/AAB
2. 上传到各大应用商店:
   - 华为应用市场
   - 小米应用商店
   - OPPO 软件商店
   - vivo 应用商店
   - 应用宝

#### iOS
1. 使用 Transporter 上传到 App Store Connect
2. 在 App Store Connect 提交审核

### 4. 配置 API 地址

生产环境 `config/index.ts`:
```typescript
export const API_CONFIG = {
  baseUrl: 'https://api.yourdomain.com',
  timeout: 10000,
};
```

## 支付配置

### 支付宝接入

1. 登录 [支付宝开放平台](https://open.alipay.com/)
2. 创建应用，获取 AppID
3. 配置 RSA2 密钥
4. 签约产品：手机网站支付/APP 支付
5. 更新后端 `.env` 配置

### 微信支付接入

1. 登录 [微信支付商户平台](https://pay.weixin.qq.com/)
2. 注册商户号
3. 配置 API 密钥
4. 下载 API 证书
5. 更新后端 `.env` 配置

## 地图服务配置

### 高德地图

1. 注册 [高德开放平台](https://lbs.amap.com/)
2. 创建应用
3. 添加 Key (Android/iOS/Web)
4. 配置 Bundle ID/包名
5. 更新配置:
   - 后端：`AMAP_API_KEY`
   - 移动端：`app.json`

## 监控与日志

### 日志
- 使用 Winston 记录日志
- 配置日志轮转
- 集成 ELK 或类似服务

### 监控
- 使用 Prometheus + Grafana
- 配置健康检查端点 `/health`
- 设置告警规则

### 错误追踪
- 集成 Sentry
- 配置 Source Map

## 性能优化

### 后端
- 启用 Redis 缓存
- 数据库连接池配置
- 启用 Gzip 压缩
- 配置 CDN (静态资源)

### 移动端
- 启用 Hermes 引擎
- 图片压缩
- 代码分割
- 按需加载

## 安全加固

- 启用 HTTPS
- 配置 CORS
- 设置速率限制
- 定期更新依赖
- 安全扫描

## 备份策略

### 数据库备份
```bash
# 每日备份
pg_dump -U postgres shunshousong > backup_$(date +%Y%m%d).sql

# 恢复到数据库
psql -U postgres shunshousong < backup_20260409.sql
```

### 配置文件备份
- 定期备份 `.env` 文件
- 版本控制配置文件 (不含敏感信息)

## 常见问题

### 数据库连接失败
检查 `DATABASE_URL` 配置，确保网络可达

### 支付回调失败
检查公网 IP 配置和 HTTPS 证书

### 推送通知不工作
检查推送证书配置和设备权限

---

详细文档请参考官方文档或联系技术支持。
