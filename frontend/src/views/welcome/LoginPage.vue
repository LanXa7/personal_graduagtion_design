<template>
  <div style="text-align: center;margin: 0 20px">
    <div style="margin-top: 150px">
      <div style="font-size: 25px;font-weight: bold">登录</div>
      <div style="font-size: 14px;color: grey">在进入系统之前请先输入用户名和密码进行登录</div>
    </div>
    <div style="margin-top: 50px">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.text" maxlength="10" type="text" placeholder="用户名/邮箱/手机号">
            <template #prefix>
              <el-icon>
                <User/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" maxlength="20" style="margin-top: 10px" placeholder="密码"
                    @keyup.enter="userLogin">
            <template #prefix>
              <el-icon>
                <Lock/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-row style="margin-top: 5px">
          <el-col :span="12" style="text-align: left">
            <el-form-item prop="remember">
              <el-checkbox v-model="form.remember" label="记住我"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-link @click="router.push('/forget')">忘记密码？</el-link>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div style="margin-top: 40px">
      <el-button @click="userLogin()" style="width: 270px" type="success" plain>立即登录</el-button>
    </div>
    <el-divider>
      <span style="color: grey;font-size: 13px">没有账号</span>
    </el-divider>
    <div>
      <el-button style="width: 270px" @click="router.push('/register')" type="warning" plain>注册账号</el-button>
    </div>
  </div>
</template>

<script setup>
import {User, Lock} from '@element-plus/icons-vue'
import router from "@/router";
import {reactive, ref} from "vue";
import {storeAccessToken} from "@/utils/auth/index.ts";
import dayjs from "dayjs";
import {useDictStoreWithOut} from "@/store/dict.ts";

const formRef = ref()
const form = reactive({
  text: '',
  password: '',
  remember: false
})

const rules = {
  text: [
    {required: true, message: '请输入用户名'}
  ],
  password: [
    {required: true, message: '请输入密码'}
  ]
}

function userLogin() {
  formRef.value.validate((isValid) => {
    if (isValid) {
      Apis.AuthController.signIn({
        data: {
          text: form.text,
          password: form.password,
        }
      }).then(data => {
        console.log('Login response:', data)
        console.log('User roles:', data.roles)
        
        ElMessage.success("登录成功!")
        storeAccessToken(form.remember, data.token, dayjs().add(data.expire, 'second'), data.roles)
        
        // 检查存储是否成功
        const authStr = localStorage.getItem('authorize') || sessionStorage.getItem('authorize')
        if (authStr) {
          console.log('Stored auth data:', JSON.parse(authStr))
        }
        
        router.push('/index')
        const dictStore = useDictStoreWithOut();
        if (!dictStore.getIsSetDict) {
          dictStore.setDictMap();
        }
      })
    }
  });
}
</script>

<style scoped>

</style>