import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';
import { Download, Upload } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';
import Apis from '@/alova';
import BeiJingTime from '@/components/BeiJingTime.vue';
import { useStore } from '@/store';
import { useDictStoreWithOut } from "@/store/dict";
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
    const roleRelatedDicts = allDictTypes.filter(type => String(type).toLowerCase().includes('role') ||
        String(type).toLowerCase().includes('权限') ||
        String(type).toLowerCase().includes('角色'));
    if (roleRelatedDicts.length > 0) {
        console.log('=== 角色相关字典 ===');
        roleRelatedDicts.forEach(type => {
            console.log(`字典类型: ${type}`);
            console.table(dictStore.getDictByType(type));
        });
    }
    else {
        console.log('未找到角色相关字典，可能需要检查后端是否正确返回了角色字典数据');
    }
};
// 获取角色名称
const getRoleName = (code) => {
    if (!code)
        return '未知角色';
    // 特殊处理 canteen_canteen 代码
    if (code === 'canteen_canteen') {
        return '食堂管理员';
    }
    // 首先使用硬编码映射确保最基本的角色名称正确显示
    const hardCodedRoleMap = {
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
                return (typeStr.includes('role') ||
                    typeStr.includes('角色'));
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
    }
    catch (error) {
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
const userList = ref([]);
const roleList = ref([]);
const orderList = ref([]);
const loading = ref(false);
const orderLoading = ref(false);
const roleDialogVisible = ref(false);
const resetPasswordDialogVisible = ref(false);
const orderDialogVisible = ref(false);
const orderDetailDialogVisible = ref(false);
const currentOrder = ref(null);
const currentUserId = ref(null);
const defaultAvatar = 'https://ts1.tc.mm.bing.net/th/id/R-C.2d165c39cb4c527c7a910f84ceb37799?rik=hTA2SKt67GUpAQ&riu=http%3a%2f%2fimg.soogif.com%2fACNwgduXYtytzz7JyAgxjzQRvedf416I.gif&ehk=gBvtZnce7OMHZKm%2fCfx48Cs9l5q8wLdxXn4AMbsLH4k%3d&risl=&pid=ImgRaw&r=0';
const resetFormRef = ref();
const searchUsername = ref('');
// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
// 表单数据
const roleForm = reactive({
    id: undefined,
    roleIds: []
});
const resetForm = reactive({
    password: '',
    confirmPassword: ''
});
// 表单校验规则
const resetRules = {
    password: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== resetForm.password) {
                    callback(new Error('两次输入密码不一致'));
                }
                else {
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
    }
    catch (error) {
        ElMessage.error('获取用户列表失败');
        console.error(error);
    }
    finally {
        loading.value = false;
    }
};
// 获取角色列表
const fetchRoles = async () => {
    try {
        const data = await Apis.RoleController.queryRoles();
        roleList.value = data;
    }
    catch (error) {
        ElMessage.error('获取角色列表失败');
        console.error(error);
    }
};
// 处理分配角色
const handleRoles = (row) => {
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
    }
    catch (error) {
        ElMessage.error('分配角色失败');
        console.error(error);
    }
};
// 处理重置密码
const handleResetPassword = (row) => {
    currentUserId.value = row.id || null;
    resetForm.password = '';
    resetForm.confirmPassword = '';
    resetPasswordDialogVisible.value = true;
};
// 保存重置密码
const saveResetPassword = async () => {
    if (!resetFormRef.value)
        return;
    await resetFormRef.value.validate(async (valid) => {
        if (valid) {
            // 显示确认弹窗
            ElMessageBox.confirm('确定要重置该员工的密码吗？', '重置密码确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(async () => {
                try {
                    // 使用新的重置密码 API
                    await Apis.UserController.resetUserPassword({
                        pathParams: {
                            userId: currentUserId.value
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
                }
                catch (error) {
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
const handleViewOrders = async (row) => {
    orderLoading.value = true;
    try {
        // 由于没有根据用户ID查询订单的API，这里使用模拟数据
        // 在实际应用中，需要后端提供相应API
        ElMessage.warning('查询用户订单功能暂未实现，请联系后端开发人员提供相应API');
        orderList.value = [];
        orderDialogVisible.value = true;
    }
    catch (error) {
        ElMessage.error('获取用户订单失败');
        console.error(error);
    }
    finally {
        orderLoading.value = false;
    }
};
// 查看订单详情
const handleOrderDetail = (order) => {
    currentOrder.value = order;
    orderDetailDialogVisible.value = true;
};
// 获取订单状态类型
const getOrderStateType = (state) => {
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
const getOrderStateName = (state) => {
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
const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchUsers();
};
// 处理每页条数变化
const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchUsers();
};
// 处理删除用户
const handleDeleteUser = (row) => {
    ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await Apis.UserController.deleteUser({
                pathParams: {
                    id: row.id || 0
                }
            });
            ElMessage.success('删除用户成功');
            fetchUsers(); // 刷新用户列表
        }
        catch (error) {
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
            { wch: 15 }, // 姓名列宽
            { wch: 15 }, // 游戏列宽
            { wch: 15 }, // 电话列宽
            { wch: 15 } // 角色列宽
        ];
        worksheet['!cols'] = cols;
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, '员工信息模板');
        // 导出工作簿为Excel文件
        XLSX.writeFile(workbook, '员工信息模板.xlsx');
        ElMessage.success('模板下载成功');
    }
    catch (error) {
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
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['card-header', 'button-group', 'button-group', 'action-button', 'button-group', 'action-button', 'el-table', 'el-table', 'el-table', 'operation-button', 'el-table', 'operation-buttons', 'el-input-group__append', 'el-input__inner',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("user-management") },
    });
    const __VLS_0 = {}.ElCard;
    /** @type { [typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ class: ("box-card") },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: ("box-card") },
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
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("button-group") },
        });
        const __VLS_6 = {}.ElUpload;
        /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
            ...{ class: ("upload-excel") },
            action: ("#"),
            autoUpload: ((false)),
            showFileList: ((false)),
            onChange: ((__VLS_ctx.handleExcelUpload)),
            accept: (".xlsx,.xls"),
        }));
        const __VLS_8 = __VLS_7({
            ...{ class: ("upload-excel") },
            action: ("#"),
            autoUpload: ((false)),
            showFileList: ((false)),
            onChange: ((__VLS_ctx.handleExcelUpload)),
            accept: (".xlsx,.xls"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        const __VLS_12 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            type: ("success"),
            ...{ class: ("action-button") },
        }));
        const __VLS_14 = __VLS_13({
            type: ("success"),
            ...{ class: ("action-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        const __VLS_18 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({}));
        const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
        const __VLS_24 = {}.Upload;
        /** @type { [typeof __VLS_components.Upload, ] } */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
        const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_23.slots.default;
        var __VLS_23;
        __VLS_17.slots.default;
        var __VLS_17;
        __VLS_11.slots.default;
        var __VLS_11;
        const __VLS_30 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
            ...{ 'onClick': {} },
            type: ("primary"),
            ...{ class: ("action-button") },
        }));
        const __VLS_32 = __VLS_31({
            ...{ 'onClick': {} },
            type: ("primary"),
            ...{ class: ("action-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        let __VLS_36;
        const __VLS_37 = {
            onClick: (__VLS_ctx.downloadTemplate)
        };
        let __VLS_33;
        let __VLS_34;
        const __VLS_38 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({}));
        const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
        const __VLS_44 = {}.Download;
        /** @type { [typeof __VLS_components.Download, ] } */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_43.slots.default;
        var __VLS_43;
        __VLS_35.slots.default;
        var __VLS_35;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-row") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-right") },
    });
    const __VLS_50 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        ...{ 'onClear': {} },
        modelValue: ((__VLS_ctx.searchUsername)),
        placeholder: ("搜索用户名"),
        clearable: (true),
        ...{ class: ("filter-input") },
    }));
    const __VLS_52 = __VLS_51({
        ...{ 'onClear': {} },
        modelValue: ((__VLS_ctx.searchUsername)),
        placeholder: ("搜索用户名"),
        clearable: (true),
        ...{ class: ("filter-input") },
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    let __VLS_56;
    const __VLS_57 = {
        onClear: (__VLS_ctx.fetchUsers)
    };
    let __VLS_53;
    let __VLS_54;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { append: __VLS_thisSlot } = __VLS_55.slots;
        const __VLS_58 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
            ...{ 'onClick': {} },
        }));
        const __VLS_60 = __VLS_59({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        let __VLS_64;
        const __VLS_65 = {
            onClick: (__VLS_ctx.fetchUsers)
        };
        let __VLS_61;
        let __VLS_62;
        __VLS_63.slots.default;
        var __VLS_63;
    }
    var __VLS_55;
    const __VLS_66 = {}.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        data: ((__VLS_ctx.userList)),
        stripe: (true),
        ...{ style: ({}) },
    }));
    const __VLS_68 = __VLS_67({
        data: ((__VLS_ctx.userList)),
        stripe: (true),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_72 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        label: ("序号"),
        width: ("80"),
        align: ("center"),
    }));
    const __VLS_74 = __VLS_73({
        label: ("序号"),
        width: ("80"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_77.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        ((__VLS_ctx.currentPage - 1) * __VLS_ctx.pageSize + scope.$index + 1);
    }
    var __VLS_77;
    const __VLS_78 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        prop: ("username"),
        label: ("用户名"),
        align: ("center"),
    }));
    const __VLS_80 = __VLS_79({
        prop: ("username"),
        label: ("用户名"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    const __VLS_84 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        prop: ("email"),
        label: ("邮箱"),
        align: ("center"),
    }));
    const __VLS_86 = __VLS_85({
        prop: ("email"),
        label: ("邮箱"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    const __VLS_90 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        prop: ("phone"),
        label: ("电话号码"),
        align: ("center"),
    }));
    const __VLS_92 = __VLS_91({
        prop: ("phone"),
        label: ("电话号码"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    const __VLS_96 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        label: ("头像"),
        align: ("center"),
    }));
    const __VLS_98 = __VLS_97({
        label: ("头像"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_101.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_102 = {}.ElAvatar;
        /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ] } */ ;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
            size: ((40)),
            src: ((scope.row.avatar ? `/api/images${scope.row.avatar}` : __VLS_ctx.defaultAvatar)),
        }));
        const __VLS_104 = __VLS_103({
            size: ((40)),
            src: ((scope.row.avatar ? `/api/images${scope.row.avatar}` : __VLS_ctx.defaultAvatar)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    }
    var __VLS_101;
    const __VLS_108 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        label: ("创建时间"),
        align: ("center"),
    }));
    const __VLS_110 = __VLS_109({
        label: ("创建时间"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_113.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        // @ts-ignore
        /** @type { [typeof BeiJingTime, ] } */ ;
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(BeiJingTime, new BeiJingTime({
            time: ((scope.row.createTime)),
        }));
        const __VLS_115 = __VLS_114({
            time: ((scope.row.createTime)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    }
    var __VLS_113;
    const __VLS_119 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
        label: ("角色"),
        align: ("center"),
    }));
    const __VLS_121 = __VLS_120({
        label: ("角色"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_124.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        for (const [role] of __VLS_getVForSourceType((scope.row.roles))) {
            const __VLS_125 = {}.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */ ;
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
                key: ((role.id)),
                ...{ style: ({}) },
            }));
            const __VLS_127 = __VLS_126({
                key: ((role.id)),
                ...{ style: ({}) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_126));
            (__VLS_ctx.getRoleName(role.code));
            __VLS_130.slots.default;
            var __VLS_130;
        }
    }
    var __VLS_124;
    const __VLS_131 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
        label: ("操作"),
        width: ("240"),
        align: ("center"),
    }));
    const __VLS_133 = __VLS_132({
        label: ("操作"),
        width: ("240"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_136.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("operation-buttons") },
        });
        const __VLS_137 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_139 = __VLS_138({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_138));
        let __VLS_143;
        const __VLS_144 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleRoles(scope.row);
            }
        };
        let __VLS_140;
        let __VLS_141;
        __VLS_142.slots.default;
        var __VLS_142;
        const __VLS_145 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("warning"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_147 = __VLS_146({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("warning"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_146));
        let __VLS_151;
        const __VLS_152 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleResetPassword(scope.row);
            }
        };
        let __VLS_148;
        let __VLS_149;
        __VLS_150.slots.default;
        var __VLS_150;
        const __VLS_153 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("danger"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_155 = __VLS_154({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("danger"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_154));
        let __VLS_159;
        const __VLS_160 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDeleteUser(scope.row);
            }
        };
        let __VLS_156;
        let __VLS_157;
        __VLS_158.slots.default;
        var __VLS_158;
    }
    var __VLS_136;
    __VLS_71.slots.default;
    var __VLS_71;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("pagination") },
    });
    const __VLS_161 = {}.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */ ;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }));
    const __VLS_163 = __VLS_162({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    let __VLS_167;
    const __VLS_168 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_169 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_164;
    let __VLS_165;
    var __VLS_166;
    var __VLS_5;
    const __VLS_170 = {}.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */ ;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
        modelValue: ((__VLS_ctx.roleDialogVisible)),
        title: ("分配角色"),
        width: ("500px"),
    }));
    const __VLS_172 = __VLS_171({
        modelValue: ((__VLS_ctx.roleDialogVisible)),
        title: ("分配角色"),
        width: ("500px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    const __VLS_176 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        model: ((__VLS_ctx.roleForm)),
        labelWidth: ("100px"),
    }));
    const __VLS_178 = __VLS_177({
        model: ((__VLS_ctx.roleForm)),
        labelWidth: ("100px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    const __VLS_182 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
        label: ("选择角色"),
    }));
    const __VLS_184 = __VLS_183({
        label: ("选择角色"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    const __VLS_188 = {}.ElCheckboxGroup;
    /** @type { [typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ] } */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        modelValue: ((__VLS_ctx.roleForm.roleIds)),
    }));
    const __VLS_190 = __VLS_189({
        modelValue: ((__VLS_ctx.roleForm.roleIds)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    for (const [role] of __VLS_getVForSourceType((__VLS_ctx.roleList))) {
        const __VLS_194 = {}.ElCheckbox;
        /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ] } */ ;
        // @ts-ignore
        const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
            key: ((role.id)),
            label: ((role.id)),
        }));
        const __VLS_196 = __VLS_195({
            key: ((role.id)),
            label: ((role.id)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_195));
        (__VLS_ctx.getRoleName(role.code));
        __VLS_199.slots.default;
        var __VLS_199;
    }
    __VLS_193.slots.default;
    var __VLS_193;
    __VLS_187.slots.default;
    var __VLS_187;
    __VLS_181.slots.default;
    var __VLS_181;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_175.slots;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("dialog-footer") },
        });
        const __VLS_200 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
            ...{ 'onClick': {} },
        }));
        const __VLS_202 = __VLS_201({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_201));
        let __VLS_206;
        const __VLS_207 = {
            onClick: (...[$event]) => {
                __VLS_ctx.roleDialogVisible = false;
            }
        };
        let __VLS_203;
        let __VLS_204;
        __VLS_205.slots.default;
        var __VLS_205;
        const __VLS_208 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
            ...{ 'onClick': {} },
            type: ("primary"),
        }));
        const __VLS_210 = __VLS_209({
            ...{ 'onClick': {} },
            type: ("primary"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_209));
        let __VLS_214;
        const __VLS_215 = {
            onClick: (__VLS_ctx.saveRoles)
        };
        let __VLS_211;
        let __VLS_212;
        __VLS_213.slots.default;
        var __VLS_213;
    }
    var __VLS_175;
    const __VLS_216 = {}.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */ ;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        modelValue: ((__VLS_ctx.resetPasswordDialogVisible)),
        title: ("重置密码"),
        width: ("500px"),
    }));
    const __VLS_218 = __VLS_217({
        modelValue: ((__VLS_ctx.resetPasswordDialogVisible)),
        title: ("重置密码"),
        width: ("500px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    const __VLS_222 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({
        model: ((__VLS_ctx.resetForm)),
        labelWidth: ("100px"),
        rules: ((__VLS_ctx.resetRules)),
        ref: ("resetFormRef"),
    }));
    const __VLS_224 = __VLS_223({
        model: ((__VLS_ctx.resetForm)),
        labelWidth: ("100px"),
        rules: ((__VLS_ctx.resetRules)),
        ref: ("resetFormRef"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_223));
    // @ts-ignore navigation for `const resetFormRef = ref()`
    /** @type { typeof __VLS_ctx.resetFormRef } */ ;
    var __VLS_228 = {};
    const __VLS_229 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
        label: ("新密码"),
        prop: ("password"),
    }));
    const __VLS_231 = __VLS_230({
        label: ("新密码"),
        prop: ("password"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_230));
    const __VLS_235 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
        modelValue: ((__VLS_ctx.resetForm.password)),
        type: ("password"),
        placeholder: ("请输入新密码"),
    }));
    const __VLS_237 = __VLS_236({
        modelValue: ((__VLS_ctx.resetForm.password)),
        type: ("password"),
        placeholder: ("请输入新密码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    __VLS_234.slots.default;
    var __VLS_234;
    const __VLS_241 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
        label: ("确认密码"),
        prop: ("confirmPassword"),
    }));
    const __VLS_243 = __VLS_242({
        label: ("确认密码"),
        prop: ("confirmPassword"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    const __VLS_247 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
        modelValue: ((__VLS_ctx.resetForm.confirmPassword)),
        type: ("password"),
        placeholder: ("请再次输入新密码"),
    }));
    const __VLS_249 = __VLS_248({
        modelValue: ((__VLS_ctx.resetForm.confirmPassword)),
        type: ("password"),
        placeholder: ("请再次输入新密码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_248));
    __VLS_246.slots.default;
    var __VLS_246;
    __VLS_227.slots.default;
    var __VLS_227;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_221.slots;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("dialog-footer") },
        });
        const __VLS_253 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
            ...{ 'onClick': {} },
        }));
        const __VLS_255 = __VLS_254({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_254));
        let __VLS_259;
        const __VLS_260 = {
            onClick: (...[$event]) => {
                __VLS_ctx.resetPasswordDialogVisible = false;
            }
        };
        let __VLS_256;
        let __VLS_257;
        __VLS_258.slots.default;
        var __VLS_258;
        const __VLS_261 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
            ...{ 'onClick': {} },
            type: ("primary"),
        }));
        const __VLS_263 = __VLS_262({
            ...{ 'onClick': {} },
            type: ("primary"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_262));
        let __VLS_267;
        const __VLS_268 = {
            onClick: (__VLS_ctx.saveResetPassword)
        };
        let __VLS_264;
        let __VLS_265;
        __VLS_266.slots.default;
        var __VLS_266;
    }
    var __VLS_221;
    ['user-management', 'box-card', 'card-header', 'font-bold', 'text-lg', 'button-group', 'upload-excel', 'action-button', 'action-button', 'filter-row', 'filter-right', 'filter-input', 'operation-buttons', 'operation-button', 'operation-button', 'operation-button', 'pagination', 'dialog-footer', 'dialog-footer',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'resetFormRef': __VLS_228,
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
            Download: Download,
            Upload: Upload,
            BeiJingTime: BeiJingTime,
            getRoleName: getRoleName,
            userList: userList,
            roleList: roleList,
            loading: loading,
            roleDialogVisible: roleDialogVisible,
            resetPasswordDialogVisible: resetPasswordDialogVisible,
            defaultAvatar: defaultAvatar,
            resetFormRef: resetFormRef,
            searchUsername: searchUsername,
            currentPage: currentPage,
            pageSize: pageSize,
            total: total,
            roleForm: roleForm,
            resetForm: resetForm,
            resetRules: resetRules,
            fetchUsers: fetchUsers,
            handleRoles: handleRoles,
            saveRoles: saveRoles,
            handleResetPassword: handleResetPassword,
            saveResetPassword: saveResetPassword,
            handleCurrentChange: handleCurrentChange,
            handleSizeChange: handleSizeChange,
            handleDeleteUser: handleDeleteUser,
            downloadTemplate: downloadTemplate,
            handleExcelUpload: handleExcelUpload,
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
