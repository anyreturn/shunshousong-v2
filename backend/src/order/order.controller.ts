import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService, CreateOrderDto } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('订单')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  async findAll(
    @Query('status') status?: OrderStatus,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.orderService.findAll({
      status,
      lat,
      lng,
      radius,
      page,
      limit,
    });
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的订单' })
  async findMyOrders(
    @Request() req,
    @Query('role') role: 'publisher' | 'courier' = 'publisher',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.orderService.findMyOrders(
      req.user.userId,
      role,
      page,
      limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.orderService.findOne(id, req.user.userId);
  }

  @Put(':id/accept')
  @ApiOperation({ summary: '接单' })
  async accept(@Request() req, @Param('id') id: string) {
    return this.orderService.acceptOrder(id, req.user.userId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新订单状态' })
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.orderService.updateStatus(id, req.user.userId, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '取消订单' })
  async cancel(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.orderService.cancelOrder(id, req.user.userId, reason);
  }
}
