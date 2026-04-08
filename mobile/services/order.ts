import api from './api';

export interface CreateOrderParams {
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

export interface Order {
  id: string;
  publisherId: string;
  courierId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  description: string;
  images: string[];
  price: number;
  status: string;
  createdAt: string;
  publisher?: any;
  courier?: any;
}

export const orderApi = {
  // 创建订单
  createOrder: async (params: CreateOrderParams): Promise<Order> => {
    const { data } = await api.post<Order>('/orders', params);
    return data;
  },

  // 获取订单列表
  getOrders: async (params?: {
    status?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    page?: number;
    limit?: number;
  }): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/orders', { params });
    return data;
  },

  // 获取我的订单
  getMyOrders: async (role: 'publisher' | 'courier' = 'publisher'): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/orders/my', { params: { role } });
    return data;
  },

  // 获取订单详情
  getOrderDetail: async (id: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  // 接单
  acceptOrder: async (id: string): Promise<Order> => {
    const { data } = await api.put<Order>(`/orders/${id}/accept`);
    return data;
  },

  // 更新订单状态
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const { data } = await api.put<Order>(`/orders/${id}/status`, { status });
    return data;
  },

  // 取消订单
  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    const { data } = await api.delete<Order>(`/orders/${id}`, { data: { reason } });
    return data;
  },
};
