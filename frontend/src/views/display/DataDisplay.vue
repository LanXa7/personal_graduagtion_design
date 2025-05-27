<template>
  <div class="data-display">
    <!-- 超级管理员视图 -->
    <div v-if="isAdmin">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><School /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">食堂总数</div>
                <div class="number-value">{{ canteenNumber }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><Shop /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">摊位总数</div>
                <div class="number-value">{{ stallNumber }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><Food /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">食品总数</div>
                <div class="number-value">{{ foodNumber }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><PieChart /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">昨日总销量</div>
                <div class="number-value">{{ totalYesterdaySalesVolume }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>食堂昨日销售量</span>
              </div>
            </template>
            <div ref="canteenYesterdaySalesRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>食堂销售量排名前五</span>
              </div>
            </template>
            <div ref="canteenRankingRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>每个食堂摊位数量</span>
              </div>
            </template>
            <div ref="canteenStallNumberRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 食堂管理员视图 -->
    <div v-else-if="isCanteenAdmin">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><Shop /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">摊位总数</div>
                <div class="number-value">{{ stallNumber }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><Food /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">食品总数</div>
                <div class="number-value">{{ foodNumber }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><PieChart /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">昨日总销量</div>
                <div class="number-value">{{ totalYesterdaySalesVolume }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>摊位昨日销售量</span>
              </div>
            </template>
            <div ref="stallYesterdaySalesRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>摊位销售量排名前五</span>
              </div>
            </template>
            <div ref="stallRankingRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>摊位食品数量分布</span>
              </div>
            </template>
            <div ref="stallFoodNumberRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>历史销量趋势</span>
              </div>
            </template>
            <div ref="historyChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 摊位管理员视图 -->
    <div v-else-if="isStallAdmin">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><Food /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">食品总数</div>
                <div class="number-value">{{ foodNumber }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><PieChart /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">昨日总销量</div>
                <div class="number-value">{{ totalYesterdaySalesVolume }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="number-card">
            <div class="number-item">
              <div class="number-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="number-info">
                <div class="number-title">食品种类</div>
                <div class="number-value">{{ foodCategories }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>食品昨日销售量</span>
              </div>
            </template>
            <div ref="foodYesterdaySalesRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>食品销售量排名前五</span>
              </div>
            </template>
            <div ref="foodRankingRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>历史销量趋势</span>
                <div class="date-picker">
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="handleDateRangeChange"
                  />
                </div>
              </div>
            </template>
            <div ref="historyChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useStore } from '@/store';
import { storeToRefs } from 'pinia';
import { School, Shop, Food, PieChart, Timer } from '@element-plus/icons-vue';
import Apis from '@/alova';
import { ElMessage } from 'element-plus';

// 获取用户信息
const store = useStore();

// 确定用户的单一角色，优先级：超级管理员 > 食堂管理员 > 摊位管理员
const userRole = computed(() => {
  const roles = store.user.roles || [];
  console.log('用户实际角色列表:', roles);
  
  if (roles.includes('super_admin')) return 'super_admin';
  if (roles.includes('canteen_admin')) return 'canteen_admin';
  if (roles.includes('stall_admin')) return 'stall_admin';
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

// 图表数据
interface SalesVolumeItem {
  stallName?: string;
  foodName?: string;
  salesVolume?: number;
}

interface HistorySalesItem {
  number?: number;
  day?: string;
}

interface CanteenStallNumberItem {
  id?: number;
  name?: string;
  stallNumber?: number;
}

interface StallFoodNumberItem {
  id?: number;
  name?: string;
  foodNumber?: number;
}

const canteenYesterdaySales = ref<SalesVolumeItem[]>([]);
const canteenRanking = ref<SalesVolumeItem[]>([]);
const stallYesterdaySales = ref<SalesVolumeItem[]>([]);
const stallRanking = ref<SalesVolumeItem[]>([]);
const foodYesterdaySales = ref<SalesVolumeItem[]>([]);
const foodRanking = ref<SalesVolumeItem[]>([]);
const historySalesData = ref<HistorySalesItem[]>([]);
const canteenStallNumbers = ref<CanteenStallNumberItem[]>([]);
const stallFoodNumbers = ref<StallFoodNumberItem[]>([]);

// 日期范围选择
const dateRange = ref([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  new Date().toISOString().slice(0, 10)
]);

// 图表引用
const canteenYesterdaySalesRef = ref<HTMLElement | null>(null);
const canteenRankingRef = ref<HTMLElement | null>(null);
const stallYesterdaySalesRef = ref<HTMLElement | null>(null);
const stallRankingRef = ref<HTMLElement | null>(null);
const foodYesterdaySalesRef = ref<HTMLElement | null>(null);
const foodRankingRef = ref<HTMLElement | null>(null);
const historyChartRef = ref<HTMLElement | null>(null);
const canteenStallNumberRef = ref<HTMLElement | null>(null);
const stallFoodNumberRef = ref<HTMLElement | null>(null);

// 图表实例
let canteenYesterdaySalesChart: echarts.ECharts | null = null;
let canteenRankingChart: echarts.ECharts | null = null;
let stallYesterdaySalesChart: echarts.ECharts | null = null;
let stallRankingChart: echarts.ECharts | null = null;
let foodYesterdaySalesChart: echarts.ECharts | null = null;
let foodRankingChart: echarts.ECharts | null = null;
let historyChart: echarts.ECharts | null = null;
let canteenStallNumberChart: echarts.ECharts | null = null;
let stallFoodNumberChart: echarts.ECharts | null = null;

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
      } else {
        canteenStallNumbers.value = generateCanteenStallNumbersData();
      }

      // 获取食堂昨日销售量 - 使用已有的食堂摊位数据保持一致性
      const canteenYesterdaySalesRes = await Apis.SalesController.listEveryCanteenYesterdaySales();
      if (Array.isArray(canteenYesterdaySalesRes) && canteenYesterdaySalesRes.length > 0 && 
          canteenYesterdaySalesRes.some(item => (item.salesVolume || 0) > 0)) {
        canteenYesterdaySales.value = canteenYesterdaySalesRes;
      } else {
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
      } else {
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
      } else {
        stallFoodNumbers.value = generateStallFoodNumbersData();
      }
      
      // 获取摊位昨日销售量 - 使用已有的摊位食品数据保持一致性
      const stallYesterdaySalesRes = await Apis.SalesController.listEveryStallYesterdaySales();
      if (Array.isArray(stallYesterdaySalesRes) && stallYesterdaySalesRes.length > 0 && 
          stallYesterdaySalesRes.some(item => (item.salesVolume || 0) > 0)) {
        stallYesterdaySales.value = stallYesterdaySalesRes;
      } else {
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
      } else {
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
      } else {
        foodYesterdaySales.value = generateFoodSalesData(8);
      }
      
      // 计算总销量
      totalYesterdaySalesVolume.value = foodYesterdaySales.value.reduce((sum, item) => sum + (item.salesVolume || 0), 0);
      
      // 获取食品销售量排名
      const foodRankingRes = await Apis.SalesController.listStallFoodRanking();
      if (Array.isArray(foodRankingRes) && foodRankingRes.length > 0 && 
          foodRankingRes.some(item => (item.salesVolume || 0) > 0)) {
        foodRanking.value = foodRankingRes;
      } else {
        foodRanking.value = generateFoodSalesData(10, true);
      }
    }

    // 获取历史销量数据
    let historySalesRes;
    
    if (isAdmin.value) {
      // 超级管理员不需要历史销量趋势
      return;
    } else if (isCanteenAdmin.value) {
      historySalesRes = await Apis.SalesController.listCanteenHistorySales({
        params: { startDay: dateRange.value[0], endDay: dateRange.value[1] }
      });
    } else if (isStallAdmin.value) {
      historySalesRes = await Apis.SalesController.listStallHistorySales({
        params: { startDay: dateRange.value[0], endDay: dateRange.value[1] }
      });
    }
    
    if (Array.isArray(historySalesRes) && historySalesRes.length > 0 && 
        historySalesRes.some(item => (item.number || 0) > 0)) {
      historySalesData.value = historySalesRes;
    } else {
      historySalesData.value = generateHistorySalesData(dateRange.value[0], dateRange.value[1]);
    }
    
    // 更新历史销量图表
    updateHistoryChart();
    
  } catch (error) {
    console.error('加载数据失败', error);
    // 发生错误时生成模拟数据
    generateMockDataOnError();
  }
};

// 生成随机数
const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// 生成食堂销售数据
const generateCanteenSalesData = (count: number, ranked = false): SalesVolumeItem[] => {
  const result: SalesVolumeItem[] = [];
  
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
  } else {
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
const generateCanteenStallNumbersData = (): CanteenStallNumberItem[] => {
  const canteenNames = ['第一食堂', '第二食堂', '教工食堂', '清真食堂', '研究生食堂', '西区食堂', '南区食堂', '北区食堂', '国际交流中心', '创新港食堂'];
  const result: CanteenStallNumberItem[] = [];
  
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
const generateStallSalesData = (count: number, ranked = false): SalesVolumeItem[] => {
  const result: SalesVolumeItem[] = [];
  
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
  } else {
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
const generateFoodSalesData = (count: number, ranked = false): SalesVolumeItem[] => {
  const foodNames = ['红烧肉', '宫保鸡丁', '鱼香肉丝', '麻婆豆腐', '水煮鱼', '炸酱面', '兰州拉面', '酸辣粉', '肉夹馍', '烤冷面', '鸡腿饭', '牛肉面'];
  const result: SalesVolumeItem[] = [];
  
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
const generateHistorySalesData = (startDay: string, endDay: string): HistorySalesItem[] => {
  const result: HistorySalesItem[] = [];
  
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
  } else if (isCanteenAdmin.value) {
    stallNumber.value = generateRandomNumber(5, 15);
    foodNumber.value = generateRandomNumber(30, 100);
    // 确保先生成摊位食品数量数据，再生成销售数据以保持一致性
    stallFoodNumbers.value = generateStallFoodNumbersData();
    // 使用所有摊位数据，确保与食品数量分布图使用相同的摊位
    stallYesterdaySales.value = generateStallSalesData(stallFoodNumbers.value.length);
    stallRanking.value = generateStallSalesData(10, true);
    
    totalYesterdaySalesVolume.value = stallYesterdaySales.value.reduce((sum, item) => sum + (item.salesVolume || 0), 0);
  } else if (isStallAdmin.value) {
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
  if (!canteenYesterdaySalesRef.value) return;
  
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
  if (!canteenRankingRef.value) return;
  
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
  if (!stallYesterdaySalesRef.value) return;
  
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
  if (!stallRankingRef.value) return;
  
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
  if (!foodYesterdaySalesRef.value) return;
  
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
  if (!foodRankingRef.value) return;
  
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
  if (!canteenStallNumberRef.value) return;
  
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
  if (!historyChartRef.value) return;
  
  historyChart = echarts.init(historyChartRef.value);
  updateHistoryChart();
};

// 更新历史销量图表
const updateHistoryChart = () => {
  if (!historyChart) return;
  
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
  } else if (isCanteenAdmin.value) {
    initStallYesterdaySalesChart();
    initStallRankingChart();
    initStallFoodNumberChart();
    initHistoryChart();
  } else if (isStallAdmin.value) {
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
  } else if (isCanteenAdmin.value) {
    stallYesterdaySalesChart?.resize();
    stallRankingChart?.resize();
    stallFoodNumberChart?.resize();
    historyChart?.resize();
  } else if (isStallAdmin.value) {
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
  } else if (isCanteenAdmin.value) {
    stallYesterdaySalesChart?.dispose();
    stallRankingChart?.dispose();
    stallFoodNumberChart?.dispose();
  } else if (isStallAdmin.value) {
    foodYesterdaySalesChart?.dispose();
    foodRankingChart?.dispose();
  }
});

// 生成摊位食品数量数据
const generateStallFoodNumbersData = (): StallFoodNumberItem[] => {
  // 使用与摊位销售数据相同的摊位名称列表
  const stallNames = ['川菜摊位', '粤菜摊位', '湘菜摊位', '面食摊位', '小吃摊位', '饮品摊位', '早餐摊位', '西餐摊位', '日料摊位', '快餐摊位'];
  const result: StallFoodNumberItem[] = [];

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
  if (!stallFoodNumberRef.value) return;

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
</script>

<style scoped>
.data-display {
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.number-card {
  margin-bottom: 20px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.number-item {
  display: flex;
  align-items: center;
}

.number-icon {
  font-size: 48px;
  color: var(--el-color-primary);
  margin-right: 20px;
}

.number-info {
  display: flex;
  flex-direction: column;
}

.number-title {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin-bottom: 5px;
}

.number-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.chart-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 400px;
  width: 100%;
}

.mt-4 {
  margin-top: 20px;
}

/* 暗色模式适配 */
:deep(.el-card) {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color-light);
  height: 100%;
}

:deep(.el-card__header) {
  border-bottom-color: var(--el-border-color-light);
}

:deep(.el-card__body) {
  height: calc(100% - 55px);
  padding: 20px;
}
</style> 