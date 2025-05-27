import { DataLine, Food, Lock, Operation, Platform, School, Setting, Shop, User, UserFilled, Camera, Tickets, FullScreen } from "@element-plus/icons-vue";
import { onMounted, ref, computed, onUnmounted } from "vue";
import UserInfo from "@/components/UserInfo.vue";
import { useStore } from "@/store";
import Apis from '@/alova';
import { hasAdminPermission, isSuperAdmin, isCanteenAdmin, isStallAdmin } from '@/utils/roleUtils';
import { useRoute } from 'vue-router';
const loading = ref(true);
const store = useStore();
const route = useRoute();
const isFullscreen = ref(false);
// 判断是否是展示页面
const isDisplayPage = computed(() => {
    return route.path === '/index/data-display' ||
        route.path === '/index/food-display' ||
        route.path === '/index/plate-recognition';
});
const toggleFullscreen = async () => {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            isFullscreen.value = true;
        }
    }
    catch (err) {
        console.error('全屏切换失败:', err);
    }
};
const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
};
// 用户菜单数据
const userMenu = computed(() => {
    const menus = [];
    // 数据展示菜单
    const dataDisplayItems = [];
    // 所有管理员都可以看到数据大屏
    if (hasAdminPermission(store.user?.roles)) {
        dataDisplayItems.push({ title: '数据大屏', icon: DataLine, index: '/index/data-display' });
    }
    // 只有摊位管理员可以看到菜品展示大屏
    if (isStallAdmin(store.user?.roles)) {
        dataDisplayItems.push({ title: '菜品展示大屏', icon: Platform, index: '/index/food-display' });
    }
    // 如果有数据展示项，则添加数据展示菜单
    if (dataDisplayItems.length > 0) {
        menus.push({
            title: '数据展示', icon: DataLine, sub: dataDisplayItems
        });
    }
    // 根据角色添加管理菜单
    if (hasAdminPermission(store.user?.roles)) {
        const adminMenuItems = [];
        // 只有超级管理员可以管理食堂
        if (isSuperAdmin(store.user?.roles)) {
            adminMenuItems.push({ title: '食堂管理', icon: School, index: '/index/canteen-management' });
            adminMenuItems.push({ title: '员工管理', icon: UserFilled, index: '/index/user-management' });
        }
        // 超级管理员和食堂管理员可以管理摊位
        if (isSuperAdmin(store.user?.roles) || isCanteenAdmin(store.user?.roles)) {
            adminMenuItems.push({ title: '摊位管理', icon: Shop, index: '/index/stall-management' });
        }
        // 所有管理员都能管理菜品和查看订单
        adminMenuItems.push({ title: '菜品管理', icon: Food, index: '/index/food-management' });
        // 超级管理员、食堂管理员和摊位管理员可以查看订单
        if (isSuperAdmin(store.user?.roles) || isCanteenAdmin(store.user?.roles) || isStallAdmin(store.user?.roles)) {
            adminMenuItems.push({ title: '订单管理', icon: Tickets, index: '/index/order-management' });
        }
        menus.push({
            title: '后台管理', icon: Setting, sub: adminMenuItems
        });
    }
    menus.push({
        title: '个人设置', icon: Operation, sub: [
            { title: '个人信息设置', icon: User, index: '/index/user-setting' },
            { title: '账号安全设置', icon: Lock, index: '/index/privacy-setting' }
        ]
    });
    return menus;
});
const isSettingPage = computed(() => {
    return route.path === '/index/user-setting' || route.path === '/index/privacy-setting';
});
onMounted(() => {
    Apis.UserController.queryUserInfo().then(data => {
        loading.value = false;
        store.user = data;
    });
    document.addEventListener('fullscreenchange', handleFullscreenChange);
});
onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['main-content-page', 'dark', 'main-beian', 'main-beian', 'main-beian', 'dark', 'main-beian', 'copyright', 'dark', 'main-beian', 'beian-link', 'fullscreen-btn', 'dark', 'fullscreen-mode', 'dark', 'fullscreen-btn', 'dark', 'fullscreen-btn',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("main-content") },
        'element-loading-text': ("正在进入，请稍后..."),
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    if (!__VLS_ctx.loading) {
        const __VLS_0 = {}.ElContainer;
        /** @type { [typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ] } */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ style: ({}) },
        }));
        const __VLS_2 = __VLS_1({
            ...{ style: ({}) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const __VLS_6 = {}.ElHeader;
        /** @type { [typeof __VLS_components.ElHeader, typeof __VLS_components.elHeader, typeof __VLS_components.ElHeader, typeof __VLS_components.elHeader, ] } */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
            ...{ class: ("main-content-header") },
        }));
        const __VLS_8 = __VLS_7({
            ...{ class: ("main-content-header") },
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: ({}) },
        });
        const __VLS_12 = {}.ElImage;
        /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            ...{ class: ("logo") },
            src: ("https://www.jmu.edu.cn/images/logo.png"),
        }));
        const __VLS_14 = __VLS_13({
            ...{ class: ("logo") },
            src: ("https://www.jmu.edu.cn/images/logo.png"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        // @ts-ignore
        /** @type { [typeof UserInfo, ] } */ ;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent(UserInfo, new UserInfo({
            ...{ style: ({}) },
        }));
        const __VLS_19 = __VLS_18({
            ...{ style: ({}) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        __VLS_11.slots.default;
        var __VLS_11;
        const __VLS_23 = {}.ElContainer;
        /** @type { [typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ] } */ ;
        // @ts-ignore
        const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({}));
        const __VLS_25 = __VLS_24({}, ...__VLS_functionalComponentArgsRest(__VLS_24));
        const __VLS_29 = {}.ElAside;
        /** @type { [typeof __VLS_components.ElAside, typeof __VLS_components.elAside, typeof __VLS_components.ElAside, typeof __VLS_components.elAside, ] } */ ;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
            width: ("230px"),
        }));
        const __VLS_31 = __VLS_30({
            width: ("230px"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        const __VLS_35 = {}.ElScrollbar;
        /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ] } */ ;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
            ...{ style: ({}) },
        }));
        const __VLS_37 = __VLS_36({
            ...{ style: ({}) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        const __VLS_41 = {}.ElMenu;
        /** @type { [typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, ] } */ ;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
            router: (true),
            defaultActive: ((__VLS_ctx.$route.path)),
            defaultOpeneds: ((['1', '2', '3'])),
            ...{ style: ({}) },
        }));
        const __VLS_43 = __VLS_42({
            router: (true),
            defaultActive: ((__VLS_ctx.$route.path)),
            defaultOpeneds: ((['1', '2', '3'])),
            ...{ style: ({}) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
        for (const [menu, index] of __VLS_getVForSourceType((__VLS_ctx.userMenu))) {
            const __VLS_47 = {}.ElSubMenu;
            /** @type { [typeof __VLS_components.ElSubMenu, typeof __VLS_components.elSubMenu, typeof __VLS_components.ElSubMenu, typeof __VLS_components.elSubMenu, ] } */ ;
            // @ts-ignore
            const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
                index: (((index + 1).toString())),
            }));
            const __VLS_49 = __VLS_48({
                index: (((index + 1).toString())),
            }, ...__VLS_functionalComponentArgsRest(__VLS_48));
            __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            {
                const { title: __VLS_thisSlot } = __VLS_52.slots;
                const __VLS_53 = {}.ElIcon;
                /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
                // @ts-ignore
                const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({}));
                const __VLS_55 = __VLS_54({}, ...__VLS_functionalComponentArgsRest(__VLS_54));
                const __VLS_59 = ((menu.icon));
                // @ts-ignore
                const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({}));
                const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
                __VLS_58.slots.default;
                var __VLS_58;
                __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
                (menu.title);
            }
            for (const [subMenu] of __VLS_getVForSourceType((menu.sub))) {
                const __VLS_65 = {}.ElMenuItem;
                /** @type { [typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ] } */ ;
                // @ts-ignore
                const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
                    index: ((subMenu.index)),
                }));
                const __VLS_67 = __VLS_66({
                    index: ((subMenu.index)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_66));
                __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
                {
                    const { title: __VLS_thisSlot } = __VLS_70.slots;
                    const __VLS_71 = {}.ElIcon;
                    /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
                    // @ts-ignore
                    const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({}));
                    const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
                    const __VLS_77 = ((subMenu.icon));
                    // @ts-ignore
                    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
                    const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
                    __VLS_76.slots.default;
                    var __VLS_76;
                    (subMenu.title);
                }
                var __VLS_70;
            }
            var __VLS_52;
        }
        if (__VLS_ctx.isStallAdmin(__VLS_ctx.store.user?.roles)) {
            const __VLS_83 = {}.ElMenuItem;
            /** @type { [typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, typeof __VLS_components.ElMenuItem, typeof __VLS_components.elMenuItem, ] } */ ;
            // @ts-ignore
            const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
                index: ("/index/plate-recognition"),
            }));
            const __VLS_85 = __VLS_84({
                index: ("/index/plate-recognition"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_84));
            const __VLS_89 = {}.RouterLink;
            /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
                to: ("/index/plate-recognition"),
                ...{ style: ({}) },
            }));
            const __VLS_91 = __VLS_90({
                to: ("/index/plate-recognition"),
                ...{ style: ({}) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_90));
            const __VLS_95 = {}.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
            // @ts-ignore
            const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({}));
            const __VLS_97 = __VLS_96({}, ...__VLS_functionalComponentArgsRest(__VLS_96));
            const __VLS_101 = {}.Camera;
            /** @type { [typeof __VLS_components.Camera, ] } */ ;
            // @ts-ignore
            const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({}));
            const __VLS_103 = __VLS_102({}, ...__VLS_functionalComponentArgsRest(__VLS_102));
            __VLS_100.slots.default;
            var __VLS_100;
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.b, __VLS_intrinsicElements.b)({});
            __VLS_94.slots.default;
            var __VLS_94;
            __VLS_88.slots.default;
            var __VLS_88;
        }
        __VLS_46.slots.default;
        var __VLS_46;
        __VLS_40.slots.default;
        var __VLS_40;
        __VLS_34.slots.default;
        var __VLS_34;
        const __VLS_107 = {}.ElMain;
        /** @type { [typeof __VLS_components.ElMain, typeof __VLS_components.elMain, typeof __VLS_components.ElMain, typeof __VLS_components.elMain, ] } */ ;
        // @ts-ignore
        const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
            ...{ class: ("main-content-page") },
            ...{ class: (({ 'fullscreen-mode': __VLS_ctx.isFullscreen })) },
        }));
        const __VLS_109 = __VLS_108({
            ...{ class: ("main-content-page") },
            ...{ class: (({ 'fullscreen-mode': __VLS_ctx.isFullscreen })) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_108));
        const __VLS_113 = {}.ElScrollbar;
        /** @type { [typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ] } */ ;
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
            ...{ style: ({}) },
            ...{ class: (({ 'fullscreen-scrollbar': __VLS_ctx.isFullscreen })) },
        }));
        const __VLS_115 = __VLS_114({
            ...{ style: ({}) },
            ...{ class: (({ 'fullscreen-scrollbar': __VLS_ctx.isFullscreen })) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_114));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("scroll-content") },
            ...{ class: (({ 'fullscreen-content': __VLS_ctx.isFullscreen })) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("content-wrapper") },
        });
        const __VLS_119 = {}.RouterView;
        /** @type { [typeof __VLS_components.RouterView, typeof __VLS_components.routerView, typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ] } */ ;
        // @ts-ignore
        const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({}));
        const __VLS_121 = __VLS_120({}, ...__VLS_functionalComponentArgsRest(__VLS_120));
        {
            const { default: __VLS_thisSlot } = __VLS_124.slots;
            const [{ Component }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_125 = {}.transition;
            /** @type { [typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ] } */ ;
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
                name: ("el-fade-in-linear"),
                mode: ("out-in"),
            }));
            const __VLS_127 = __VLS_126({
                name: ("el-fade-in-linear"),
                mode: ("out-in"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_126));
            const __VLS_131 = ((Component));
            // @ts-ignore
            const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
                ...{ style: ({}) },
            }));
            const __VLS_133 = __VLS_132({
                ...{ style: ({}) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_132));
            __VLS_130.slots.default;
            var __VLS_130;
            __VLS_124.slots['' /* empty slot name completion */];
        }
        var __VLS_124;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("main-beian") },
            ...{ class: (({ 'fixed-beian': __VLS_ctx.isSettingPage, 'hide-beian': __VLS_ctx.isFullscreen })) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("copyright") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: ("https://beian.miit.gov.cn/"),
            target: ("_blank"),
            rel: ("noopener noreferrer"),
            ...{ class: ("beian-link") },
        });
        __VLS_118.slots.default;
        var __VLS_118;
        if (__VLS_ctx.isDisplayPage && !__VLS_ctx.isFullscreen) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (__VLS_ctx.toggleFullscreen) },
                ...{ class: ("fullscreen-btn") },
            });
            const __VLS_137 = {}.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
            // @ts-ignore
            const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
                size: ((24)),
            }));
            const __VLS_139 = __VLS_138({
                size: ((24)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_138));
            const __VLS_143 = {}.FullScreen;
            /** @type { [typeof __VLS_components.FullScreen, ] } */ ;
            // @ts-ignore
            const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({}));
            const __VLS_145 = __VLS_144({}, ...__VLS_functionalComponentArgsRest(__VLS_144));
            __VLS_142.slots.default;
            var __VLS_142;
        }
        __VLS_112.slots.default;
        var __VLS_112;
        __VLS_28.slots.default;
        var __VLS_28;
        __VLS_5.slots.default;
        var __VLS_5;
    }
    ['main-content', 'main-content-header', 'logo', 'main-content-page', 'fullscreen-mode', 'fullscreen-scrollbar', 'scroll-content', 'fullscreen-content', 'content-wrapper', 'main-beian', 'fixed-beian', 'hide-beian', 'copyright', 'beian-link', 'fullscreen-btn',];
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
            Camera: Camera,
            FullScreen: FullScreen,
            UserInfo: UserInfo,
            isStallAdmin: isStallAdmin,
            loading: loading,
            store: store,
            isFullscreen: isFullscreen,
            isDisplayPage: isDisplayPage,
            toggleFullscreen: toggleFullscreen,
            userMenu: userMenu,
            isSettingPage: isSettingPage,
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
