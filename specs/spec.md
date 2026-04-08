# 顺手送 - 同城互助配送平台

## 产品概述

顺手送是一款同城互助配送应用，连接需要配送服务的用户和愿意接单的跑腿人员。利用社会闲散人力资源，实现信息共享和资源优化配置。

## 核心功能

### 1. 用户端功能

#### 1.1 发布订单
- 填写配送信息（取件地址、收件地址、物品描述）
- 设置配送费用（可协商）
- 选择配送时间（立即/预约）
- 上传物品图片（可选）

#### 1.2 浏览订单
- 查看附近可接订单列表
- 按距离、价格、时间筛选
- 查看订单详情

#### 1.3 订单管理
- 查看我的订单（发布/接单）
- 订单状态跟踪（待接单→进行中→已完成）
- 取消订单（符合条件时）
- 评价系统

#### 1.4 实时追踪
- 地图上查看配送员实时位置
- 配送路线展示
- 预计到达时间

#### 1.5 消息沟通
- 与配送员/用户在线聊天
- 系统通知推送

### 2. 配送员端功能

#### 2.1 接单大厅
- 浏览可接订单
- 按条件筛选订单
- 快速抢单

#### 2.2 我的任务
- 查看进行中订单
- 更新订单状态
- 完成订单确认

#### 2.3 收入管理
- 查看收入明细
- 提现功能
- 收入统计

### 3. 公共功能

#### 3.1 用户认证
- 手机号注册/登录
- 实名认证（配送员必需）
- 身份验证

#### 3.2 支付系统
- 在线支付（微信/支付宝）
- 押金管理
- 费用结算

#### 3.3 安全机制
- 用户信用评分
- 订单保险
- 紧急联系
- 投诉举报

## 技术架构

### 前端
- 移动端：React Native / Flutter（跨平台）
- Web 管理后台：React + TypeScript

### 后端
- 框架：Node.js + Express / NestJS
- 数据库：PostgreSQL（主数据）+ Redis（缓存）
- 地图服务：高德地图 API
- 即时通讯：WebSocket / Socket.IO

### 基础设施
- 云服务：阿里云/腾讯云
- 消息队列：RabbitMQ / Redis Pub-Sub
- 文件存储：OSS / COS

## 数据模型

### User（用户）
```
- id: UUID
- phone: string
- nickname: string
- avatar: string
- role: enum (user, courier, both)
- creditScore: number
- verified: boolean
- createdAt: timestamp
```

### Order（订单）
```
- id: UUID
- publisherId: UUID (发布者)
- courierId: UUID (配送员，可选)
- pickupAddress: string
- deliveryAddress: string
- pickupLocation: {lat, lng}
- deliveryLocation: {lat, lng}
- description: string
- images: string[]
- price: number
- status: enum (pending, accepted, picking_up, delivering, completed, cancelled)
- createdAt: timestamp
- completedAt: timestamp
```

### Message（消息）
```
- id: UUID
- orderId: UUID
- senderId: UUID
- content: string
- type: enum (text, image, system)
- createdAt: timestamp
```

### Transaction（交易）
```
- id: UUID
- orderId: UUID
- amount: number
- type: enum (payment, refund, withdrawal)
- status: enum (pending, completed, failed)
- createdAt: timestamp
```

## API 设计

### 认证
- POST /api/auth/register - 注册
- POST /api/auth/login - 登录
- POST /api/auth/verify - 实名认证

### 订单
- POST /api/orders - 创建订单
- GET /api/orders - 获取订单列表
- GET /api/orders/:id - 获取订单详情
- PUT /api/orders/:id/accept - 接单
- PUT /api/orders/:id/status - 更新状态
- DELETE /api/orders/:id - 取消订单

### 消息
- GET /api/messages/:orderId - 获取订单消息
- POST /api/messages - 发送消息

### 用户
- GET /api/users/profile - 获取个人信息
- PUT /api/users/profile - 更新个人信息
- GET /api/users/courier/orders - 配送员订单

## 开发阶段

### Phase 1 - MVP
- 用户注册/登录
- 发布订单
- 浏览/接单
- 订单状态管理
- 基础消息功能

### Phase 2 - 完善
- 实时位置追踪
- 支付集成
- 评价系统
- 推送通知

### Phase 3 - 优化
- 信用体系
- 智能推荐
- 数据分析
- 客服系统

## 非功能需求

- 响应时间：< 200ms（API）
- 并发支持：1000+ 同时在线
- 数据安全：HTTPS + 数据加密
- 可用性：99.9%
