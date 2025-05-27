<template>
  <div style="width: 100vw;height: 100vh;overflow: hidden;display: flex; position: relative;">
    <div style="flex: 1">
      <el-image style="width: 100%;height: 100%" fit="cover"
                src="http://5b0988e595225.cdn.sohucs.com/images/20180831/f0468a963d1f40ae8e8d0199a53f7c32.jpeg"/>
    </div>
    <div class="welcome-title">
      <div style="font-size: 30px;font-weight: bold">欢迎来到食堂自助结账系统</div>
      <div style="margin-top: 10px">在这里你可以自动识别餐品完成结账以及管理食堂数据</div>
      <div style="margin-top: 5px">在这里你可以感受到科技给生活带来的改变</div>
    </div>
    <div class="right-card">
      <router-view v-slot="{ Component }">
        <transition name="el-fade-in-linear" mode="out-in">
          <component :is="Component" style="height: 100%"/>
        </transition>
      </router-view>
    </div>
    <div class="welcome-beian">
      <span class="copyright">© 2025 在线校园食堂管理系统</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="beian-link">
        闽 ICP 备09004614号
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.right-card {
  width: 400px;
  z-index: 1;
  background-color: var(--el-bg-color);
}

.welcome-title {
  position: absolute;
  bottom: 30px;
  left: 30px;
  color: white;
  text-shadow: 0 0 10px black;
}

.welcome-beian {
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 13px;
  color: #000000;
  z-index: 2;
}

.welcome-beian .copyright,
.welcome-beian .beian-link {
  color: #000000;
  text-decoration: none;
}

/* 暗色模式适配 */
html.dark .welcome-beian .copyright,
html.dark .welcome-beian .beian-link {
  color: #000000;
}
</style>