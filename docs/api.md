# 顺手送 API 文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **Swagger 文档**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token

## 认证

### 用户注册

```http
POST /auth/register
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "123456",
  "nickname": "小明"
}
```

**响应**:
```json
{
  "user": {
    "id": "uuid",
    "phone": "13800138000",
    "nickname": "小明",
    "role": "USER",
    "creditScore": 100
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 用户登录

```http
POST /auth/login
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "123456"
}
```

## 订单

### 创建订单

```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickupAddress": "北京市朝阳区 xxx",
  "deliveryAddress": "北京市海淀区 xxx",
  "pickupLat": 39.9042,
  "pickupLng": 116.4074,
  "deliveryLat": 39.9942,
  "deliveryLng": 116.3074,
  "description": "文件一份，重要",
  "price": 20.0,
  "weight": 0.5,
  "note": "请尽快送达"
}
```

### 获取订单列表

```http
GET /orders?status=PENDING&page=1&limit=20
Authorization: Bearer <token>
```

### 获取订单详情

```http
GET /orders/:id
Authorization: Bearer <token>
```

### 接单

```http
PUT /orders/:id/accept
Authorization: Bearer <token>
```

### 更新订单状态

```http
PUT /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "PICKING_UP"
}
```

状态流转：`PENDING` → `ACCEPTED` → `PICKING_UP` → `DELIVERING` → `COMPLETED`

### 取消订单

```http
DELETE /orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "临时不需要了"
}
```

### 获取我的订单

```http
GET /orders/my?role=publisher&page=1&limit=20
Authorization: Bearer <token>
```

`role`: `publisher` (我发布的) 或 `courier` (我接的)

## 消息

### 获取订单消息

```http
GET /messages/order/:orderId?limit=50
Authorization: Bearer <token>
```

### 发送消息 (HTTP 备用)

```http
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid",
  "content": "你好，请问什么时候能到？",
  "type": "TEXT"
}
```

### WebSocket 消息

连接：`ws://localhost:3000/messages`

**认证**:
```javascript
socket.emit('authenticate', { token: 'your-jwt-token' });
```

**加入订单房间**:
```javascript
socket.emit('join_order', { orderId: 'order-uuid' });
```

**发送消息**:
```javascript
socket.emit('send_message', {
  orderId: 'order-uuid',
  content: '你好',
  type: 'TEXT'
});
```

**接收消息**:
```javascript
socket.on('new_message', (message) => {
  console.log('收到消息:', message);
});
```

## 支付

### 创建支付

```http
POST /payment/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid",
  "paymentMethod": "alipay"
}
```

### 获取余额

```http
GET /payment/balance
Authorization: Bearer <token>
```

### 申请提现

```http
POST /payment/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "alipayAccount": "xxx@alipay.com"
}
```

### 获取交易记录

```http
GET /payment/transactions?page=1&limit=20
Authorization: Bearer <token>
```

## 错误响应

```json
{
  "statusCode": 400,
  "message": "手机号已注册",
  "error": "Conflict"
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未认证/Token 过期
- `403`: 无权访问
- `404`: 资源不存在
- `409`: 资源冲突
