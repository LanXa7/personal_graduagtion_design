<template>
  <div class="plate-recognition">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">餐品识别</span>
        </div>
      </template>

      <div class="content-container">
        <div v-if="!orderData" class="camera-container">
          <div class="camera-wrapper">
            <div class="camera-overlay" v-if="!isCapturing">
              <div class="instructions">
                <el-icon>
                  <Camera/>
                </el-icon>
                <p>将餐盘放置在摄像头前</p>
                <p>系统将自动识别</p>
              </div>
            </div>
            <div v-else class="detection-info">
              <p>正在分析 <span>{{ countDown }}</span> 秒后拍照</p>
              <el-progress :percentage="(countDown / 3) * 100" :show-text="false" status="warning"/>
            </div>
            <video ref="videoEl" class="webcam" autoplay playsinline></video>
          </div>
          <div class="camera-controls">
            <el-select v-model="deviceId" placeholder="选择摄像头" @change="handleDeviceChange">
              <el-option
                  v-for="device in cameras"
                  :key="device.deviceId"
                  :label="device.label || `摄像头 ${device.deviceId.substring(0, 8)}...`"
                  :value="device.deviceId"
              />
            </el-select>
            <el-button type="primary" @click="startCapturing" :disabled="isCapturing || loading">
              <el-icon>
                <VideoCamera/>
              </el-icon>
              开始捕获
            </el-button>
            <el-button type="success" @click="captureImage" :disabled="!isCapturing || loading">
              <el-icon>
                <Camera/>
              </el-icon>
              立即拍照
            </el-button>
          </div>
        </div>

        <div v-if="orderData" class="order-result">
          <div class="order-header">
            <h2>识别成功</h2>
            <p class="order-code">订单编号: {{ orderData.code }}</p>
          </div>

          <div class="order-image" v-if="orderData.picture">
            <el-image
                :src="`/api/images${orderData.picture}`"
                :preview-src-list="[`/api/images${orderData.picture}`]"
                fit="contain"
                class="order-image-preview"
                :preview-teleported="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon>
                    <Picture/>
                  </el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
          </div>

          <div class="order-items">
            <h3>餐品明细</h3>
            <el-table :data="orderData.orderItems || []" border>
              <el-table-column label="序号" type="index" width="50" align="center"/>
              <el-table-column label="餐品名称" prop="food.name" min-width="120"/>
              <el-table-column label="数量" prop="totalNumber" width="80" align="center"/>
              <el-table-column label="金额" width="100" align="right">
                <template #default="scope">
                  ¥{{ scope.row.totalPrice?.toFixed(2) }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="order-total">
            <span class="total-label">总计:</span>
            <span class="total-price">¥{{ orderData.totalPrice?.toFixed(2) }}</span>
          </div>

          <div class="payment-container">
            <div class="qrcode-container">
              <div v-if="showLoading" class="loading-container">
                <el-icon class="loading-icon">
                  <Loading/>
                </el-icon>
                <p>正在等待支付...</p>
              </div>
              <div v-else-if="showQRCode && orderData?.qrCode" class="qrcode-wrapper">
                <img :src="qrCodeUrl" alt="支付二维码" class="qrcode-image"/>
                <p class="scan-tips">请使用支付宝扫一扫完成支付</p>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="resetRecognition">重新识别</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="errorDialogVisible" title="识别失败" width="400px">
      <p class="error-message">{{ errorMessage }}</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="errorDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleRetry">重试</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount} from 'vue';
import {ElMessage} from 'element-plus';
import {Camera, VideoCamera, Loading, Picture} from '@element-plus/icons-vue';
import Apis from '@/alova';
import * as QRCode from 'qrcode';
import {takeAccessToken} from '@/utils/auth';

// 类型定义
interface OrderPayView {
  code?: string;
  totalPrice?: number;
  orderItems?: Array<{
    totalPrice?: number;
    totalNumber?: number;
  }>;
  qrCode?: string;
  picture?: string;
}

interface OrderStatus {
  status: number; // 0: 未支付, 1: 已支付
}

// 状态变量
const videoEl = ref<HTMLVideoElement | null>(null);
const qrcodeCanvas = ref<HTMLCanvasElement | null>(null);
const cameras = ref<MediaDeviceInfo[]>([]);
const deviceId = ref('');
const loading = ref(false);
const isCapturing = ref(false);
const countDown = ref(3);
const orderData = ref<OrderPayView | null>(null);
const errorDialogVisible = ref(false);
const errorMessage = ref('');
const captureTimeout = ref<number | null>(null);
const countdownInterval = ref<number | null>(null);
const stream = ref<MediaStream | null>(null);
const orderStatusTimer = ref<number | null>(null);
const showQRCode = ref(true);
const showLoading = ref(false);
const qrCodeUrl = ref('');
const MAX_RETRY_COUNT = 3;
const retryCount = ref(0);
const ws = ref<WebSocket | null>(null);
const token = ref('');
const heartbeatInterval = ref<number | null>(null);

// 获取摄像头列表
const getCameras = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('浏览器不支持访问媒体设备');
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    cameras.value = devices.filter(device => device.kind === 'videoinput');

    if (cameras.value.length > 0) {
      deviceId.value = cameras.value[0].deviceId;
    } else {
      ElMessage.warning('未检测到摄像头设备');
    }
  } catch (error) {
    ElMessage.error(`获取摄像头失败: ${error}`);
    console.error('获取摄像头失败:', error);
  }
};

// 处理摄像头变更
const handleDeviceChange = async () => {
  if (isCapturing.value) {
    stopCapturing();
  }
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
  }
  await initCamera();
};

// 初始化摄像头
const initCamera = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('浏览器不支持访问媒体设备');
    }

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        deviceId: deviceId.value ? {exact: deviceId.value} : undefined,
        width: {ideal: 1280},
        height: {ideal: 720},
        facingMode: 'environment'
      }
    };

    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop());
      stream.value = null;
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('摄像头初始化超时')), 10000);
    });

    const streamPromise = navigator.mediaDevices.getUserMedia(constraints);
    stream.value = await Promise.race([streamPromise, timeoutPromise]) as MediaStream;

    if (videoEl.value) {
      videoEl.value.srcObject = stream.value;
      await new Promise((resolve) => {
        if (videoEl.value) {
          videoEl.value.onloadedmetadata = resolve;
        }
      });
    }

    retryCount.value = 0;
  } catch (error) {
    console.error('摄像头初始化失败:', error);

    if (retryCount.value < MAX_RETRY_COUNT) {
      retryCount.value++;
      ElMessage.warning(`摄像头初始化失败，正在重试(${retryCount.value}/${MAX_RETRY_COUNT})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return initCamera();
    }

    errorMessage.value = '摄像头初始化失败，请检查设备连接或刷新页面重试';
    errorDialogVisible.value = true;
    throw error;
  }
};

// 开始捕获
const startCapturing = () => {
  if (!videoEl.value || !stream.value) {
    ElMessage.error('摄像头未初始化');
    return;
  }

  isCapturing.value = true;
  countDown.value = 3;

  // 启动倒计时
  countdownInterval.value = window.setInterval(() => {
    countDown.value--;
    if (countDown.value <= 0) {
      clearInterval(countdownInterval.value!);
      captureImage();
    }
  }, 1000);

  // 3秒后自动拍照
  captureTimeout.value = window.setTimeout(() => {
    captureImage();
  }, 3000);
};

// 停止捕获
const stopCapturing = () => {
  isCapturing.value = false;
  if (captureTimeout.value) {
    clearTimeout(captureTimeout.value);
    captureTimeout.value = null;
  }
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
    countdownInterval.value = null;
  }
};

// 查询订单状态
const checkOrderStatus = async () => {
  if (!orderData.value?.code) return;

  try {
    const result = await Apis.OrderController.getOrderStatus({
      pathParams: {code: orderData.value.code}
    });

    switch (result) {
      case 'THE_CODE_WAS_NOT_SCANNED':
        showQRCode.value = true;
        showLoading.value = false;
        break;

      case 'WAIT_BUYER_PAY':
        showQRCode.value = false;
        showLoading.value = true;
        break;

      case 'TRADE_SUCCESS':
        await handlePaymentSuccess();
        break;

      case 'TRADE_CLOSED':
        if (orderStatusTimer.value) {
          clearInterval(orderStatusTimer.value);
          orderStatusTimer.value = null;
        }
        showQRCode.value = false;
        showLoading.value = false;
        ElMessage.warning('交易已关闭');
        await resetRecognition();
        break;

      case 'TRADE_FINISHED':
        if (orderStatusTimer.value) {
          clearInterval(orderStatusTimer.value);
          orderStatusTimer.value = null;
        }
        showQRCode.value = false;
        showLoading.value = false;
        ElMessage.info('交易已结束');
        await resetRecognition();
        break;

      default:
        showQRCode.value = true;
        showLoading.value = false;
    }
  } catch (error) {
    ElMessage.error('获取支付状态失败');
  }
};

// 添加支付成功处理函数
const handlePaymentSuccess = async () => {
  // 清除所有定时器
  if (orderStatusTimer.value) {
    clearInterval(orderStatusTimer.value);
    orderStatusTimer.value = null;
  }
  if (heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value);
    heartbeatInterval.value = null;
  }
  
  // 关闭 WebSocket 连接
  if (ws.value) {
    ws.value.close();
    ws.value = null;
  }

  showQRCode.value = false;
  showLoading.value = false;
  ElMessage.success('支付成功');
  
  // 重置识别状态
  orderData.value = null;
  
  // 重新初始化摄像头
  try {
    await initCamera();
  } catch (error) {
    ElMessage.error('摄像头初始化失败，请刷新页面重试');
  }
};

// 修改 connectWebSocket 函数，添加 Authorization 头信息
const connectWebSocket = (orderCode: string) => {
  if (ws.value) {
    console.log('关闭已存在的WebSocket连接');
    ws.value.close();
  }

  const token = takeAccessToken()?.token;
  if (!token) {
    ElMessage.error('未获取到认证信息');
    return;
  }
//  const host = "127.0.0.1:8085"
  const host = "www.wdxlanxa7.xyz/websocket"
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${host}/ws/payment/status/${orderCode}`;
  console.log('正在建立WebSocket连接:', wsUrl);

  const finalUrl = `${wsUrl}`;
  console.log('最终WebSocket连接URL:', finalUrl);

  ws.value = new WebSocket(finalUrl);

  // 心跳定时器
  heartbeatInterval.value = window.setInterval(() => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send('PING');
    }
  }, 30000);

  ws.value.onopen = () => {
    console.log('WebSocket连接已建立');
  };

  ws.value.onmessage = (event) => {
    console.log('收到WebSocket消息:', event.data);
    try {
      const message = event.data;
      if (message === 'PONG') {
        return; // 忽略心跳响应
      }

      if (message === 'PAYMENT_SUCCESS') {
        handlePaymentSuccess();
      } else if (message === 'PAYMENT_FAILED') {
        // 支付失败
        if (orderStatusTimer.value) {
          clearInterval(orderStatusTimer.value);
          orderStatusTimer.value = null;
        }
        if (heartbeatInterval.value) {
          clearInterval(heartbeatInterval.value);
          heartbeatInterval.value = null;
        }
        showQRCode.value = false;
        showLoading.value = false;
        ElMessage.error('支付失败，请重试');
        resetRecognition();
      }
    } catch (error) {
      console.error('WebSocket消息解析失败:', error);
    }
  };

  ws.value.onerror = (error) => {
    console.error('WebSocket连接错误:', error);
    ElMessage.error('支付通知连接失败');
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value);
      heartbeatInterval.value = null;
    }
  };

  ws.value.onclose = () => {
    console.log('WebSocket连接已关闭');
    ws.value = null;
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value);
      heartbeatInterval.value = null;
    }
  };
};

// 修改 captureImage 函数，在获取订单数据后立即建立 WebSocket 连接
const captureImage = async () => {
  stopCapturing();

  if (!videoEl.value || !stream.value) {
    ElMessage.error('摄像头未初始化');
    return;
  }

  try {
    loading.value = true;

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.value.videoWidth;
    canvas.height = videoEl.value.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoEl.value, 0, 0, canvas.width, canvas.height);

    const blob = await compressImage(canvas, 0.95, 500);

    const result = await Apis.OrderController.uploadOrder({
      data: {file: blob}
    });

    orderData.value = result;

    // 在获取到识别结果后立即建立 WebSocket 连接
    if (result.code) {
      console.log('开始建立WebSocket连接，订单号:', result.code);
      connectWebSocket(result.code);
    }

    if (result.qrCode) {
      qrCodeUrl.value = await QRCode.toDataURL(result.qrCode, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    }

    if (orderStatusTimer.value) {
      clearInterval(orderStatusTimer.value);
    }

    await checkOrderStatus();
    orderStatusTimer.value = window.setInterval(checkOrderStatus, 5000);

    ElMessage.success('识别成功');
  } catch (error) {
    errorMessage.value = typeof error === 'string' ? error : '识别失败，请重试';
    errorDialogVisible.value = true;
  } finally {
    loading.value = false;
  }
};

// 压缩图片确保不超过最大体积（MB）
const compressImage = async (canvas: HTMLCanvasElement, initialQuality = 0.95, maxSizeMB = 500): Promise<Blob> => {
  let quality = initialQuality;
  let blob: Blob;

  blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
        result => {
          if (result) resolve(result);
          else reject(new Error('创建图片失败'));
        },
        'image/jpeg',
        quality
    );
  });

  while (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
    quality -= 0.1;
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
          result => {
            if (result) resolve(result);
            else reject(new Error('创建图片失败'));
          },
          'image/jpeg',
          quality
      );
    });
  }

  if (blob.size > maxSizeMB * 1024 * 1024) {
    const scaleFactor = Math.sqrt(maxSizeMB * 1024 * 1024 / blob.size);
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = Math.floor(canvas.width * scaleFactor);
    scaledCanvas.height = Math.floor(canvas.height * scaleFactor);

    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx?.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

    blob = await new Promise<Blob>((resolve, reject) => {
      scaledCanvas.toBlob(
          result => {
            if (result) resolve(result);
            else reject(new Error('创建图片失败'));
          },
          'image/jpeg',
          0.9
      );
    });
  }

  return blob;
};

// 修改 resetRecognition 函数，确保关闭 WebSocket 连接
const resetRecognition = async () => {
  // 先关闭所有定时器
  if (orderStatusTimer.value) {
    clearInterval(orderStatusTimer.value);
    orderStatusTimer.value = null;
  }

  // 关闭 WebSocket 连接
  if (ws.value) {
    ws.value.close();
    ws.value = null;
  }

  // 重置状态
  orderData.value = null;
  errorDialogVisible.value = false;
  retryCount.value = 0;

  try {
    await initCamera();
  } catch (error) {
    ElMessage.error('摄像头初始化失败，请刷新页面重试');
  }
};

// 处理重试
const handleRetry = async () => {
  errorDialogVisible.value = false;
  retryCount.value = 0;
  try {
    await initCamera();
    startCapturing();
  } catch (error) {
    ElMessage.error('摄像头初始化失败，请刷新页面重试');
  }
};

// 生命周期钩子
onMounted(async () => {
  await getCameras();
  await initCamera();
});

onBeforeUnmount(() => {
  stopCapturing();
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
  }
  if (orderStatusTimer.value) {
    clearInterval(orderStatusTimer.value);
    orderStatusTimer.value = null;
  }
  if (ws.value) {
    ws.value.close();
    ws.value = null;
  }
});
</script>

<style scoped>
.plate-recognition {
  padding: 20px;
}

.main-card {
  width: 100%;
  min-height: calc(100vh - 120px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 60vh;
  align-items: center;
}

.camera-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.camera-wrapper {
  position: relative;
  width: 640px;
  height: 480px;
  overflow: hidden;
  background-color: #000;
  border-radius: 8px;
  margin: 0 auto;
}

.webcam {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-controls {
  display: flex;
  gap: 16px;
  width: 640px;
  justify-content: center;
  margin-top: 16px;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.instructions {
  text-align: center;
  color: white;
}

.instructions .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.detection-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px;
  text-align: center;
  z-index: 2;
}

.detection-info span {
  font-size: 20px;
  font-weight: bold;
  color: #ff9900;
}

.order-result {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.order-header {
  text-align: center;
  margin-bottom: 16px;
}

.order-code {
  color: #606266;
  margin-top: 8px;
}

.order-items {
  margin-bottom: 16px;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 18px;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
}

.total-label {
  margin-right: 12px;
}

.total-price {
  font-weight: bold;
  color: #f56c6c;
  font-size: 24px;
}

.payment-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

iframe {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.scan-tips {
  color: #606266;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.error-message {
  color: #f56c6c;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .camera-wrapper {
    width: 100%;
    height: auto;
    aspect-ratio: 4/3;
  }

  .camera-controls {
    width: 100%;
    flex-direction: column;
  }
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.order-image {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.order-image-preview {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  font-size: 14px;
}

.image-error .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
</style> 