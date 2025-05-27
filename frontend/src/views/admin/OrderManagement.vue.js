import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Picture } from '@element-plus/icons-vue';
import Apis, { alovaInstance } from '@/alova';
import BeiJingTime from '@/components/BeiJingTime.vue';
import { useStore } from '@/store';
const store = useStore();
const orderList = ref([]);
const canteenList = ref([]);
const stallList = ref([]);
const loading = ref(false);
const orderDetailVisible = ref(false);
const currentOrder = ref(null);
const filterCanteenId = ref(null);
const filterStallId = ref(null);
const filterState = ref(null);
const dateRange = ref(null);
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
const disabledDate = (time) => {
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
        }
        else if (isCanteenAdmin.value) {
            // 食堂管理员需要获取摊位列表和订单列表
            await Promise.all([fetchStalls(), fetchOrders()]);
        }
        else {
            // 超级管理员需要获取食堂、摊位和订单列表
            await Promise.all([fetchCanteens(), fetchStalls(), fetchOrders()]);
        }
        console.log('Initial data loaded successfully');
    }
    catch (error) {
        console.error('Error during component initialization:', error);
        ElMessage.error('初始化页面数据失败，请刷新重试');
    }
});
// 获取订单列表
const fetchOrders = async () => {
    loading.value = true;
    try {
        const data = await alovaInstance.Get('/order/page', {
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
    }
    catch (error) {
        console.error('获取订单列表失败:', error);
        ElMessage.error('获取订单列表失败');
    }
    finally {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('获取摊位列表失败:', error);
        ElMessage.error('获取摊位列表失败');
    }
};
// 处理食堂选择变化
const handleCanteenChange = () => {
    filterStallId.value = null;
    if (filterCanteenId.value) {
        fetchStalls();
    }
    else {
        stallList.value = [];
    }
    fetchOrders();
};
// 查看订单详情
const handleViewOrder = async (order) => {
    try {
        // 获取完整的订单详情，包括订单项
        const data = await Apis.OrderController.getOrderItem({
            pathParams: { id: order.id || 0 }
        });
        currentOrder.value = data;
        orderDetailVisible.value = true;
    }
    catch (error) {
        ElMessage.error('获取订单详情失败');
        console.error(error);
    }
};
// 分页处理
const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
    fetchOrders();
};
const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchOrders();
};
// 获取订单状态文本
const getOrderStateName = (state) => {
    if (state === undefined)
        return '未知状态';
    const stateMap = {
        0: '待支付',
        1: '已支付',
        2: '已取消'
    };
    return stateMap[state] || '未知状态';
};
// 获取订单状态类型
const getOrderStateType = (state) => {
    if (state === undefined)
        return 'info';
    const typeMap = {
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
        const userStall = (data || []).find(stall => stall.user && stall.user.id === store.user?.id);
        return userStall;
    }
    catch (error) {
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
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['card-header', 'button-group', 'button-group', 'action-button', 'button-group', 'action-button', 'el-table', 'el-table', 'el-table', 'operation-button', 'el-table', 'operation-buttons', 'order-info', 'order-info', 'el-input-group__append', 'el-date-editor', 'el-input__inner', 'image-error', 'el-icon',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("order-management") },
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
            type: ("info"),
            ...{ class: ("action-button") },
        }));
        const __VLS_8 = __VLS_7({
            ...{ 'onClick': {} },
            type: ("info"),
            ...{ class: ("action-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        let __VLS_12;
        const __VLS_13 = {
            onClick: (__VLS_ctx.clearFilters)
        };
        let __VLS_9;
        let __VLS_10;
        const __VLS_14 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({}));
        const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
        const __VLS_20 = {}.Refresh;
        /** @type { [typeof __VLS_components.Refresh, ] } */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_19.slots.default;
        var __VLS_19;
        __VLS_11.slots.default;
        var __VLS_11;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-row mb-4") },
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
    if (__VLS_ctx.isSuperAdmin || __VLS_ctx.isCanteenAdmin) {
        const __VLS_40 = {}.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.filterStallId)),
            placeholder: ("选择摊位"),
            clearable: (true),
            ...{ class: ("filter-select") },
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.filterStallId)),
            placeholder: ("选择摊位"),
            clearable: (true),
            ...{ class: ("filter-select") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_46;
        const __VLS_47 = {
            onChange: (__VLS_ctx.fetchOrders)
        };
        let __VLS_43;
        let __VLS_44;
        for (const [stall] of __VLS_getVForSourceType((__VLS_ctx.stallList))) {
            const __VLS_48 = {}.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                key: ((stall.id || 0)),
                label: ((stall.name)),
                value: ((stall.id)),
            }));
            const __VLS_50 = __VLS_49({
                key: ((stall.id || 0)),
                label: ((stall.name)),
                value: ((stall.id)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        }
        __VLS_45.slots.default;
        var __VLS_45;
    }
    const __VLS_54 = {}.ElSelect;
    /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        ...{ 'onChange': {} },
        modelValue: ((__VLS_ctx.filterState)),
        placeholder: ("订单状态"),
        clearable: (true),
        ...{ class: ("filter-select") },
    }));
    const __VLS_56 = __VLS_55({
        ...{ 'onChange': {} },
        modelValue: ((__VLS_ctx.filterState)),
        placeholder: ("订单状态"),
        clearable: (true),
        ...{ class: ("filter-select") },
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    let __VLS_60;
    const __VLS_61 = {
        onChange: (__VLS_ctx.fetchOrders)
    };
    let __VLS_57;
    let __VLS_58;
    const __VLS_62 = {}.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
        label: ("待支付"),
        value: ((0)),
    }));
    const __VLS_64 = __VLS_63({
        label: ("待支付"),
        value: ((0)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    const __VLS_68 = {}.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        label: ("已支付"),
        value: ((1)),
    }));
    const __VLS_70 = __VLS_69({
        label: ("已支付"),
        value: ((1)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    const __VLS_74 = {}.ElOption;
    /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        label: ("已取消"),
        value: ((2)),
    }));
    const __VLS_76 = __VLS_75({
        label: ("已取消"),
        value: ((2)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    __VLS_59.slots.default;
    var __VLS_59;
    const __VLS_80 = {}.ElDatePicker;
    /** @type { [typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ] } */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        ...{ 'onChange': {} },
        modelValue: ((__VLS_ctx.dateRange)),
        type: ("daterange"),
        unlinkPanels: (true),
        rangeSeparator: ("至"),
        startPlaceholder: ("开始日期"),
        endPlaceholder: ("结束日期"),
        format: ("YYYY-MM-DD"),
        valueFormat: ("YYYY-MM-DD"),
        shortcuts: ((__VLS_ctx.dateShortcuts)),
        disabledDate: ((__VLS_ctx.disabledDate)),
        ...{ class: ("date-picker") },
        clearable: ((true)),
        editable: ((true)),
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onChange': {} },
        modelValue: ((__VLS_ctx.dateRange)),
        type: ("daterange"),
        unlinkPanels: (true),
        rangeSeparator: ("至"),
        startPlaceholder: ("开始日期"),
        endPlaceholder: ("结束日期"),
        format: ("YYYY-MM-DD"),
        valueFormat: ("YYYY-MM-DD"),
        shortcuts: ((__VLS_ctx.dateShortcuts)),
        disabledDate: ((__VLS_ctx.disabledDate)),
        ...{ class: ("date-picker") },
        clearable: ((true)),
        editable: ((true)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_86;
    const __VLS_87 = {
        onChange: (__VLS_ctx.fetchOrders)
    };
    let __VLS_83;
    let __VLS_84;
    var __VLS_85;
    const __VLS_88 = {}.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        data: ((__VLS_ctx.orderList)),
        stripe: (true),
        ...{ style: ({}) },
    }));
    const __VLS_90 = __VLS_89({
        data: ((__VLS_ctx.orderList)),
        stripe: (true),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_94 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        label: ("序号"),
        width: ("80"),
        align: ("center"),
    }));
    const __VLS_96 = __VLS_95({
        label: ("序号"),
        width: ("80"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_99.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        ((__VLS_ctx.currentPage - 1) * __VLS_ctx.pageSize + scope.$index + 1);
    }
    var __VLS_99;
    const __VLS_100 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        prop: ("code"),
        label: ("订单编号"),
        align: ("center"),
    }));
    const __VLS_102 = __VLS_101({
        prop: ("code"),
        label: ("订单编号"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const __VLS_106 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
        prop: ("totalPrice"),
        label: ("总价"),
        align: ("center"),
    }));
    const __VLS_108 = __VLS_107({
        prop: ("totalPrice"),
        label: ("总价"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_111.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.totalPrice?.toFixed(2));
    }
    var __VLS_111;
    const __VLS_112 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        label: ("订单状态"),
        align: ("center"),
    }));
    const __VLS_114 = __VLS_113({
        label: ("订单状态"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_117.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_118 = {}.ElTag;
        /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */ ;
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
            type: ((__VLS_ctx.getOrderStateType(scope.row.state))),
        }));
        const __VLS_120 = __VLS_119({
            type: ((__VLS_ctx.getOrderStateType(scope.row.state))),
        }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        (__VLS_ctx.getOrderStateName(scope.row.state));
        __VLS_123.slots.default;
        var __VLS_123;
    }
    var __VLS_117;
    const __VLS_124 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        label: ("所属摊位"),
        align: ("center"),
    }));
    const __VLS_126 = __VLS_125({
        label: ("所属摊位"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_129.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.stall?.name || '未分配');
    }
    var __VLS_129;
    const __VLS_130 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
        label: ("创建时间"),
        align: ("center"),
    }));
    const __VLS_132 = __VLS_131({
        label: ("创建时间"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_135.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        // @ts-ignore
        /** @type { [typeof BeiJingTime, ] } */ ;
        // @ts-ignore
        const __VLS_136 = __VLS_asFunctionalComponent(BeiJingTime, new BeiJingTime({
            time: ((scope.row.createTime)),
        }));
        const __VLS_137 = __VLS_136({
            time: ((scope.row.createTime)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_136));
    }
    var __VLS_135;
    const __VLS_141 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
        label: ("操作"),
        width: ("120"),
        fixed: ("right"),
        align: ("center"),
    }));
    const __VLS_143 = __VLS_142({
        label: ("操作"),
        width: ("120"),
        fixed: ("right"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_142));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_146.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("operation-buttons") },
        });
        const __VLS_147 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_149 = __VLS_148({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_148));
        let __VLS_153;
        const __VLS_154 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleViewOrder(scope.row);
            }
        };
        let __VLS_150;
        let __VLS_151;
        __VLS_152.slots.default;
        var __VLS_152;
    }
    var __VLS_146;
    __VLS_93.slots.default;
    var __VLS_93;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("pagination") },
    });
    const __VLS_155 = {}.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */ ;
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }));
    const __VLS_157 = __VLS_156({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    let __VLS_161;
    const __VLS_162 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_163 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_158;
    let __VLS_159;
    var __VLS_160;
    var __VLS_5;
    const __VLS_164 = {}.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        modelValue: ((__VLS_ctx.orderDetailVisible)),
        title: ("订单详情"),
        width: ("800px"),
    }));
    const __VLS_166 = __VLS_165({
        modelValue: ((__VLS_ctx.orderDetailVisible)),
        title: ("订单详情"),
        width: ("800px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("order-detail") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("order-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("order-info") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.currentOrder?.code);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    // @ts-ignore
    /** @type { [typeof BeiJingTime, ] } */ ;
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent(BeiJingTime, new BeiJingTime({
        time: ((__VLS_ctx.currentOrder?.createTime)),
        format: ("YYYY-MM-DD HH:mm:ss"),
    }));
    const __VLS_171 = __VLS_170({
        time: ((__VLS_ctx.currentOrder?.createTime)),
        format: ("YYYY-MM-DD HH:mm:ss"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    const __VLS_175 = {}.ElTag;
    /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */ ;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        type: ((__VLS_ctx.getOrderStateType(__VLS_ctx.currentOrder?.state))),
    }));
    const __VLS_177 = __VLS_176({
        type: ((__VLS_ctx.getOrderStateType(__VLS_ctx.currentOrder?.state))),
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    (__VLS_ctx.getOrderStateName(__VLS_ctx.currentOrder?.state));
    __VLS_180.slots.default;
    var __VLS_180;
    if (__VLS_ctx.currentOrder?.picture) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("order-image") },
        });
        const __VLS_181 = {}.ElImage;
        /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */ ;
        // @ts-ignore
        const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
            src: ((`/api/images${__VLS_ctx.currentOrder.picture}`)),
            previewSrcList: (([`/api/images${__VLS_ctx.currentOrder.picture}`])),
            fit: ("contain"),
            ...{ class: ("order-image-preview") },
            previewTeleported: ((true)),
        }));
        const __VLS_183 = __VLS_182({
            src: ((`/api/images${__VLS_ctx.currentOrder.picture}`)),
            previewSrcList: (([`/api/images${__VLS_ctx.currentOrder.picture}`])),
            fit: ("contain"),
            ...{ class: ("order-image-preview") },
            previewTeleported: ((true)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_182));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { error: __VLS_thisSlot } = __VLS_186.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("image-error") },
            });
            const __VLS_187 = {}.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
            // @ts-ignore
            const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({}));
            const __VLS_189 = __VLS_188({}, ...__VLS_functionalComponentArgsRest(__VLS_188));
            const __VLS_193 = {}.Picture;
            /** @type { [typeof __VLS_components.Picture, ] } */ ;
            // @ts-ignore
            const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({}));
            const __VLS_195 = __VLS_194({}, ...__VLS_functionalComponentArgsRest(__VLS_194));
            __VLS_192.slots.default;
            var __VLS_192;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
        var __VLS_186;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("order-items") },
    });
    const __VLS_199 = {}.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */ ;
    // @ts-ignore
    const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
        data: ((__VLS_ctx.currentOrder?.orderItems)),
        stripe: (true),
    }));
    const __VLS_201 = __VLS_200({
        data: ((__VLS_ctx.currentOrder?.orderItems)),
        stripe: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_200));
    const __VLS_205 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
        prop: ("food.name"),
        label: ("餐品名称"),
        align: ("center"),
    }));
    const __VLS_207 = __VLS_206({
        prop: ("food.name"),
        label: ("餐品名称"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_206));
    const __VLS_211 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({
        prop: ("totalNumber"),
        label: ("数量"),
        align: ("center"),
    }));
    const __VLS_213 = __VLS_212({
        prop: ("totalNumber"),
        label: ("数量"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_212));
    const __VLS_217 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
        prop: ("totalPrice"),
        label: ("总价"),
        align: ("center"),
    }));
    const __VLS_219 = __VLS_218({
        prop: ("totalPrice"),
        label: ("总价"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_222.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.totalPrice?.toFixed(2));
    }
    var __VLS_222;
    __VLS_204.slots.default;
    var __VLS_204;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("order-footer") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("order-total") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("price") },
    });
    (__VLS_ctx.currentOrder?.totalPrice?.toFixed(2));
    __VLS_169.slots.default;
    var __VLS_169;
    ['order-management', 'box-card', 'card-header', 'font-bold', 'text-lg', 'button-group', 'action-button', 'filter-row', 'mb-4', 'filter-select', 'filter-select', 'filter-select', 'date-picker', 'operation-buttons', 'operation-button', 'pagination', 'order-detail', 'order-header', 'order-info', 'order-image', 'order-image-preview', 'image-error', 'order-items', 'order-footer', 'order-total', 'price',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {};
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
            Refresh: Refresh,
            Picture: Picture,
            BeiJingTime: BeiJingTime,
            orderList: orderList,
            canteenList: canteenList,
            stallList: stallList,
            loading: loading,
            orderDetailVisible: orderDetailVisible,
            currentOrder: currentOrder,
            filterCanteenId: filterCanteenId,
            filterStallId: filterStallId,
            filterState: filterState,
            dateRange: dateRange,
            currentPage: currentPage,
            pageSize: pageSize,
            total: total,
            dateShortcuts: dateShortcuts,
            disabledDate: disabledDate,
            fetchOrders: fetchOrders,
            handleCanteenChange: handleCanteenChange,
            handleViewOrder: handleViewOrder,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            getOrderStateName: getOrderStateName,
            getOrderStateType: getOrderStateType,
            isSuperAdmin: isSuperAdmin,
            isCanteenAdmin: isCanteenAdmin,
            clearFilters: clearFilters,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
