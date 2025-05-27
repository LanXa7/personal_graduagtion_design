import Card from "@/components/Card.vue";
import { Message, Refresh, Phone } from "@element-plus/icons-vue";
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { useStore } from "@/store";
import { accessHeader } from "@/utils/auth";
import { formatChineseTime } from "@/utils/dateUtils";
const store = useStore();
const loading = reactive({
    form: true,
    base: false
});
const createTime = formatChineseTime(store.user.createTime);
const emailFormRef = ref();
const emailForm = reactive({
    email: '',
    code: ''
});
const phoneFormRef = ref();
const phoneForm = reactive({
    phone: ''
});
const rules = {
    email: [
        { required: true, message: '请输入邮件地址', trigger: 'blur' },
        { type: 'email', message: '请输入合法的电子邮件地址', trigger: ['blur', 'change'] }
    ]
};
const coldTime = ref(0);
const isEmailValid = ref(true);
const onValidate = (prop, isValid) => {
    if (prop === 'email')
        isEmailValid.value = isValid;
};
function sendEmailCode() {
    emailFormRef.value.validate(isValid => {
        if (isValid) {
            coldTime.value = 60;
            Apis.AuthController.queryCode({
                data: {
                    email: emailForm.email,
                    type: 'modify',
                }
            }).then(() => {
                const handle = setInterval(() => {
                    coldTime.value--;
                    if (coldTime.value === 0) {
                        clearInterval(handle);
                    }
                }, 1000);
                ElMessage.success(`验证码已发送到邮箱: ${emailForm.email}，请注意查收`);
            }).catch(() => {
                coldTime.value = 0;
                ElMessage.error('获取验证码失败');
            });
        }
    });
}
function modifyEmail() {
    emailFormRef.value.validate(isValid => {
        if (isValid) {
            Apis.UserController.updateEmail({
                data: {
                    email: emailForm.email,
                    code: emailForm.code
                }
            }).then(() => {
                ElMessage.success('邮件修改成功');
                store.user.email = emailForm.email;
                emailFormRef.value.resetFields();
            });
        }
    });
}
function modifyPhone() {
    // 由于后端没有提供电话号码修改的API，目前只更新本地状态
    // 实际项目中需要后端提供updatePhone接口
    ElMessage.warning('电话号码修改功能需要后端支持，请联系开发人员');
    ElMessage.success('电话号码已在本地更新');
    store.user.phone = phoneForm.phone;
    phoneFormRef.value.resetFields();
}
function beforeAvatarUpload(rawFile) {
    if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElMessage.error('头像只能是 JPG/PNG 格式的');
        return false;
    }
    else if (rawFile.size / 1024 > 100) {
        ElMessage.error('头像大小不能大于 100KB');
        return false;
    }
    return true;
}
function uploadSuccess(data) {
    ElMessage.success('头像上传成功');
    store.user.avatar = data;
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
        ...{ class: ("settings-left") },
    });
    // @ts-ignore
    /** @type { [typeof Card, typeof Card, ] } */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(Card, new Card({
        ...{ style: ({}) },
        icon: ((__VLS_ctx.Message)),
        title: ("电子邮件设置"),
        desc: ("您可以在这里修改默认绑定的电子邮件地址"),
    }));
    const __VLS_1 = __VLS_0({
        ...{ style: ({}) },
        icon: ((__VLS_ctx.Message)),
        title: ("电子邮件设置"),
        desc: ("您可以在这里修改默认绑定的电子邮件地址"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    const __VLS_5 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        ...{ 'onValidate': {} },
        rules: ((__VLS_ctx.rules)),
        model: ((__VLS_ctx.emailForm)),
        ref: ("emailFormRef"),
        labelPosition: ("top"),
        ...{ style: ({}) },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onValidate': {} },
        rules: ((__VLS_ctx.rules)),
        model: ((__VLS_ctx.emailForm)),
        ref: ("emailFormRef"),
        labelPosition: ("top"),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    // @ts-ignore navigation for `const emailFormRef = ref()`
    /** @type { typeof __VLS_ctx.emailFormRef } */ ;
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
        label: ("电子邮件"),
        prop: ("email"),
    }));
    const __VLS_16 = __VLS_15({
        label: ("电子邮件"),
        prop: ("email"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    const __VLS_20 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        modelValue: ((__VLS_ctx.emailForm.email)),
    }));
    const __VLS_22 = __VLS_21({
        modelValue: ((__VLS_ctx.emailForm.email)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_19.slots.default;
    var __VLS_19;
    const __VLS_26 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
        prop: ("code"),
    }));
    const __VLS_28 = __VLS_27({
        prop: ("code"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const __VLS_32 = {}.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ style: ({}) },
        gutter: ((10)),
    }));
    const __VLS_34 = __VLS_33({
        ...{ style: ({}) },
        gutter: ((10)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const __VLS_38 = {}.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
        span: ((18)),
    }));
    const __VLS_40 = __VLS_39({
        span: ((18)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    const __VLS_44 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        placeholder: ("请获取验证码"),
        modelValue: ((__VLS_ctx.emailForm.code)),
    }));
    const __VLS_46 = __VLS_45({
        placeholder: ("请获取验证码"),
        modelValue: ((__VLS_ctx.emailForm.code)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_43.slots.default;
    var __VLS_43;
    const __VLS_50 = {}.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        span: ((6)),
    }));
    const __VLS_52 = __VLS_51({
        span: ((6)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    const __VLS_56 = {}.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ...{ 'onClick': {} },
        type: ("success"),
        ...{ style: ({}) },
        disabled: ((!__VLS_ctx.isEmailValid || __VLS_ctx.coldTime > 0)),
        plain: (true),
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onClick': {} },
        type: ("success"),
        ...{ style: ({}) },
        disabled: ((!__VLS_ctx.isEmailValid || __VLS_ctx.coldTime > 0)),
        plain: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_62;
    const __VLS_63 = {
        onClick: (__VLS_ctx.sendEmailCode)
    };
    let __VLS_59;
    let __VLS_60;
    (__VLS_ctx.coldTime > 0 ? `请稍后 ${__VLS_ctx.coldTime} 秒` : '获取验证码');
    __VLS_61.slots.default;
    var __VLS_61;
    __VLS_55.slots.default;
    var __VLS_55;
    __VLS_37.slots.default;
    var __VLS_37;
    __VLS_31.slots.default;
    var __VLS_31;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_64 = {}.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
        icon: ((__VLS_ctx.Refresh)),
        type: ("success"),
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        icon: ((__VLS_ctx.Refresh)),
        type: ("success"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_70;
    const __VLS_71 = {
        onClick: (__VLS_ctx.modifyEmail)
    };
    let __VLS_67;
    let __VLS_68;
    __VLS_69.slots.default;
    var __VLS_69;
    __VLS_10.slots.default;
    var __VLS_10;
    __VLS_4.slots.default;
    var __VLS_4;
    // @ts-ignore
    /** @type { [typeof Card, typeof Card, ] } */ ;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent(Card, new Card({
        ...{ style: ({}) },
        icon: ((__VLS_ctx.Phone)),
        title: ("电话号码设置"),
        desc: ("您可以在这里修改绑定的电话号码"),
    }));
    const __VLS_73 = __VLS_72({
        ...{ style: ({}) },
        icon: ((__VLS_ctx.Phone)),
        title: ("电话号码设置"),
        desc: ("您可以在这里修改绑定的电话号码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    const __VLS_77 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        model: ((__VLS_ctx.phoneForm)),
        ref: ("phoneFormRef"),
        labelPosition: ("top"),
        ...{ style: ({}) },
    }));
    const __VLS_79 = __VLS_78({
        model: ((__VLS_ctx.phoneForm)),
        ref: ("phoneFormRef"),
        labelPosition: ("top"),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    // @ts-ignore navigation for `const phoneFormRef = ref()`
    /** @type { typeof __VLS_ctx.phoneFormRef } */ ;
    var __VLS_83 = {};
    const __VLS_84 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        label: ("电话号码"),
        prop: ("phone"),
    }));
    const __VLS_86 = __VLS_85({
        label: ("电话号码"),
        prop: ("phone"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    const __VLS_90 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
        modelValue: ((__VLS_ctx.phoneForm.phone)),
        maxlength: ("11"),
    }));
    const __VLS_92 = __VLS_91({
        modelValue: ((__VLS_ctx.phoneForm.phone)),
        maxlength: ("11"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    __VLS_89.slots.default;
    var __VLS_89;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_96 = {}.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        ...{ 'onClick': {} },
        icon: ((__VLS_ctx.Refresh)),
        type: ("success"),
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onClick': {} },
        icon: ((__VLS_ctx.Refresh)),
        type: ("success"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_102;
    const __VLS_103 = {
        onClick: (__VLS_ctx.modifyPhone)
    };
    let __VLS_99;
    let __VLS_100;
    __VLS_101.slots.default;
    var __VLS_101;
    __VLS_82.slots.default;
    var __VLS_82;
    __VLS_76.slots.default;
    var __VLS_76;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("settings-right") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    // @ts-ignore
    /** @type { [typeof Card, typeof Card, ] } */ ;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent(Card, new Card({}));
    const __VLS_105 = __VLS_104({}, ...__VLS_functionalComponentArgsRest(__VLS_104));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    const __VLS_109 = {}.ElAvatar;
    /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ] } */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        size: ((70)),
        src: ((__VLS_ctx.store.avatarUrl)),
    }));
    const __VLS_111 = __VLS_110({
        size: ((70)),
        src: ((__VLS_ctx.store.avatarUrl)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    const __VLS_115 = {}.ElUpload;
    /** @type { [typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ] } */ ;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
        action: (('/api/user/avatar')),
        showFileList: ((false)),
        beforeUpload: ((__VLS_ctx.beforeAvatarUpload)),
        onSuccess: ((__VLS_ctx.uploadSuccess)),
        headers: ((__VLS_ctx.accessHeader())),
    }));
    const __VLS_117 = __VLS_116({
        action: (('/api/user/avatar')),
        showFileList: ((false)),
        beforeUpload: ((__VLS_ctx.beforeAvatarUpload)),
        onSuccess: ((__VLS_ctx.uploadSuccess)),
        headers: ((__VLS_ctx.accessHeader())),
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    const __VLS_121 = {}.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
        size: ("small"),
        round: (true),
    }));
    const __VLS_123 = __VLS_122({
        size: ("small"),
        round: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    __VLS_126.slots.default;
    var __VLS_126;
    __VLS_120.slots.default;
    var __VLS_120;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    (__VLS_ctx.store.user.username);
    const __VLS_127 = {}.ElDivider;
    /** @type { [typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ] } */ ;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
        ...{ style: ({}) },
    }));
    const __VLS_129 = __VLS_128({
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    ('这个用户很懒，没有填写个人简介~');
    __VLS_108.slots.default;
    var __VLS_108;
    // @ts-ignore
    /** @type { [typeof Card, typeof Card, ] } */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(Card, new Card({
        ...{ style: ({}) },
    }));
    const __VLS_134 = __VLS_133({
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.createTime);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    __VLS_137.slots.default;
    var __VLS_137;
    ['settings-left', 'settings-right',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'emailFormRef': __VLS_11,
        'phoneFormRef': __VLS_83,
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
            Message: Message,
            Refresh: Refresh,
            Phone: Phone,
            accessHeader: accessHeader,
            store: store,
            createTime: createTime,
            emailFormRef: emailFormRef,
            emailForm: emailForm,
            phoneFormRef: phoneFormRef,
            phoneForm: phoneForm,
            rules: rules,
            coldTime: coldTime,
            isEmailValid: isEmailValid,
            onValidate: onValidate,
            sendEmailCode: sendEmailCode,
            modifyEmail: modifyEmail,
            modifyPhone: modifyPhone,
            beforeAvatarUpload: beforeAvatarUpload,
            uploadSuccess: uploadSuccess,
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
