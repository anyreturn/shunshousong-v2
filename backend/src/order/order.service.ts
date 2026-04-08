import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

export interface CreateOrderDto {
  pickupAddress: string;
  deliveryAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  description: string;
  images?: string[];
  price: number;
  weight?: number;
  note?: string;
}

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, data: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: {
        ...data,
        publisherId: userId,
        images: data.images || [],
      },
      include: {
        publisher: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
            creditScore: true,
          },
        },
      },
    });

    return order;
  }

  async findAll(filters: {
    status?: OrderStatus;
    lat?: number;
    lng?: number;
    radius?: number;
    page?: number;
    limit?: number;
  }) {
    const { status, lat, lng, radius, page = 1, limit = 20 } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    // 位置筛选（简单版本，实际应该用 PostGIS）
    let orders;
    if (lat && lng && radius) {
      // 这里简化处理，实际应该用数据库的空间查询
      orders = await this.prisma.order.findMany({
        where,
        include: {
          publisher: {
            select: {
              id: true,
              phone: true,
              nickname: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      // 前端过滤距离
      if (orders.length > 0) {
        orders = orders.filter((order: any) => {
          const distance = this.calculateDistance(
            lat,
            lng,
            order.pickupLat,
            order.pickupLng,
          );
          return distance <= radius;
        });
      }
    } else {
      orders = await this.prisma.order.findMany({
        where,
        include: {
          publisher: {
            select: {
              id: true,
              phone: true,
              nickname: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    }

    return orders;
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        publisher: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
            creditScore: true,
          },
        },
        courier: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
            creditScore: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查权限
    if (order.publisherId !== userId && order.courierId !== userId) {
      throw new ForbiddenException('无权查看此订单');
    }

    return order;
  }

  async acceptOrder(orderId: string, courierId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('订单状态不允许接单');
    }

    if (order.publisherId === courierId) {
      throw new ForbiddenException('不能接自己的订单');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        courierId,
        status: OrderStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: {
        publisher: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
          },
        },
        courier: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateStatus(
    orderId: string,
    userId: string,
    status: OrderStatus,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查权限
    if (order.publisherId !== userId && order.courierId !== userId) {
      throw new ForbiddenException('无权操作此订单');
    }

    // 状态机验证
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
      [OrderStatus.ACCEPTED]: [OrderStatus.PICKING_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKING_UP]: [OrderStatus.DELIVERING],
      [OrderStatus.DELIVERING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new ForbiddenException('无效的状态转换');
    }

    const updateData: any = {
      status,
    };

    if (status === OrderStatus.PICKING_UP) {
      updateData.pickedUpAt = new Date();
    } else if (status === OrderStatus.DELIVERING) {
      updateData.deliveredAt = new Date();
    } else if (status === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        publisher: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
          },
        },
        courier: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });
  }

  async cancelOrder(
    orderId: string,
    userId: string,
    reason?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.publisherId !== userId) {
      throw new ForbiddenException('只有发布者可以取消订单');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('订单已被接单，无法取消');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    });
  }

  async findMyOrders(
    userId: string,
    role: 'publisher' | 'courier',
    page = 1,
    limit = 20,
  ) {
    const where = role === 'publisher' 
      ? { publisherId: userId }
      : { courierId: userId };

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        publisher: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
          },
        },
        courier: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return orders;
  }

  // 计算两点之间的距离（单位：公里）
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
