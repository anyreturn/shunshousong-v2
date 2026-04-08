import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { orderApi, Order } from '../../services/order';
import { useAuthStore } from '../../store/authStore';

interface Props {
  route: any;
  navigation: any;
}

export default function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      const data = await orderApi.getOrderDetail(orderId);
      setOrder(data);
    } catch (error) {
      console.error('加载订单详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await orderApi.acceptOrder(orderId);
      Alert.alert('成功', '接单成功');
      loadOrderDetail();
    } catch (error: any) {
      Alert.alert('失败', error.response?.data?.message);
    }
  };

  const handleCancel = async () => {
    Alert.alert('确认', '确定取消订单吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            await orderApi.cancelOrder(orderId, '用户取消');
            Alert.alert('成功', '订单已取消');
            loadOrderDetail();
          } catch (error: any) {
            Alert.alert('失败', error.response?.data?.message);
          }
        },
      },
    ]);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: '待接单',
      ACCEPTED: '已接单',
      PICKING_UP: '取件中',
      DELIVERING: '配送中',
      COMPLETED: '已完成',
      CANCELLED: '已取消',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1890ff" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  const isPublisher = user?.id === order.publisherId;
  const isCourier = user?.id === order.courierId;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>订单号：{order.id}</Text>
        <Text style={styles.status}>{getStatusText(order.status)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>配送信息</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>取件地址:</Text>
          <Text style={styles.value}>{order.pickupAddress}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>收件地址:</Text>
          <Text style={styles.value}>{order.deliveryAddress}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>配送费用:</Text>
          <Text style={[styles.value, styles.price]}>¥{order.price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>物品描述</Text>
        <Text style={styles.description}>{order.description}</Text>
      </View>

      {order.note && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>备注</Text>
          <Text style={styles.description}>{order.note}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>订单信息</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>发布时间:</Text>
          <Text style={styles.value}>
            {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>
        {order.publisher && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>发布者:</Text>
            <Text style={styles.value}>{order.publisher.nickname}</Text>
          </View>
        )}
        {order.courier && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>配送员:</Text>
            <Text style={styles.value}>{order.courier.nickname}</Text>
          </View>
        )}
      </View>

      {/* 操作按钮 */}
      <View style={styles.actions}>
        {!isPublisher && order.status === 'PENDING' && (
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>立即接单</Text>
          </TouchableOpacity>
        )}

        {isPublisher && order.status === 'PENDING' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>取消订单</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat', { orderId })}
        >
          <Text style={styles.chatButtonText}>联系{isPublisher ? '配送员' : '发布者'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderId: {
    fontSize: 14,
    color: '#999',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1890ff',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  price: {
    color: '#f5222d',
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  actions: {
    padding: 20,
  },
  acceptButton: {
    backgroundColor: '#52c41a',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff4d4f',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  chatButton: {
    backgroundColor: '#1890ff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
