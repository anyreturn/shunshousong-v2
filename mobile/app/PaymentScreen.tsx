import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { paymentApi } from '../services/payment';

interface Props {
  route: any;
  navigation: any;
}

export default function PaymentScreen({ route, navigation }: Props) {
  const { orderId, amount } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    loadBalance();
    loadTransactions();
  }, []);

  const loadBalance = async () => {
    try {
      const data = await paymentApi.getBalance();
      setBalance(data.balance);
    } catch (error) {
      console.error('加载余额失败:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await paymentApi.getTransactions(1, 20);
      setTransactions(data.transactions);
    } catch (error) {
      console.error('加载交易记录失败:', error);
    }
  };

  const handlePay = async (method: 'alipay' | 'wechat') => {
    if (!orderId) {
      Alert.alert('提示', '订单信息不完整');
      return;
    }

    setLoading(true);
    try {
      const result = await paymentApi.createPayment({
        orderId,
        paymentMethod: method,
      });

      // 模拟支付流程
      Alert.alert(
        '支付',
        `调用${method === 'alipay' ? '支付宝' : '微信支付'}...\n金额：¥${amount || result.paymentParams.amount}`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '支付成功',
            onPress: async () => {
              // 实际应该调用支付回调接口
              Alert.alert('成功', '支付成功');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('失败', error.response?.data?.message || '支付失败');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 10) {
      Alert.alert('提示', '最低提现金额为 10 元');
      return;
    }

    if (amount > balance) {
      Alert.alert('提示', '余额不足');
      return;
    }

    setLoading(true);
    try {
      await paymentApi.createWithdrawal({
        amount,
        alipayAccount: 'user@example.com',
      });
      Alert.alert('成功', '提现申请已提交', [
        { text: '确定', onPress: loadBalance },
      ]);
      setWithdrawAmount('');
    } catch (error: any) {
      Alert.alert('失败', error.response?.data?.message || '提现失败');
    } finally {
      setLoading(false);
    }
  };

  const getTypeText = (type: string) => {
    const map: Record<string, string> = {
      PAYMENT: '支付',
      REFUND: '退款',
      WITHDRAWAL: '提现',
    };
    return map[type] || type;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: '#faad14',
      COMPLETED: '#52c41a',
      FAILED: '#ff4d4f',
    };
    return map[status] || '#666';
  };

  return (
    <ScrollView style={styles.container}>
      {/* 余额卡片 */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>可用余额</Text>
        <Text style={styles.balanceAmount}>¥{balance.toFixed(2)}</Text>
        <View style={styles.balanceDetails}>
          <Text style={styles.balanceDetail}>总收入：¥{balance}</Text>
        </View>
      </View>

      {/* 提现区域 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>提现</Text>
        <TextInput
          style={styles.input}
          placeholder="输入提现金额"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={handleWithdraw}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.withdrawButtonText}>申请提现</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 支付方式 (如果有订单) */}
      {orderId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>支付方式</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={styles.paymentMethod}
              onPress={() => handlePay('alipay')}
            >
              <Text style={styles.paymentMethodText}>💳 支付宝</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paymentMethod}
              onPress={() => handlePay('wechat')}
            >
              <Text style={styles.paymentMethodText}>💚 微信支付</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 交易记录 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>交易记录</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>暂无交易记录</Text>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionType}>{getTypeText(tx.type)}</Text>
                <Text
                  style={[
                    styles.transactionStatus,
                    { color: getStatusColor(tx.status) },
                  ]}
                >
                  {tx.status === 'COMPLETED' ? '成功' : tx.status === 'PENDING' ? '处理中' : '失败'}
                </Text>
              </View>
              <View style={styles.transactionBody}>
                <Text style={styles.transactionAmount}>
                  {tx.type === 'WITHDRAWAL' ? '-' : '+'}¥{Math.abs(tx.amount).toFixed(2)}
                </Text>
                <Text style={styles.transactionTime}>
                  {new Date(tx.createdAt).toLocaleString()}
                </Text>
              </View>
              {tx.order && (
                <Text style={styles.transactionOrder} numberOfLines={1}>
                  {tx.order.pickupAddress} → {tx.order.deliveryAddress}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    backgroundColor: '#1890ff',
    padding: 30,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
  },
  balanceDetails: {
    flexDirection: 'row',
    marginTop: 15,
  },
  balanceDetail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  withdrawButton: {
    backgroundColor: '#52c41a',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  paymentMethod: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#52c41a',
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
  },
  transactionOrder: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
});
