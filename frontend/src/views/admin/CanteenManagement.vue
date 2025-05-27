<template>
  <div class="canteen-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">食堂管理</span>
          <div class="button-group">
            <el-button type="primary" @click="handleAddCanteen" class="action-button">
              <el-icon>
                <Plus/>
              </el-icon>
              新增食堂
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 添加搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchName"
          placeholder="请输入食堂名称"
          class="search-input"
          clearable
          @clear="fetchCanteens"
        >
          <template #append>
            <el-button @click="fetchCanteens">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      
      <el-table :data="canteenList" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="序号" width="80" align="center">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="食堂名称" align="center"/>
        <el-table-column prop="directorName" label="负责人" align="center"/>
        <el-table-column prop="directorPhone" label="联系电话" align="center"/>
        <el-table-column prop="address" label="地址" align="center"/>
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
        <el-table-column label="操作" width="360" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button size="small" type="primary" @click="handleEdit(scope.row)" class="operation-button">
                编辑
              </el-button>
              <el-button size="small" type="success" @click="handleAllocation(scope.row)" class="operation-button">
                分配管理员
            </el-button>
              <el-button size="small" type="danger" @click="handleDeleteCanteen(scope.row)" class="operation-button">
                删除
            </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
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

    <!-- 添加/编辑食堂对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑食堂' : '新增食堂'"
      width="500px"
    >
      <el-form :model="canteenForm" label-width="100px" :rules="rules" ref="canteenFormRef">
        <el-form-item label="食堂名称" prop="name">
          <el-input v-model="canteenForm.name" placeholder="请输入食堂名称"/>
        </el-form-item>
        <el-form-item label="负责人" prop="directorName">
          <el-input v-model="canteenForm.directorName" placeholder="请输入负责人姓名"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="directorPhone">
          <el-input v-model="canteenForm.directorPhone" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="canteenForm.address" placeholder="请输入地址"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCanteen">确定</el-button>
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
          <el-select v-model="allocationForm.userId" placeholder="请选择管理员" style="width: 100%">
            <el-option
              v-for="user in userList"
              :key="user.id"
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
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElNotification, FormInstance } from 'element-plus';
import { Edit, User, Search, Plus } from '@element-plus/icons-vue';
import Apis from '@/alova';
import BeiJingTime from '@/components/BeiJingTime.vue';
import type { CanteenSaveInput, Canteen_CanteenService_CANTEEN_FETCHER, Page_Canteen_CanteenService_CANTEEN_FETCHER, Page_Dynamic_User } from '@/alova/globals';

const canteenFormRef = ref<FormInstance>();
const canteenList = ref<Canteen_CanteenService_CANTEEN_FETCHER[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const allocationDialogVisible = ref(false);
const isEdit = ref(false);
const userList = ref<any[]>([]);
const currentCanteenId = ref<number | null>(null);
// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
// 添加搜索变量
const searchName = ref('');

const canteenForm = reactive<CanteenSaveInput>({
  name: '',
  directorName: '',
  directorPhone: '',
  address: ''
});

const allocationForm = reactive({
  userId: undefined as number | undefined
});

const rules = {
  name: [{ required: true, message: '请输入食堂名称', trigger: 'blur' }],
  directorName: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
  directorPhone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }]
};

// 获取食堂列表
const fetchCanteens = async () => {
  loading.value = true;
  try {
    const data = await Apis.CanteenController.pageCanteen({
      params: {
        pageIndex: currentPage.value - 1,
        pageSize: pageSize.value,
        canteenName: searchName.value // 将搜索名称传递给API
      }
    });
    canteenList.value = data.rows || [];
    total.value = data.totalRowCount || 0;
  } catch (error) {
    ElMessage.error('获取食堂列表失败');
    console.error(error);
  } finally {
    loading.value = false;
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
    // 在前端过滤出食堂管理员
    userList.value = (data.rows || []).filter(user => 
      user.roles && user.roles.some(role => role.code === 'canteen_admin')
    ).map(user => ({
      id: user.id,
      username: user.username,
      label: user.username // 添加label属性用于显示
    }));
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  }
};

// 添加食堂
const handleAddCanteen = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑食堂
const handleEdit = (row: Canteen_CanteenService_CANTEEN_FETCHER) => {
  isEdit.value = true;
  currentCanteenId.value = row.id || null;
  canteenForm.name = row.name || '';
  canteenForm.directorName = row.directorName || '';
  canteenForm.directorPhone = row.directorPhone || '';
  canteenForm.address = row.address || '';
  dialogVisible.value = true;
};

// 分配管理员
const handleAllocation = (row: Canteen_CanteenService_CANTEEN_FETCHER) => {
  currentCanteenId.value = row.id || null;
  allocationForm.userId = row.user?.id;
  allocationDialogVisible.value = true;
  fetchUsers(); // 获取用户列表以便选择
};

// 保存食堂信息
const saveCanteen = async () => {
  if (!canteenFormRef.value) return;
  
  await canteenFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && currentCanteenId.value) {
          await Apis.CanteenController.updateCanteen({
            pathParams: { id: currentCanteenId.value },
            data: canteenForm
          });
          ElNotification({
            title: '成功',
            message: '食堂信息更新成功',
            type: 'success'
          });
        } else {
          await Apis.CanteenController.createCanteen({
            data: canteenForm
          });
          ElNotification({
            title: '成功',
            message: '食堂添加成功',
            type: 'success'
          });
        }
        dialogVisible.value = false;
        fetchCanteens();
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新食堂信息失败' : '添加食堂失败');
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
  
  if (!currentCanteenId.value) {
    ElMessage.warning('食堂ID不能为空');
    return;
  }

  try {
    await Apis.CanteenController.allocationCanteen({
      pathParams: { 
        id: currentCanteenId.value,
        userId: allocationForm.userId 
      }
    });
    ElNotification({
      title: '成功',
      message: '管理员分配成功',
      type: 'success'
    });
    allocationDialogVisible.value = false;
    fetchCanteens();
  } catch (error) {
    ElMessage.error('分配管理员失败');
    console.error(error);
  }
};

// 重置表单
const resetForm = () => {
  canteenForm.name = '';
  canteenForm.directorName = '';
  canteenForm.directorPhone = '';
  canteenForm.address = '';
  currentCanteenId.value = null;
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchCanteens();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchCanteens();
};

// 删除食堂
const handleDeleteCanteen = async (row: Canteen_CanteenService_CANTEEN_FETCHER) => {
  try {
    await Apis.CanteenController.deleteCanteen({
      pathParams: { id: row.id || 0 }
    });
    ElMessage.success('删除成功');
    fetchCanteens();
  } catch (error) {
    ElMessage.error('删除失败');
    console.error(error);
  }
};

onMounted(() => {
  fetchCanteens();
  fetchUsers();
});
</script>

<style scoped>
.canteen-management {
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

/* 添加搜索框样式 */
.search-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
.search-input {
  width: 300px;
}
</style> 