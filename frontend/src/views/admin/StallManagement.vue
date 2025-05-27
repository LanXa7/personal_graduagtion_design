<template>
  <div class="stall-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">摊位管理</span>
          <div class="button-group">
            <el-button type="primary" @click="handleAddStall" class="action-button">
              <el-icon>
                <Plus/>
              </el-icon>
              新增摊位
            </el-button>
          </div>
        </div>
      </template>
      <div class="filter-row">
        <div class="filter-left">
          <el-select v-if="isSuperAdmin" v-model="filterCanteenId" placeholder="选择食堂" clearable @change="handleCanteenChange" class="filter-select">
          <el-option
            v-for="canteen in canteenList"
            :key="canteen.id || 0"
            :label="canteen.name"
            :value="canteen.id"
          />
        </el-select>
        </div>
        <div class="filter-right">
          <el-input 
            v-model="filterStallName" 
            placeholder="搜索摊位名称" 
            clearable
            @clear="fetchStalls"
            class="filter-input"
          >
            <template #append>
              <el-button @click="fetchStalls">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
      <el-table :data="stallList" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="序号" width="80" align="center">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="摊位名称" align="center"/>
        <el-table-column prop="directorName" label="负责人" align="center"/>
        <el-table-column prop="directorPhone" label="联系电话" align="center"/>
        <el-table-column label="所属食堂" align="center">
          <template #default="scope">
            {{ scope.row.canteen?.name || '未分配' }}
          </template>
        </el-table-column>
        <el-table-column label="管理员" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.user" type="success">
              {{ scope.row.user.username }}
            </el-tag>
            <el-tag v-else type="info">
              未分配
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template #default="scope">
            <bei-jing-time :time="scope.row.createTime"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="360" fixed="right" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)" class="operation-button">
                编辑
              </el-button>
              <el-button size="small" type="success" @click="handleAllocation(scope.row)" class="operation-button">
                分配管理员
              </el-button>
              <el-button size="small" type="danger" @click="handleDeleteStall(scope.row)" class="operation-button">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页控件 -->
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

    <!-- 添加/编辑摊位对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑摊位' : '新增摊位'"
      width="500px"
    >
      <el-form :model="stallForm" label-width="100px" :rules="rules" ref="stallFormRef">
        <el-form-item label="摊位名称" prop="name">
          <el-input v-model="stallForm.name" placeholder="请输入摊位名称"/>
        </el-form-item>
        <el-form-item label="所属食堂" prop="canteenId" v-if="isSuperAdmin">
          <el-select v-model="stallForm.canteenId" placeholder="请选择所属食堂" style="width: 100%">
            <el-option
              v-for="canteen in canteenList"
              :key="canteen.id"
              :label="canteen.name"
              :value="canteen.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="directorName">
          <el-input v-model="stallForm.directorName" placeholder="请输入负责人姓名"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="directorPhone">
          <el-input v-model="stallForm.directorPhone" placeholder="请输入联系电话"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveStall">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配管理员对话框 -->
    <el-dialog
      v-model="allocationDialogVisible"
      title="分配管理员"
      width="500px"
    >
      <el-form :model="allocationForm" label-width="100px">
        <el-form-item label="管理员">
          <el-select v-model="allocationForm.userId" placeholder="请选择管理员">
            <el-option
              v-for="user in userList"
              :key="user.id || 0"
              :label="user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="allocationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAllocation">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElNotification, FormInstance } from 'element-plus';
import Apis from '@/alova';
import { useStore } from '@/store';
import type { 
  Canteen_CanteenService_CANTEEN_FETCHER,
  Stall_StallService_STALL_FETCHER,
  Page_Stall_StallService_STALL_FETCHER,
  StallSaveInput,
  Page_Dynamic_User
} from '@/alova/globals';
import BeiJingTime from '@/components/BeiJingTime.vue';
import { Plus } from '@element-plus/icons-vue';

const store = useStore();
const stallFormRef = ref<FormInstance>();
const stallList = ref<Stall_StallService_STALL_FETCHER[]>([]);
const canteenList = ref<Canteen_CanteenService_CANTEEN_FETCHER[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const allocationDialogVisible = ref(false);
const isEdit = ref(false);
const userList = ref<any[]>([]);
const currentStallId = ref<number | null>(null);
const filterCanteenId = ref<number | null>(null);
const filterStallName = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogType = ref('add');

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

const stallForm = reactive({
  name: '',
  directorName: '',
  directorPhone: '',
  canteenId: undefined as number | undefined
});

const allocationForm = reactive({
  userId: undefined as number | undefined
});

const rules = {
  name: [{ required: true, message: '请输入摊位名称', trigger: 'blur' }],
  directorName: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
  directorPhone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  canteenId: [{ required: true, message: '请选择所属食堂', trigger: 'change' }]
};

// 获取摊位列表
const fetchStalls = async () => {
  loading.value = true;
  try {
    const data = await Apis.StallController.pageStall({
      params: {
        pageIndex: currentPage.value - 1,
        pageSize: pageSize.value,
        canteenId: filterCanteenId.value || undefined,
        stallName: filterStallName.value || undefined
      }
    });
    
    stallList.value = data.rows || [];
    total.value = data.totalRowCount || 0;
  } catch (error) {
    console.error('获取摊位列表失败:', error);
    ElMessage.error('获取摊位列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取食堂列表
const fetchCanteens = async () => {
  // 食堂管理员不需要获取食堂列表
  if (isCanteenAdmin.value) {
    try {
      // 直接获取用户管理的摊位，从中提取食堂ID
      const data = await Apis.StallController.listStall();
      const userCanteens = (data || [])
        .filter(stall => stall.canteen)
        .map(stall => stall.canteen)
        .filter((canteen, index, self) => 
          canteen && self.findIndex(c => c.id === canteen.id) === index
        );
      
      if (userCanteens.length > 0) {
        // 设置食堂过滤条件
        canteenList.value = userCanteens;
        filterCanteenId.value = userCanteens[0].id;
      } else {
        canteenList.value = [];
      }
    } catch (error) {
      console.error('获取食堂列表失败:', error);
      ElMessage.error('获取用户食堂信息失败');
      canteenList.value = [];
    }
    return;
  }
  
  try {
    const data = await Apis.CanteenController.listCanteen();
    // 超级管理员可以看到所有食堂
    canteenList.value = data || [];
  } catch (error) {
    console.error('获取食堂列表失败:', error);
    ElMessage.error('获取食堂列表失败');
  }
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    const data = await Apis.UserController.pageUser({
      params: {
        pageIndex: 0,
        pageSize: 100,
        username: ''
      }
    });
    // 在前端过滤出摊位管理员
    userList.value = (data.rows || []).filter(user => 
      user.roles && user.roles.some(role => role.code === 'stall_admin')
    );
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  }
};

// 添加摊位
const handleAddStall = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑摊位
const handleEdit = (row: Stall_StallService_STALL_FETCHER) => {
  isEdit.value = true;
  currentStallId.value = row.id || null;
  stallForm.name = row.name || '';
  stallForm.canteenId = row.canteen?.id;
  stallForm.directorName = row.directorName || '';
  stallForm.directorPhone = row.directorPhone || '';
  dialogVisible.value = true;
};

// 分配管理员
const handleAllocation = (row: Stall_StallService_STALL_FETCHER) => {
  currentStallId.value = row.id || null;
  allocationForm.userId = row.user?.id;
  allocationDialogVisible.value = true;
  fetchUsers();
};

// 保存摊位信息
const saveStall = async () => {
  if (!stallFormRef.value) return;

  await stallFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && currentStallId.value) {
          await Apis.StallController.updateStall({
              pathParams: { id: currentStallId.value },
            data: stallForm
          });
          ElNotification({
            title: '成功',
            message: '摊位信息更新成功',
            type: 'success'
          });
        } else {
          await Apis.StallController.createStall({
            data: stallForm
          });
          ElNotification({
            title: '成功',
            message: '摊位添加成功',
            type: 'success'
          });
        }
        dialogVisible.value = false;
        fetchStalls();
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新摊位信息失败' : '添加摊位失败');
        console.error(error);
      }
    }
  });
};

// 保存管理员分配
const saveAllocation = async () => {
  if (!allocationForm.userId) {
    ElMessage.warning('请选择管理员');
    return;
  }
  
  if (!currentStallId.value) {
    ElMessage.warning('摊位ID不能为空');
    return;
  }

  try {
    await Apis.StallController.allocationCanteen_2({
      pathParams: { 
        id: currentStallId.value,
        userId: allocationForm.userId 
      }
    });
    ElNotification({
      title: '成功',
      message: '管理员分配成功',
      type: 'success'
    });
    allocationDialogVisible.value = false;
    fetchStalls();
  } catch (error) {
    ElMessage.error('分配管理员失败');
    console.error(error);
  }
};

// 重置表单
const resetForm = () => {
  stallForm.name = '';
  stallForm.directorName = '';
  stallForm.directorPhone = '';
  stallForm.canteenId = undefined;
  currentStallId.value = null;
};

// 处理分页
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  fetchStalls();
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  fetchStalls();
};

// 处理食堂选择变化
const handleCanteenChange = () => {
  currentPage.value = 1;
  fetchStalls();
};

// 删除摊位
const handleDeleteStall = async (row: Stall_StallService_STALL_FETCHER) => {
  try {
    await Apis.StallController.deleteStall({
      pathParams: { id: row.id || 0 }
    });
    ElMessage.success('删除成功');
    fetchStalls();
  } catch (error) {
    ElMessage.error('删除失败');
    console.error(error);
  }
};

onMounted(() => {
  fetchCanteens();
  fetchStalls();
});
</script>

<style scoped>
.stall-management {
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

.filter-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
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
</style> 