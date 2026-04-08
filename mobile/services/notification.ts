import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 配置通知行为
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: {
    orderId?: string;
    type?: string;
  };
}

export const notificationApi = {
  // 请求通知权限
  requestPermission: async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  // 获取推送 Token
  getPushToken: async (): Promise<string | null> => {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('获取推送 Token 失败:', error);
      return null;
    }
  },

  // 发送本地通知
  sendNotification: async (notification: NotificationData) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: true,
      },
      trigger: null, // 立即发送
    });
  },

  // 发送定时通知
  scheduleNotification: async (
    notification: NotificationData,
    delaySeconds: number
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: true,
      },
      trigger: delaySeconds,
    });
  },

  // 取消所有通知
  cancelAllNotifications: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // 监听通知点击
  addNotificationResponseListener: (callback: (response: any) => void) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  // 监听通知接收
  addNotificationReceivedListener: (callback: (notification: any) => void) => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  // 设置角标数
  setBadgeCount: async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  },
};

// 订单通知快捷方式
export const OrderNotifications = {
  // 新订单通知
  newOrder: async (orderId: string, price: number) => {
    await notificationApi.sendNotification({
      title: '📦 新订单通知',
      body: `您有一个新订单，配送费 ¥${price}`,
      data: { orderId, type: 'new_order' },
    });
  },

  // 订单被接单
  orderAccepted: async (orderId: string) => {
    await notificationApi.sendNotification({
      title: '✅ 订单已接单',
      body: '配送员已接单，即将开始配送',
      data: { orderId, type: 'order_accepted' },
    });
  },

  // 订单状态更新
  orderStatusUpdate: async (orderId: string, status: string) => {
    const statusMap: Record<string, string> = {
      PICKING_UP: '🚚 配送员正在取件',
      DELIVERING: '🚚 配送中',
      COMPLETED: '✅ 订单已完成',
      CANCELLED: '❌ 订单已取消',
    };

    await notificationApi.sendNotification({
      title: '订单状态更新',
      body: statusMap[status] || `订单状态：${status}`,
      data: { orderId, type: 'status_update' },
    });
  },

  // 收到新消息
  newMessage: async (orderId: string, content: string) => {
    await notificationApi.sendNotification({
      title: '💬 新消息',
      body: content,
      data: { orderId, type: 'new_message' },
    });
  },
};
