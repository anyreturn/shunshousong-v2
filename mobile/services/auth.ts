import api from './api';

export interface LoginParams {
  phone: string;
  password: string;
}

export interface RegisterParams {
  phone: string;
  password: string;
  nickname?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    phone: string;
    nickname: string;
    avatar?: string;
    role: string;
    creditScore: number;
  };
  accessToken: string;
}

export const authApi = {
  // 登录
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', params);
    return data;
  },

  // 注册
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', params);
    return data;
  },

  // 获取个人信息
  getProfile: async () => {
    const { data } = await api.get('/users/profile');
    return data;
  },
};
