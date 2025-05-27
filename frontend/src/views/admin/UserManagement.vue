<template>
  <div class="user-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="font-bold text-lg">员工管理</span>
          <div class="button-group">
            <el-upload class="upload-excel" action="#" :auto-upload="false" :show-file-list="false"
                       :on-change="handleExcelUpload" accept=".xlsx,.xls">
              <el-button type="success" class="action-button">
                <el-icon>
                  <Upload/>
                </el-icon>
                上传员工数据
              </el-button>
            </el-upload>
            <el-button type="primary" @click="downloadTemplate" class="action-button">
              <el-icon>
                <Download/>
              </el-icon>
              下载员工模板
            </el-button>
          </div>
        </div>
      </template>
      <div class="filter-row">
        <div class="filter-right">
          <el-input 
            v-model="searchUsername" 
            placeholder="搜索用户名" 
            clearable
            @clear="fetchUsers"
            class="filter-input"
          >
            <template #append>
              <el-button @click="fetchUsers">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
      <el-table :data="userList" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="序号" width="80" align="center">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" align="center"/>
        <el-table-column prop="email" label="邮箱" align="center"/>
        <el-table-column prop="phone" label="电话号码" align="center"/>
        <el-table-column label="头像" align="center">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar ? `/api/images${scope.row.avatar}` : defaultAvatar"/>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template #default="scope">
            <bei-jing-time :time="scope.row.createTime"/>
          </template>
        </el-table-column>
        <el-table-column label="角色" align="center">
          <template #default="scope">
            <el-tag v-for="role in scope.row.roles" :key="role.id" style="margin-right: 5px">
              {{ getRoleName(role.code) }}
            </el-tag>
          </template>
        </el-table-column>
<!--        <el-table-column label="分配情况" align="center">-->
<!--          <template #default="scope">-->
<!--            <div v-if="scope.row.canteen">-->
<!--              <el-tag type="success">{{ scope.row.canteen.name }} 食堂管理员</el-tag>-->
<!--            </div>-->
<!--            <div v-if="scope.row.stall">-->
<!--              <el-tag type="warning">{{ scope.row.stall.name }} 摊位管理员</el-tag>-->
<!--            </div>-->
<!--            <div v-if="!scope.row.canteen && !scope.row.stall">-->
<!--              <el-tag type="info">未分配</el-tag>-->
<!--            </div>-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column label="操作" width="240" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button size="small" type="primary" @click="handleRoles(scope.row)" class="operation-button">
                分配角色
              </el-button>
              <el-button size="small" type="warning" @click="handleResetPassword(scope.row)" class="operation-button">
                重置密码
              </el-button>
              <el-button size="small" type="danger" @click="handleDeleteUser(scope.row)" class="operation-button">
                删除用户
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
                       background layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"/>
      </div>
    </el-card>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="500px">
      <el-form :model="roleForm" label-width="100px">
        <el-form-item label="选择角色">
          <el-checkbox-group v-model="roleForm.roleIds">
            <el-checkbox v-for="role in roleList" :key="role.id" :label="role.id">
              {{ getRoleName(role.code) }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRoles">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="resetPasswordDialogVisible" title="重置密码" width="500px">
      <el-form :model="resetForm" label-width="100px" :rules="resetRules" ref="resetFormRef">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetForm.password" type="password" placeholder="请输入新密码"/>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetForm.confirmPassword" type="password" placeholder="请再次输入新密码"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveResetPassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive, computed} from 'vue';
import {ElMessage, ElNotification, ElMessageBox, FormInstance} from 'element-plus';
import {Download, Upload} from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';
import Apis from '@/alova';
import type {
  Dynamic_Role,
  Dynamic_Order,
  Dynamic_User,
  Page_Dynamic_User
} from '@/alova/globals';
import BeiJingTime from '@/components/BeiJingTime.vue';
import {useStore} from '@/store';
import {useDictStoreWithOut} from "@/store/dict";
import {getDictLabel} from "@/utils/dict";

const store = useStore();
const dictStore = useDictStoreWithOut();

// 临时函数：检查字典数据
const checkDictData = () => {
  // 加载字典数据，确保已经初始化
  if (!dictStore.isSetDict) {
    dictStore.setDictMap();
  }

  console.log('字典数据已加载:', dictStore.isSetDict);

  // 获取所有字典类型
  const allDictTypes = Array.from(dictStore.dictMap.keys());
  console.log('所有字典类型:', allDictTypes);

  // 打印所有字典内容
  console.log('=== 所有字典内容 ===');
  allDictTypes.forEach(type => {
    const dictValues = dictStore.getDictByType(type);
    console.log(`字典类型: ${type}`);
    console.table(dictValues);
  });

  // 查找可能与角色相关的字典
  const roleRelatedDicts = allDictTypes.filter(type =>
      String(type).toLowerCase().includes('role') ||
      String(type).toLowerCase().includes('权限') ||
      String(type).toLowerCase().includes('角色')
  );

  if (roleRelatedDicts.length > 0) {
    console.log('=== 角色相关字典 ===');
    roleRelatedDicts.forEach(type => {
      console.log(`字典类型: ${type}`);
      console.table(dictStore.getDictByType(type));
    });
  } else {
    console.log('未找到角色相关字典，可能需要检查后端是否正确返回了角色字典数据');
  }
};

// 获取角色名称
const getRoleName = (code?: string): string => {
  if (!code) return '未知角色';

  // 特殊处理 canteen_canteen 代码
  if (code === 'canteen_canteen') {
    return '食堂管理员';
  }

  // 首先使用硬编码映射确保最基本的角色名称正确显示
  const hardCodedRoleMap: Record<string, string> = {
    'super_admin': '超级管理员',
    'canteen_admin': '食堂管理员',
    'stall_admin': '摊位管理员',
    'user': '普通用户',
    'normal': '普通用户'
  };

  if (hardCodedRoleMap[code]) {
    return hardCodedRoleMap[code];
  }

  // 然后再尝试从字典获取
  // 确保字典已经加载
  if (!dictStore.isSetDict) {
    dictStore.setDictMap();
  }

  try {
    // 尝试查找与角色相关的字典类型
    const allDictTypes = Array.from(dictStore.dictMap.keys());

    // 可能的角色字典类型列表（尝试几种可能的类型名）
    // 检查 role_type, user_role, sys_role 等可能的名称
    const possibleRoleTypes = ['role_type', 'user_role', 'sys_role', 'role', 'roles'];

    // 首先尝试直接匹配可能的角色字典类型
    let roleDictType = possibleRoleTypes.find(type => allDictTypes.includes(type));

    // 如果没找到，则进行模糊匹配
    if (!roleDictType) {
      roleDictType = allDictTypes.find(type => {
        const typeStr = String(type).toLowerCase();
        return (
            typeStr.includes('role') ||
            typeStr.includes('角色')
        );
      });
    }

    if (roleDictType) {
      // 使用字典工具获取标签
      const dictValues = dictStore.getDictByType(roleDictType);
      const roleItem = dictValues?.find(item => String(item.value) === code);

      if (roleItem && roleItem.label) {
        return roleItem.label;
      }
    }
  } catch (error) {
    console.error('获取角色名称失败:', error);
  }

  // 如果字典中没有找到，再次尝试使用硬编码映射
  return hardCodedRoleMap[code] || code;
};

// 角色判断方法
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

const userList = ref<Dynamic_User[]>([]);
const roleList = ref<Dynamic_Role[]>([]);
const orderList = ref<Dynamic_Order[]>([]);
const loading = ref(false);
const orderLoading = ref(false);
const roleDialogVisible = ref(false);
const resetPasswordDialogVisible = ref(false);
const orderDialogVisible = ref(false);
const orderDetailDialogVisible = ref(false);
const currentOrder = ref<Dynamic_Order | null>(null);
const currentUserId = ref<number | null>(null);
const defaultAvatar = 'https://ts1.tc.mm.bing.net/th/id/R-C.2d165c39cb4c527c7a910f84ceb37799?rik=hTA2SKt67GUpAQ&riu=http%3a%2f%2fimg.soogif.com%2fACNwgduXYtytzz7JyAgxjzQRvedf416I.gif&ehk=gBvtZnce7OMHZKm%2fCfx48Cs9l5q8wLdxXn4AMbsLH4k%3d&risl=&pid=ImgRaw&r=0';
const resetFormRef = ref<FormInstance>();
const searchUsername = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 表单数据
const roleForm = reactive({
  id: undefined as number | undefined,
  roleIds: [] as number[]
});

const resetForm = reactive({
  password: '',
  confirmPassword: ''
});

// 表单校验规则
const resetRules = {
  password: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能小于6个字符', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请再次输入新密码', trigger: 'blur'},
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== resetForm.password) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const data = await Apis.UserController.pageUser({
      params: {
        pageIndex: currentPage.value - 1,
        pageSize: pageSize.value,
        username: searchUsername.value || undefined
      }
    });
    userList.value = data.rows || [];
    total.value = data.totalRowCount || 0;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 获取角色列表
const fetchRoles = async () => {
  try {
    const data = await Apis.RoleController.queryRoles();
    roleList.value = data;
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error(error);
  }
};

// 处理分配角色
const handleRoles = (row: Dynamic_User) => {
  roleForm.id = row.id;
  roleForm.roleIds = row.roles?.map(role => role.id || 0) || [];
  roleDialogVisible.value = true;
};

// 保存角色分配
const saveRoles = async () => {
  if (!roleForm.id) {
    ElMessage.warning('用户ID不能为空');
    return;
  }

  try {
    // 使用updateUserRole接口
    await Apis.UserController.updateUserRole({
      data: {
        id: roleForm.id,
        roleIds: roleForm.roleIds
      }
    });
    ElNotification({
      title: '成功',
      message: '角色分配成功',
      type: 'success'
    });
    roleDialogVisible.value = false;
    fetchUsers();
  } catch (error) {
    ElMessage.error('分配角色失败');
    console.error(error);
  }
};

// 处理重置密码
const handleResetPassword = (row: Dynamic_User) => {
  currentUserId.value = row.id || null;
  resetForm.password = '';
  resetForm.confirmPassword = '';
  resetPasswordDialogVisible.value = true;
};

// 保存重置密码
const saveResetPassword = async () => {
  if (!resetFormRef.value) return;
  
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      // 显示确认弹窗
      ElMessageBox.confirm(
        '确定要重置该员工的密码吗？',
        '重置密码确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          // 使用新的重置密码 API
          await Apis.UserController.resetUserPassword({
            pathParams: {
              userId: currentUserId.value as number
            },
            data: {
              password: resetForm.password
            }
          });
          ElNotification({
            title: '成功',
            message: '密码重置成功',
            type: 'success'
          });
          resetPasswordDialogVisible.value = false;
        } catch (error) {
          ElMessage.error('重置密码失败');
          console.error(error);
        }
      }).catch(() => {
        // 用户取消操作
        ElMessage.info('已取消重置密码');
      });
    }
  });
};

// 查看用户订单
const handleViewOrders = async (row: Dynamic_User) => {
  orderLoading.value = true;
  try {
    // 由于没有根据用户ID查询订单的API，这里使用模拟数据
    // 在实际应用中，需要后端提供相应API
    ElMessage.warning('查询用户订单功能暂未实现，请联系后端开发人员提供相应API');
    orderList.value = [];
    orderDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取用户订单失败');
    console.error(error);
  } finally {
    orderLoading.value = false;
  }
};

// 查看订单详情
const handleOrderDetail = (order: Dynamic_Order) => {
  currentOrder.value = order;
  orderDetailDialogVisible.value = true;
};

// 获取订单状态类型
const getOrderStateType = (state?: number) => {
  switch (state) {
    case 0:
      return 'info'; // 待支付
    case 1:
      return 'warning'; // 已支付
    case 2:
      return 'success'; // 已完成
    case 3:
      return 'danger'; // 已取消
    default:
      return 'info';
  }
};

// 获取订单状态名称
const getOrderStateName = (state?: number) => {
  switch (state) {
    case 0:
      return '待支付';
    case 1:
      return '已支付';
    case 2:
      return '已完成';
    case 3:
      return '已取消';
    default:
      return '未知状态';
  }
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchUsers();
};

// 处理每页条数变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUsers();
};

// 处理删除用户
const handleDeleteUser = (row: Dynamic_User) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await Apis.UserController.deleteUser({
        pathParams: {
          id: row.id || 0
        }
      });
      ElMessage.success('删除用户成功');
      fetchUsers(); // 刷新用户列表
    } catch (error) {
      console.error('删除用户失败:', error);
      ElMessage.error('删除用户失败');
    }
  }).catch(() => {
    // 用户取消删除操作
  });
};

onMounted(async () => {
  // 确保字典数据已加载
  if (!dictStore.getIsSetDict) {
    await dictStore.setDictMap();
  }

  // 检查字典数据
  checkDictData();

  // 获取用户和角色数据
  fetchUsers();
  fetchRoles();
});

// 下载员工模板方法
const downloadTemplate = () => {
  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 定义表头和示例数据
    const header = ['姓名', '电话', '邮箱', '角色'];
    const data = [
      header,
      ['张三', '13800138000', '321321@qq.com', '普通用户'],
      ['李四', '13900139000', '677564@qq.com', '摊位管理员']
    ];

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // 设置列宽
    const cols = [
      {wch: 15}, // 姓名列宽
      {wch: 15}, // 游戏列宽
      {wch: 15}, // 电话列宽
      {wch: 15}  // 角色列宽
    ];
    worksheet['!cols'] = cols;

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '员工信息模板');

    // 导出工作簿为Excel文件
    XLSX.writeFile(workbook, '员工信息模板.xlsx');

    ElMessage.success('模板下载成功');
  } catch (error) {
    console.error('下载模板失败:', error);
    ElMessage.error('下载模板失败');
  }
};

// 处理Excel上传
const handleExcelUpload = (file) => {
  if (!file) {
    return;
  }

  // 文件类型检查
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!');
    return;
  }

  // 文件大小检查(限制5MB)
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('上传的文件不能超过5MB!');
    return;
  }

  // 调用后端接口上传Excel文件
  Apis.UserController.importUser({
    data: {
      file: file.raw
    }
  }).then(() => {
    ElMessage.success('员工数据导入成功');
    // 刷新用户列表
    fetchUsers();
  }).catch(error => {
    console.error('导入员工数据失败:', error);
    ElMessage.error('导入员工数据失败');
  });
};
</script>

<style scoped>
.user-management {
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

.filter-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 12px;
}

.filter-input {
  width: 220px;
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

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}
</style> 