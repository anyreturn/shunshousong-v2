# Task 1.1: 后端项目初始化

## 目标
创建 NestJS 后端项目基础结构

## 步骤

1. 初始化 NestJS 项目
```bash
cd shunshousong
npm install -g @nestjs/cli
nest new backend
```

2. 安装核心依赖
```bash
cd backend
npm install @prisma/client
npm install -D prisma
npm install @nestjs/config
npm install class-validator class-transformer
npm install bcrypt
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/swagger
```

3. 配置项目结构
```
src/
├── auth/           # 认证模块
├── user/           # 用户模块
├── order/          # 订单模块
├── message/        # 消息模块
├── common/         # 公共模块
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/         # 配置
└── prisma/         # 数据库
```

4. 配置环境变量
创建 `.env.example`:
```
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/shunshousong"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

## 验收标准
- [x] NestJS 项目可启动
- [x] 健康检查接口可用
- [x] 环境变量配置正确
- [x] 代码规范配置完成
