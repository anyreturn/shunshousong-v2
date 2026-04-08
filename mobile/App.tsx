import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Linking } from 'react-native';
import { useAuthStore } from './store/authStore';
import { notificationApi } from './services/notification';
import LoginScreen from './app/LoginScreen';
import RegisterScreen from './app/RegisterScreen';
import OrderListScreen from './app/OrderListScreen';
import CreateOrderScreen from './app/CreateOrderScreen';
import OrderDetailScreen from './app/OrderDetailScreen';
import ChatScreen from './app/ChatScreen';
import PaymentScreen from './app/PaymentScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 主页面导航
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>
            {route.name === 'Orders' ? '📦' : '👤'}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Orders" component={OrderListScreen} options={{ title: '订单' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  );
}

// 个人中心
function ProfileScreen() {
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
          // 可以导航到订单详情
          console.log('点击通知，订单 ID:', data.orderId);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        你好，{user?.nickname || '用户'}
      </Text>
      <Text style={{ color: '#666', marginBottom: 10 }}>手机号：{user?.phone}</Text>
      <Text style={{ color: '#666', marginBottom: 30 }}>
        信用分：{user?.creditScore || 100}
      </Text>
      
      <TouchableOpacity
        onPress={() => {}}
        style={{
          backgroundColor: '#1890ff',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          💰 我的钱包
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {}}
        style={{
          backgroundColor: '#f0f0f0',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#333', fontSize: 16 }}>
          ⚙️ 设置
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor: '#ff4d4f',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          退出登录
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 认证导航
function AuthStack() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!showRegister ? (
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLoginSuccess={() => {}}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Register">
          {(props) => (
            <RegisterScreen
              {...props}
              onRegisterSuccess={() => {}}
              onBack={() => setShowRegister(false)}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

// 主应用导航
function AppStack() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: '发布订单' }} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: '订单详情' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: '消息' }} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: '钱包' }} />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return <AppStack />;
}
