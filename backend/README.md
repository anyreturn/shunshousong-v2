# 顺手送 - 后端服务

同城互助配送平台后端 API 服务

## 技术栈

- NestJS - 后端框架
- Prisma - 数据库 ORM
- PostgreSQL - 数据库
- JWT - 认证
- Swagger - API 文档

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 配置数据库连接等
```

### 3. 启动数据库

使用 Docker 启动 PostgreSQL：

```bash
docker run -d \
  --name shunshousong-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shunshousong \
  -p 5432:5432 \
  postgres:15
```

### 4. 数据库迁移

```bash
npx prisma migrate dev --name init
```

### 5. 启动服务

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run start:prod
```

## API 文档

启动服务后访问：http://localhost:3000/api

## 主要接口

### 认证
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录

### 订单
- `POST /orders` - 创建订单
- `GET /orders` - 获取订单列表
- `GET /orders/:id` - 获取订单详情
- `GET /orders/my` - 获取我的订单
- `PUT /orders/:id/accept` - 接单
- `PUT /orders/:id/status` - 更新状态
- `DELETE /orders/:id` - 取消订单

## 项目结构

```
src/
├── auth/           # 认证模块
├── order/          # 订单模块
├── prisma/         # 数据库服务
├── app.module.ts   # 主模块
└── main.ts         # 入口文件
```

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 NestJS 最佳实践
- API 响应统一格式
- 错误处理使用过滤器
