# 顺手送 - 执行计划

## 项目结构

```
shunshousong/
├── specs/              # 规范文档
│   ├── spec.md         # 产品规范
│   ├── plan.md         # 执行计划
│   └── tasks/          # 任务列表
├── backend/            # 后端服务
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── README.md
├── mobile/             # 移动端应用
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── README.md
└── docs/               # 文档
    └── api.md
```

## 任务分解

### Phase 1 - 后端基础 (Week 1-2)

#### Task 1.1: 项目初始化
- [ ] 创建后端项目结构
- [ ] 配置 TypeScript
- [ ] 配置 ESLint + Prettier
- [ ] 设置环境变量管理

#### Task 1.2: 数据库设计
- [ ] 设计数据库 Schema
- [ ] 创建 migrations
- [ ] 配置 Sequelize/TypeORM
- [ ] 创建种子数据

#### Task 1.3: 认证模块
- [ ] 实现 JWT 认证
- [ ] 用户注册 API
- [ ] 用户登录 API
- [ ] 短信验证码服务

#### Task 1.4: 订单模块
- [ ] 订单 CRUD API
- [ ] 订单状态机
- [ ] 订单查询接口
- [ ] 地理位置计算

#### Task 1.5: 消息模块
- [ ] WebSocket 配置
- [ ] 消息存储
- [ ] 实时推送
- [ ] 离线消息

### Phase 2 - 前端开发 (Week 3-4)

#### Task 2.1: 项目初始化
- [ ] 创建 React Native 项目
- [ ] 配置导航 (React Navigation)
- [ ] 配置状态管理 (Zustand/Redux)
- [ ] 配置 UI 组件库

#### Task 2.2: 认证界面
- [ ] 登录页面
- [ ] 注册页面
- [ ] 验证码输入
- [ ] 用户协议

#### Task 2.3: 订单界面
- [ ] 发布订单表单
- [ ] 订单列表页
- [ ] 订单详情页
- [ ] 地图选点组件

#### Task 2.4: 消息界面
- [ ] 聊天列表
- [ ] 聊天窗口
- [ ] 消息输入框
- [ ] 图片发送

#### Task 2.5: 个人中心
- [ ] 个人资料页
- [ ] 我的订单
- [ ] 设置页面
- [ ] 实名认证

### Phase 3 - 集成测试 (Week 5)

#### Task 3.1: API 测试
- [ ] 单元测试
- [ ] 集成测试
- [ ] 压力测试

#### Task 3.2: E2E 测试
- [ ] 用户流程测试
- [ ] 配送员流程测试
- [ ] 边界情况测试

#### Task 3.3: 性能优化
- [ ] 数据库索引优化
- [ ] API 响应优化
- [ ] 前端性能优化

## 技术选型确认

| 模块 | 技术 | 理由 |
|------|------|------|
| 后端框架 | NestJS | TypeScript 友好，模块化 |
| 数据库 | PostgreSQL + Prisma | 类型安全，开发效率高 |
| 缓存 | Redis | 高性能，支持 Pub-Sub |
| 移动端 | React Native | 跨平台，生态成熟 |
| 地图 | 高德地图 | 国内覆盖好，API 完善 |
| 即时通讯 | Socket.IO | 成熟稳定，支持房间 |
| 支付 | 支付宝/微信 SDK | 主流支付方式 |
| 部署 | Docker + K8s | 容器化，易扩展 |

## 里程碑

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| Phase 1 | Week 1-2 | 后端 API 完成，可测试 |
| Phase 2 | Week 3-4 | 移动端 MVP 完成 |
| Phase 3 | Week 5 | 测试完成，准备上线 |
| Phase 4 | Week 6 | 上线 + 监控 |

## 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 地图 API 成本 | 中 | 使用免费额度，优化调用 |
| 支付接入复杂 | 高 | 提前申请，准备材料 |
| 并发性能 | 中 | 压力测试，提前优化 |
| 安全问题 | 高 | 代码审查，安全测试 |
