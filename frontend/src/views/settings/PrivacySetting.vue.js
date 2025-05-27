import Card from "@/components/Card.vue";
import { Setting, Switch, Lock } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
const form = reactive({
    password: '',
    new_password: '',
    new_password_repeat: ''
});
const validatePassword = (_, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'));
    }
    else if (value !== form.new_password) {
        callback(new Error("两次输入的密码不一致"));
    }
    else {
        callback();
    }
};
const rules = {
    password: [
        { required: true, message: '请输入原来的密码', trigger: 'blur' }
    ],
    new_password: [
        { required: true, message: '请输入新的密码', trigger: 'blur' },
        { min: 6, max: 16, message: '密码的长度必须在6-16个字符之间', trigger: ['blur'] }
    ],
    new_password_repeat: [
        { required: true, message: '请再次输入新的密码', trigger: 'blur' },
        { validator: validatePassword, trigger: ['blur', 'change'] },
    ]
};
const formRef = ref();
const valid = ref(false);
const onValidate = (prop, isValid) => valid.value = isValid;
function resetPassword() {
    formRef.value.validate(valid => {
        if (valid) {
            Apis.UserController.updatePassword({
                data: {
                    oldPassword: form.password,
                    newPassword: form.new_password
                }
            }).then(() => {
                ElMessage.success('修改密码成功！');
                formRef.value.resetFields();
            });
        }
    });
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    // @ts-ignore
    /** @type { [typeof Card, typeof Card, ] } */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(Card, new Card({
        ...{ style: ({}) },
        icon: ((__VLS_ctx.Setting)),
        title: ("修改密码"),
        desc: ("修改密码请在这里进行操作，请务必牢记您的密码"),
    }));
    const __VLS_1 = __VLS_0({
        ...{ style: ({}) },
        icon: ((__VLS_ctx.Setting)),
        title: ("修改密码"),
        desc: ("修改密码请在这里进行操作，请务必牢记您的密码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    const __VLS_5 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        ...{ 'onValidate': {} },
        rules: ((__VLS_ctx.rules)),
        model: ((__VLS_ctx.form)),
        ref: ("formRef"),
        labelWidth: ("100"),
        ...{ style: ({}) },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onValidate': {} },
        rules: ((__VLS_ctx.rules)),
        model: ((__VLS_ctx.form)),
        ref: ("formRef"),
        labelWidth: ("100"),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    // @ts-ignore navigation for `const formRef = ref()`
    /** @type { typeof __VLS_ctx.formRef } */ ;
    var __VLS_11 = {};
    let __VLS_12;
    const __VLS_13 = {
        onValidate: (__VLS_ctx.onValidate)
    };
    let __VLS_8;
    let __VLS_9;
    const __VLS_14 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
        label: ("当前密码"),
        prop: ("password"),
    }));
    const __VLS_16 = __VLS_15({
        label: ("当前密码"),
        prop: ("password"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        type: ("password"),
        prefixIcon: ((__VLS_ctx.Lock)),
        modelValue: ((__VLS_ctx.form.password)),
        placeholder: ("当前密码"),
        maxlength: ("16"),
    }));
    const __VLS_22 = __VLS_21({
        type: ("password"),
        prefixIcon: ((__VLS_ctx.Lock)),
        modelValue: ((__VLS_ctx.form.password)),
        placeholder: ("当前密码"),
        maxlength: ("16"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_19.slots.default;
    var __VLS_19;
    const __VLS_26 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
        label: ("新密码"),
        prop: ("new_password"),
    }));
    const __VLS_28 = __VLS_27({
        label: ("新密码"),
        prop: ("new_password"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        type: ("password"),
        prefixIcon: ((__VLS_ctx.Lock)),
        modelValue: ((__VLS_ctx.form.new_password)),
        placeholder: ("新密码"),
        maxlength: ("16"),
    }));
    const __VLS_34 = __VLS_33({
        type: ("password"),
        prefixIcon: ((__VLS_ctx.Lock)),
        modelValue: ((__VLS_ctx.form.new_password)),
        placeholder: ("新密码"),
        maxlength: ("16"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_31.slots.default;
    var __VLS_31;
    const __VLS_38 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
        label: ("重复新密码"),
        prop: ("new_password_repeat"),
    }));
    const __VLS_40 = __VLS_39({
        label: ("重复新密码"),
        prop: ("new_password_repeat"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    const __VLS_44 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        type: ("password"),
        prefixIcon: ((__VLS_ctx.Lock)),
        modelValue: ((__VLS_ctx.form.new_password_repeat)),
        placeholder: ("重新输入新密码"),
        maxlength: ("16"),
    }));
    const __VLS_46 = __VLS_45({
        type: ("password"),
        prefixIcon: ((__VLS_ctx.Lock)),
        modelValue: ((__VLS_ctx.form.new_password_repeat)),
        placeholder: ("重新输入新密码"),
        maxlength: ("16"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_43.slots.default;
    var __VLS_43;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    const __VLS_50 = {}.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        ...{ 'onClick': {} },
        icon: ((__VLS_ctx.Switch)),
        type: ("success"),
    }));
    const __VLS_52 = __VLS_51({
        ...{ 'onClick': {} },
        icon: ((__VLS_ctx.Switch)),
        type: ("success"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    let __VLS_56;
    const __VLS_57 = {
        onClick: (__VLS_ctx.resetPassword)
    };
    let __VLS_53;
    let __VLS_54;
    __VLS_55.slots.default;
    var __VLS_55;
    __VLS_10.slots.default;
    var __VLS_10;
    __VLS_4.slots.default;
    var __VLS_4;
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'formRef': __VLS_11,
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
            Card: Card,
            Setting: Setting,
            Switch: Switch,
            Lock: Lock,
            form: form,
            rules: rules,
            formRef: formRef,
            onValidate: onValidate,
            resetPassword: resetPassword,
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
