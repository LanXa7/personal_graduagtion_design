import {createRouter, createWebHistory} from 'vue-router'
import {unauthorized} from "@/utils/auth";
import { isStallAdmin, hasAdminPermission } from '@/utils/roleUtils';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'welcome',
            component: () => import('@/views/WelcomeView.vue'),
            children: [
                {
                    path: '',
                    name: 'welcome-login',
                    component: () => import('@/views/welcome/LoginPage.vue')
                }, {
                    path: 'register',
                    name: 'welcome-register',
                    component: () => import('@/views/welcome/RegisterPage.vue')
                }, {
                    path: 'forget',
                    name: 'welcome-forget',
                    component: () => import('@/views/welcome/ForgetPage.vue')
                }
            ]
        }, {
            path: '/index',
            name: 'index',
            component: () => import('@/views/IndexView.vue'),
            redirect: (to) => {
                // 从本地存储中获取认证信息
                const authStr = localStorage.getItem('authorize') || sessionStorage.getItem('authorize')
                if (authStr) {
                    try {
                        const authObj = JSON.parse(authStr)
                        const userRoles = authObj.roles || []
                        
                        if (isStallAdmin(userRoles)) {
                            return '/index/food-display'
                        } else if (hasAdminPermission(userRoles)) {
                            return '/index/data-display'
                        }
                    } catch (error) {
                        console.error('Error parsing auth data:', error)
                    }
                }
                return '/index/user-setting'
            },
            children: [
                {
                    path: 'data-display',
                    name: 'data-display',
                    component: () => import('@/views/display/DataDisplay.vue'),
                    meta: {
                        requiresAuth: true,
                        requiresAdmin: true
                    }
                },
                {
                    path: 'food-display',
                    name: 'food-display',
                    component: () => import('@/views/display/FoodDisplay.vue'),
                    meta: {
                        requiresAuth: true,
                        requiresStallAdmin: true
                    }
                },
                {
                    path: 'user-setting',
                    name: 'user-setting',
                    component: () => import('@/views/settings/UserSetting.vue')
                }, {
                    path: 'privacy-setting',
                    name: 'privacy-setting',
                    component: () => import('@/views/settings/PrivacySetting.vue')
                },
                {
                    path: 'canteen-management',
                    name: 'canteen-management',
                    component: () => import('@/views/admin/CanteenManagement.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'stall-management',
                    name: 'stall-management',
                    component: () => import('@/views/admin/StallManagement.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'food-management',
                    name: 'food-management',
                    component: () => import('@/views/admin/FoodManagement.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'order-management',
                    name: 'order-management',
                    component: () => import('@/views/admin/OrderManagement.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'user-management',
                    name: 'user-management',
                    component: () => import('@/views/admin/UserManagement.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'plate-recognition',
                    component: () => import('@/views/plate-recognition/index.vue'),
                    meta: {
                        title: '餐品识别',
                        requiresAuth: true,
                        requiresStallAdmin: true
                    }
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    const isUnauthorized = unauthorized()
    
    // 处理登录页面的访问
    if (to.name?.toString().startsWith('welcome')) {
        if (!isUnauthorized) {
            // 已登录用户访问登录页面，根据角色重定向
            const authStr = localStorage.getItem('authorize') || sessionStorage.getItem('authorize')
            if (authStr) {
                try {
                    const authObj = JSON.parse(authStr)
                    const userRoles = authObj.roles || []
                    
                    if (isStallAdmin(userRoles)) {
                        next('/index/food-display')
                    } else if (hasAdminPermission(userRoles)) {
                        next('/index/data-display')
                    } else {
                        next('/index/user-setting')
                    }
                    return
                } catch (error) {
                    console.error('Error parsing auth data:', error)
                }
            }
        }
        next()
        return
    }
    
    // 处理需要认证的页面
    if (to.fullPath.startsWith('/index') && isUnauthorized) {
        next('/')
        return
    }
    
    // 处理需要特定角色的页面
    if (to.meta.requiresAdmin || to.meta.requiresStallAdmin) {
        const authStr = localStorage.getItem('authorize') || sessionStorage.getItem('authorize')
        if (!authStr) {
            next('/')
            return
        }
        
        try {
            const authObj = JSON.parse(authStr)
            const userRoles = authObj.roles || []
            
            if (to.meta.requiresStallAdmin && !isStallAdmin(userRoles)) {
                next('/index/user-setting')
                return
            }
            
            if (to.meta.requiresAdmin && !hasAdminPermission(userRoles)) {
                next('/index/user-setting')
                return
            }
            
            next()
        } catch (error) {
            console.error('Error parsing auth data:', error)
            next('/')
        }
    } else {
        next()
    }
})

export default router