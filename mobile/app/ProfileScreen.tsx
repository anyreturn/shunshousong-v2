import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { notificationApi } from '../services/notification';

interface Props {
  navigation: any;
}

export default function ProfileScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // 初始化通知权限
    const initNotifications = async () => {
      const granted = await notificationApi.requestPermission();
      if (granted) {
        const token = await notificationApi.getPushToken();
        console.log('推送 Token:', token);
      }
    };
    initNotifications();

    // 监听通知点击
    const subscription = notificationApi.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.orderId) {
          Alert.alert('通知', `订单 ${data.orderId} 有更新`);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleTestNotification = async () => {
    await notificationApi.sendNotification({
      title: '测试通知',
      body: '这是一条测试通知消息',
      data: { type: 'test' },
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* 用户信息卡片 */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nickname?.charAt(0) || '用'}
          </Text>
        </View>
        <Text style={styles.nickname}>{user?.nickname || '用户'}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        <View style={styles.creditBadge}>
          <Text style={styles.creditLabel}>信用分</Text>
          <Text style={styles.creditScore}>{user?.creditScore || 100}</Text>
        </View>
      </View>

      {/* 功能菜单 */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>我的服务</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Payment')}
        >
          <Text style={styles.menuIcon}>💰</Text>
          <Text style={styles.menuText}>我的钱包</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {}}
        >
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>我的订单</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {}}
        >
          <Text style={styles.menuIcon}>⭐</Text>
          <Text style={styles.menuText}>评价管理</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleTestNotification}
        >
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>测试通知</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 设置区域 */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>设置</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {}}
        >
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>通用设置</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {}}
        >
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>帮助与反馈</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {}}
        >
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>关于我们</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 退出登录 */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert('确认', '确定要退出登录吗？', [
            { text: '取消', style: 'cancel' },
            { text: '确定', onPress: logout },
          ]);
        }}
      >
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    backgroundColor: '#1890ff',
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  nickname: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15,
  },
  creditBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginRight: 8,
  },
  creditScore: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#999',
    padding: 15,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
