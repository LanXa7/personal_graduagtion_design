<template>
  <div class="order-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">订单管理</span>
          <div class="button-group">
            <el-button type="info" @click="clearFilters" class="action-button">
              <el-icon>
                <Refresh/>
              </el-icon>
              清空筛选
            </el-button>
          </div>
        </div>
      </template>

      <div class="filter-row mb-4">
        <el-select v-model="filterCanteenId" placeholder="选择食堂" clearable @change="handleCanteenChange" class="filter-select" v-if="isSuperAdmin">
          <el-option
            v-for="canteen in canteenList"
            :key="canteen.id || 0"
            :label="canteen.name"
            :value="canteen.id"
          />
        </el-select>
        <el-select v-model="filterStallId" placeholder="选择摊位" clearable @change="fetchOrders" class="filter-select" v-if="isSuperAdmin || isCanteenAdmin">
          <el-option
            v-for="stall in stallList"
            :key="stall.id || 0"
            :label="stall.name"
            :value="stall.id"
          />
        </el-select>
        <el-select v-model="filterState" placeholder="订单状态" clearable @change="fetchOrders" class="filter-select">
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已取消" :value="2" />
        </el-select>
        
        <!-- 优化后的日期选择器 -->
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          @change="fetchOrders"
          :disabled-date="disabledDate"
          class="date-picker"
          :clearable="true"
          :editable="true"
        />
      </div>

      <el-table :data="orderList" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="序号" width="80" align="center">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="code" label="订单编号" align="center"/>
        <el-table-column prop="totalPrice" label="总价" align="center">
          <template #default="scope">
            ¥{{ scope.row.totalPrice?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="订单状态" align="center">
          <template #default="scope">
            <el-tag :type="getOrderStateType(scope.row.state)">
              {{ getOrderStateName(scope.row.state) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属摊位" align="center">
          <template #default="scope">
            {{ scope.row.stall?.name || '未分配' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template #default="scope">
            <bei-jing-time :time="scope.row.createTime"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button size="small" type="primary" @click="handleViewOrder(scope.row)" class="operation-button">
                查看详情
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="orderDetailVisible"
      title="订单详情"
      width="800px"
    >
      <div class="order-detail">
        <div class="order-header">
          <div class="order-info">
            <p><strong>订单编号：</strong>{{ currentOrder?.code }}</p>
            <p><strong>创建时间：</strong><bei-jing-time :time="currentOrder?.createTime" format="YYYY-MM-DD HH:mm:ss"/></p>
            <p><strong>订单状态：</strong>
              <el-tag :type="getOrderStateType(currentOrder?.state)">
                {{ getOrderStateName(currentOrder?.state) }}
              </el-tag>
            </p>
          </div>
        </div>
        
        <!-- 添加订单图片显示 -->
        <div class="order-image" v-if="currentOrder?.picture">
          <el-image 
            :src="`/api/images${currentOrder.picture}`" 
            :preview-src-list="[`/api/images${currentOrder.picture}`]"
            fit="contain"
            class="order-image-preview"
            :preview-teleported="true"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>图片加载失败</span>
              </div>
            </template>
          </el-image>
        </div>
        
        <div class="order-items">
          <el-table :data="currentOrder?.orderItems" stripe>
            <el-table-column prop="food.name" label="餐品名称" align="center"/>
            <el-table-column prop="totalNumber" label="数量" align="center"/>
            <el-table-column prop="totalPrice" label="总价" align="center">
              <template #default="scope">
                ¥{{ scope.row.totalPrice?.toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="order-footer">
          <div class="order-total">
            <span>总计：</span>
            <span class="price">¥{{ currentOrder?.totalPrice?.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Calendar, Plus, Refresh, Picture } from '@element-plus/icons-vue';
import Apis, {alovaInstance} from '@/alova';
import BeiJingTime from '@/components/BeiJingTime.vue';
import { useStore } from '@/store';
import type { 
  Canteen_CanteenService_CANTEEN_FETCHER,
  Stall_StallService_STALL_FETCHER,
  Dynamic_Order
} from '@/alova/globals';

const store = useStore();
const orderList = ref<Dynamic_Order[]>([]);
const canteenList = ref<Canteen_CanteenService_CANTEEN_FETCHER[]>([]);
const stallList = ref<Stall_StallService_STALL_FETCHER[]>([]);
const loading = ref(false);
const orderDetailVisible = ref(false);
const currentOrder = ref<Dynamic_Order | null>(null);
const filterCanteenId = ref<number | null>(null);
const filterStallId = ref<number | null>(null);
const filterState = ref<number | null>(null);
const dateRange = ref<[string, string] | null>(null);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 日期选择器的快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date();
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date();
      return [start, end];
    },
  },
  {
    text: '昨天',
    value: () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const end = new Date(yesterday);
      end.setHours(23, 59, 59, 999);
      return [yesterday, end];
    },
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '本月',
    value: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return [start, now];
    },
  },
  {
    text: '上月',
    value: () => {
      const now = new Date();
      const lastMonthLastDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      const lastMonthFirstDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      return [lastMonthFirstDate, lastMonthLastDate];
    },
  },
];

// 禁用未来日期
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now();
};

// 根据用户角色预设筛选条件
onMounted(async () => {
  console.log('OrderManagement component mounted');
  
  try {
    // 根据用户角色决定需要获取的数据
    if (isStallAdmin.value) {
      // 摊位管理员只需要获取订单列表
      await fetchOrders();
    } else if (isCanteenAdmin.value) {
      // 食堂管理员需要获取摊位列表和订单列表
      await Promise.all([fetchStalls(), fetchOrders()]);
    } else {
      // 超级管理员需要获取食堂、摊位和订单列表
      await Promise.all([fetchCanteens(), fetchStalls(), fetchOrders()]);
    }
    
    console.log('Initial data loaded successfully');
  } catch (error) {
    console.error('Error during component initialization:', error);
    ElMessage.error('初始化页面数据失败，请刷新重试');
  }
});

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true;
  try {
    const data = await alovaInstance.Get<{
      rows: Dynamic_Order[];
      totalRowCount: number;
    }>('/order/page',{
      params: {
        pageIndex: currentPage.value - 1,
        pageSize: pageSize.value,
        canteenId: filterCanteenId.value || undefined,
        stallId: filterStallId.value || undefined,
        orderState: filterState.value !== null ? filterState.value : undefined,
        startDay: dateRange.value?.[0] ? dateRange.value[0].split(' ')[0] : undefined,
        endDay: dateRange.value?.[1] ? dateRange.value[1].split(' ')[0] : undefined
      }
    });
    
    orderList.value = data.rows || [];
    total.value = data.totalRowCount || 0;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取食堂列表
const fetchCanteens = async () => {
  // 只有超级管理员需要获取食堂列表
  if (!isSuperAdmin.value) {
    return;
  }
  
  try {
    const data = await Apis.CanteenController.listCanteen();
    canteenList.value = data || [];
  } catch (error) {
    console.error('获取食堂列表失败:', error);
    ElMessage.error('获取食堂列表失败');
  }
};

// 获取摊位列表
const fetchStalls = async () => {
  // 摊位管理员不需要获取摊位列表
  if (isStallAdmin.value) {
    return;
  }
  
  try {
    const data = await Apis.StallController.listStall();
    stallList.value = data || [];
  } catch (error) {
    console.error('获取摊位列表失败:', error);
    ElMessage.error('获取摊位列表失败');
  }
};

// 处理食堂选择变化
const handleCanteenChange = () => {
  filterStallId.value = null;
  if (filterCanteenId.value) {
    fetchStalls();
  } else {
    stallList.value = [];
  }
  fetchOrders();
};

// 查看订单详情
const handleViewOrder = async (order: Dynamic_Order) => {
  try {
    // 获取完整的订单详情，包括订单项
    const data = await Apis.OrderController.getOrderItem({
      pathParams: { id: order.id || 0 }
    });
    currentOrder.value = data;
    orderDetailVisible.value = true;
  } catch (error) {
    ElMessage.error('获取订单详情失败');
    console.error(error);
  }
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchOrders();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchOrders();
};

// 获取订单状态文本
const getOrderStateName = (state: number | undefined) => {
  if (state === undefined) return '未知状态';
  const stateMap: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已取消'
  };
  return stateMap[state] || '未知状态';
};

// 获取订单状态类型
const getOrderStateType = (state: number | undefined) => {
  if (state === undefined) return 'info';
  const typeMap: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  };
  return typeMap[state] || 'info';
};

// 检查用户角色
const isSuperAdmin = computed(() => {
  if (!store.user || !store.user.roles) {
    return false;
  }
  return store.user.roles.includes('super_admin');
});

const isCanteenAdmin = computed(() => {
  if (!store.user || !store.user.roles) {
    return false;
  }
  return store.user.roles.includes('canteen_admin');
});

const isStallAdmin = computed(() => {
  if (!store.user || !store.user.roles) {
    return false;
  }
  return store.user.roles.includes('stall_admin');
});

// 获取当前用户管理的摊位
const getUserStall = async () => {
  try {
    const data = await Apis.StallController.listStall();
    const userStall = (data || []).find(stall => 
      stall.user && stall.user.id === store.user?.id
    );
    return userStall;
  } catch (error) {
    console.error('获取用户摊位失败:', error);
    ElMessage.error('获取用户摊位失败');
    return null;
  }
};

// 清空筛选条件
const clearFilters = () => {
  filterCanteenId.value = null;
  filterStallId.value = null;
  filterState.value = null;
  dateRange.value = null;
  currentPage.value = 1;
  fetchOrders();
};
</script>

<style scoped>
.order-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.box-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.card-header .font-bold {
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.button-group .action-button {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.button-group .action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.button-group .action-button .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
  height: 50px;
  text-align: center;
}

:deep(.el-table td) {
  padding: 8px 0;
  text-align: center;
}

:deep(.el-table .cell) {
  padding: 0 8px;
}

.operation-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
}

.operation-button {
  min-width: 70px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.operation-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-table .operation-buttons) {
  padding: 4px 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  margin: 0;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}

.order-detail {
  padding: 20px 0;
}

.order-header {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.order-info strong {
  color: #303133;
  margin-right: 8px;
}

.order-items {
  margin-bottom: 20px;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.order-total {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  margin-left: 8px;
}

.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  width: 180px;
}

.date-picker {
  width: 360px;
}

:deep(.el-select) {
  width: 180px;
}

:deep(.el-input__inner) {
  height: 32px;
  line-height: 32px;
}

:deep(.el-input-group__append) {
  padding: 0 12px;
}

:deep(.el-input-group__append .el-button) {
  margin: 0;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
}

:deep(.el-date-editor) {
  width: 360px;
}

:deep(.el-date-editor .el-input__inner) {
  height: 32px;
  line-height: 32px;
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