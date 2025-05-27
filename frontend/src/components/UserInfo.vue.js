import { Back, Operation } from "@element-plus/icons-vue";
import { deleteAccessToken } from "@/utils/auth";
import router from "@/router";
import { useStore } from "@/store";
import { ElMessage } from "element-plus";
const store = useStore();
function userLogout() {
    Apis.AuthController.logout().then(() => {
        ElMessage.success("退出成功!");
        deleteAccessToken();
        router.push("/");
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
        ...{ class: ("user-info") },
    });
    var __VLS_0 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("profile") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.store.user.username);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.store.user.email);
    if (__VLS_ctx.store.user.phone) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        (__VLS_ctx.store.user.phone);
    }
    const __VLS_1 = {}.ElDropdown;
    /** @type { [typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, typeof __VLS_components.ElDropdown, typeof __VLS_components.elDropdown, ] } */ ;
    // @ts-ignore
    const __VLS_2 = __VLS_asFunctionalComponent(__VLS_1, new __VLS_1({}));
    const __VLS_3 = __VLS_2({}, ...__VLS_functionalComponentArgsRest(__VLS_2));
    const __VLS_7 = {}.ElAvatar;
    /** @type { [typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ] } */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
        src: ((__VLS_ctx.store.avatarUrl)),
    }));
    const __VLS_9 = __VLS_8({
        src: ((__VLS_ctx.store.avatarUrl)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { dropdown: __VLS_thisSlot } = __VLS_6.slots;
        const __VLS_13 = {}.ElDropdownItem;
        /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */ ;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
        const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
        const __VLS_19 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({}));
        const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
        const __VLS_25 = {}.Operation;
        /** @type { [typeof __VLS_components.Operation, ] } */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({}));
        const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
        __VLS_24.slots.default;
        var __VLS_24;
        __VLS_18.slots.default;
        var __VLS_18;
        const __VLS_31 = {}.ElDropdownItem;
        /** @type { [typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, typeof __VLS_components.ElDropdownItem, typeof __VLS_components.elDropdownItem, ] } */ ;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
            ...{ 'onClick': {} },
            divided: (true),
        }));
        const __VLS_33 = __VLS_32({
            ...{ 'onClick': {} },
            divided: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        let __VLS_37;
        const __VLS_38 = {
            onClick: (__VLS_ctx.userLogout)
        };
        let __VLS_34;
        let __VLS_35;
        const __VLS_39 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({}));
        const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
        const __VLS_45 = {}.Back;
        /** @type { [typeof __VLS_components.Back, ] } */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({}));
        const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
        __VLS_44.slots.default;
        var __VLS_44;
        __VLS_36.slots.default;
        var __VLS_36;
    }
    var __VLS_6;
    ['user-info', 'profile',];
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
            Back: Back,
            Operation: Operation,
            store: store,
            userLogout: userLogout,
        };
    },
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
