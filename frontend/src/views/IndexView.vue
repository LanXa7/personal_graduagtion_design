<template>
  <div class="main-content" v-loading="loading" element-loading-text="正在进入，请稍后...">
    <el-container style="height: 100%" v-if="!loading">
      <el-header class="main-content-header">
        <div style="width: 320px;height: 32px">
          <el-image class="logo" src="https://www.jmu.edu.cn/images/logo.png"/>
        </div>
        <user-info style="margin-left: auto;"/>
      </el-header>
      <el-container>
        <el-aside width="230px">
          <el-scrollbar style="height: calc(100vh - 55px)">
            <el-menu
                router
                :default-active="$route.path"
                :default-openeds="['1', '2', '3']"
                style="min-height: calc(100vh - 55px)">
              <el-sub-menu :index="(index + 1).toString()"
                           v-for="(menu, index) in userMenu">
                <template #title>
                  <el-icon>
                    <component :is="menu.icon"/>
                  </el-icon>
                  <span><b>{{ menu.title }}</b></span>
                </template>
                <el-menu-item :index="subMenu.index" v-for="subMenu in menu.sub">
                  <template #title>
                    <el-icon>
                      <component :is="subMenu.icon"/>
                    </el-icon>
                    {{ subMenu.title }}
                  </template>
                </el-menu-item>
              </el-sub-menu>

              <!-- 添加餐盘识别菜单项 - 只对摊位管理员显示 -->
              <el-menu-item index="/index/plate-recognition" v-if="isStallAdmin(store.user?.roles)">
                <router-link to="/index/plate-recognition" style="text-decoration: none; color: inherit; display: flex; align-items: center;">
                  <el-icon><Camera /></el-icon>
                  <span><b>餐品识别</b></span>
                </router-link>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
        </el-aside>
        <el-main class="main-content-page" :class="{ 'fullscreen-mode': isFullscreen }">
          <el-scrollbar style="height: calc(100vh - 55px)" :class="{ 'fullscreen-scrollbar': isFullscreen }">
            <div class="scroll-content" :class="{ 'fullscreen-content': isFullscreen }">
              <div class="content-wrapper">
            <router-view v-slot="{ Component }">
              <transition name="el-fade-in-linear" mode="out-in">
                <component :is="Component" style="height: 100%"/>
              </transition>
            </router-view>
              </div>
              <!-- el-main底部的备案信息 -->
              <div class="main-beian" :class="{ 'fixed-beian': isSettingPage, 'hide-beian': isFullscreen }">
                <span class="copyright">© 2025 在线校园食堂管理系统</span>
                <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="beian-link">
                  闽 ICP 备09004614号
                </a>
              </div>
            </div>
          </el-scrollbar>
          <!-- 全屏按钮 -->
          <div class="fullscreen-btn" @click="toggleFullscreen" v-if="isDisplayPage && !isFullscreen">
            <el-icon :size="24">
              <FullScreen />
            </el-icon>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>


<script setup lang="ts">
import {
  Bell,
  ChatDotSquare, Check, Collection, DataLine,
  Document, Files, Food,
  Location, Lock, Monitor,
  Notification, Operation,
  Position, Platform,
  School, Search, Setting, Shop,
  Umbrella, User, UserFilled, Camera, Tickets, FullScreen
} from "@element-plus/icons-vue";
import {onMounted, ref, computed, onUnmounted} from "vue";
import UserInfo from "@/components/UserInfo.vue";
import {useStore} from "@/store";
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
  } catch (err) {
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
    dataDisplayItems.push({title: '数据大屏', icon: DataLine, index: '/index/data-display'});
  }
  
  // 只有摊位管理员可以看到菜品展示大屏
  if (isStallAdmin(store.user?.roles)) {
    dataDisplayItems.push({title: '菜品展示大屏', icon: Platform, index: '/index/food-display'});
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
      adminMenuItems.push({title: '食堂管理', icon: School, index: '/index/canteen-management'});
      adminMenuItems.push({title: '员工管理', icon: UserFilled, index: '/index/user-management'});
    }

    // 超级管理员和食堂管理员可以管理摊位
    if (isSuperAdmin(store.user?.roles) || isCanteenAdmin(store.user?.roles)) {
      adminMenuItems.push({title: '摊位管理', icon: Shop, index: '/index/stall-management'});
    }

    // 所有管理员都能管理菜品和查看订单
    adminMenuItems.push({title: '菜品管理', icon: Food, index: '/index/food-management'});
    // 超级管理员、食堂管理员和摊位管理员可以查看订单
    if (isSuperAdmin(store.user?.roles) || isCanteenAdmin(store.user?.roles) || isStallAdmin(store.user?.roles)) {
      adminMenuItems.push({title: '订单管理', icon: Tickets, index: '/index/order-management'});
    }

    menus.push({
      title: '后台管理', icon: Setting, sub: adminMenuItems
    });
  }

  menus.push({
    title: '个人设置', icon: Operation, sub: [
      {title: '个人信息设置', icon: User, index: '/index/user-setting'},
      {title: '账号安全设置', icon: Lock, index: '/index/privacy-setting'}
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

</script>

<style lang="less" scoped>
.notification-item {
  transition: .3s;

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }
}

.notification {
  font-size: 22px;
  line-height: 14px;
  text-align: center;
  transition: color .3s;

  &:hover {
    color: grey;
    cursor: pointer;
  }
}

.main-content-page {
  padding: 0;
  background-color: #f7f8fa;
  position: relative;
  transition: all 0.3s;
}

.dark .main-content-page {
  background-color: #212225;
}

.main-content {
  height: 100vh;
  width: 100vw;
}

.main-content-header {
  border-bottom: solid 1px var(--el-border-color);
  height: 55px;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  .logo {
    height: 32px;
  }

  .user-info {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .el-avatar:hover {
      cursor: pointer;
    }

    .profile {
      text-align: right;
      margin-right: 20px;

      :first-child {
        font-size: 18px;
        font-weight: bold;
        line-height: 20px;
      }

      :last-child {
        font-size: 10px;
        color: grey;
      }
    }
  }
}

.scroll-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  min-height: 0;
}

.main-beian {
  flex-shrink: 0;
  text-align: center;
  font-size: 13px;
  color: #000000;
  padding: 12px 0;
  background-color: #f7f8fa;
}

.fixed-beian {
  position: fixed;
  bottom: 0;
  left: 230px;
  right: 0;
  z-index: 100;
}

.dark .main-beian {
  background-color: #212225;
}

.main-beian .copyright,
.main-beian .beian-link {
  color: #000000;
  text-decoration: none;
}

/* 暗色模式适配 */
html.dark .main-beian .copyright,
html.dark .main-beian .beian-link {
  color: #ffffff;
}

.fullscreen-mode {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9999;
  background: white;
  padding: 0 !important;
  margin: 0 !important;
  height: 100vh !important;
  width: 100vw !important;
}

.fullscreen-scrollbar {
  height: 100vh !important;
  width: 100vw !important;
}

.fullscreen-content {
  min-height: 100vh !important;
  width: 100vw !important;
  padding: 0 !important;
  margin: 0 !important;
}

.hide-beian {
  display: none !important;
}

.fullscreen-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 10000;
  transition: all 0.3s;
}

.fullscreen-btn:hover {
  background: white;
  transform: scale(1.1);
}

/* 暗色模式适配 */
html.dark .fullscreen-mode {
  background: #1a1a1a;
}

html.dark .fullscreen-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

html.dark .fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}
</style>