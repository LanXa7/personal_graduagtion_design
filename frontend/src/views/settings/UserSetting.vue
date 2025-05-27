<template>
  <div style="display: flex;max-width: 950px;margin: auto">
    <div class="settings-left">
      <!--      <card :icon="User" title="账号信息设置" desc="在这里编辑您的个人信息，您可以在隐私设置中选择是否展示这些信息"-->
      <!--            v-loading="loading">-->
      <!--        <el-form :model="baseForm" :rules="rules" ref="baseFormRef" label-position="top"-->
      <!--                 style="margin: 0 10px 10px 10px">-->
      <!--          <el-form-item label="用户名" prop="username">-->
      <!--            <el-input v-model="baseForm.username" maxlength="10"/>-->
      <!--          </el-form-item>-->
      <!--          <el-form-item label="性别">-->
      <!--            <el-radio-group v-model="baseForm.gender">-->
      <!--              <el-radio :label="0">男</el-radio>-->
      <!--              <el-radio :label="1">女</el-radio>-->
      <!--            </el-radio-group>-->
      <!--          </el-form-item>-->
      <!--          <el-form-item label="手机号" prop="phone">-->
      <!--            <el-input v-model="baseForm.phone" maxlength="11"/>-->
      <!--          </el-form-item>-->
      <!--          <el-form-item label="QQ号" prop="qq">-->
      <!--            <el-input v-model="baseForm.qq" maxlength="13"/>-->
      <!--          </el-form-item>-->
      <!--          <el-form-item label="微信号" prop="wx">-->
      <!--            <el-input v-model="baseForm.wx" maxlength="20"/>-->
      <!--          </el-form-item>-->
      <!--          <el-form-item label="个人简介" prop="desc">-->
      <!--            <el-input v-model="baseForm.desc" type="textarea" :rows="6" maxlength="200"/>-->
      <!--          </el-form-item>-->
      <!--          <div>-->
      <!--            <el-button :icon="Select" @click="saveDetails" :loading="loading.base"-->
      <!--                       type="success">保存用户信息-->
      <!--            </el-button>-->
      <!--          </div>-->
      <!--        </el-form>-->
      <!--      </card>-->
      <card style="margin-top: 10px" :icon="Message" title="电子邮件设置"
            desc="您可以在这里修改默认绑定的电子邮件地址">
        <el-form :rules="rules" @validate="onValidate" :model="emailForm" ref="emailFormRef"
                 label-position="top" style="margin: 0 10px 10px 10px">
          <el-form-item label="电子邮件" prop="email">
            <el-input v-model="emailForm.email"/>
          </el-form-item>
          <el-form-item prop="code">
            <el-row style="width: 100%" :gutter="10">
              <el-col :span="18">
                <el-input placeholder="请获取验证码" v-model="emailForm.code"/>
              </el-col>
              <el-col :span="6">
                <el-button type="success" style="width: 100%" :disabled="!isEmailValid || coldTime > 0"
                           @click="sendEmailCode" plain>
                  {{ coldTime > 0 ? `请稍后 ${coldTime} 秒` : '获取验证码' }}
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <div>
            <el-button :icon="Refresh" type="success" @click="modifyEmail">更新电子邮件</el-button>
          </div>
        </el-form>
      </card>
      
      <card style="margin-top: 10px" :icon="Phone" title="电话号码设置"
            desc="您可以在这里修改绑定的电话号码">
        <el-form :model="phoneForm" ref="phoneFormRef" label-position="top" style="margin: 0 10px 10px 10px">
          <el-form-item label="电话号码" prop="phone">
            <el-input v-model="phoneForm.phone" maxlength="11"/>
          </el-form-item>
          <div>
            <el-button :icon="Refresh" type="success" @click="modifyPhone">更新电话号码</el-button>
          </div>
        </el-form>
      </card>
    </div>
    <div class="settings-right">
      <div style="position: sticky;top: 20px">
        <card>
          <div style="text-align: center;padding: 5px 15px 0 15px">
            <el-avatar :size="70" :src="store.avatarUrl"/>
            <div style="margin: 5px 0">
              <el-upload
                  :action="'/api/user/avatar'"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                  :on-success="uploadSuccess"
                  :headers="accessHeader()">
                <el-button size="small" round>修改头像</el-button>
              </el-upload>
            </div>
            <div style="font-weight: bold">你好, {{ store.user.username }}</div>
          </div>
          <el-divider style="margin: 10px 0"/>
          <div style="font-size: 14px;color: grey;padding: 10px">
            {{ '这个用户很懒，没有填写个人简介~' }}
          </div>
        </card>
        <card style="margin-top: 10px;font-size: 14px">
          <div>账号注册时间: {{ createTime }}</div>
          <div style="color: grey">欢迎加入我们的校园食堂系统！</div>
        </card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import Card from "@/components/Card.vue";
import {Message, Refresh, Select, User, Phone} from "@element-plus/icons-vue";
import {ref, reactive} from "vue";
import {ElMessage} from "element-plus";
import {useStore} from "@/store";
import {accessHeader} from "@/utils/auth";
import { formatChineseTime } from "@/utils/dateUtils";
import BeiJingTime from '@/components/BeiJingTime.vue';

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
    {required: true, message: '请输入邮件地址', trigger: 'blur'},
    {type: 'email', message: '请输入合法的电子邮件地址', trigger: ['blur', 'change']}
  ]
}

const coldTime = ref(0)
const isEmailValid = ref(true)
const onValidate = (prop, isValid) => {
  if (prop === 'email')
    isEmailValid.value = isValid
}

function sendEmailCode() {
  emailFormRef.value.validate(isValid => {
    if (isValid) {
      coldTime.value = 60
      Apis.AuthController.queryCode({
        data: {
          email: emailForm.email,
          type: 'modify',
        }
      }).then(() => {
          const handle = setInterval(() => {
            coldTime.value--
            if (coldTime.value === 0) {
              clearInterval(handle)
            }
          }, 1000)
          ElMessage.success(`验证码已发送到邮箱: ${emailForm.email}，请注意查收`)
      }).catch(() => {
          coldTime.value = 0
        ElMessage.error('获取验证码失败')
      })
    }
  })
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
        ElMessage.success('邮件修改成功')
        store.user.email = emailForm.email
        emailFormRef.value.resetFields();
      })
    }
  })
}

function modifyPhone() {
  // 由于后端没有提供电话号码修改的API，目前只更新本地状态
  // 实际项目中需要后端提供updatePhone接口
  ElMessage.warning('电话号码修改功能需要后端支持，请联系开发人员')
  ElMessage.success('电话号码已在本地更新')
  store.user.phone = phoneForm.phone
  phoneFormRef.value.resetFields();
}

function beforeAvatarUpload(rawFile) {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('头像只能是 JPG/PNG 格式的')
    return false
  } else if(rawFile.size / 1024 > 100) {
    ElMessage.error('头像大小不能大于 100KB')
    return false
  }
  return true
}

function uploadSuccess(data){
  ElMessage.success('头像上传成功')
  store.user.avatar = data
}


</script>

<style scoped>
.settings-left {
  flex: 1;
  margin: 20px;
}

.settings-right {
  width: 300px;
  margin: 20px 30px 20px 0;
}
</style>