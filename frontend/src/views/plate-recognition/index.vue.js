import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { Camera, VideoCamera, Loading, Picture } from '@element-plus/icons-vue';
import Apis from '@/alova';
import * as QRCode from 'qrcode';
import { takeAccessToken } from '@/utils/auth';
// 状态变量
const videoEl = ref(null);
const qrcodeCanvas = ref(null);
const cameras = ref([]);
const deviceId = ref('');
const loading = ref(false);
const isCapturing = ref(false);
const countDown = ref(3);
const orderData = ref(null);
const errorDialogVisible = ref(false);
const errorMessage = ref('');
const captureTimeout = ref(null);
const countdownInterval = ref(null);
const stream = ref(null);
const orderStatusTimer = ref(null);
const showQRCode = ref(true);
const showLoading = ref(false);
const qrCodeUrl = ref('');
const MAX_RETRY_COUNT = 3;
const retryCount = ref(0);
const ws = ref(null);
const token = ref('');
const heartbeatInterval = ref(null);
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
        }
        else {
            ElMessage.warning('未检测到摄像头设备');
        }
    }
    catch (error) {
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
        const constraints = {
            audio: false,
            video: {
                deviceId: deviceId.value ? { exact: deviceId.value } : undefined,
                width: { ideal: 1280 },
                height: { ideal: 720 },
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
        stream.value = await Promise.race([streamPromise, timeoutPromise]);
        if (videoEl.value) {
            videoEl.value.srcObject = stream.value;
            await new Promise((resolve) => {
                if (videoEl.value) {
                    videoEl.value.onloadedmetadata = resolve;
                }
            });
        }
        retryCount.value = 0;
    }
    catch (error) {
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
            clearInterval(countdownInterval.value);
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
    if (!orderData.value?.code)
        return;
    try {
        const result = await Apis.OrderController.getOrderStatus({
            pathParams: { code: orderData.value.code }
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
    }
    catch (error) {
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
    }
    catch (error) {
        ElMessage.error('摄像头初始化失败，请刷新页面重试');
    }
};
// 修改 connectWebSocket 函数，添加 Authorization 头信息
const connectWebSocket = (orderCode) => {
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
    const host = "www.wdxlanxa7.xyz/websocket";
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
            }
            else if (message === 'PAYMENT_FAILED') {
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
        }
        catch (error) {
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
            data: { file: blob }
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
    }
    catch (error) {
        errorMessage.value = typeof error === 'string' ? error : '识别失败，请重试';
        errorDialogVisible.value = true;
    }
    finally {
        loading.value = false;
    }
};
// 压缩图片确保不超过最大体积（MB）
const compressImage = async (canvas, initialQuality = 0.95, maxSizeMB = 500) => {
    let quality = initialQuality;
    let blob;
    blob = await new Promise((resolve, reject) => {
        canvas.toBlob(result => {
            if (result)
                resolve(result);
            else
                reject(new Error('创建图片失败'));
        }, 'image/jpeg', quality);
    });
    while (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
        quality -= 0.1;
        blob = await new Promise((resolve, reject) => {
            canvas.toBlob(result => {
                if (result)
                    resolve(result);
                else
                    reject(new Error('创建图片失败'));
            }, 'image/jpeg', quality);
        });
    }
    if (blob.size > maxSizeMB * 1024 * 1024) {
        const scaleFactor = Math.sqrt(maxSizeMB * 1024 * 1024 / blob.size);
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = Math.floor(canvas.width * scaleFactor);
        scaledCanvas.height = Math.floor(canvas.height * scaleFactor);
        const scaledCtx = scaledCanvas.getContext('2d');
        scaledCtx?.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
        blob = await new Promise((resolve, reject) => {
            scaledCanvas.toBlob(result => {
                if (result)
                    resolve(result);
                else
                    reject(new Error('创建图片失败'));
            }, 'image/jpeg', 0.9);
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
    }
    catch (error) {
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
    }
    catch (error) {
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
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['instructions', 'detection-info', 'camera-wrapper', 'camera-controls', 'image-error', 'el-icon',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("plate-recognition") },
    });
    const __VLS_0 = {}.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ class: ("main-card") },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: ("main-card") },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { header: __VLS_thisSlot } = __VLS_5.slots;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("card-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("font-bold text-lg") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("content-container") },
    });
    if (!__VLS_ctx.orderData) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("camera-container") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("camera-wrapper") },
        });
        if (!__VLS_ctx.isCapturing) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("camera-overlay") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("instructions") },
            });
            const __VLS_6 = {}.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
            // @ts-ignore
            const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
            const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
            const __VLS_12 = {}.Camera;
            /** @type { [typeof __VLS_components.Camera, ] } */ ;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
            const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
            __VLS_11.slots.default;
            var __VLS_11;
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("detection-info") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.countDown);
            const __VLS_18 = {}.ElProgress;
            /** @type { [typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ] } */ ;
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
                percentage: (((__VLS_ctx.countDown / 3) * 100)),
                showText: ((false)),
                status: ("warning"),
            }));
            const __VLS_20 = __VLS_19({
                percentage: (((__VLS_ctx.countDown / 3) * 100)),
                showText: ((false)),
                status: ("warning"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.video, __VLS_intrinsicElements.video)({
            ref: ("videoEl"),
            ...{ class: ("webcam") },
            autoplay: (true),
            playsinline: (true),
        });
        // @ts-ignore navigation for `const videoEl = ref()`
        /** @type { typeof __VLS_ctx.videoEl } */ ;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("camera-controls") },
        });
        const __VLS_24 = {}.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.deviceId)),
            placeholder: ("选择摄像头"),
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.deviceId)),
            placeholder: ("选择摄像头"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        let __VLS_30;
        const __VLS_31 = {
            onChange: (__VLS_ctx.handleDeviceChange)
        };
        let __VLS_27;
        let __VLS_28;
        for (const [device] of __VLS_getVForSourceType((__VLS_ctx.cameras))) {
            const __VLS_32 = {}.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
            // @ts-ignore
            const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                key: ((device.deviceId)),
                label: ((device.label || `摄像头 ${device.deviceId.substring(0, 8)}...`)),
                value: ((device.deviceId)),
            }));
            const __VLS_34 = __VLS_33({
                key: ((device.deviceId)),
                label: ((device.label || `摄像头 ${device.deviceId.substring(0, 8)}...`)),
                value: ((device.deviceId)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        }
        __VLS_29.slots.default;
        var __VLS_29;
        const __VLS_38 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
            ...{ 'onClick': {} },
            type: ("primary"),
            disabled: ((__VLS_ctx.isCapturing || __VLS_ctx.loading)),
        }));
        const __VLS_40 = __VLS_39({
            ...{ 'onClick': {} },
            type: ("primary"),
            disabled: ((__VLS_ctx.isCapturing || __VLS_ctx.loading)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        let __VLS_44;
        const __VLS_45 = {
            onClick: (__VLS_ctx.startCapturing)
        };
        let __VLS_41;
        let __VLS_42;
        const __VLS_46 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({}));
        const __VLS_48 = __VLS_47({}, ...__VLS_functionalComponentArgsRest(__VLS_47));
        const __VLS_52 = {}.VideoCamera;
        /** @type { [typeof __VLS_components.VideoCamera, ] } */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
        const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_51.slots.default;
        var __VLS_51;
        __VLS_43.slots.default;
        var __VLS_43;
        const __VLS_58 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
            ...{ 'onClick': {} },
            type: ("success"),
            disabled: ((!__VLS_ctx.isCapturing || __VLS_ctx.loading)),
        }));
        const __VLS_60 = __VLS_59({
            ...{ 'onClick': {} },
            type: ("success"),
            disabled: ((!__VLS_ctx.isCapturing || __VLS_ctx.loading)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        let __VLS_64;
        const __VLS_65 = {
            onClick: (__VLS_ctx.captureImage)
        };
        let __VLS_61;
        let __VLS_62;
        const __VLS_66 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({}));
        const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
        const __VLS_72 = {}.Camera;
        /** @type { [typeof __VLS_components.Camera, ] } */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
        const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_71.slots.default;
        var __VLS_71;
        __VLS_63.slots.default;
        var __VLS_63;
    }
    if (__VLS_ctx.orderData) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("order-result") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("order-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: ("order-code") },
        });
        (__VLS_ctx.orderData.code);
        if (__VLS_ctx.orderData.picture) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("order-image") },
            });
            const __VLS_78 = {}.ElImage;
            /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */ ;
            // @ts-ignore
            const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
                src: ((`/api/images${__VLS_ctx.orderData.picture}`)),
                previewSrcList: (([`/api/images${__VLS_ctx.orderData.picture}`])),
                fit: ("contain"),
                ...{ class: ("order-image-preview") },
                previewTeleported: ((true)),
            }));
            const __VLS_80 = __VLS_79({
                src: ((`/api/images${__VLS_ctx.orderData.picture}`)),
                previewSrcList: (([`/api/images${__VLS_ctx.orderData.picture}`])),
                fit: ("contain"),
                ...{ class: ("order-image-preview") },
                previewTeleported: ((true)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_79));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { error: __VLS_thisSlot } = __VLS_83.slots;
                __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: ("image-error") },
                });
                const __VLS_84 = {}.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
                // @ts-ignore
                const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
                const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
                const __VLS_90 = {}.Picture;
                /** @type { [typeof __VLS_components.Picture, ] } */ ;
                // @ts-ignore
                const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
                const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
                __VLS_89.slots.default;
                var __VLS_89;
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            }
            var __VLS_83;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("order-items") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        const __VLS_96 = {}.ElTable;
        /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            data: ((__VLS_ctx.orderData.orderItems || [])),
            border: (true),
        }));
        const __VLS_98 = __VLS_97({
            data: ((__VLS_ctx.orderData.orderItems || [])),
            border: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        const __VLS_102 = {}.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
            label: ("序号"),
            type: ("index"),
            width: ("50"),
            align: ("center"),
        }));
        const __VLS_104 = __VLS_103({
            label: ("序号"),
            type: ("index"),
            width: ("50"),
            align: ("center"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        const __VLS_108 = {}.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            label: ("餐品名称"),
            prop: ("food.name"),
            minWidth: ("120"),
        }));
        const __VLS_110 = __VLS_109({
            label: ("餐品名称"),
            prop: ("food.name"),
            minWidth: ("120"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        const __VLS_114 = {}.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
            label: ("数量"),
            prop: ("totalNumber"),
            width: ("80"),
            align: ("center"),
        }));
        const __VLS_116 = __VLS_115({
            label: ("数量"),
            prop: ("totalNumber"),
            width: ("80"),
            align: ("center"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        const __VLS_120 = {}.ElTableColumn;
        /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            label: ("金额"),
            width: ("100"),
            align: ("right"),
        }));
        const __VLS_122 = __VLS_121({
            label: ("金额"),
            width: ("100"),
            align: ("right"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { default: __VLS_thisSlot } = __VLS_125.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            (scope.row.totalPrice?.toFixed(2));
        }
        var __VLS_125;
        __VLS_101.slots.default;
        var __VLS_101;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("order-total") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("total-label") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("total-price") },
        });
        (__VLS_ctx.orderData.totalPrice?.toFixed(2));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("payment-container") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("qrcode-container") },
        });
        if (__VLS_ctx.showLoading) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("loading-container") },
            });
            const __VLS_126 = {}.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
            // @ts-ignore
            const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
                ...{ class: ("loading-icon") },
            }));
            const __VLS_128 = __VLS_127({
                ...{ class: ("loading-icon") },
            }, ...__VLS_functionalComponentArgsRest(__VLS_127));
            const __VLS_132 = {}.Loading;
            /** @type { [typeof __VLS_components.Loading, ] } */ ;
            // @ts-ignore
            const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
            const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
            __VLS_131.slots.default;
            var __VLS_131;
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        }
        else if (__VLS_ctx.showQRCode && __VLS_ctx.orderData?.qrCode) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("qrcode-wrapper") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
                src: ((__VLS_ctx.qrCodeUrl)),
                alt: ("支付二维码"),
                ...{ class: ("qrcode-image") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: ("scan-tips") },
            });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("action-buttons") },
        });
        const __VLS_138 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
            ...{ 'onClick': {} },
            type: ("primary"),
        }));
        const __VLS_140 = __VLS_139({
            ...{ 'onClick': {} },
            type: ("primary"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        let __VLS_144;
        const __VLS_145 = {
            onClick: (__VLS_ctx.resetRecognition)
        };
        let __VLS_141;
        let __VLS_142;
        __VLS_143.slots.default;
        var __VLS_143;
    }
    var __VLS_5;
    const __VLS_146 = {}.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */ ;
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
        modelValue: ((__VLS_ctx.errorDialogVisible)),
        title: ("识别失败"),
        width: ("400px"),
    }));
    const __VLS_148 = __VLS_147({
        modelValue: ((__VLS_ctx.errorDialogVisible)),
        title: ("识别失败"),
        width: ("400px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("error-message") },
    });
    (__VLS_ctx.errorMessage);
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_151.slots;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("dialog-footer") },
        });
        const __VLS_152 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
            ...{ 'onClick': {} },
        }));
        const __VLS_154 = __VLS_153({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_153));
        let __VLS_158;
        const __VLS_159 = {
            onClick: (...[$event]) => {
                __VLS_ctx.errorDialogVisible = false;
            }
        };
        let __VLS_155;
        let __VLS_156;
        __VLS_157.slots.default;
        var __VLS_157;
        const __VLS_160 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
            ...{ 'onClick': {} },
            type: ("primary"),
        }));
        const __VLS_162 = __VLS_161({
            ...{ 'onClick': {} },
            type: ("primary"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_161));
        let __VLS_166;
        const __VLS_167 = {
            onClick: (__VLS_ctx.handleRetry)
        };
        let __VLS_163;
        let __VLS_164;
        __VLS_165.slots.default;
        var __VLS_165;
    }
    var __VLS_151;
    ['plate-recognition', 'main-card', 'card-header', 'font-bold', 'text-lg', 'content-container', 'camera-container', 'camera-wrapper', 'camera-overlay', 'instructions', 'detection-info', 'webcam', 'camera-controls', 'order-result', 'order-header', 'order-code', 'order-image', 'order-image-preview', 'image-error', 'order-items', 'order-total', 'total-label', 'total-price', 'payment-container', 'qrcode-container', 'loading-container', 'loading-icon', 'qrcode-wrapper', 'qrcode-image', 'scan-tips', 'action-buttons', 'error-message', 'dialog-footer',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'videoEl': __VLS_nativeElements['video'],
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Camera: Camera,
            VideoCamera: VideoCamera,
            Loading: Loading,
            Picture: Picture,
            videoEl: videoEl,
            cameras: cameras,
            deviceId: deviceId,
            loading: loading,
            isCapturing: isCapturing,
            countDown: countDown,
            orderData: orderData,
            errorDialogVisible: errorDialogVisible,
            errorMessage: errorMessage,
            showQRCode: showQRCode,
            showLoading: showLoading,
            qrCodeUrl: qrCodeUrl,
            handleDeviceChange: handleDeviceChange,
            startCapturing: startCapturing,
            captureImage: captureImage,
            resetRecognition: resetRecognition,
            handleRetry: handleRetry,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeRefs: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
