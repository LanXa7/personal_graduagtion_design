<template>
  <div class="user-info">
    <slot/>
    <div class="profile">
      <div>{{ store.user.username }}</div>
      <div>{{ store.user.email }}</div>
      <div v-if="store.user.phone">{{ store.user.phone }}</div>
    </div>
    <el-dropdown>
      <el-avatar :src="store.avatarUrl"/>
      <template #dropdown>
        <el-dropdown-item>
          <el-icon>
            <Operation/>
          </el-icon>
          个人设置
        </el-dropdown-item>
<!--        <el-dropdown-item>-->
<!--          <el-icon>-->
<!--            <Message/>-->
<!--          </el-icon>-->
<!--          消息列表-->
<!--        </el-dropdown-item>-->
        <el-dropdown-item @click="userLogout" divided>
          <el-icon>
            <Back/>
          </el-icon>
          退出登录
        </el-dropdown-item>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import {Back, Message, Operation, Right} from "@element-plus/icons-vue";
import {deleteAccessToken} from "@/utils/auth";
import router from "@/router";
import {useStore} from "@/store";
import {ElMessage} from "element-plus";

const store = useStore()

function userLogout() {
  Apis.AuthController.logout().then(() => {
    ElMessage.success("退出成功!")
    deleteAccessToken()
    router.push("/")
  })
}
</script>

<style scoped>
.user-info {
  width: 320px;
  display: flex;
  gap: 20px;
  justify-content: flex-end;
  align-items: center;

  .el-avatar:hover {
    cursor: pointer;
  }

  .profile {
    text-align: right;

    :first-child {
      font-size: 18px;
      font-weight: bold;
      line-height: 20px;
    }

    :nth-child(2), :nth-child(3) {
      font-size: 10px;
      color: grey;
      line-height: 14px;
    }
  }
}
</style>