<template>
  <div class="food-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">菜品管理</span>
          <div class="button-group">
            <el-button type="primary" @click="handleAddDish" class="action-button">
              <el-icon>
                <Plus/>
              </el-icon>
              新增菜品
            </el-button>
          </div>
        </div>
      </template>
      <div class="filter-row">
        <div class="filter-left">
          <el-select v-model="filterCanteenId" placeholder="选择食堂" clearable @change="handleCanteenChange" class="filter-select" v-if="isSuperAdmin">
            <el-option
              v-for="canteen in canteenList"
              :key="canteen.id || 0"
              :label="canteen.name"
              :value="canteen.id"
            />
          </el-select>
          <el-select v-model="filterStallId" placeholder="选择摊位" clearable @change="fetchFoods" class="filter-select" v-if="!isStallAdmin" :disabled="!filterCanteenId">
            <el-option
              v-for="stall in stallList"
              :key="stall.id || 0"
              :label="stall.name"
              :value="stall.id"
            />
          </el-select>
        </div>
        <div class="filter-right">
          <el-input 
            v-model="filterFoodName" 
            placeholder="搜索菜品名称" 
            clearable
            @clear="fetchFoods"
            class="filter-input"
          >
            <template #append>
              <el-button @click="fetchFoods">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
      <el-table :data="foodList" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="菜品名称" min-width="100" align="center"/>
        <el-table-column prop="code" label="菜品编码" min-width="80" align="center"/>
        <el-table-column prop="price" label="价格" min-width="160" align="center">
          <template #default="scope">
                        <div class="price-control">              <el-button                 type="primary"                 size="small"                 circle                 @click="handlePriceChange(scope.row, -1)"                class="price-button price-button-mini"               >                <el-icon><Minus /></el-icon>              </el-button>              <el-popover
                placement="top"
                :width="200"
                trigger="click"
                v-model:visible="scope.row.priceEditing"
              >
                <template #reference>
                  <span class="price-value clickable">¥{{ scope.row.price?.toFixed(2) }}</span>
                </template>
                <div class="price-edit-form">
                  <el-input-number 
                    v-model="scope.row.editingPrice" 
                    :min="0" 
                    :precision="2" 
                    :step="0.1" 
                    size="small"
                    style="width: 100%;"
                  />
                  <div class="price-edit-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="saveEditedPrice(scope.row)"
                    >
                      保存
                    </el-button>
                    <el-button 
                      size="small" 
                      @click="scope.row.priceEditing = false"
                    >
                      取消
                    </el-button>
                  </div>
                                </div>              </el-popover>              <el-button                 type="primary"                 size="small"                 circle                 @click="handlePriceChange(scope.row, 1)"                class="price-button price-button-mini"               >                <el-icon><Plus /></el-icon>              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="70" align="center">
          <template #default="scope">
            <el-image
              v-if="scope.row.picture"
              style="width: 50px; height: 50px"
              :src="scope.row.picture ? `/api/images${scope.row.picture}` : ''"
              :preview-src-list="scope.row.picture ? [`/api/images${scope.row.picture}`] : []"
            />
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="120" align="center" :show-overflow-tooltip="true"/>
        <el-table-column label="所属摊位" min-width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.stall" type="info" size="small">
              {{ scope.row.stall.name }}
            </el-tag>
            <span v-else>未分配</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="120" align="center">
          <template #default="scope">
            <bei-jing-time :time="scope.row.createTime"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" align="center">
          <template #default="scope">
            <div class="operation-buttons">              <el-button size="small" type="primary" @click="handleEdit(scope.row)" class="operation-button">                编辑              </el-button>              <el-button size="small" type="danger" @click="handleDelete(scope.row)" class="operation-button">                删除              </el-button>            </div>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜品' : '新增菜品'"
      width="500px"
    >
      <el-form :model="foodForm" label-width="100px" :rules="rules" ref="foodFormRef">
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="foodForm.name" placeholder="请输入菜品名称"/>
        </el-form-item>
        <el-form-item label="菜品编码" prop="code">
          <el-input v-model="foodForm.code" placeholder="请输入菜品编码"/>
        </el-form-item>
        <el-form-item label="所属食堂" prop="canteenId" v-if="isSuperAdmin">
          <el-select v-model="foodForm.canteenId" placeholder="请选择所属食堂" style="width: 100%" @change="handleCanteenChange">
            <el-option
              v-for="canteen in canteenList"
              :key="canteen.id"
              :label="canteen.name"
              :value="canteen.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属摊位" prop="stallId" v-if="!isStallAdmin">
          <el-select v-model="foodForm.stallId" placeholder="请选择所属摊位" style="width: 100%" @change="handleStallChange">
            <el-option
              v-for="stall in stallList"
              :key="stall.id"
              :label="stall.name"
              :value="stall.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="foodForm.price" :min="0" :precision="2" :step="0.1" style="width: 100%"/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="foodForm.description" type="textarea" placeholder="请输入菜品描述"/>
        </el-form-item>
        <el-form-item label="图片" prop="picture">
          <el-upload
            class="dish-uploader"
            action="/api/food/picture"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
            :headers="accessHeader()"
            :data="{
              ...(foodForm.stallId ? { stallId: foodForm.stallId } : {}),
              ...(currentFoodId ? { id: currentFoodId } : {})
            }"
            accept="image/*"
          >
            <el-image
              v-if="foodForm.picture"
              :src="foodForm.picture ? `/api/images${foodForm.picture}` : ''"
              class="dish-image"
              fit="cover"
            />
            <el-icon v-else class="dish-uploader-icon"><Plus/></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveFood">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElNotification, FormInstance, ElMessageBox } from 'element-plus';
import { Plus, Minus, Edit, Delete } from '@element-plus/icons-vue';
import Apis from '@/alova';
import { useStore } from '@/store';
import { accessHeader } from '@/utils/auth';
import type { 
  Canteen_CanteenService_CANTEEN_FETCHER,
  Stall_StallService_STALL_FETCHER,
  Dynamic_Food,
  FoodSaveInput
} from '@/alova/globals';
import BeiJingTime from "@/components/BeiJingTime.vue";

const store = useStore();

const foodFormRef = ref<FormInstance>();
const foodList = ref<Dynamic_Food[]>([]);
const canteenList = ref<Canteen_CanteenService_CANTEEN_FETCHER[]>([]);
const stallList = ref<Stall_StallService_STALL_FETCHER[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentFoodId = ref<number | null>(null);
const filterCanteenId = ref<number | null>(null);
const filterStallId = ref<number | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);
const filterFoodName = ref('');
const total = ref(0);

const foodForm = reactive({
  name: '',
  code: '',
  price: 0,
  picture: '',
  description: '',
  stallId: null as number | null,
  canteenId: null as number | null
});

const rules = {
  name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入菜品编码', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'change' }],
  stallId: [{ required: true, message: '请选择所属摊位', trigger: 'change' }],
  picture: [{ required: true, message: '请上传菜品图片', trigger: 'change' }],
  canteenId: [{ required: true, message: '请选择所属食堂', trigger: 'change' }]
};

// 判断当前用户是否是超级管理员
const isSuperAdmin = computed(() => {
  if (!store.user || !store.user.roles) {
    return false;
  }
  return store.user.roles.includes('super_admin');
});

// 判断当前用户是否是食堂管理员
const isCanteenAdmin = computed(() => {
  if (!store.user || !store.user.roles) {
    return false;
  }
  return store.user.roles.includes('canteen_admin');
});

// 判断当前用户是否是摊位管理员
const isStallAdmin = computed(() => {
  if (!store.user || !store.user.roles) {
    return false;
  }
  return store.user.roles.includes('stall_admin');
});

// 获取食堂列表
const fetchCanteens = async () => {
  // 摊位管理员和食堂管理员不需要获取食堂列表
  if (isStallAdmin.value || isCanteenAdmin.value) {
    return;
  }
  
  try {
    const data = await Apis.CanteenController.listCanteen();
    canteenList.value = data || [];
  } catch (error) {
    ElMessage.error('获取食堂列表失败');
    console.error(error);
  }
};

// 获取摊位列表
const fetchStalls = async () => {
  // 摊位管理员不需要获取摊位列表
  if (isStallAdmin.value) {
    return;
  }
  
  try {
    const response = await Apis.StallController.listStall();
    stallList.value = response;
  } catch (error) {
    console.error('获取摊位列表失败:', error);
    ElMessage.error('获取摊位列表失败');
  }
};

// 获取指定食堂的摊位列表
const fetchStallsByCanteen = async (canteenId: number) => {
  // 摊位管理员不需要获取摊位列表
  if (isStallAdmin.value) {
    return;
  }
  
  try {
    const data = await Apis.StallController.listStall();
    // 在前端过滤出指定食堂的摊位
    stallList.value = (data || []).filter(stall => 
      stall.canteen && stall.canteen.id === canteenId
    );
    // 如果当前选择的摊位不在过滤后的列表中，清空选择
    if (filterStallId.value && !stallList.value.some(stall => stall.id === filterStallId.value)) {
      filterStallId.value = null;
    }
  } catch (error) {
    console.error('获取摊位列表失败:', error);
    ElMessage.error('获取摊位列表失败');
  }
};

// 获取当前用户管理的摊位
const getUserStall = async () => {
  try {
    // 获取所有摊位,在前端过滤
    const data = await Apis.StallController.listStall();
    const userStall = (data || []).find(stall => 
      stall.user && stall.user.id === store.user?.id
    );
    
    if (userStall) {
      foodForm.stallId = userStall.id || null;
      foodForm.canteenId = userStall.canteen?.id || null;
      // 如果是摊位管理员,直接设置过滤条件
      if (isStallAdmin.value) {
        filterStallId.value = userStall.id;
        filterCanteenId.value = userStall.canteen?.id || null;
      }
    }
    return userStall;
  } catch (error) {
    console.error('获取用户摊位失败:', error);
    ElMessage.error('获取用户摊位失败');
    return null;
  }
};

// 获取菜品列表
const fetchFoods = async () => {
  loading.value = true;
  try {
    const data = await Apis.FoodController.pageFood({
      params: {
        pageIndex: currentPage.value - 1,
        pageSize: pageSize.value,
        canteenId: filterCanteenId.value || undefined,
        stallId: filterStallId.value || undefined,
        foodName: filterFoodName.value || undefined
      }
    });
    // 为每个菜品添加编辑价格需要的属性
    foodList.value = (data.rows || []).map(food => {
      return {
        ...food,
        priceEditing: false,
        editingPrice: food.price || 0
      };
    });
    total.value = data.totalRowCount || 0;
  } catch (error) {
    ElMessage.error('获取菜品列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 处理食堂选择变化
const handleCanteenChange = (canteenId: number | null) => {
  foodForm.stallId = null;
  // 清空摊位选择
  filterStallId.value = null;
  if (canteenId) {
    // 获取该食堂下的摊位列表
    fetchStallsByCanteen(canteenId);
  } else {
    stallList.value = [];
  }
  fetchFoods();
};

// 添加菜品
const handleAddDish = async () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
  
  // 根据用户角色决定需要获取的数据
  if (isStallAdmin.value) {
    // 摊位管理员不需要获取任何列表，也不需要设置摊位ID
    // 不做任何处理
  } else if (isCanteenAdmin.value) {
    // 食堂管理员需要获取摊位列表
    await fetchStalls();
  } else {
    // 超级管理员需要获取所有食堂和摊位列表
    await Promise.all([fetchCanteens(), fetchStalls()]);
  }
};

// 编辑菜品
const handleEdit = (row: Dynamic_Food) => {
  isEdit.value = true;
  currentFoodId.value = row.id || null;
  foodForm.name = row.name || '';
  foodForm.code = row.code || '';
  foodForm.price = row.price || 0;
  foodForm.picture = row.picture || '';
  foodForm.description = row.description || '';
  foodForm.stallId = row.stall ? row.stall.id : null;
  dialogVisible.value = true;
};

// 删除菜品
const handleDelete = async (row: Dynamic_Food) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await Apis.FoodController.deleteFood({
      pathParams: { id: row.id || 0 }
    });
    
    ElMessage.success('删除成功');
    fetchFoods();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error(error);
    }
  }
};

// 图片上传前处理
const beforeImageUpload = (file: File) => {
  // 非摊位管理员需要先选择摊位
  if (!isStallAdmin.value && !foodForm.stallId) {
    ElMessage.error('请先选择所属摊位！');
    return false;
  }

  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isLt200M = file.size / 1024 / 1024 < 200;

  if (!isJPG && !isPNG) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt200M) {
    ElMessage.error('上传图片大小不能超过 200MB!');
    return false;
  }
  return true;
};

// 图片上传成功处理
const handleImageSuccess = (response: any) => {
  if (response) {
    foodForm.picture = response;
    // 触发表单验证
    if (foodFormRef.value) {
      foodFormRef.value.validateField('picture');
    }
    ElMessage.success('图片上传成功');
  }
};

// 处理摊位选择变化
const handleStallChange = (stallId: number | null) => {
  foodForm.stallId = stallId;
  // 触发表单验证
  if (foodFormRef.value) {
    foodFormRef.value.validateField('stallId');
  }
};

// 保存菜品信息
const saveFood = async () => {
  if (!foodFormRef.value) return;

  await foodFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && currentFoodId.value) {
          await Apis.FoodController.updateFood({
            pathParams: { id: currentFoodId.value },
            data: foodForm as FoodSaveInput
          });
          ElNotification({
            title: '成功',
            message: '菜品信息更新成功',
            type: 'success'
          });
        } else {
          await Apis.FoodController.createFood({
            data: foodForm as FoodSaveInput
          });
          ElNotification({
            title: '成功',
            message: '菜品添加成功',
            type: 'success'
          });
        }
        dialogVisible.value = false;
        fetchFoods();
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新菜品信息失败' : '添加菜品失败');
        console.error(error);
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  foodForm.name = '';
  foodForm.code = '';
  foodForm.price = 0;
  foodForm.picture = '';
  foodForm.description = '';
  foodForm.stallId = null;
  foodForm.canteenId = null;
  currentFoodId.value = null;
};

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchFoods();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchFoods();
};

// 处理价格变化
const handlePriceChange = async (row: Dynamic_Food & { priceEditing?: boolean; editingPrice?: number }, change: number) => {
  // 计算新价格，确保不小于0
  const currentPrice = row.price || 0;
  const newPrice = Math.max(0, currentPrice + change);
  
  // 如果价格没有变化，则不发送请求
  if (newPrice === currentPrice) {
    if (change < 0) {
      ElMessage.warning('价格已经是最低值');
    }
    return;
  }
  
  try {
    await Apis.FoodController.updateFoodPrice({
      pathParams: { id: row.id || 0 },
      params: {
        price: newPrice
      }
    });
    // 直接更新本地数据，避免重新请求
    row.price = newPrice;
    // 同时更新编辑中的价格
    if (row.editingPrice !== undefined) {
      row.editingPrice = newPrice;
    }
    ElMessage.success('价格更新成功');
  } catch (error) {
    ElMessage.error('更新价格失败');
    console.error(error);
  }
};

// 保存编辑后的价格
const saveEditedPrice = async (row: Dynamic_Food & { priceEditing?: boolean; editingPrice?: number }) => {
  if (row.editingPrice === undefined) return;
  
  try {
    await Apis.FoodController.updateFoodPrice({
      pathParams: { id: row.id || 0 },
      params: {
        price: row.editingPrice
      }
    });
    // 直接更新本地数据，避免重新请求
    row.price = row.editingPrice;
    // 关闭编辑状态
    row.priceEditing = false;
    ElMessage.success('价格更新成功');
  } catch (error) {
    ElMessage.error('更新价格失败');
    console.error(error);
  }
};

onMounted(() => {
  // 根据用户角色决定需要获取的数据
  if (isStallAdmin.value) {
    // 摊位管理员只需要获取菜品列表
  fetchFoods();
  } else if (isCanteenAdmin.value) {
    // 食堂管理员需要获取摊位列表和菜品列表
    Promise.all([fetchStalls(), fetchFoods()]);
  } else {
    // 超级管理员需要获取所有食堂和摊位列表
    Promise.all([fetchCanteens(), fetchStalls(), fetchFoods()]);
  }
});
</script>

<style scoped>
.food-management {  padding: 20px;  background-color: #f5f7fa;  min-height: calc(100vh - 60px);  box-sizing: border-box;}.box-card {  border-radius: 8px;  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);  margin-bottom: 20px;  overflow: hidden;  width: 100%;}

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

:deep(.el-table) {  border-radius: 8px;  overflow: hidden;  width: 100% !important;  table-layout: fixed;}:deep(.el-table th) {  background-color: #f5f7fa !important;  color: #606266;  font-weight: 600;  height: 50px;  text-align: center;}:deep(.el-table td) {  padding: 8px 0;  text-align: center;}:deep(.el-table .cell) {  padding: 0 8px;  word-break: break-word;  white-space: normal;}:deep(.el-table__body-wrapper) {  overflow-x: hidden;}

.operation-buttons {  display: flex;  gap: 6px;  justify-content: center;  align-items: center;}.operation-button {  min-width: 70px;  height: 28px;  padding: 0 10px;  font-size: 12px;  border-radius: 4px;  transition: all 0.3s ease;}:deep(.el-table .operation-buttons) {  padding: 4px 0;}

.operation-button:hover {
  transform: scale(1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__inner) {
  border-radius: 4px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

.filter-row {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-left {
  display: flex;
  gap: 12px;
}

.filter-right {
  display: flex;
  gap: 12px;
}

.filter-select {
  width: 180px;
}

.filter-input {
  width: 220px;
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

.dish-uploader {
  width: 300px;
  height: 300px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dish-uploader:hover {
  border-color: var(--el-color-primary);
}

.dish-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-uploader-icon {
  font-size: 48px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

:deep(.el-image-viewer__wrapper) {
  z-index: 3000;
}

:deep(.el-image-viewer__mask) {
  background-color: rgba(0, 0, 0, 0.5);
}

:deep(.el-image-viewer__btn) {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

:deep(.el-image-viewer__canvas) {
  max-width: 80vw;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-control {  display: flex;  align-items: center;  justify-content: center;  flex-wrap: nowrap;}.price-button {  margin: 0 2px;}.price-button-mini {  transform: scale(0.75);  height: 22px;  width: 22px;}.price-value {  margin: 0 3px;  font-weight: 500;  font-size: 13px;}

.price-edit-form {
  padding: 10px;
}

.price-edit-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.clickable {
  cursor: pointer;
  color: #409EFF;
  text-decoration: underline;
  text-decoration-style: dotted;
}
</style> 