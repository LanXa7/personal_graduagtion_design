import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import Apis from '@/alova';
import { useStore } from '@/store';
import BeiJingTime from '@/components/BeiJingTime.vue';
import { Plus } from '@element-plus/icons-vue';
const store = useStore();
const stallFormRef = ref();
const stallList = ref([]);
const canteenList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const allocationDialogVisible = ref(false);
const isEdit = ref(false);
const userList = ref([]);
const currentStallId = ref(null);
const filterCanteenId = ref(null);
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
    canteenId: undefined
});
const allocationForm = reactive({
    userId: undefined
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
    }
    catch (error) {
        console.error('获取摊位列表失败:', error);
        ElMessage.error('获取摊位列表失败');
    }
    finally {
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
                .filter((canteen, index, self) => canteen && self.findIndex(c => c.id === canteen.id) === index);
            if (userCanteens.length > 0) {
                // 设置食堂过滤条件
                canteenList.value = userCanteens;
                filterCanteenId.value = userCanteens[0].id;
            }
            else {
                canteenList.value = [];
            }
        }
        catch (error) {
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
    }
    catch (error) {
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
        userList.value = (data.rows || []).filter(user => user.roles && user.roles.some(role => role.code === 'stall_admin'));
    }
    catch (error) {
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
const handleEdit = (row) => {
    isEdit.value = true;
    currentStallId.value = row.id || null;
    stallForm.name = row.name || '';
    stallForm.canteenId = row.canteen?.id;
    stallForm.directorName = row.directorName || '';
    stallForm.directorPhone = row.directorPhone || '';
    dialogVisible.value = true;
};
// 分配管理员
const handleAllocation = (row) => {
    currentStallId.value = row.id || null;
    allocationForm.userId = row.user?.id;
    allocationDialogVisible.value = true;
    fetchUsers();
};
// 保存摊位信息
const saveStall = async () => {
    if (!stallFormRef.value)
        return;
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
                }
                else {
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
            }
            catch (error) {
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
    }
    catch (error) {
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
const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
    fetchStalls();
};
const handleCurrentChange = (newPage) => {
    currentPage.value = newPage;
    fetchStalls();
};
// 处理食堂选择变化
const handleCanteenChange = () => {
    currentPage.value = 1;
    fetchStalls();
};
// 删除摊位
const handleDeleteStall = async (row) => {
    try {
        await Apis.StallController.deleteStall({
            pathParams: { id: row.id || 0 }
        });
        ElMessage.success('删除成功');
        fetchStalls();
    }
    catch (error) {
        ElMessage.error('删除失败');
        console.error(error);
    }
};
onMounted(() => {
    fetchCanteens();
    fetchStalls();
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['card-header', 'button-group', 'button-group', 'action-button', 'button-group', 'action-button', 'el-table', 'el-table', 'el-table', 'operation-button', 'el-table', 'operation-buttons', 'el-select', 'el-input__inner', 'el-input-group__append',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stall-management") },
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
        const __VLS_6 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
            ...{ 'onClick': {} },
            type: ("primary"),
            ...{ class: ("action-button") },
        }));
        const __VLS_8 = __VLS_7({
            ...{ 'onClick': {} },
            type: ("primary"),
            ...{ class: ("action-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        let __VLS_12;
        const __VLS_13 = {
            onClick: (__VLS_ctx.handleAddStall)
        };
        let __VLS_9;
        let __VLS_10;
        const __VLS_14 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
        const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
        const __VLS_20 = {}.Plus;
        /** @type { [typeof __VLS_components.Plus, ] } */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_19.slots.default;
        var __VLS_19;
        __VLS_11.slots.default;
        var __VLS_11;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-row") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-left") },
    });
    if (__VLS_ctx.isSuperAdmin) {
        const __VLS_26 = {}.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.filterCanteenId)),
            placeholder: ("选择食堂"),
            clearable: (true),
            ...{ class: ("filter-select") },
        }));
        const __VLS_28 = __VLS_27({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.filterCanteenId)),
            placeholder: ("选择食堂"),
            clearable: (true),
            ...{ class: ("filter-select") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        let __VLS_32;
        const __VLS_33 = {
            onChange: (__VLS_ctx.handleCanteenChange)
        };
        let __VLS_29;
        let __VLS_30;
        for (const [canteen] of __VLS_getVForSourceType((__VLS_ctx.canteenList))) {
            const __VLS_34 = {}.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
            // @ts-ignore
            const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
                key: ((canteen.id || 0)),
                label: ((canteen.name)),
                value: ((canteen.id)),
            }));
            const __VLS_36 = __VLS_35({
                key: ((canteen.id || 0)),
                label: ((canteen.name)),
                value: ((canteen.id)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        }
        __VLS_31.slots.default;
        var __VLS_31;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-right") },
    });
    const __VLS_40 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onClear': {} },
        modelValue: ((__VLS_ctx.filterStallName)),
        placeholder: ("搜索摊位名称"),
        clearable: (true),
        ...{ class: ("filter-input") },
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClear': {} },
        modelValue: ((__VLS_ctx.filterStallName)),
        placeholder: ("搜索摊位名称"),
        clearable: (true),
        ...{ class: ("filter-input") },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_46;
    const __VLS_47 = {
        onClear: (__VLS_ctx.fetchStalls)
    };
    let __VLS_43;
    let __VLS_44;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { append: __VLS_thisSlot } = __VLS_45.slots;
        const __VLS_48 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onClick': {} },
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_54;
        const __VLS_55 = {
            onClick: (__VLS_ctx.fetchStalls)
        };
        let __VLS_51;
        let __VLS_52;
        __VLS_53.slots.default;
        var __VLS_53;
    }
    var __VLS_45;
    const __VLS_56 = {}.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        data: ((__VLS_ctx.stallList)),
        stripe: (true),
        ...{ style: ({}) },
    }));
    const __VLS_58 = __VLS_57({
        data: ((__VLS_ctx.stallList)),
        stripe: (true),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_62 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        label: ("序号"),
        width: ("80"),
        align: ("center"),
    }));
    const __VLS_64 = __VLS_63({
        label: ("序号"),
        width: ("80"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_67.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        ((__VLS_ctx.currentPage - 1) * __VLS_ctx.pageSize + scope.$index + 1);
    }
    var __VLS_67;
    const __VLS_68 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        prop: ("name"),
        label: ("摊位名称"),
        align: ("center"),
    }));
    const __VLS_70 = __VLS_69({
        prop: ("name"),
        label: ("摊位名称"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    const __VLS_74 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        prop: ("directorName"),
        label: ("负责人"),
        align: ("center"),
    }));
    const __VLS_76 = __VLS_75({
        prop: ("directorName"),
        label: ("负责人"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    const __VLS_80 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        prop: ("directorPhone"),
        label: ("联系电话"),
        align: ("center"),
    }));
    const __VLS_82 = __VLS_81({
        prop: ("directorPhone"),
        label: ("联系电话"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    const __VLS_86 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
        label: ("所属食堂"),
        align: ("center"),
    }));
    const __VLS_88 = __VLS_87({
        label: ("所属食堂"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_91.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.canteen?.name || '未分配');
    }
    var __VLS_91;
    const __VLS_92 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        label: ("管理员"),
        align: ("center"),
    }));
    const __VLS_94 = __VLS_93({
        label: ("管理员"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_97.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        if (scope.row.user) {
            const __VLS_98 = {}.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */ ;
            // @ts-ignore
            const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
                type: ("success"),
            }));
            const __VLS_100 = __VLS_99({
                type: ("success"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_99));
            (scope.row.user.username);
            __VLS_103.slots.default;
            var __VLS_103;
        }
        else {
            const __VLS_104 = {}.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */ ;
            // @ts-ignore
            const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
                type: ("info"),
            }));
            const __VLS_106 = __VLS_105({
                type: ("info"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_105));
            __VLS_109.slots.default;
            var __VLS_109;
        }
    }
    var __VLS_97;
    const __VLS_110 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
        label: ("创建时间"),
        align: ("center"),
    }));
    const __VLS_112 = __VLS_111({
        label: ("创建时间"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_115.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        // @ts-ignore
        /** @type { [typeof BeiJingTime, ] } */ ;
        // @ts-ignore
        const __VLS_116 = __VLS_asFunctionalComponent(BeiJingTime, new BeiJingTime({
            time: ((scope.row.createTime)),
        }));
        const __VLS_117 = __VLS_116({
            time: ((scope.row.createTime)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    }
    var __VLS_115;
    const __VLS_121 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
        label: ("操作"),
        width: ("360"),
        fixed: ("right"),
        align: ("center"),
    }));
    const __VLS_123 = __VLS_122({
        label: ("操作"),
        width: ("360"),
        fixed: ("right"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_126.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("operation-buttons") },
        });
        const __VLS_127 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_129 = __VLS_128({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_128));
        let __VLS_133;
        const __VLS_134 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
            }
        };
        let __VLS_130;
        let __VLS_131;
        __VLS_132.slots.default;
        var __VLS_132;
        const __VLS_135 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("success"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_137 = __VLS_136({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("success"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_136));
        let __VLS_141;
        const __VLS_142 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleAllocation(scope.row);
            }
        };
        let __VLS_138;
        let __VLS_139;
        __VLS_140.slots.default;
        var __VLS_140;
        const __VLS_143 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("danger"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_145 = __VLS_144({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("danger"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_144));
        let __VLS_149;
        const __VLS_150 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDeleteStall(scope.row);
            }
        };
        let __VLS_146;
        let __VLS_147;
        __VLS_148.slots.default;
        var __VLS_148;
    }
    var __VLS_126;
    __VLS_61.slots.default;
    var __VLS_61;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("pagination") },
    });
    const __VLS_151 = {}.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */ ;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }));
    const __VLS_153 = __VLS_152({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    let __VLS_157;
    const __VLS_158 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_159 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_154;
    let __VLS_155;
    var __VLS_156;
    var __VLS_5;
    const __VLS_160 = {}.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        modelValue: ((__VLS_ctx.dialogVisible)),
        title: ((__VLS_ctx.isEdit ? '编辑摊位' : '新增摊位')),
        width: ("500px"),
    }));
    const __VLS_162 = __VLS_161({
        modelValue: ((__VLS_ctx.dialogVisible)),
        title: ((__VLS_ctx.isEdit ? '编辑摊位' : '新增摊位')),
        width: ("500px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    const __VLS_166 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
        model: ((__VLS_ctx.stallForm)),
        labelWidth: ("100px"),
        rules: ((__VLS_ctx.rules)),
        ref: ("stallFormRef"),
    }));
    const __VLS_168 = __VLS_167({
        model: ((__VLS_ctx.stallForm)),
        labelWidth: ("100px"),
        rules: ((__VLS_ctx.rules)),
        ref: ("stallFormRef"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    // @ts-ignore navigation for `const stallFormRef = ref()`
    /** @type { typeof __VLS_ctx.stallFormRef } */ ;
    var __VLS_172 = {};
    const __VLS_173 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
        label: ("摊位名称"),
        prop: ("name"),
    }));
    const __VLS_175 = __VLS_174({
        label: ("摊位名称"),
        prop: ("name"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    const __VLS_179 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
        modelValue: ((__VLS_ctx.stallForm.name)),
        placeholder: ("请输入摊位名称"),
    }));
    const __VLS_181 = __VLS_180({
        modelValue: ((__VLS_ctx.stallForm.name)),
        placeholder: ("请输入摊位名称"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    __VLS_178.slots.default;
    var __VLS_178;
    if (__VLS_ctx.isSuperAdmin) {
        const __VLS_185 = {}.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
        // @ts-ignore
        const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
            label: ("所属食堂"),
            prop: ("canteenId"),
        }));
        const __VLS_187 = __VLS_186({
            label: ("所属食堂"),
            prop: ("canteenId"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_186));
        const __VLS_191 = {}.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
        // @ts-ignore
        const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
            modelValue: ((__VLS_ctx.stallForm.canteenId)),
            placeholder: ("请选择所属食堂"),
            ...{ style: ({}) },
        }));
        const __VLS_193 = __VLS_192({
            modelValue: ((__VLS_ctx.stallForm.canteenId)),
            placeholder: ("请选择所属食堂"),
            ...{ style: ({}) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_192));
        for (const [canteen] of __VLS_getVForSourceType((__VLS_ctx.canteenList))) {
            const __VLS_197 = {}.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
            // @ts-ignore
            const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
                key: ((canteen.id)),
                label: ((canteen.name)),
                value: ((canteen.id)),
            }));
            const __VLS_199 = __VLS_198({
                key: ((canteen.id)),
                label: ((canteen.name)),
                value: ((canteen.id)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_198));
        }
        __VLS_196.slots.default;
        var __VLS_196;
        __VLS_190.slots.default;
        var __VLS_190;
    }
    const __VLS_203 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
        label: ("负责人"),
        prop: ("directorName"),
    }));
    const __VLS_205 = __VLS_204({
        label: ("负责人"),
        prop: ("directorName"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    const __VLS_209 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
        modelValue: ((__VLS_ctx.stallForm.directorName)),
        placeholder: ("请输入负责人姓名"),
    }));
    const __VLS_211 = __VLS_210({
        modelValue: ((__VLS_ctx.stallForm.directorName)),
        placeholder: ("请输入负责人姓名"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    __VLS_208.slots.default;
    var __VLS_208;
    const __VLS_215 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
        label: ("联系电话"),
        prop: ("directorPhone"),
    }));
    const __VLS_217 = __VLS_216({
        label: ("联系电话"),
        prop: ("directorPhone"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    const __VLS_221 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
        modelValue: ((__VLS_ctx.stallForm.directorPhone)),
        placeholder: ("请输入联系电话"),
    }));
    const __VLS_223 = __VLS_222({
        modelValue: ((__VLS_ctx.stallForm.directorPhone)),
        placeholder: ("请输入联系电话"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_222));
    __VLS_220.slots.default;
    var __VLS_220;
    __VLS_171.slots.default;
    var __VLS_171;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_165.slots;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("dialog-footer") },
        });
        const __VLS_227 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({
            ...{ 'onClick': {} },
        }));
        const __VLS_229 = __VLS_228({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_228));
        let __VLS_233;
        const __VLS_234 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_230;
        let __VLS_231;
        __VLS_232.slots.default;
        var __VLS_232;
        const __VLS_235 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
            ...{ 'onClick': {} },
            type: ("primary"),
        }));
        const __VLS_237 = __VLS_236({
            ...{ 'onClick': {} },
            type: ("primary"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_236));
        let __VLS_241;
        const __VLS_242 = {
            onClick: (__VLS_ctx.saveStall)
        };
        let __VLS_238;
        let __VLS_239;
        __VLS_240.slots.default;
        var __VLS_240;
    }
    var __VLS_165;
    const __VLS_243 = {}.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */ ;
    // @ts-ignore
    const __VLS_244 = __VLS_asFunctionalComponent(__VLS_243, new __VLS_243({
        modelValue: ((__VLS_ctx.allocationDialogVisible)),
        title: ("分配管理员"),
        width: ("500px"),
    }));
    const __VLS_245 = __VLS_244({
        modelValue: ((__VLS_ctx.allocationDialogVisible)),
        title: ("分配管理员"),
        width: ("500px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_244));
    const __VLS_249 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
        model: ((__VLS_ctx.allocationForm)),
        labelWidth: ("100px"),
    }));
    const __VLS_251 = __VLS_250({
        model: ((__VLS_ctx.allocationForm)),
        labelWidth: ("100px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_250));
    const __VLS_255 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_256 = __VLS_asFunctionalComponent(__VLS_255, new __VLS_255({
        label: ("管理员"),
    }));
    const __VLS_257 = __VLS_256({
        label: ("管理员"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_256));
    const __VLS_261 = {}.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
    // @ts-ignore
    const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
        modelValue: ((__VLS_ctx.allocationForm.userId)),
        placeholder: ("请选择管理员"),
    }));
    const __VLS_263 = __VLS_262({
        modelValue: ((__VLS_ctx.allocationForm.userId)),
        placeholder: ("请选择管理员"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_262));
    for (const [user] of __VLS_getVForSourceType((__VLS_ctx.userList))) {
        const __VLS_267 = {}.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
        // @ts-ignore
        const __VLS_268 = __VLS_asFunctionalComponent(__VLS_267, new __VLS_267({
            key: ((user.id || 0)),
            label: ((user.username)),
            value: ((user.id)),
        }));
        const __VLS_269 = __VLS_268({
            key: ((user.id || 0)),
            label: ((user.username)),
            value: ((user.id)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_268));
    }
    __VLS_266.slots.default;
    var __VLS_266;
    __VLS_260.slots.default;
    var __VLS_260;
    __VLS_254.slots.default;
    var __VLS_254;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_248.slots;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("dialog-footer") },
        });
        const __VLS_273 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
            ...{ 'onClick': {} },
        }));
        const __VLS_275 = __VLS_274({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_274));
        let __VLS_279;
        const __VLS_280 = {
            onClick: (...[$event]) => {
                __VLS_ctx.allocationDialogVisible = false;
            }
        };
        let __VLS_276;
        let __VLS_277;
        __VLS_278.slots.default;
        var __VLS_278;
        const __VLS_281 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_282 = __VLS_asFunctionalComponent(__VLS_281, new __VLS_281({
            ...{ 'onClick': {} },
            type: ("primary"),
        }));
        const __VLS_283 = __VLS_282({
            ...{ 'onClick': {} },
            type: ("primary"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_282));
        let __VLS_287;
        const __VLS_288 = {
            onClick: (__VLS_ctx.saveAllocation)
        };
        let __VLS_284;
        let __VLS_285;
        __VLS_286.slots.default;
        var __VLS_286;
    }
    var __VLS_248;
    ['stall-management', 'box-card', 'card-header', 'font-bold', 'text-lg', 'button-group', 'action-button', 'filter-row', 'filter-left', 'filter-select', 'filter-right', 'filter-input', 'operation-buttons', 'operation-button', 'operation-button', 'operation-button', 'pagination', 'dialog-footer', 'dialog-footer',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'stallFormRef': __VLS_172,
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
            BeiJingTime: BeiJingTime,
            Plus: Plus,
            stallFormRef: stallFormRef,
            stallList: stallList,
            canteenList: canteenList,
            loading: loading,
            dialogVisible: dialogVisible,
            allocationDialogVisible: allocationDialogVisible,
            isEdit: isEdit,
            userList: userList,
            filterCanteenId: filterCanteenId,
            filterStallName: filterStallName,
            currentPage: currentPage,
            pageSize: pageSize,
            total: total,
            isSuperAdmin: isSuperAdmin,
            stallForm: stallForm,
            allocationForm: allocationForm,
            rules: rules,
            fetchStalls: fetchStalls,
            handleAddStall: handleAddStall,
            handleEdit: handleEdit,
            handleAllocation: handleAllocation,
            saveStall: saveStall,
            saveAllocation: saveAllocation,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            handleCanteenChange: handleCanteenChange,
            handleDeleteStall: handleDeleteStall,
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
