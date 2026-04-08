# 顺手送 v2 - 同城互助配送平台

🚀 基于 **Spec-Driven Development (SDD)** 方式开发的同城互助配送应用 v2 版本

**在线文档**: https://github.com/yourusername/shunshousong-v2

## 项目概述

顺手送连接需要配送服务的用户和愿意接单的跑腿人员，利用社会闲散人力资源，实现信息共享和资源优化配置。

**核心理念**：物来顺应，互帮互助

## 技术架构

### 后端
- **框架**: NestJS (TypeScript)
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT
- **实时通讯**: Socket.IO
- **文档**: Swagger

### 移动端
- **框架**: React Native (Expo)
- **导航**: React Navigation
- **状态管理**: Zustand
- **网络**: Axios + Socket.IO Client

## 核心功能

### 用户端
- 📦 发布配送订单
- 📍 地图选点 (待集成)
- 💬 实时消息聊天
- 📋 订单管理
- 👤 个人中心

### 配送员端
- 📋 接单大厅
- 🚀 快速抢单
- 💰 收入管理
- 📊 订单状态更新

### 系统功能
- 🔐 JWT 认证
- 🔔 WebSocket 实时推送
- 💳 支付接口 (待接入)
- ⭐ 信用评分系统

## 项目结构

```
shunshousong-v2/
├── specs/                  # 规范文档 (Spec Kit)
│   ├── spec.md             # 产品规范
│   ├── plan.md             # 执行计划
│   └── tasks/              # 任务列表
├── backend/                # 后端服务 (NestJS)
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── order/          # 订单模块
│   │   ├── message/        # 消息模块 (WebSocket)
│   │   ├── payment/        # 支付模块
│   │   ├── prisma/         # 数据库服务
│   │   └── main.ts
│   ├── prisma/schema.prisma
│   └── README.md
├── mobile/                 # 移动端 (React Native)
│   ├── app/                # 屏幕组件
│   ├── services/           # API 服务
│   ├── store/              # 状态管理
│   ├── config/             # 配置
│   └── App.tsx
└── docs/
    └── api.md              # API 文档
```

## 快速开始

### 后端启动

```bash
cd shunshousong-v2/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动数据库 (Docker)
docker run -d --name shunshousong-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shunshousong \
  -p 5432:5432 postgres:15

# 数据库迁移
npx prisma migrate dev --name init

# 启动服务
npm run start:dev
```

访问 API 文档：http://localhost:3000/api

### 移动端启动

```bash
cd shunshousong-v2/mobile

# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行平台
npm run android  # Android
npm run ios      # iOS (需要 macOS)
npm run web      # Web
```

## 开发进度

### Phase 1 - 后端基础 ✅
- [x] 项目初始化
- [x] 数据库设计 (User, Order, Message, Transaction)
- [x] 认证模块 (注册/登录/JWT)
- [x] 订单模块 (CRUD/状态机)
- [x] 消息模块 (WebSocket)
- [x] 支付模块 (接口)

### Phase 2 - 前端开发 ✅
- [x] React Native 项目初始化
- [x] 认证界面 (登录/注册)
- [x] 订单界面 (列表/详情/发布)
- [x] 聊天界面 (WebSocket 实时)
- [x] 个人中心
- [ ] 地图选点集成
- [ ] 图片上传

### Phase 3 - 测试与优化 (待开始)
- [ ] 单元测试
- [ ] E2E 测试
- [ ] 性能优化
- [ ] 支付接入

## API 接口

### 认证
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /auth/register | 用户注册 |
| POST | /auth/login | 用户登录 |

### 订单
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /orders | 创建订单 |
| GET | /orders | 获取订单列表 |
| GET | /orders/:id | 订单详情 |
| GET | /orders/my | 我的订单 |
| PUT | /orders/:id/accept | 接单 |
| PUT | /orders/:id/status | 更新状态 |
| DELETE | /orders/:id | 取消订单 |

### 消息
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /messages/order/:id | 订单消息 |
| POST | /messages | 发送消息 |
| WS | /messages | WebSocket 连接 |

### 支付
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /payment/create | 创建支付 |
| GET | /payment/balance | 获取余额 |
| POST | /payment/withdraw | 申请提现 |
| GET | /payment/transactions | 交易记录 |

## 数据模型

```prisma
User          # 用户 (手机号、昵称、信用分)
Order         # 订单 (地址、价格、状态)
Message       # 消息 (订单关联、发送者)
Transaction   # 交易 (支付、提现)
VerificationCode # 验证码
```

## 开发团队

使用 **Spec Kit** 规范驱动开发方式构建

## License

MIT
