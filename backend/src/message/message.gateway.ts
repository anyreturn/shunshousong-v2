import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'messages',
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // 用户 socket 映射
  private userSockets: Map<string, string> = new Map();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`客户端连接：${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`客户端断开：${client.id}`);
    // 清理用户 socket 映射
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token: string },
  ) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(data.token);
      this.userSockets.set(payload.userId, client.id);
      client.join(`user:${payload.userId}`);
      return { event: 'authenticated', data: { success: true } };
    } catch (error) {
      client.emit('error', { message: '认证失败' });
      return { event: 'authenticated', data: { success: false } };
    }
  }

  @SubscribeMessage('join_order')
  async handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    client.join(`order:${data.orderId}`);
    return { event: 'joined_order', data: { orderId: data.orderId } };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { orderId: string; content: string; type?: string },
  ) {
    try {
      // 验证用户权限
      const token = client.handshake.auth.token;
      if (!token) {
        throw new Error('未认证');
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      const userId = payload.userId;

      // 验证订单权限
      const order = await this.prisma.order.findUnique({
        where: { id: data.orderId },
      });

      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.publisherId !== userId && order.courierId !== userId) {
        throw new Error('无权发送消息');
      }

      // 保存消息
      const message = await this.prisma.message.create({
        data: {
          orderId: data.orderId,
          senderId: userId,
          content: data.content,
          type: data.type || 'TEXT',
        },
        include: {
          sender: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
        },
      });

      // 广播给订单房间
      this.server.to(`order:${data.orderId}`).emit('new_message', message);

      return { event: 'message_sent', data: message };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { event: 'error', data: { message: error.message } };
    }
  }

  // 发送系统通知
  sendSystemNotification(orderId: string, content: string) {
    this.server.to(`order:${orderId}`).emit('new_message', {
      type: 'SYSTEM',
      content,
      createdAt: new Date(),
    });
  }

  // 通知订单状态更新
  notifyOrderUpdate(orderId: string, order: any) {
    this.server.to(`order:${orderId}`).emit('order_updated', order);
  }

  // 通知新订单 (给附近配送员)
  notifyNewOrder(lat: number, lng: number, order: any) {
    // 实际应该推送给附近区域的配送员
    this.server.emit('new_order_nearby', order);
  }
}
