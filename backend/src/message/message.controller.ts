import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

class CreateMessageDto {
  orderId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'SYSTEM';
}

@ApiTags('消息')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private prisma: PrismaService) {}

  @Get('order/:orderId')
  @ApiOperation({ summary: '获取订单消息列表' })
  async getOrderMessages(
    @Request() req,
    @Param('orderId') orderId: string,
    @Query('limit') limit = 50,
  ) {
    // 验证权限
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { error: '订单不存在' };
    }

    if (
      order.publisherId !== req.user.userId &&
      order.courierId !== req.user.userId
    ) {
      return { error: '无权查看此订单消息' };
    }

    const messages = await this.prisma.message.findMany({
      where: { orderId },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: parseInt(limit.toString()),
    });

    return messages;
  }

  @Post()
  @ApiOperation({ summary: '发送消息 (HTTP 备用接口)' })
  async createMessage(
    @Request() req,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const { orderId, content, type } = createMessageDto;

    // 验证订单权限
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { error: '订单不存在' };
    }

    if (
      order.publisherId !== req.user.userId &&
      order.courierId !== req.user.userId
    ) {
      return { error: '无权发送消息' };
    }

    const message = await this.prisma.message.create({
      data: {
        orderId,
        senderId: req.user.userId,
        content,
        type: type || 'TEXT',
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

    return message;
  }
}
