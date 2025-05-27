import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';
import { Plus, Minus } from '@element-plus/icons-vue';
import Apis from '@/alova';
import { useStore } from '@/store';
import { accessHeader } from '@/utils/auth';
import BeiJingTime from "@/components/BeiJingTime.vue";
const store = useStore();
const foodFormRef = ref();
const foodList = ref([]);
const canteenList = ref([]);
const stallList = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentFoodId = ref(null);
const filterCanteenId = ref(null);
const filterStallId = ref(null);
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
    stallId: null,
    canteenId: null
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('获取摊位列表失败:', error);
        ElMessage.error('获取摊位列表失败');
    }
};
// 获取指定食堂的摊位列表
const fetchStallsByCanteen = async (canteenId) => {
    // 摊位管理员不需要获取摊位列表
    if (isStallAdmin.value) {
        return;
    }
    try {
        const data = await Apis.StallController.listStall();
        // 在前端过滤出指定食堂的摊位
        stallList.value = (data || []).filter(stall => stall.canteen && stall.canteen.id === canteenId);
        // 如果当前选择的摊位不在过滤后的列表中，清空选择
        if (filterStallId.value && !stallList.value.some(stall => stall.id === filterStallId.value)) {
            filterStallId.value = null;
        }
    }
    catch (error) {
        console.error('获取摊位列表失败:', error);
        ElMessage.error('获取摊位列表失败');
    }
};
// 获取当前用户管理的摊位
const getUserStall = async () => {
    try {
        // 获取所有摊位,在前端过滤
        const data = await Apis.StallController.listStall();
        const userStall = (data || []).find(stall => stall.user && stall.user.id === store.user?.id);
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
    }
    catch (error) {
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
    }
    catch (error) {
        ElMessage.error('获取菜品列表失败');
        console.error(error);
    }
    finally {
        loading.value = false;
    }
};
// 处理食堂选择变化
const handleCanteenChange = (canteenId) => {
    foodForm.stallId = null;
    // 清空摊位选择
    filterStallId.value = null;
    if (canteenId) {
        // 获取该食堂下的摊位列表
        fetchStallsByCanteen(canteenId);
    }
    else {
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
    }
    else if (isCanteenAdmin.value) {
        // 食堂管理员需要获取摊位列表
        await fetchStalls();
    }
    else {
        // 超级管理员需要获取所有食堂和摊位列表
        await Promise.all([fetchCanteens(), fetchStalls()]);
    }
};
// 编辑菜品
const handleEdit = (row) => {
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
const handleDelete = async (row) => {
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
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败');
            console.error(error);
        }
    }
};
// 图片上传前处理
const beforeImageUpload = (file) => {
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
const handleImageSuccess = (response) => {
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
const handleStallChange = (stallId) => {
    foodForm.stallId = stallId;
    // 触发表单验证
    if (foodFormRef.value) {
        foodFormRef.value.validateField('stallId');
    }
};
// 保存菜品信息
const saveFood = async () => {
    if (!foodFormRef.value)
        return;
    await foodFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (isEdit.value && currentFoodId.value) {
                    await Apis.FoodController.updateFood({
                        pathParams: { id: currentFoodId.value },
                        data: foodForm
                    });
                    ElNotification({
                        title: '成功',
                        message: '菜品信息更新成功',
                        type: 'success'
                    });
                }
                else {
                    await Apis.FoodController.createFood({
                        data: foodForm
                    });
                    ElNotification({
                        title: '成功',
                        message: '菜品添加成功',
                        type: 'success'
                    });
                }
                dialogVisible.value = false;
                fetchFoods();
            }
            catch (error) {
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
const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
    fetchFoods();
};
const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchFoods();
};
// 处理价格变化
const handlePriceChange = async (row, change) => {
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
    }
    catch (error) {
        ElMessage.error('更新价格失败');
        console.error(error);
    }
};
// 保存编辑后的价格
const saveEditedPrice = async (row) => {
    if (row.editingPrice === undefined)
        return;
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
    }
    catch (error) {
        ElMessage.error('更新价格失败');
        console.error(error);
    }
};
onMounted(() => {
    // 根据用户角色决定需要获取的数据
    if (isStallAdmin.value) {
        // 摊位管理员只需要获取菜品列表
        fetchFoods();
    }
    else if (isCanteenAdmin.value) {
        // 食堂管理员需要获取摊位列表和菜品列表
        Promise.all([fetchStalls(), fetchFoods()]);
    }
    else {
        // 超级管理员需要获取所有食堂和摊位列表
        Promise.all([fetchCanteens(), fetchStalls(), fetchFoods()]);
    }
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['card-header', 'button-group', 'button-group', 'action-button', 'button-group', 'action-button', 'el-table', 'el-table', 'el-table', 'el-table', 'operation-buttons', 'operation-button', 'el-select', 'el-input__inner', 'el-input-group__append', 'dish-uploader',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("food-management") },
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
            onClick: (__VLS_ctx.handleAddDish)
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
    if (!__VLS_ctx.isStallAdmin) {
        const __VLS_40 = {}.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.filterStallId)),
            placeholder: ("选择摊位"),
            clearable: (true),
            ...{ class: ("filter-select") },
            disabled: ((!__VLS_ctx.filterCanteenId)),
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.filterStallId)),
            placeholder: ("选择摊位"),
            clearable: (true),
            ...{ class: ("filter-select") },
            disabled: ((!__VLS_ctx.filterCanteenId)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_46;
        const __VLS_47 = {
            onChange: (__VLS_ctx.fetchFoods)
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("filter-right") },
    });
    const __VLS_54 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        ...{ 'onClear': {} },
        modelValue: ((__VLS_ctx.filterFoodName)),
        placeholder: ("搜索菜品名称"),
        clearable: (true),
        ...{ class: ("filter-input") },
    }));
    const __VLS_56 = __VLS_55({
        ...{ 'onClear': {} },
        modelValue: ((__VLS_ctx.filterFoodName)),
        placeholder: ("搜索菜品名称"),
        clearable: (true),
        ...{ class: ("filter-input") },
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    let __VLS_60;
    const __VLS_61 = {
        onClear: (__VLS_ctx.fetchFoods)
    };
    let __VLS_57;
    let __VLS_58;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { append: __VLS_thisSlot } = __VLS_59.slots;
        const __VLS_62 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
            ...{ 'onClick': {} },
        }));
        const __VLS_64 = __VLS_63({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        let __VLS_68;
        const __VLS_69 = {
            onClick: (__VLS_ctx.fetchFoods)
        };
        let __VLS_65;
        let __VLS_66;
        __VLS_67.slots.default;
        var __VLS_67;
    }
    var __VLS_59;
    const __VLS_70 = {}.ElTable;
    /** @type { [typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ] } */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        data: ((__VLS_ctx.foodList)),
        stripe: (true),
        ...{ style: ({}) },
    }));
    const __VLS_72 = __VLS_71({
        data: ((__VLS_ctx.foodList)),
        stripe: (true),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    const __VLS_76 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        label: ("序号"),
        width: ("60"),
        align: ("center"),
    }));
    const __VLS_78 = __VLS_77({
        label: ("序号"),
        width: ("60"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_81.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        ((__VLS_ctx.currentPage - 1) * __VLS_ctx.pageSize + scope.$index + 1);
    }
    var __VLS_81;
    const __VLS_82 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        prop: ("name"),
        label: ("菜品名称"),
        minWidth: ("100"),
        align: ("center"),
    }));
    const __VLS_84 = __VLS_83({
        prop: ("name"),
        label: ("菜品名称"),
        minWidth: ("100"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    const __VLS_88 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        prop: ("code"),
        label: ("菜品编码"),
        minWidth: ("80"),
        align: ("center"),
    }));
    const __VLS_90 = __VLS_89({
        prop: ("code"),
        label: ("菜品编码"),
        minWidth: ("80"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    const __VLS_94 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        prop: ("price"),
        label: ("价格"),
        minWidth: ("160"),
        align: ("center"),
    }));
    const __VLS_96 = __VLS_95({
        prop: ("price"),
        label: ("价格"),
        minWidth: ("160"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_99.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("price-control") },
        });
        const __VLS_100 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            ...{ 'onClick': {} },
            type: ("primary"),
            size: ("small"),
            circle: (true),
            ...{ class: ("price-button price-button-mini") },
        }));
        const __VLS_102 = __VLS_101({
            ...{ 'onClick': {} },
            type: ("primary"),
            size: ("small"),
            circle: (true),
            ...{ class: ("price-button price-button-mini") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_106;
        const __VLS_107 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handlePriceChange(scope.row, -1);
            }
        };
        let __VLS_103;
        let __VLS_104;
        const __VLS_108 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
        const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
        const __VLS_114 = {}.Minus;
        /** @type { [typeof __VLS_components.Minus, ] } */ ;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({}));
        const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
        __VLS_113.slots.default;
        var __VLS_113;
        __VLS_105.slots.default;
        var __VLS_105;
        const __VLS_120 = {}.ElPopover;
        /** @type { [typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ] } */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            placement: ("top"),
            width: ((200)),
            trigger: ("click"),
            visible: ((scope.row.priceEditing)),
        }));
        const __VLS_122 = __VLS_121({
            placement: ("top"),
            width: ((200)),
            trigger: ("click"),
            visible: ((scope.row.priceEditing)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { reference: __VLS_thisSlot } = __VLS_125.slots;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("price-value clickable") },
            });
            (scope.row.price?.toFixed(2));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("price-edit-form") },
        });
        const __VLS_126 = {}.ElInputNumber;
        /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */ ;
        // @ts-ignore
        const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
            modelValue: ((scope.row.editingPrice)),
            min: ((0)),
            precision: ((2)),
            step: ((0.1)),
            size: ("small"),
            ...{ style: ({}) },
        }));
        const __VLS_128 = __VLS_127({
            modelValue: ((scope.row.editingPrice)),
            min: ((0)),
            precision: ((2)),
            step: ((0.1)),
            size: ("small"),
            ...{ style: ({}) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_127));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("price-edit-actions") },
        });
        const __VLS_132 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
            ...{ 'onClick': {} },
            type: ("primary"),
            size: ("small"),
        }));
        const __VLS_134 = __VLS_133({
            ...{ 'onClick': {} },
            type: ("primary"),
            size: ("small"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_133));
        let __VLS_138;
        const __VLS_139 = {
            onClick: (...[$event]) => {
                __VLS_ctx.saveEditedPrice(scope.row);
            }
        };
        let __VLS_135;
        let __VLS_136;
        __VLS_137.slots.default;
        var __VLS_137;
        const __VLS_140 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
            ...{ 'onClick': {} },
            size: ("small"),
        }));
        const __VLS_142 = __VLS_141({
            ...{ 'onClick': {} },
            size: ("small"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        let __VLS_146;
        const __VLS_147 = {
            onClick: (...[$event]) => {
                scope.row.priceEditing = false;
            }
        };
        let __VLS_143;
        let __VLS_144;
        __VLS_145.slots.default;
        var __VLS_145;
        var __VLS_125;
        const __VLS_148 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
            ...{ 'onClick': {} },
            type: ("primary"),
            size: ("small"),
            circle: (true),
            ...{ class: ("price-button price-button-mini") },
        }));
        const __VLS_150 = __VLS_149({
            ...{ 'onClick': {} },
            type: ("primary"),
            size: ("small"),
            circle: (true),
            ...{ class: ("price-button price-button-mini") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        let __VLS_154;
        const __VLS_155 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handlePriceChange(scope.row, 1);
            }
        };
        let __VLS_151;
        let __VLS_152;
        const __VLS_156 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({}));
        const __VLS_158 = __VLS_157({}, ...__VLS_functionalComponentArgsRest(__VLS_157));
        const __VLS_162 = {}.Plus;
        /** @type { [typeof __VLS_components.Plus, ] } */ ;
        // @ts-ignore
        const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({}));
        const __VLS_164 = __VLS_163({}, ...__VLS_functionalComponentArgsRest(__VLS_163));
        __VLS_161.slots.default;
        var __VLS_161;
        __VLS_153.slots.default;
        var __VLS_153;
    }
    var __VLS_99;
    const __VLS_168 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        label: ("图片"),
        width: ("70"),
        align: ("center"),
    }));
    const __VLS_170 = __VLS_169({
        label: ("图片"),
        width: ("70"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_173.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        if (scope.row.picture) {
            const __VLS_174 = {}.ElImage;
            /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */ ;
            // @ts-ignore
            const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
                ...{ style: ({}) },
                src: ((scope.row.picture ? `/api/images${scope.row.picture}` : '')),
                previewSrcList: ((scope.row.picture ? [`/api/images${scope.row.picture}`] : [])),
            }));
            const __VLS_176 = __VLS_175({
                ...{ style: ({}) },
                src: ((scope.row.picture ? `/api/images${scope.row.picture}` : '')),
                previewSrcList: ((scope.row.picture ? [`/api/images${scope.row.picture}`] : [])),
            }, ...__VLS_functionalComponentArgsRest(__VLS_175));
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
    }
    var __VLS_173;
    const __VLS_180 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        prop: ("description"),
        label: ("描述"),
        minWidth: ("120"),
        align: ("center"),
        showOverflowTooltip: ((true)),
    }));
    const __VLS_182 = __VLS_181({
        prop: ("description"),
        label: ("描述"),
        minWidth: ("120"),
        align: ("center"),
        showOverflowTooltip: ((true)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    const __VLS_186 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
        label: ("所属摊位"),
        minWidth: ("100"),
        align: ("center"),
    }));
    const __VLS_188 = __VLS_187({
        label: ("所属摊位"),
        minWidth: ("100"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_187));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_191.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        if (scope.row.stall) {
            const __VLS_192 = {}.ElTag;
            /** @type { [typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ] } */ ;
            // @ts-ignore
            const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
                type: ("info"),
                size: ("small"),
            }));
            const __VLS_194 = __VLS_193({
                type: ("info"),
                size: ("small"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_193));
            (scope.row.stall.name);
            __VLS_197.slots.default;
            var __VLS_197;
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
    }
    var __VLS_191;
    const __VLS_198 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
        label: ("创建时间"),
        minWidth: ("120"),
        align: ("center"),
    }));
    const __VLS_200 = __VLS_199({
        label: ("创建时间"),
        minWidth: ("120"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_203.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        // @ts-ignore
        /** @type { [typeof BeiJingTime, ] } */ ;
        // @ts-ignore
        const __VLS_204 = __VLS_asFunctionalComponent(BeiJingTime, new BeiJingTime({
            time: ((scope.row.createTime)),
        }));
        const __VLS_205 = __VLS_204({
            time: ((scope.row.createTime)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    }
    var __VLS_203;
    const __VLS_209 = {}.ElTableColumn;
    /** @type { [typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ] } */ ;
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
        label: ("操作"),
        minWidth: ("160"),
        align: ("center"),
    }));
    const __VLS_211 = __VLS_210({
        label: ("操作"),
        minWidth: ("160"),
        align: ("center"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_214.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("operation-buttons") },
        });
        const __VLS_215 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_217 = __VLS_216({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("primary"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_216));
        let __VLS_221;
        const __VLS_222 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
            }
        };
        let __VLS_218;
        let __VLS_219;
        __VLS_220.slots.default;
        var __VLS_220;
        const __VLS_223 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("danger"),
            ...{ class: ("operation-button") },
        }));
        const __VLS_225 = __VLS_224({
            ...{ 'onClick': {} },
            size: ("small"),
            type: ("danger"),
            ...{ class: ("operation-button") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_224));
        let __VLS_229;
        const __VLS_230 = {
            onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(scope.row);
            }
        };
        let __VLS_226;
        let __VLS_227;
        __VLS_228.slots.default;
        var __VLS_228;
    }
    var __VLS_214;
    __VLS_75.slots.default;
    var __VLS_75;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("pagination") },
    });
    const __VLS_231 = {}.ElPagination;
    /** @type { [typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ] } */ ;
    // @ts-ignore
    const __VLS_232 = __VLS_asFunctionalComponent(__VLS_231, new __VLS_231({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }));
    const __VLS_233 = __VLS_232({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: ((__VLS_ctx.currentPage)),
        pageSize: ((__VLS_ctx.pageSize)),
        pageSizes: (([10, 20, 50, 100])),
        background: (true),
        layout: ("total, sizes, prev, pager, next, jumper"),
        total: ((__VLS_ctx.total)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_232));
    let __VLS_237;
    const __VLS_238 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_239 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    let __VLS_234;
    let __VLS_235;
    var __VLS_236;
    var __VLS_5;
    const __VLS_240 = {}.ElDialog;
    /** @type { [typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ] } */ ;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
        modelValue: ((__VLS_ctx.dialogVisible)),
        title: ((__VLS_ctx.isEdit ? '编辑菜品' : '新增菜品')),
        width: ("500px"),
    }));
    const __VLS_242 = __VLS_241({
        modelValue: ((__VLS_ctx.dialogVisible)),
        title: ((__VLS_ctx.isEdit ? '编辑菜品' : '新增菜品')),
        width: ("500px"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    const __VLS_246 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
        model: ((__VLS_ctx.foodForm)),
        labelWidth: ("100px"),
        rules: ((__VLS_ctx.rules)),
        ref: ("foodFormRef"),
    }));
    const __VLS_248 = __VLS_247({
        model: ((__VLS_ctx.foodForm)),
        labelWidth: ("100px"),
        rules: ((__VLS_ctx.rules)),
        ref: ("foodFormRef"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_247));
    // @ts-ignore navigation for `const foodFormRef = ref()`
    /** @type { typeof __VLS_ctx.foodFormRef } */ ;
    var __VLS_252 = {};
    const __VLS_253 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
        label: ("菜品名称"),
        prop: ("name"),
    }));
    const __VLS_255 = __VLS_254({
        label: ("菜品名称"),
        prop: ("name"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    const __VLS_259 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_260 = __VLS_asFunctionalComponent(__VLS_259, new __VLS_259({
        modelValue: ((__VLS_ctx.foodForm.name)),
        placeholder: ("请输入菜品名称"),
    }));
    const __VLS_261 = __VLS_260({
        modelValue: ((__VLS_ctx.foodForm.name)),
        placeholder: ("请输入菜品名称"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_260));
    __VLS_258.slots.default;
    var __VLS_258;
    const __VLS_265 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({
        label: ("菜品编码"),
        prop: ("code"),
    }));
    const __VLS_267 = __VLS_266({
        label: ("菜品编码"),
        prop: ("code"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_266));
    const __VLS_271 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_272 = __VLS_asFunctionalComponent(__VLS_271, new __VLS_271({
        modelValue: ((__VLS_ctx.foodForm.code)),
        placeholder: ("请输入菜品编码"),
    }));
    const __VLS_273 = __VLS_272({
        modelValue: ((__VLS_ctx.foodForm.code)),
        placeholder: ("请输入菜品编码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_272));
    __VLS_270.slots.default;
    var __VLS_270;
    if (__VLS_ctx.isSuperAdmin) {
        const __VLS_277 = {}.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
        // @ts-ignore
        const __VLS_278 = __VLS_asFunctionalComponent(__VLS_277, new __VLS_277({
            label: ("所属食堂"),
            prop: ("canteenId"),
        }));
        const __VLS_279 = __VLS_278({
            label: ("所属食堂"),
            prop: ("canteenId"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_278));
        const __VLS_283 = {}.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
        // @ts-ignore
        const __VLS_284 = __VLS_asFunctionalComponent(__VLS_283, new __VLS_283({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.foodForm.canteenId)),
            placeholder: ("请选择所属食堂"),
            ...{ style: ({}) },
        }));
        const __VLS_285 = __VLS_284({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.foodForm.canteenId)),
            placeholder: ("请选择所属食堂"),
            ...{ style: ({}) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_284));
        let __VLS_289;
        const __VLS_290 = {
            onChange: (__VLS_ctx.handleCanteenChange)
        };
        let __VLS_286;
        let __VLS_287;
        for (const [canteen] of __VLS_getVForSourceType((__VLS_ctx.canteenList))) {
            const __VLS_291 = {}.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
            // @ts-ignore
            const __VLS_292 = __VLS_asFunctionalComponent(__VLS_291, new __VLS_291({
                key: ((canteen.id)),
                label: ((canteen.name)),
                value: ((canteen.id)),
            }));
            const __VLS_293 = __VLS_292({
                key: ((canteen.id)),
                label: ((canteen.name)),
                value: ((canteen.id)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_292));
        }
        __VLS_288.slots.default;
        var __VLS_288;
        __VLS_282.slots.default;
        var __VLS_282;
    }
    if (!__VLS_ctx.isStallAdmin) {
        const __VLS_297 = {}.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
        // @ts-ignore
        const __VLS_298 = __VLS_asFunctionalComponent(__VLS_297, new __VLS_297({
            label: ("所属摊位"),
            prop: ("stallId"),
        }));
        const __VLS_299 = __VLS_298({
            label: ("所属摊位"),
            prop: ("stallId"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_298));
        const __VLS_303 = {}.ElSelect;
        /** @type { [typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ] } */ ;
        // @ts-ignore
        const __VLS_304 = __VLS_asFunctionalComponent(__VLS_303, new __VLS_303({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.foodForm.stallId)),
            placeholder: ("请选择所属摊位"),
            ...{ style: ({}) },
        }));
        const __VLS_305 = __VLS_304({
            ...{ 'onChange': {} },
            modelValue: ((__VLS_ctx.foodForm.stallId)),
            placeholder: ("请选择所属摊位"),
            ...{ style: ({}) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_304));
        let __VLS_309;
        const __VLS_310 = {
            onChange: (__VLS_ctx.handleStallChange)
        };
        let __VLS_306;
        let __VLS_307;
        for (const [stall] of __VLS_getVForSourceType((__VLS_ctx.stallList))) {
            const __VLS_311 = {}.ElOption;
            /** @type { [typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ] } */ ;
            // @ts-ignore
            const __VLS_312 = __VLS_asFunctionalComponent(__VLS_311, new __VLS_311({
                key: ((stall.id)),
                label: ((stall.name)),
                value: ((stall.id)),
            }));
            const __VLS_313 = __VLS_312({
                key: ((stall.id)),
                label: ((stall.name)),
                value: ((stall.id)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_312));
        }
        __VLS_308.slots.default;
        var __VLS_308;
        __VLS_302.slots.default;
        var __VLS_302;
    }
    const __VLS_317 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({
        label: ("价格"),
        prop: ("price"),
    }));
    const __VLS_319 = __VLS_318({
        label: ("价格"),
        prop: ("price"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_318));
    const __VLS_323 = {}.ElInputNumber;
    /** @type { [typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ] } */ ;
    // @ts-ignore
    const __VLS_324 = __VLS_asFunctionalComponent(__VLS_323, new __VLS_323({
        modelValue: ((__VLS_ctx.foodForm.price)),
        min: ((0)),
        precision: ((2)),
        step: ((0.1)),
        ...{ style: ({}) },
    }));
    const __VLS_325 = __VLS_324({
        modelValue: ((__VLS_ctx.foodForm.price)),
        min: ((0)),
        precision: ((2)),
        step: ((0.1)),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_324));
    __VLS_322.slots.default;
    var __VLS_322;
    const __VLS_329 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
        label: ("描述"),
        prop: ("description"),
    }));
    const __VLS_331 = __VLS_330({
        label: ("描述"),
        prop: ("description"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_330));
    const __VLS_335 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_336 = __VLS_asFunctionalComponent(__VLS_335, new __VLS_335({
        modelValue: ((__VLS_ctx.foodForm.description)),
        type: ("textarea"),
        placeholder: ("请输入菜品描述"),
    }));
    const __VLS_337 = __VLS_336({
        modelValue: ((__VLS_ctx.foodForm.description)),
        type: ("textarea"),
        placeholder: ("请输入菜品描述"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_336));
    __VLS_334.slots.default;
    var __VLS_334;
    const __VLS_341 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({
        label: ("图片"),
        prop: ("picture"),
    }));
    const __VLS_343 = __VLS_342({
        label: ("图片"),
        prop: ("picture"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_342));
    const __VLS_347 = {}.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */ ;
    // @ts-ignore
    const __VLS_348 = __VLS_asFunctionalComponent(__VLS_347, new __VLS_347({
        ...{ class: ("dish-uploader") },
        action: ("/api/food/picture"),
        showFileList: ((false)),
        onSuccess: ((__VLS_ctx.handleImageSuccess)),
        beforeUpload: ((__VLS_ctx.beforeImageUpload)),
        headers: ((__VLS_ctx.accessHeader())),
        data: (({
            ...(__VLS_ctx.foodForm.stallId ? { stallId: __VLS_ctx.foodForm.stallId } : {}),
            ...(__VLS_ctx.currentFoodId ? { id: __VLS_ctx.currentFoodId } : {})
        })),
        accept: ("image/*"),
    }));
    const __VLS_349 = __VLS_348({
        ...{ class: ("dish-uploader") },
        action: ("/api/food/picture"),
        showFileList: ((false)),
        onSuccess: ((__VLS_ctx.handleImageSuccess)),
        beforeUpload: ((__VLS_ctx.beforeImageUpload)),
        headers: ((__VLS_ctx.accessHeader())),
        data: (({
            ...(__VLS_ctx.foodForm.stallId ? { stallId: __VLS_ctx.foodForm.stallId } : {}),
            ...(__VLS_ctx.currentFoodId ? { id: __VLS_ctx.currentFoodId } : {})
        })),
        accept: ("image/*"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_348));
    if (__VLS_ctx.foodForm.picture) {
        const __VLS_353 = {}.ElImage;
        /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */ ;
        // @ts-ignore
        const __VLS_354 = __VLS_asFunctionalComponent(__VLS_353, new __VLS_353({
            src: ((__VLS_ctx.foodForm.picture ? `/api/images${__VLS_ctx.foodForm.picture}` : '')),
            ...{ class: ("dish-image") },
            fit: ("cover"),
        }));
        const __VLS_355 = __VLS_354({
            src: ((__VLS_ctx.foodForm.picture ? `/api/images${__VLS_ctx.foodForm.picture}` : '')),
            ...{ class: ("dish-image") },
            fit: ("cover"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_354));
    }
    else {
        const __VLS_359 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_360 = __VLS_asFunctionalComponent(__VLS_359, new __VLS_359({
            ...{ class: ("dish-uploader-icon") },
        }));
        const __VLS_361 = __VLS_360({
            ...{ class: ("dish-uploader-icon") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_360));
        const __VLS_365 = {}.Plus;
        /** @type { [typeof __VLS_components.Plus, ] } */ ;
        // @ts-ignore
        const __VLS_366 = __VLS_asFunctionalComponent(__VLS_365, new __VLS_365({}));
        const __VLS_367 = __VLS_366({}, ...__VLS_functionalComponentArgsRest(__VLS_366));
        __VLS_364.slots.default;
        var __VLS_364;
    }
    __VLS_352.slots.default;
    var __VLS_352;
    __VLS_346.slots.default;
    var __VLS_346;
    __VLS_251.slots.default;
    var __VLS_251;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { footer: __VLS_thisSlot } = __VLS_245.slots;
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("dialog-footer") },
        });
        const __VLS_371 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_372 = __VLS_asFunctionalComponent(__VLS_371, new __VLS_371({
            ...{ 'onClick': {} },
        }));
        const __VLS_373 = __VLS_372({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_372));
        let __VLS_377;
        const __VLS_378 = {
            onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
            }
        };
        let __VLS_374;
        let __VLS_375;
        __VLS_376.slots.default;
        var __VLS_376;
        const __VLS_379 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_380 = __VLS_asFunctionalComponent(__VLS_379, new __VLS_379({
            ...{ 'onClick': {} },
            type: ("primary"),
        }));
        const __VLS_381 = __VLS_380({
            ...{ 'onClick': {} },
            type: ("primary"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_380));
        let __VLS_385;
        const __VLS_386 = {
            onClick: (__VLS_ctx.saveFood)
        };
        let __VLS_382;
        let __VLS_383;
        __VLS_384.slots.default;
        var __VLS_384;
    }
    var __VLS_245;
    ['food-management', 'box-card', 'card-header', 'font-bold', 'text-lg', 'button-group', 'action-button', 'filter-row', 'filter-left', 'filter-select', 'filter-select', 'filter-right', 'filter-input', 'price-control', 'price-button', 'price-button-mini', 'price-value', 'clickable', 'price-edit-form', 'price-edit-actions', 'price-button', 'price-button-mini', 'operation-buttons', 'operation-button', 'operation-button', 'pagination', 'dish-uploader', 'dish-image', 'dish-uploader-icon', 'dialog-footer',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'foodFormRef': __VLS_252,
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
            Plus: Plus,
            Minus: Minus,
            accessHeader: accessHeader,
            BeiJingTime: BeiJingTime,
            foodFormRef: foodFormRef,
            foodList: foodList,
            canteenList: canteenList,
            stallList: stallList,
            loading: loading,
            dialogVisible: dialogVisible,
            isEdit: isEdit,
            currentFoodId: currentFoodId,
            filterCanteenId: filterCanteenId,
            filterStallId: filterStallId,
            currentPage: currentPage,
            pageSize: pageSize,
            filterFoodName: filterFoodName,
            total: total,
            foodForm: foodForm,
            rules: rules,
            isSuperAdmin: isSuperAdmin,
            isStallAdmin: isStallAdmin,
            fetchFoods: fetchFoods,
            handleCanteenChange: handleCanteenChange,
            handleAddDish: handleAddDish,
            handleEdit: handleEdit,
            handleDelete: handleDelete,
            beforeImageUpload: beforeImageUpload,
            handleImageSuccess: handleImageSuccess,
            handleStallChange: handleStallChange,
            saveFood: saveFood,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            handlePriceChange: handlePriceChange,
            saveEditedPrice: saveEditedPrice,
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
