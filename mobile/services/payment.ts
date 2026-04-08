import api from './api';

export interface CreatePaymentParams {
  orderId: string;
  paymentMethod: 'alipay' | 'wechat';
}

export interface PaymentResponse {
  transaction: {
    id: string;
    amount: number;
    status: string;
  };
  paymentParams: {
    transactionId: string;
    amount: number;
    alipay?: {
      outTradeNo: string;
      totalAmount: string;
      subject: string;
    };
    wechat?: {
      outTradeNo: string;
      totalFee: number;
      body: string;
    };
  };
}

export interface WithdrawalParams {
  amount: number;
  alipayAccount?: string;
  bankAccount?: string;
}

export interface BalanceResponse {
  balance: number;
  totalIncome: number;
  totalWithdrawn: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  order?: {
    pickupAddress: string;
    deliveryAddress: string;
  };
}

export const paymentApi = {
  // 创建支付
  createPayment: async (params: CreatePaymentParams): Promise<PaymentResponse> => {
    const { data } = await api.post<PaymentResponse>('/payment/create', params);
    return data;
  },

  // 获取余额
  getBalance: async (): Promise<BalanceResponse> => {
    const { data } = await api.get<BalanceResponse>('/payment/balance');
    return data;
  },

  // 申请提现
  createWithdrawal: async (params: WithdrawalParams): Promise<any> => {
    const { data } = await api.post('/payment/withdraw', params);
    return data;
  },

  // 获取交易记录
  getTransactions: async (page?: number, limit?: number): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const { data } = await api.get('/payment/transactions', {
      params: { page, limit },
    });
    return data;
  },
};
