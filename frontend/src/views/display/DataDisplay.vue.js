import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useStore } from '@/store';
import { School, Shop, Food, PieChart, Timer } from '@element-plus/icons-vue';
import Apis from '@/alova';
// 获取用户信息
const store = useStore();
// 确定用户的单一角色，优先级：超级管理员 > 食堂管理员 > 摊位管理员
const userRole = computed(() => {
    const roles = store.user.roles || [];
    console.log('用户实际角色列表:', roles);
    if (roles.includes('super_admin'))
        return 'super_admin';
    if (roles.includes('canteen_admin'))
        return 'canteen_admin';
    if (roles.includes('stall_admin'))
        return 'stall_admin';
    return 'unknown';
});
// 简化的角色判断
const isAdmin = computed(() => userRole.value === 'super_admin');
const isCanteenAdmin = computed(() => userRole.value === 'canteen_admin');
const isStallAdmin = computed(() => userRole.value === 'stall_admin');
// 数据统计
const canteenNumber = ref(0);
const stallNumber = ref(0);
const foodNumber = ref(0);
const totalYesterdaySalesVolume = ref(0);
const foodCategories = ref(0);
const canteenYesterdaySales = ref([]);
const canteenRanking = ref([]);
const stallYesterdaySales = ref([]);
const stallRanking = ref([]);
const foodYesterdaySales = ref([]);
const foodRanking = ref([]);
const historySalesData = ref([]);
const canteenStallNumbers = ref([]);
const stallFoodNumbers = ref([]);
// 日期范围选择
const dateRange = ref([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    new Date().toISOString().slice(0, 10)
]);
// 图表引用
const canteenYesterdaySalesRef = ref(null);
const canteenRankingRef = ref(null);
const stallYesterdaySalesRef = ref(null);
const stallRankingRef = ref(null);
const foodYesterdaySalesRef = ref(null);
const foodRankingRef = ref(null);
const historyChartRef = ref(null);
const canteenStallNumberRef = ref(null);
const stallFoodNumberRef = ref(null);
// 图表实例
let canteenYesterdaySalesChart = null;
let canteenRankingChart = null;
let stallYesterdaySalesChart = null;
let stallRankingChart = null;
let foodYesterdaySalesChart = null;
let foodRankingChart = null;
let historyChart = null;
let canteenStallNumberChart = null;
let stallFoodNumberChart = null;
// 加载数据
const loadData = async () => {
    try {
        // 超级管理员数据
        if (isAdmin.value) {
            // 获取食堂总数
            const canteenNumberRes = await Apis.CanteenController.getCanteenNumber();
            canteenNumber.value = Number(canteenNumberRes) || generateRandomNumber(5, 15);
            // 获取摊位总数
            const stallNumberRes = await Apis.StallController.getStallNumber();
            stallNumber.value = Number(stallNumberRes) || generateRandomNumber(20, 50);
            // 获取食品总数
            const foodNumberRes = await Apis.FoodController.getFoodNumber();
            foodNumber.value = Number(foodNumberRes) || generateRandomNumber(50, 150);
            // 先获取每个食堂摊位数量
            const canteenStallNumbersRes = await Apis.CanteenController.listEveryStallNumber();
            if (Array.isArray(canteenStallNumbersRes) && canteenStallNumbersRes.length > 0) {
                canteenStallNumbers.value = canteenStallNumbersRes;
            }
            else {
                canteenStallNumbers.value = generateCanteenStallNumbersData();
            }
            // 获取食堂昨日销售量 - 使用已有的食堂摊位数据保持一致性
            const canteenYesterdaySalesRes = await Apis.SalesController.listEveryCanteenYesterdaySales();
            if (Array.isArray(canteenYesterdaySalesRes) && canteenYesterdaySalesRes.length > 0 &&
                canteenYesterdaySalesRes.some(item => (item.salesVolume || 0) > 0)) {
                canteenYesterdaySales.value = canteenYesterdaySalesRes;
            }
            else {
                // 使用所有食堂数据，确保与摊位数量分布图使用相同的食堂
                canteenYesterdaySales.value = generateCanteenSalesData(canteenStallNumbers.value.length);
            }
            // 计算总销量
            totalYesterdaySalesVolume.value = canteenYesterdaySales.value.reduce((sum, item) => sum + (item.salesVolume || 0), 0);
            // 获取食堂销售量排名 - 同样确保与已有数据一致
            const canteenRankingRes = await Apis.SalesController.listCanteenRanking();
            if (Array.isArray(canteenRankingRes) && canteenRankingRes.length > 0 &&
                canteenRankingRes.some(item => (item.salesVolume || 0) > 0)) {
                canteenRanking.value = canteenRankingRes;
            }
            else {
                // 生成排名数据时也使用一致的数据
                canteenRanking.value = generateCanteenSalesData(10, true);
            }
        }
        // 食堂管理员数据
        else if (isCanteenAdmin.value) {
            // 获取摊位总数
            const stallNumberRes = await Apis.StallController.getStallNumber();
            stallNumber.value = Number(stallNumberRes) || generateRandomNumber(5, 15);
            // 获取菜品总数
            const foodNumberRes = await Apis.FoodController.getFoodNumber();
            foodNumber.value = Number(foodNumberRes) || generateRandomNumber(30, 100);
            // 先获取每个摊位的食品数量
            const stallFoodNumbersRes = await Apis.CanteenController.listEveryStallFoodCount();
            if (Array.isArray(stallFoodNumbersRes) && stallFoodNumbersRes.length > 0) {
                stallFoodNumbers.value = stallFoodNumbersRes;
            }
            else {
                stallFoodNumbers.value = generateStallFoodNumbersData();
            }
            // 获取摊位昨日销售量 - 使用已有的摊位食品数据保持一致性
            const stallYesterdaySalesRes = await Apis.SalesController.listEveryStallYesterdaySales();
            if (Array.isArray(stallYesterdaySalesRes) && stallYesterdaySalesRes.length > 0 &&
                stallYesterdaySalesRes.some(item => (item.salesVolume || 0) > 0)) {
                stallYesterdaySales.value = stallYesterdaySalesRes;
            }
            else {
                // 使用所有摊位数据，确保与食品数量分布图使用相同的摊位
                stallYesterdaySales.value = generateStallSalesData(stallFoodNumbers.value.length);
            }
            // 计算总销量
            totalYesterdaySalesVolume.value = stallYesterdaySales.value.reduce((sum, item) => sum + (item.salesVolume || 0), 0);
            // 获取摊位销售量排名 - 同样确保与已有数据一致
            const stallRankingRes = await Apis.SalesController.listCanteenStallRanking();
            if (Array.isArray(stallRankingRes) && stallRankingRes.length > 0 &&
                stallRankingRes.some(item => (item.salesVolume || 0) > 0)) {
                stallRanking.value = stallRankingRes;
            }
            else {
                // 生成排名数据时也使用一致的数据
                stallRanking.value = generateStallSalesData(10, true);
            }
        }
        // 摊位管理员数据
        else if (isStallAdmin.value) {
            // 获取食品总数
            const foodNumberRes = await Apis.FoodController.getFoodNumber();
            foodNumber.value = Number(foodNumberRes) || generateRandomNumber(15, 40);
            // 假设食品种类为食品总数的1/3（这里仅作示例，实际应从后端获取）
            foodCategories.value = Math.round(foodNumber.value / 3);
            // 获取食品昨日销售量
            const foodYesterdaySalesRes = await Apis.SalesController.listEveryFoodYesterdaySales();
            if (Array.isArray(foodYesterdaySalesRes) && foodYesterdaySalesRes.length > 0 &&
                foodYesterdaySalesRes.some(item => (item.salesVolume || 0) > 0)) {
                foodYesterdaySales.value = foodYesterdaySalesRes;
            }
            else {
                foodYesterdaySales.value = generateFoodSalesData(8);
            }
            // 计算总销量
            totalYesterdaySalesVolume.value = foodYesterdaySales.value.reduce((sum, item) => sum + (item.salesVolume || 0), 0);
            // 获取食品销售量排名
            const foodRankingRes = await Apis.SalesController.listStallFoodRanking();
            if (Array.isArray(foodRankingRes) && foodRankingRes.length > 0 &&
                foodRankingRes.some(item => (item.salesVolume || 0) > 0)) {
                foodRanking.value = foodRankingRes;
            }
            else {
                foodRanking.value = generateFoodSalesData(10, true);
            }
        }
        // 获取历史销量数据
        let historySalesRes;
        if (isAdmin.value) {
            // 超级管理员不需要历史销量趋势
            return;
        }
        else if (isCanteenAdmin.value) {
            historySalesRes = await Apis.SalesController.listCanteenHistorySales({
                params: { startDay: dateRange.value[0], endDay: dateRange.value[1] }
            });
        }
        else if (isStallAdmin.value) {
            historySalesRes = await Apis.SalesController.listStallHistorySales({
                params: { startDay: dateRange.value[0], endDay: dateRange.value[1] }
            });
        }
        if (Array.isArray(historySalesRes) && historySalesRes.length > 0 &&
            historySalesRes.some(item => (item.number || 0) > 0)) {
            historySalesData.value = historySalesRes;
        }
        else {
            historySalesData.value = generateHistorySalesData(dateRange.value[0], dateRange.value[1]);
        }
        // 更新历史销量图表
        updateHistoryChart();
    }
    catch (error) {
        console.error('加载数据失败', error);
        // 发生错误时生成模拟数据
        generateMockDataOnError();
    }
};
// 生成随机数
const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
// 生成食堂销售数据
const generateCanteenSalesData = (count, ranked = false) => {
    const result = [];
    // 如果已有食堂摊位数量数据，使用其中的食堂名称
    if (canteenStallNumbers.value && canteenStallNumbers.value.length > 0) {
        // 使用已有的食堂数据来生成销售量数据
        for (let i = 0; i < Math.min(count, canteenStallNumbers.value.length); i++) {
            const item = canteenStallNumbers.value[i];
            if (item.name) {
                result.push({
                    stallName: item.name,
                    salesVolume: generateRandomNumber(1000, 5000)
                });
            }
        }
    }
    else {
        // 如果没有现有数据，使用默认食堂名称列表
        const canteenNames = ['第一食堂', '第二食堂', '教工食堂', '清真食堂', '研究生食堂', '西区食堂', '南区食堂', '北区食堂', '国际交流中心', '创新港食堂'];
        for (let i = 0; i < Math.min(count, canteenNames.length); i++) {
            result.push({
                stallName: canteenNames[i],
                salesVolume: generateRandomNumber(1000, 5000)
            });
        }
    }
    // 如果是排名数据，按销量排序
    if (ranked) {
        result.sort((a, b) => (b.salesVolume || 0) - (a.salesVolume || 0));
    }
    return result;
};
// 生成食堂摊位数量数据
const generateCanteenStallNumbersData = () => {
    const canteenNames = ['第一食堂', '第二食堂', '教工食堂', '清真食堂', '研究生食堂', '西区食堂', '南区食堂', '北区食堂', '国际交流中心', '创新港食堂'];
    const result = [];
    for (let i = 0; i < canteenNames.length; i++) {
        result.push({
            id: i + 1,
            name: canteenNames[i],
            stallNumber: generateRandomNumber(3, 15)
        });
    }
    return result;
};
// 生成摊位销售数据
const generateStallSalesData = (count, ranked = false) => {
    const result = [];
    // 直接使用stallFoodNumbers中的摊位名称和食品数量数据
    if (stallFoodNumbers.value && stallFoodNumbers.value.length > 0) {
        // 使用已有的食品数据来生成销售量数据
        for (let i = 0; i < Math.min(count, stallFoodNumbers.value.length); i++) {
            const item = stallFoodNumbers.value[i];
            if (item.name) {
                result.push({
                    stallName: item.name,
                    // 使销售量和食品数量成比例关联，这样数据更加合理
                    salesVolume: item.foodNumber ? item.foodNumber * 40 : generateRandomNumber(500, 2000)
                });
            }
        }
    }
    else {
        // 如果没有现有数据，使用默认摊位名称列表
        const stallNames = ['川菜摊位', '粤菜摊位', '湘菜摊位', '面食摊位', '小吃摊位', '饮品摊位', '早餐摊位', '西餐摊位', '日料摊位', '快餐摊位'];
        for (let i = 0; i < Math.min(count, stallNames.length); i++) {
            result.push({
                stallName: stallNames[i],
                salesVolume: generateRandomNumber(500, 2000)
            });
        }
    }
    // 如果是排名数据，按销量排序
    if (ranked) {
        result.sort((a, b) => (b.salesVolume || 0) - (a.salesVolume || 0));
    }
    return result;
};
// 生成食品销售数据
const generateFoodSalesData = (count, ranked = false) => {
    const foodNames = ['红烧肉', '宫保鸡丁', '鱼香肉丝', '麻婆豆腐', '水煮鱼', '炸酱面', '兰州拉面', '酸辣粉', '肉夹馍', '烤冷面', '鸡腿饭', '牛肉面'];
    const result = [];
    for (let i = 0; i < Math.min(count, foodNames.length); i++) {
        result.push({
            foodName: foodNames[i],
            salesVolume: generateRandomNumber(100, 800)
        });
    }
    // 如果是排名数据，按销量排序
    if (ranked) {
        result.sort((a, b) => (b.salesVolume || 0) - (a.salesVolume || 0));
    }
    return result;
};
// 生成历史销量数据
const generateHistorySalesData = (startDay, endDay) => {
    const result = [];
    const start = new Date(startDay);
    const end = new Date(endDay);
    const dayCount = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    for (let i = 0; i < dayCount; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        result.push({
            day: currentDate.toISOString().slice(0, 10),
            number: generateRandomNumber(1000, 5000)
        });
    }
    return result;
};
// 发生错误时生成所有模拟数据
const generateMockDataOnError = () => {
    if (isAdmin.value) {
        canteenNumber.value = generateRandomNumber(5, 15);
        stallNumber.value = generateRandomNumber(20, 50);
        foodNumber.value = generateRandomNumber(50, 150);
        // 确保先生成摊位数量数据，再生成销售数据以保持一致性
        canteenStallNumbers.value = generateCanteenStallNumbersData();
        canteenYesterdaySales.value = generateCanteenSalesData(canteenStallNumbers.value.length);
        canteenRanking.value = generateCanteenSalesData(10, true);
        totalYesterdaySalesVolume.value = canteenYesterdaySales.value.reduce((sum, item) => sum + (item.salesVolume || 0), 0);
    }
    else if (isCanteenAdmin.value) {
        stallNumber.value = generateRandomNumber(5, 15);
        foodNumber.value = generateRandomNumber(30, 100);
        // 确保先生成摊位食品数量数据，再生成销售数据以保持一致性
        stallFoodNumbers.value = generateStallFoodNumbersData();
        // 使用所有摊位数据，确保与食品数量分布图使用相同的摊位
        stallYesterdaySales.value = generateStallSalesData(stallFoodNumbers.value.length);
        stallRanking.value = generateStallSalesData(10, true);
        totalYesterdaySalesVolume.value = stallYesterdaySales.value.reduce((sum, item) => sum + (item.salesVolume || 0), 0);
    }
    else if (isStallAdmin.value) {
        foodNumber.value = generateRandomNumber(15, 40);
        foodCategories.value = Math.round(foodNumber.value / 3);
        foodYesterdaySales.value = generateFoodSalesData(8);
        foodRanking.value = generateFoodSalesData(10, true);
        totalYesterdaySalesVolume.value = foodYesterdaySales.value.reduce((sum, item) => sum + (item.salesVolume || 0), 0);
    }
    const startDay = dateRange.value[0];
    const endDay = dateRange.value[1];
    historySalesData.value = generateHistorySalesData(startDay, endDay);
};
// 日期范围变化处理
const handleDateRangeChange = () => {
    loadData();
};
// 初始化食堂昨日销售量图表
const initCanteenYesterdaySalesChart = () => {
    if (!canteenYesterdaySalesRef.value)
        return;
    canteenYesterdaySalesChart = echarts.init(canteenYesterdaySalesRef.value);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: canteenYesterdaySales.value.map(item => item.stallName || '未命名'),
            axisLabel: {
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '销售量'
        },
        series: [
            {
                name: '昨日销售量',
                type: 'bar',
                barWidth: '60%',
                data: canteenYesterdaySales.value.map(item => item.salesVolume || 0),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#83bff6' },
                        { offset: 0.5, color: '#188df0' },
                        { offset: 1, color: '#188df0' }
                    ])
                }
            }
        ]
    };
    canteenYesterdaySalesChart.setOption(option);
};
// 初始化食堂销售量排名图表
const initCanteenRankingChart = () => {
    if (!canteenRankingRef.value)
        return;
    canteenRankingChart = echarts.init(canteenRankingRef.value);
    // 获取前五名数据
    const top5Data = canteenRanking.value.slice(0, 5);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '销售量'
        },
        yAxis: {
            type: 'category',
            data: top5Data.map(item => item.stallName || '未命名'),
            axisLabel: {
                interval: 0
            }
        },
        series: [
            {
                name: '销售量',
                type: 'bar',
                data: top5Data.map(item => item.salesVolume || 0),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#ffb64d' },
                        { offset: 1, color: '#ff9642' }
                    ])
                }
            }
        ]
    };
    canteenRankingChart.setOption(option);
};
// 初始化摊位昨日销售量图表
const initStallYesterdaySalesChart = () => {
    if (!stallYesterdaySalesRef.value)
        return;
    stallYesterdaySalesChart = echarts.init(stallYesterdaySalesRef.value);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: stallYesterdaySales.value.map(item => item.stallName || '未命名'),
            axisLabel: {
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '销售量'
        },
        series: [
            {
                name: '昨日销售量',
                type: 'bar',
                barWidth: '60%',
                data: stallYesterdaySales.value.map(item => item.salesVolume || 0),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#91cc75' },
                        { offset: 1, color: '#5eb55e' }
                    ])
                }
            }
        ]
    };
    stallYesterdaySalesChart.setOption(option);
};
// 初始化摊位销售量排名图表
const initStallRankingChart = () => {
    if (!stallRankingRef.value)
        return;
    stallRankingChart = echarts.init(stallRankingRef.value);
    // 获取前五名数据
    const top5Data = stallRanking.value.slice(0, 5);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '销售量'
        },
        yAxis: {
            type: 'category',
            data: top5Data.map(item => item.stallName || '未命名'),
            axisLabel: {
                interval: 0
            }
        },
        series: [
            {
                name: '销售量',
                type: 'bar',
                data: top5Data.map(item => item.salesVolume || 0),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#67e0e3' },
                        { offset: 1, color: '#32c5e9' }
                    ])
                }
            }
        ]
    };
    stallRankingChart.setOption(option);
};
// 初始化食品昨日销售量图表
const initFoodYesterdaySalesChart = () => {
    if (!foodYesterdaySalesRef.value)
        return;
    foodYesterdaySalesChart = echarts.init(foodYesterdaySalesRef.value);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: foodYesterdaySales.value.map(item => item.foodName || '未命名'),
            axisLabel: {
                interval: 0,
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            name: '销售量'
        },
        series: [
            {
                name: '昨日销售量',
                type: 'bar',
                barWidth: '60%',
                data: foodYesterdaySales.value.map(item => item.salesVolume || 0),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#fc8251' },
                        { offset: 1, color: '#e86110' }
                    ])
                }
            }
        ]
    };
    foodYesterdaySalesChart.setOption(option);
};
// 初始化食品销售量排名图表
const initFoodRankingChart = () => {
    if (!foodRankingRef.value)
        return;
    foodRankingChart = echarts.init(foodRankingRef.value);
    // 获取前五名数据
    const top5Data = foodRanking.value.slice(0, 5);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '销售量'
        },
        yAxis: {
            type: 'category',
            data: top5Data.map(item => item.foodName || '未命名'),
            axisLabel: {
                interval: 0
            }
        },
        series: [
            {
                name: '销售量',
                type: 'bar',
                data: top5Data.map(item => item.salesVolume || 0),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#ee6666' },
                        { offset: 1, color: '#c13531' }
                    ])
                }
            }
        ]
    };
    foodRankingChart.setOption(option);
};
// 初始化食堂摊位数量图表
const initCanteenStallNumberChart = () => {
    if (!canteenStallNumberRef.value)
        return;
    canteenStallNumberChart = echarts.init(canteenStallNumberRef.value);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '摊位数量'
        },
        yAxis: {
            type: 'category',
            data: canteenStallNumbers.value.map(item => item.name || '未命名'),
            axisLabel: {
                interval: 0
            }
        },
        series: [
            {
                name: '摊位数量',
                type: 'bar',
                data: canteenStallNumbers.value.map(item => item.stallNumber || 0),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#4dabf7' },
                        { offset: 1, color: '#228be6' }
                    ])
                }
            }
        ]
    };
    canteenStallNumberChart.setOption(option);
};
// 初始化历史销量图表
const initHistoryChart = () => {
    if (!historyChartRef.value)
        return;
    historyChart = echarts.init(historyChartRef.value);
    updateHistoryChart();
};
// 更新历史销量图表
const updateHistoryChart = () => {
    if (!historyChart)
        return;
    const option = {
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: historySalesData.value.map(item => item.day)
        },
        yAxis: {
            type: 'value',
            name: '销售量'
        },
        series: [
            {
                name: '销售量',
                type: 'line',
                smooth: true,
                areaStyle: {
                    opacity: 0.3
                },
                data: historySalesData.value.map(item => item.number),
                markPoint: {
                    data: [
                        { type: 'max', name: '最大值' },
                        { type: 'min', name: '最小值' }
                    ]
                },
                markLine: {
                    data: [
                        { type: 'average', name: '平均值' }
                    ]
                }
            }
        ]
    };
    historyChart.setOption(option);
};
// 初始化所有图表
const initCharts = () => {
    // 清除旧的图表实例
    canteenYesterdaySalesChart?.dispose();
    canteenRankingChart?.dispose();
    stallYesterdaySalesChart?.dispose();
    stallRankingChart?.dispose();
    foodYesterdaySalesChart?.dispose();
    foodRankingChart?.dispose();
    historyChart?.dispose();
    canteenStallNumberChart?.dispose();
    stallFoodNumberChart?.dispose();
    // 根据角色初始化相应的图表
    if (isAdmin.value) {
        initCanteenYesterdaySalesChart();
        initCanteenRankingChart();
        initCanteenStallNumberChart();
    }
    else if (isCanteenAdmin.value) {
        initStallYesterdaySalesChart();
        initStallRankingChart();
        initStallFoodNumberChart();
        initHistoryChart();
    }
    else if (isStallAdmin.value) {
        initFoodYesterdaySalesChart();
        initFoodRankingChart();
        initHistoryChart();
    }
};
// 处理窗口大小变化
const handleResize = () => {
    if (isAdmin.value) {
        canteenYesterdaySalesChart?.resize();
        canteenRankingChart?.resize();
        canteenStallNumberChart?.resize();
    }
    else if (isCanteenAdmin.value) {
        stallYesterdaySalesChart?.resize();
        stallRankingChart?.resize();
        stallFoodNumberChart?.resize();
        historyChart?.resize();
    }
    else if (isStallAdmin.value) {
        foodYesterdaySalesChart?.resize();
        foodRankingChart?.resize();
        historyChart?.resize();
    }
};
onMounted(async () => {
    // 如果没有识别到角色，使用超级管理员视图
    if (userRole.value === 'unknown') {
        // 临时覆盖角色判断
        Object.defineProperty(isAdmin, 'value', { get: () => true });
    }
    await loadData();
    // 使用 nextTick 确保 DOM 已经渲染
    nextTick(() => {
        initCharts();
        window.addEventListener('resize', handleResize);
    });
});
// 组件卸载时清理资源
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (isAdmin.value) {
        canteenYesterdaySalesChart?.dispose();
        canteenRankingChart?.dispose();
        canteenStallNumberChart?.dispose();
    }
    else if (isCanteenAdmin.value) {
        stallYesterdaySalesChart?.dispose();
        stallRankingChart?.dispose();
        stallFoodNumberChart?.dispose();
    }
    else if (isStallAdmin.value) {
        foodYesterdaySalesChart?.dispose();
        foodRankingChart?.dispose();
    }
});
// 生成摊位食品数量数据
const generateStallFoodNumbersData = () => {
    // 使用与摊位销售数据相同的摊位名称列表
    const stallNames = ['川菜摊位', '粤菜摊位', '湘菜摊位', '面食摊位', '小吃摊位', '饮品摊位', '早餐摊位', '西餐摊位', '日料摊位', '快餐摊位'];
    const result = [];
    // 确保生成一个固定的随机种子，让同名摊位的数据具有一致性
    const stallDataMap = new Map();
    // 为每个摊位名称生成一致的数据值
    stallNames.forEach((name, index) => {
        const randomValue = generateRandomNumber(5, 25);
        stallDataMap.set(name, {
            id: index + 1,
            foodNumber: randomValue,
            salesVolume: randomValue * 40 // 使销售量和食品数量有关联
        });
    });
    // 按相同的顺序生成结果
    for (let i = 0; i < stallNames.length; i++) {
        const name = stallNames[i];
        const data = stallDataMap.get(name);
        result.push({
            id: data.id,
            name: name,
            foodNumber: data.foodNumber
        });
    }
    return result;
};
// 初始化摊位食品数量图表
const initStallFoodNumberChart = () => {
    if (!stallFoodNumberRef.value)
        return;
    stallFoodNumberChart = echarts.init(stallFoodNumberRef.value);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '食品数量'
        },
        yAxis: {
            type: 'category',
            data: stallFoodNumbers.value.map(item => item.name || '未命名'),
            axisLabel: {
                interval: 0
            }
        },
        series: [
            {
                name: '食品数量',
                type: 'bar',
                data: stallFoodNumbers.value.map(item => item.foodNumber || 0),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: '#82d616' },
                        { offset: 1, color: '#5ca30d' }
                    ])
                }
            }
        ]
    };
    stallFoodNumberChart.setOption(option);
};
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("data-display") },
    });
    if (__VLS_ctx.isAdmin) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_0 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            gutter: ((20)),
        }));
        const __VLS_2 = __VLS_1({
            gutter: ((20)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const __VLS_6 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
            span: ((6)),
        }));
        const __VLS_8 = __VLS_7({
            span: ((6)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        const __VLS_12 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ class: ("number-card") },
        }));
        const __VLS_14 = __VLS_13({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_18 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({}));
        const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
        const __VLS_24 = {}.School;
        /** @type { [typeof __VLS_components.School, ] } */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
        const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_23.slots.default;
        var __VLS_23;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.canteenNumber);
        __VLS_17.slots.default;
        var __VLS_17;
        __VLS_11.slots.default;
        var __VLS_11;
        const __VLS_30 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
            span: ((6)),
        }));
        const __VLS_32 = __VLS_31({
            span: ((6)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        const __VLS_36 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            ...{ class: ("number-card") },
        }));
        const __VLS_38 = __VLS_37({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_42 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({}));
        const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
        const __VLS_48 = {}.Shop;
        /** @type { [typeof __VLS_components.Shop, ] } */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
        const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_47.slots.default;
        var __VLS_47;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.stallNumber);
        __VLS_41.slots.default;
        var __VLS_41;
        __VLS_35.slots.default;
        var __VLS_35;
        const __VLS_54 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
            span: ((6)),
        }));
        const __VLS_56 = __VLS_55({
            span: ((6)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        const __VLS_60 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            ...{ class: ("number-card") },
        }));
        const __VLS_62 = __VLS_61({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_66 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({}));
        const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
        const __VLS_72 = {}.Food;
        /** @type { [typeof __VLS_components.Food, ] } */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
        const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_71.slots.default;
        var __VLS_71;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.foodNumber);
        __VLS_65.slots.default;
        var __VLS_65;
        __VLS_59.slots.default;
        var __VLS_59;
        const __VLS_78 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
            span: ((6)),
        }));
        const __VLS_80 = __VLS_79({
            span: ((6)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_79));
        const __VLS_84 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            ...{ class: ("number-card") },
        }));
        const __VLS_86 = __VLS_85({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_90 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
        const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
        const __VLS_96 = {}.PieChart;
        /** @type { [typeof __VLS_components.PieChart, ] } */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
        const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
        __VLS_95.slots.default;
        var __VLS_95;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.totalYesterdaySalesVolume);
        __VLS_89.slots.default;
        var __VLS_89;
        __VLS_83.slots.default;
        var __VLS_83;
        __VLS_5.slots.default;
        var __VLS_5;
        const __VLS_102 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }));
        const __VLS_104 = __VLS_103({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        const __VLS_108 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            span: ((12)),
        }));
        const __VLS_110 = __VLS_109({
            span: ((12)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        const __VLS_114 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
            ...{ class: ("chart-card") },
        }));
        const __VLS_116 = __VLS_115({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_119.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("canteenYesterdaySalesRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const canteenYesterdaySalesRef = ref()`
        /** @type { typeof __VLS_ctx.canteenYesterdaySalesRef } */ ;
        var __VLS_119;
        __VLS_113.slots.default;
        var __VLS_113;
        const __VLS_120 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            span: ((12)),
        }));
        const __VLS_122 = __VLS_121({
            span: ((12)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        const __VLS_126 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
            ...{ class: ("chart-card") },
        }));
        const __VLS_128 = __VLS_127({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_127));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_131.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("canteenRankingRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const canteenRankingRef = ref()`
        /** @type { typeof __VLS_ctx.canteenRankingRef } */ ;
        var __VLS_131;
        __VLS_125.slots.default;
        var __VLS_125;
        __VLS_107.slots.default;
        var __VLS_107;
        const __VLS_132 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }));
        const __VLS_134 = __VLS_133({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        const __VLS_138 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
            span: ((24)),
        }));
        const __VLS_140 = __VLS_139({
            span: ((24)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        const __VLS_144 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
            ...{ class: ("chart-card") },
        }));
        const __VLS_146 = __VLS_145({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_149.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("canteenStallNumberRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const canteenStallNumberRef = ref()`
        /** @type { typeof __VLS_ctx.canteenStallNumberRef } */ ;
        var __VLS_149;
        __VLS_143.slots.default;
        var __VLS_143;
        __VLS_137.slots.default;
        var __VLS_137;
    }
    else if (__VLS_ctx.isCanteenAdmin) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_150 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
            gutter: ((20)),
        }));
        const __VLS_152 = __VLS_151({
            gutter: ((20)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_151));
        const __VLS_156 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
            span: ((8)),
        }));
        const __VLS_158 = __VLS_157({
            span: ((8)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        const __VLS_162 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
            ...{ class: ("number-card") },
        }));
        const __VLS_164 = __VLS_163({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_163));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_168 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({}));
        const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
        const __VLS_174 = {}.Shop;
        /** @type { [typeof __VLS_components.Shop, ] } */ ;
        // @ts-ignore
        const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({}));
        const __VLS_176 = __VLS_175({}, ...__VLS_functionalComponentArgsRest(__VLS_175));
        __VLS_173.slots.default;
        var __VLS_173;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.stallNumber);
        __VLS_167.slots.default;
        var __VLS_167;
        __VLS_161.slots.default;
        var __VLS_161;
        const __VLS_180 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
            span: ((8)),
        }));
        const __VLS_182 = __VLS_181({
            span: ((8)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_181));
        const __VLS_186 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
            ...{ class: ("number-card") },
        }));
        const __VLS_188 = __VLS_187({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_187));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_192 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
        const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
        const __VLS_198 = {}.Food;
        /** @type { [typeof __VLS_components.Food, ] } */ ;
        // @ts-ignore
        const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({}));
        const __VLS_200 = __VLS_199({}, ...__VLS_functionalComponentArgsRest(__VLS_199));
        __VLS_197.slots.default;
        var __VLS_197;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.foodNumber);
        __VLS_191.slots.default;
        var __VLS_191;
        __VLS_185.slots.default;
        var __VLS_185;
        const __VLS_204 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
            span: ((8)),
        }));
        const __VLS_206 = __VLS_205({
            span: ((8)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_205));
        const __VLS_210 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
            ...{ class: ("number-card") },
        }));
        const __VLS_212 = __VLS_211({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_211));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_216 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({}));
        const __VLS_218 = __VLS_217({}, ...__VLS_functionalComponentArgsRest(__VLS_217));
        const __VLS_222 = {}.PieChart;
        /** @type { [typeof __VLS_components.PieChart, ] } */ ;
        // @ts-ignore
        const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({}));
        const __VLS_224 = __VLS_223({}, ...__VLS_functionalComponentArgsRest(__VLS_223));
        __VLS_221.slots.default;
        var __VLS_221;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.totalYesterdaySalesVolume);
        __VLS_215.slots.default;
        var __VLS_215;
        __VLS_209.slots.default;
        var __VLS_209;
        __VLS_155.slots.default;
        var __VLS_155;
        const __VLS_228 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }));
        const __VLS_230 = __VLS_229({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_229));
        const __VLS_234 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
            span: ((12)),
        }));
        const __VLS_236 = __VLS_235({
            span: ((12)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_235));
        const __VLS_240 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
            ...{ class: ("chart-card") },
        }));
        const __VLS_242 = __VLS_241({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_241));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_245.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("stallYesterdaySalesRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const stallYesterdaySalesRef = ref()`
        /** @type { typeof __VLS_ctx.stallYesterdaySalesRef } */ ;
        var __VLS_245;
        __VLS_239.slots.default;
        var __VLS_239;
        const __VLS_246 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
            span: ((12)),
        }));
        const __VLS_248 = __VLS_247({
            span: ((12)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_247));
        const __VLS_252 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
            ...{ class: ("chart-card") },
        }));
        const __VLS_254 = __VLS_253({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_253));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_257.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("stallRankingRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const stallRankingRef = ref()`
        /** @type { typeof __VLS_ctx.stallRankingRef } */ ;
        var __VLS_257;
        __VLS_251.slots.default;
        var __VLS_251;
        __VLS_233.slots.default;
        var __VLS_233;
        const __VLS_258 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }));
        const __VLS_260 = __VLS_259({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_259));
        const __VLS_264 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
            span: ((12)),
        }));
        const __VLS_266 = __VLS_265({
            span: ((12)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_265));
        const __VLS_270 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
            ...{ class: ("chart-card") },
        }));
        const __VLS_272 = __VLS_271({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_271));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_275.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("stallFoodNumberRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const stallFoodNumberRef = ref()`
        /** @type { typeof __VLS_ctx.stallFoodNumberRef } */ ;
        var __VLS_275;
        __VLS_269.slots.default;
        var __VLS_269;
        const __VLS_276 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
            span: ((12)),
        }));
        const __VLS_278 = __VLS_277({
            span: ((12)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_277));
        const __VLS_282 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
            ...{ class: ("chart-card") },
        }));
        const __VLS_284 = __VLS_283({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_283));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_287.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("historyChartRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const historyChartRef = ref()`
        /** @type { typeof __VLS_ctx.historyChartRef } */ ;
        var __VLS_287;
        __VLS_281.slots.default;
        var __VLS_281;
        __VLS_263.slots.default;
        var __VLS_263;
    }
    else if (__VLS_ctx.isStallAdmin) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_288 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
            gutter: ((20)),
        }));
        const __VLS_290 = __VLS_289({
            gutter: ((20)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_289));
        const __VLS_294 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
            span: ((8)),
        }));
        const __VLS_296 = __VLS_295({
            span: ((8)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_295));
        const __VLS_300 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
            ...{ class: ("number-card") },
        }));
        const __VLS_302 = __VLS_301({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_301));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_306 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_307 = __VLS_asFunctionalComponent(__VLS_306, new __VLS_306({}));
        const __VLS_308 = __VLS_307({}, ...__VLS_functionalComponentArgsRest(__VLS_307));
        const __VLS_312 = {}.Food;
        /** @type { [typeof __VLS_components.Food, ] } */ ;
        // @ts-ignore
        const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({}));
        const __VLS_314 = __VLS_313({}, ...__VLS_functionalComponentArgsRest(__VLS_313));
        __VLS_311.slots.default;
        var __VLS_311;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.foodNumber);
        __VLS_305.slots.default;
        var __VLS_305;
        __VLS_299.slots.default;
        var __VLS_299;
        const __VLS_318 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_319 = __VLS_asFunctionalComponent(__VLS_318, new __VLS_318({
            span: ((8)),
        }));
        const __VLS_320 = __VLS_319({
            span: ((8)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_319));
        const __VLS_324 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
            ...{ class: ("number-card") },
        }));
        const __VLS_326 = __VLS_325({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_325));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_330 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_331 = __VLS_asFunctionalComponent(__VLS_330, new __VLS_330({}));
        const __VLS_332 = __VLS_331({}, ...__VLS_functionalComponentArgsRest(__VLS_331));
        const __VLS_336 = {}.PieChart;
        /** @type { [typeof __VLS_components.PieChart, ] } */ ;
        // @ts-ignore
        const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({}));
        const __VLS_338 = __VLS_337({}, ...__VLS_functionalComponentArgsRest(__VLS_337));
        __VLS_335.slots.default;
        var __VLS_335;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.totalYesterdaySalesVolume);
        __VLS_329.slots.default;
        var __VLS_329;
        __VLS_323.slots.default;
        var __VLS_323;
        const __VLS_342 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_343 = __VLS_asFunctionalComponent(__VLS_342, new __VLS_342({
            span: ((8)),
        }));
        const __VLS_344 = __VLS_343({
            span: ((8)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_343));
        const __VLS_348 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
            ...{ class: ("number-card") },
        }));
        const __VLS_350 = __VLS_349({
            ...{ class: ("number-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_349));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-item") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-icon") },
        });
        const __VLS_354 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_355 = __VLS_asFunctionalComponent(__VLS_354, new __VLS_354({}));
        const __VLS_356 = __VLS_355({}, ...__VLS_functionalComponentArgsRest(__VLS_355));
        const __VLS_360 = {}.Timer;
        /** @type { [typeof __VLS_components.Timer, ] } */ ;
        // @ts-ignore
        const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({}));
        const __VLS_362 = __VLS_361({}, ...__VLS_functionalComponentArgsRest(__VLS_361));
        __VLS_359.slots.default;
        var __VLS_359;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-title") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("number-value") },
        });
        (__VLS_ctx.foodCategories);
        __VLS_353.slots.default;
        var __VLS_353;
        __VLS_347.slots.default;
        var __VLS_347;
        __VLS_293.slots.default;
        var __VLS_293;
        const __VLS_366 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_367 = __VLS_asFunctionalComponent(__VLS_366, new __VLS_366({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }));
        const __VLS_368 = __VLS_367({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_367));
        const __VLS_372 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
            span: ((12)),
        }));
        const __VLS_374 = __VLS_373({
            span: ((12)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_373));
        const __VLS_378 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_379 = __VLS_asFunctionalComponent(__VLS_378, new __VLS_378({
            ...{ class: ("chart-card") },
        }));
        const __VLS_380 = __VLS_379({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_379));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_383.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("foodYesterdaySalesRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const foodYesterdaySalesRef = ref()`
        /** @type { typeof __VLS_ctx.foodYesterdaySalesRef } */ ;
        var __VLS_383;
        __VLS_377.slots.default;
        var __VLS_377;
        const __VLS_384 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
            span: ((12)),
        }));
        const __VLS_386 = __VLS_385({
            span: ((12)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_385));
        const __VLS_390 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_391 = __VLS_asFunctionalComponent(__VLS_390, new __VLS_390({
            ...{ class: ("chart-card") },
        }));
        const __VLS_392 = __VLS_391({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_391));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_395.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("foodRankingRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const foodRankingRef = ref()`
        /** @type { typeof __VLS_ctx.foodRankingRef } */ ;
        var __VLS_395;
        __VLS_389.slots.default;
        var __VLS_389;
        __VLS_371.slots.default;
        var __VLS_371;
        const __VLS_396 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_397 = __VLS_asFunctionalComponent(__VLS_396, new __VLS_396({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }));
        const __VLS_398 = __VLS_397({
            gutter: ((20)),
            ...{ class: ("mt-4") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_397));
        const __VLS_402 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_403 = __VLS_asFunctionalComponent(__VLS_402, new __VLS_402({
            span: ((24)),
        }));
        const __VLS_404 = __VLS_403({
            span: ((24)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_403));
        const __VLS_408 = {}.ElCard;
        /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
        // @ts-ignore
        const __VLS_409 = __VLS_asFunctionalComponent(__VLS_408, new __VLS_408({
            ...{ class: ("chart-card") },
        }));
        const __VLS_410 = __VLS_409({
            ...{ class: ("chart-card") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_409));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { header: __VLS_thisSlot } = __VLS_413.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("card-header") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("date-picker") },
            });
            const __VLS_414 = {}.ElDatePicker;
            /** @type { [typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ] } */ ;
            // @ts-ignore
            const __VLS_415 = __VLS_asFunctionalComponent(__VLS_414, new __VLS_414({
                ...{ 'onChange': {} },
                modelValue: ((__VLS_ctx.dateRange)),
                type: ("daterange"),
                rangeSeparator: ("至"),
                startPlaceholder: ("开始日期"),
                endPlaceholder: ("结束日期"),
                format: ("YYYY-MM-DD"),
                valueFormat: ("YYYY-MM-DD"),
            }));
            const __VLS_416 = __VLS_415({
                ...{ 'onChange': {} },
                modelValue: ((__VLS_ctx.dateRange)),
                type: ("daterange"),
                rangeSeparator: ("至"),
                startPlaceholder: ("开始日期"),
                endPlaceholder: ("结束日期"),
                format: ("YYYY-MM-DD"),
                valueFormat: ("YYYY-MM-DD"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_415));
            let __VLS_420;
            const __VLS_421 = {
                onChange: (__VLS_ctx.handleDateRangeChange)
            };
            let __VLS_417;
            let __VLS_418;
            var __VLS_419;
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ref: ("historyChartRef"),
            ...{ class: ("chart") },
        });
        // @ts-ignore navigation for `const historyChartRef = ref()`
        /** @type { typeof __VLS_ctx.historyChartRef } */ ;
        var __VLS_413;
        __VLS_407.slots.default;
        var __VLS_407;
        __VLS_401.slots.default;
        var __VLS_401;
    }
    ['data-display', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'mt-4', 'chart-card', 'card-header', 'chart', 'chart-card', 'card-header', 'chart', 'mt-4', 'chart-card', 'card-header', 'chart', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'mt-4', 'chart-card', 'card-header', 'chart', 'chart-card', 'card-header', 'chart', 'mt-4', 'chart-card', 'card-header', 'chart', 'chart-card', 'card-header', 'chart', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'number-card', 'number-item', 'number-icon', 'number-info', 'number-title', 'number-value', 'mt-4', 'chart-card', 'card-header', 'chart', 'chart-card', 'card-header', 'chart', 'mt-4', 'chart-card', 'card-header', 'date-picker', 'chart',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'canteenYesterdaySalesRef': __VLS_nativeElements['div'],
        'canteenRankingRef': __VLS_nativeElements['div'],
        'canteenStallNumberRef': __VLS_nativeElements['div'],
        'stallYesterdaySalesRef': __VLS_nativeElements['div'],
        'stallRankingRef': __VLS_nativeElements['div'],
        'stallFoodNumberRef': __VLS_nativeElements['div'],
        'historyChartRef': __VLS_nativeElements['div'],
        'foodYesterdaySalesRef': __VLS_nativeElements['div'],
        'foodRankingRef': __VLS_nativeElements['div'],
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
            School: School,
            Shop: Shop,
            Food: Food,
            PieChart: PieChart,
            Timer: Timer,
            isAdmin: isAdmin,
            isCanteenAdmin: isCanteenAdmin,
            isStallAdmin: isStallAdmin,
            canteenNumber: canteenNumber,
            stallNumber: stallNumber,
            foodNumber: foodNumber,
            totalYesterdaySalesVolume: totalYesterdaySalesVolume,
            foodCategories: foodCategories,
            dateRange: dateRange,
            canteenYesterdaySalesRef: canteenYesterdaySalesRef,
            canteenRankingRef: canteenRankingRef,
            stallYesterdaySalesRef: stallYesterdaySalesRef,
            stallRankingRef: stallRankingRef,
            foodYesterdaySalesRef: foodYesterdaySalesRef,
            foodRankingRef: foodRankingRef,
            historyChartRef: historyChartRef,
            canteenStallNumberRef: canteenStallNumberRef,
            stallFoodNumberRef: stallFoodNumberRef,
            handleDateRangeChange: handleDateRangeChange,
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
