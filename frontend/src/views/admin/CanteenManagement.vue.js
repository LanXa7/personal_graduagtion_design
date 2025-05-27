import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import Apis from '@/alova';
import BeiJingTime from '@/components/BeiJingTime.vue';
const canteenFormRef = ref();
const canteenList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const allocationDialogVisible = ref(false);
const isEdit = ref(false);
const userList = ref([]);
const currentCanteenId = ref(null);
// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
// 添加搜索变量
const searchName = ref('');
const canteenForm = reactive({
    name: '',
    directorName: '',
    directorPhone: '',
    address: ''
});
const allocationForm = reactive({
    userId: undefined
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
    }
    catch (error) {
        ElMessage.error('获取食堂列表失败');
        console.error(error);
    }
    finally {
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
        userList.value = (data.rows || []).filter(user => user.roles && user.roles.some(role => role.code === 'canteen_admin')).map(user => ({
            id: user.id,
            username: user.username,
            label: user.username // 添加label属性用于显示
        }));
    }
    catch (error) {
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
const handleEdit = (row) => {
    isEdit.value = true;
    currentCanteenId.value = row.id || null;
    canteenForm.name = row.name || '';
    canteenForm.directorName = row.directorName || '';
    canteenForm.directorPhone = row.directorPhone || '';
    canteenForm.address = row.address || '';
    dialogVisible.value = true;
};
// 分配管理员
const handleAllocation = (row) => {
    currentCanteenId.value = row.id || null;
    allocationForm.userId = row.user?.id;
    allocationDialogVisible.value = true;
    fetchUsers(); // 获取用户列表以便选择
};
// 保存食堂信息
const saveCanteen = async () => {
    if (!canteenFormRef.value)
        return;
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
                }
                else {
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
            }
            catch (error) {
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
    }
    catch (error) {
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
const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
    fetchCanteens();
};
const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchCanteens();
};
// 删除食堂
const handleDeleteCanteen = async (row) => {
    try {
        await Apis.CanteenController.deleteCanteen({
            pathParams: { id: row.id || 0 }
        });
        ElMessage.success('删除成功');
        fetchCanteens();
    }
    catch (error) {
        ElMessage.error('删除失败');
        console.error(error);
    }
};
onMounted(() => {
    fetchCanteens();
    fetchUsers();
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['card-header', 'button-group', 'button-group', 'action-button', 'button-group', 'action-button', 'el-table', 'el-table', 'el-table', 'operation-button', 'el-table', 'operation-buttons',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("canteen-management") },
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
            onClick: (__VLS_ctx.handleAddCanteen)
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
        ...{ class: ("search-container") },
    });
    const __VLS_26 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
        ...{ 'onClear': {} },
        modelValue: ((__VLS_ctx.searchName)),
        placeholder: ("请输入食堂名称"),
        ...{ class: ("search-input") },
        clearable: (true),
    }));
    const __VLS_28 = __VLS_27({
        ...{ 'onClear': {} },
        modelValue: ((__VLS_ctx.searchName)),
        placeholder: ("请输入食堂名称"),
        ...{ class: ("search-input") },
        clearable: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_32;
    const __VLS_33 = {
        onClear: (__VLS_ctx.fetchCanteens)
    };
    let __VLS_29;
    let __VLS_30;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { append: __VLS_thisSlot } = __VLS_31.slots;
        const __VLS_34 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
            ...{ 'onClick': {} },
        }));
        const __VLS_36 = __VLS_35({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        let __VLS_40;
        const __VLS_41 = {
            onClick: (__VLS_ctx.fetchCanteens)
        };
        let __VLS_37;
        let __VLS_38;
        const __VLS_42 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({}));
        const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
        const __VLS_48 = {}.Search;
        /** @type { [typeof __VLS_components.Search, ] } */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
        const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_47.slots.default;
        var __VLS_47;
        __VLS_39.slots.default;
        var __VLS_39;
    }
    var __VLS_31;
    const __VLS_54 = {}.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        data: ((__VLS_ctx.canteenList)),
        stripe: (true),
        ...{ style: ({}) },
    }));
    const __VLS_56 = __VLS_55({
        data: ((__VLS_ctx.canteenList)),
        stripe: (true),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_60 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        label: ("序号"),
        width: ("80"),
        align: ("center"),
    }));
    const __VLS_62 = __VLS_61({
        label: ("序号"),
        width: ("80"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_65.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        ((__VLS_ctx.currentPage - 1) * __VLS_ctx.pageSize + scope.$index + 1);
    }
    var __VLS_65;
    const __VLS_66 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
        prop: ("name"),
        label: ("食堂名称"),
        align: ("center"),
    }));
    const __VLS_68 = __VLS_67({
        prop: ("name"),
        label: ("食堂名称"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    const __VLS_72 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        prop: ("directorName"),
        label: ("负责人"),
        align: ("center"),
    }));
    const __VLS_74 = __VLS_73({
        prop: ("directorName"),
        label: ("负责人"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    const __VLS_78 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
        prop: ("directorPhone"),
        label: ("联系电话"),
        align: ("center"),
    }));
    const __VLS_80 = __VLS_79({
        prop: ("directorPhone"),
        label: ("联系电话"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    const __VLS_84 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        prop: ("address"),
        label: ("地址"),
        align: ("center"),
    }));
    const __VLS_86 = __VLS_85({
        prop: ("address"),
        label: ("地址"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    const __VLS_90 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        label: ("管理员"),
        align: ("center"),
    }));
    const __VLS_92 = __VLS_91({
        label: ("管理员"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_95.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        if (scope.row.user) {
            const __VLS_96 = {}.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */ ;
            // @ts-ignore
            const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
                type: ("success"),
            }));
            const __VLS_98 = __VLS_97({
                type: ("success"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_97));
            (scope.row.user.username);
            __VLS_101.slots.default;
            var __VLS_101;
        }
        else {
            const __VLS_102 = {}.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */ ;
            // @ts-ignore
            const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
                type: ("info"),
            }));
            const __VLS_104 = __VLS_103({
                type: ("info"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_103));
            __VLS_107.slots.default;
            var __VLS_107;
        }
    }
    var __VLS_95;
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
        label: ("操作"),
        width: ("360"),
        align: ("center"),
    }));
    const __VLS_121 = __VLS_120({
        label: ("操作"),
        width: ("360"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_124.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("operation-buttons") },
        });
        const __VLS_125 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_127 = __VLS_126({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_126));
        let __VLS_131;
        const __VLS_132 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
            }
        };
        let __VLS_128;
        let __VLS_129;
        __VLS_130.slots.default;
        var __VLS_130;
        const __VLS_133 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("success"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_135 = __VLS_134({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("success"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        let __VLS_139;
        const __VLS_140 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleAllocation(scope.row);
            }
        };
        let __VLS_136;
        let __VLS_137;
        __VLS_138.slots.default;
        var __VLS_138;
        const __VLS_141 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("danger"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_143 = __VLS_142({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("danger"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        let __VLS_147;
        const __VLS_148 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDeleteCanteen(scope.row);
            }
        };
        let __VLS_144;
        let __VLS_145;
        __VLS_146.slots.default;
        var __VLS_146;
    }
    var __VLS_124;
    __VLS_59.slots.default;
    var __VLS_59;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("pagination") },
    });
    const __VLS_149 = {}.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */ ;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }));
    const __VLS_151 = __VLS_150({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    let __VLS_155;
    const __VLS_156 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_157 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_152;
    let __VLS_153;
    var __VLS_154;
    var __VLS_5;
    const __VLS_158 = {}.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */ ;
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
        modelValue: ((__VLS_ctx.dialogVisible)),
        title: ((__VLS_ctx.isEdit ? '编辑食堂' : '新增食堂')),
        width: ("500px"),
    }));
    const __VLS_160 = __VLS_159({
        modelValue: ((__VLS_ctx.dialogVisible)),
        title: ((__VLS_ctx.isEdit ? '编辑食堂' : '新增食堂')),
        width: ("500px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    const __VLS_164 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        model: ((__VLS_ctx.canteenForm)),
        labelWidth: ("100px"),
        rules: ((__VLS_ctx.rules)),
        ref: ("canteenFormRef"),
    }));
    const __VLS_166 = __VLS_165({
        model: ((__VLS_ctx.canteenForm)),
        labelWidth: ("100px"),
        rules: ((__VLS_ctx.rules)),
        ref: ("canteenFormRef"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    // @ts-ignore navigation for `const canteenFormRef = ref()`
    /** @type { typeof __VLS_ctx.canteenFormRef } */ ;
    var __VLS_170 = {};
    const __VLS_171 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({
        label: ("食堂名称"),
        prop: ("name"),
    }));
    const __VLS_173 = __VLS_172({
        label: ("食堂名称"),
        prop: ("name"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    const __VLS_177 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
        modelValue: ((__VLS_ctx.canteenForm.name)),
        placeholder: ("请输入食堂名称"),
    }));
    const __VLS_179 = __VLS_178({
        modelValue: ((__VLS_ctx.canteenForm.name)),
        placeholder: ("请输入食堂名称"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_178));
    __VLS_176.slots.default;
    var __VLS_176;
    const __VLS_183 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
        label: ("负责人"),
        prop: ("directorName"),
    }));
    const __VLS_185 = __VLS_184({
        label: ("负责人"),
        prop: ("directorName"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    const __VLS_189 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
        modelValue: ((__VLS_ctx.canteenForm.directorName)),
        placeholder: ("请输入负责人姓名"),
    }));
    const __VLS_191 = __VLS_190({
        modelValue: ((__VLS_ctx.canteenForm.directorName)),
        placeholder: ("请输入负责人姓名"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_190));
    __VLS_188.slots.default;
    var __VLS_188;
    const __VLS_195 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({
        label: ("联系电话"),
        prop: ("directorPhone"),
    }));
    const __VLS_197 = __VLS_196({
        label: ("联系电话"),
        prop: ("directorPhone"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_196));
    const __VLS_201 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
        modelValue: ((__VLS_ctx.canteenForm.directorPhone)),
        placeholder: ("请输入联系电话"),
    }));
    const __VLS_203 = __VLS_202({
        modelValue: ((__VLS_ctx.canteenForm.directorPhone)),
        placeholder: ("请输入联系电话"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_202));
    __VLS_200.slots.default;
    var __VLS_200;
    const __VLS_207 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({
        label: ("地址"),
        prop: ("address"),
    }));
    const __VLS_209 = __VLS_208({
        label: ("地址"),
        prop: ("address"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_208));
    const __VLS_213 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
        modelValue: ((__VLS_ctx.canteenForm.address)),
        placeholder: ("请输入地址"),
    }));
    const __VLS_215 = __VLS_214({
        modelValue: ((__VLS_ctx.canteenForm.address)),
        placeholder: ("请输入地址"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_214));
    __VLS_212.slots.default;
    var __VLS_212;
    __VLS_169.slots.default;
    var __VLS_169;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_163.slots;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("dialog-footer") },
        });
        const __VLS_219 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({
            ...{ 'onClick': {} },
        }));
        const __VLS_221 = __VLS_220({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_220));
        let __VLS_225;
        const __VLS_226 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_222;
        let __VLS_223;
        __VLS_224.slots.default;
        var __VLS_224;
        const __VLS_227 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_228 = __VLS_asFunctionalComponent(__VLS_227, new __VLS_227({
            ...{ 'onClick': {} },
            type: ("primary"),
        }));
        const __VLS_229 = __VLS_228({
            ...{ 'onClick': {} },
            type: ("primary"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_228));
        let __VLS_233;
        const __VLS_234 = {
            onClick: (__VLS_ctx.saveCanteen)
        };
        let __VLS_230;
        let __VLS_231;
        __VLS_232.slots.default;
        var __VLS_232;
    }
    var __VLS_163;
    const __VLS_235 = {}.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */ ;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent(__VLS_235, new __VLS_235({
        modelValue: ((__VLS_ctx.allocationDialogVisible)),
        title: ("分配管理员"),
        width: ("500px"),
    }));
    const __VLS_237 = __VLS_236({
        modelValue: ((__VLS_ctx.allocationDialogVisible)),
        title: ("分配管理员"),
        width: ("500px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    const __VLS_241 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
        model: ((__VLS_ctx.allocationForm)),
        labelWidth: ("100px"),
    }));
    const __VLS_243 = __VLS_242({
        model: ((__VLS_ctx.allocationForm)),
        labelWidth: ("100px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    const __VLS_247 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_248 = __VLS_asFunctionalComponent(__VLS_247, new __VLS_247({
        label: ("管理员"),
    }));
    const __VLS_249 = __VLS_248({
        label: ("管理员"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_248));
    const __VLS_253 = {}.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
        modelValue: ((__VLS_ctx.allocationForm.userId)),
        placeholder: ("请选择管理员"),
        ...{ style: ({}) },
    }));
    const __VLS_255 = __VLS_254({
        modelValue: ((__VLS_ctx.allocationForm.userId)),
        placeholder: ("请选择管理员"),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    for (const [user] of __VLS_getVForSourceType((__VLS_ctx.userList))) {
        const __VLS_259 = {}.ElOption;
        /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
        // @ts-ignore
        const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
            key: ((user.id)),
            label: ((user.username)),
            value: ((user.id)),
        }));
        const __VLS_261 = __VLS_260({
            key: ((user.id)),
            label: ((user.username)),
            value: ((user.id)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_260));
    }
    __VLS_258.slots.default;
    var __VLS_258;
    __VLS_252.slots.default;
    var __VLS_252;
    __VLS_246.slots.default;
    var __VLS_246;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_240.slots;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("dialog-footer") },
        });
        const __VLS_265 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({
            ...{ 'onClick': {} },
        }));
        const __VLS_267 = __VLS_266({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_266));
        let __VLS_271;
        const __VLS_272 = {
            onClick: (...[$event]) => {
                __VLS_ctx.allocationDialogVisible = false;
            }
        };
        let __VLS_268;
        let __VLS_269;
        __VLS_270.slots.default;
        var __VLS_270;
        const __VLS_273 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
            ...{ 'onClick': {} },
            type: ("primary"),
        }));
        const __VLS_275 = __VLS_274({
            ...{ 'onClick': {} },
            type: ("primary"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_274));
        let __VLS_279;
        const __VLS_280 = {
            onClick: (__VLS_ctx.saveAllocation)
        };
        let __VLS_276;
        let __VLS_277;
        __VLS_278.slots.default;
        var __VLS_278;
    }
    var __VLS_240;
    ['canteen-management', 'box-card', 'card-header', 'font-bold', 'text-lg', 'button-group', 'action-button', 'search-container', 'search-input', 'operation-buttons', 'operation-button', 'operation-button', 'operation-button', 'pagination', 'dialog-footer', 'dialog-footer',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'canteenFormRef': __VLS_170,
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
            Search: Search,
            Plus: Plus,
            BeiJingTime: BeiJingTime,
            canteenFormRef: canteenFormRef,
            canteenList: canteenList,
            loading: loading,
            dialogVisible: dialogVisible,
            allocationDialogVisible: allocationDialogVisible,
            isEdit: isEdit,
            userList: userList,
            currentPage: currentPage,
            pageSize: pageSize,
            total: total,
            searchName: searchName,
            canteenForm: canteenForm,
            allocationForm: allocationForm,
            rules: rules,
            fetchCanteens: fetchCanteens,
            handleAddCanteen: handleAddCanteen,
            handleEdit: handleEdit,
            handleAllocation: handleAllocation,
            saveCanteen: saveCanteen,
            saveAllocation: saveAllocation,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            handleDeleteCanteen: handleDeleteCanteen,
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
