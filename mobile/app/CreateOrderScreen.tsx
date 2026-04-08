import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { orderApi } from '../../services/order';

interface Props {
  navigation: any;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function CreateOrderScreen({ navigation }: Props) {
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<LocationData | null>(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要位置权限才能使用地图选点功能');
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      const formattedAddress = address.length > 0 
        ? `${address[0].city || ''}${address[0].district || ''}${address[0].street || ''}`
        : '当前位置';
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: formattedAddress,
      };
    } catch (error) {
      console.error('获取位置失败:', error);
      return null;
    }
  };

  const handleSetPickupLocation = async () => {
    Alert.alert('选择取件地址', '使用当前位置还是手动输入？', [
      {
        text: '当前位置',
        onPress: async () => {
          const loc = await getCurrentLocation();
          if (loc) {
            setPickupLocation(loc);
          }
        },
      },
      {
        text: '手动输入',
        onPress: () => {
          // 这里可以打开地图选页
          Alert.alert('提示', '地图选点功能开发中，暂用手动输入');
        },
      },
    ]);
  };

  const handleSetDeliveryLocation = async () => {
    Alert.alert('选择收件地址', '使用当前位置还是手动输入？', [
      {
        text: '当前位置',
        onPress: async () => {
          const loc = await getCurrentLocation();
          if (loc) {
            setDeliveryLocation(loc);
          }
        },
      },
      {
        text: '手动输入',
        onPress: () => {
          Alert.alert('提示', '地图选点功能开发中，暂用手动输入');
        },
      },
    ]);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('提示', '需要相册权限才能上传图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async () => {
    if (!pickupLocation || !deliveryLocation || !description || !price) {
      Alert.alert('提示', '请填写必填信息');
      return;
    }

    setLoading(true);
    try {
      // 实际应该上传图片到 OSS，这里用 base64 模拟
      const imageUrls = images.length > 0 ? images : [];

      await orderApi.createOrder({
        pickupAddress: pickupLocation.address,
        deliveryAddress: deliveryLocation.address,
        pickupLat: pickupLocation.latitude,
        pickupLng: pickupLocation.longitude,
        deliveryLat: deliveryLocation.latitude,
        deliveryLng: deliveryLocation.longitude,
        description,
        price: parseFloat(price),
        weight: weight ? parseFloat(weight) : undefined,
        note: note || undefined,
        images: imageUrls,
      });
      Alert.alert('成功', '订单创建成功', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('失败', error.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 取件地址 */}
      <Text style={styles.label}>取件地址 *</Text>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={handleSetPickupLocation}
      >
        <Text style={styles.locationText}>
          {pickupLocation?.address || '点击选择取件地址'}
        </Text>
        <Text style={styles.locationIcon}>📍</Text>
      </TouchableOpacity>

      {/* 收件地址 */}
      <Text style={styles.label}>收件地址 *</Text>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={handleSetDeliveryLocation}
      >
        <Text style={styles.locationText}>
          {deliveryLocation?.address || '点击选择收件地址'}
        </Text>
        <Text style={styles.locationIcon}>📍</Text>
      </TouchableOpacity>

      {/* 物品描述 */}
      <Text style={styles.label}>物品描述 *</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="请描述物品信息"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      {/* 图片上传 */}
      <Text style={styles.label}>物品图片 (可选)</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>📷 选择图片</Text>
      </TouchableOpacity>
      
      {images.length > 0 && (
        <View style={styles.imageList}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 配送费用 */}
      <Text style={styles.label}>配送费用 (元) *</Text>
      <TextInput
        style={styles.input}
        placeholder="请输入配送费用"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      {/* 物品重量 */}
      <Text style={styles.label}>物品重量 (kg，可选)</Text>
      <TextInput
        style={styles.input}
        placeholder="请输入重量"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      {/* 备注 */}
      <Text style={styles.label}>备注 (可选)</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="其他说明"
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
      />

      {/* 提交按钮 */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>发布订单</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  locationText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  locationIcon: {
    fontSize: 20,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#666',
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4d4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1890ff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
