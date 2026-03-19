<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-title">
        <h2>电子档案管理系统</h2>
        <p>请登录您的账户</p>
      </div>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loginLoading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { loginApi } from '../api/auth'

const router = useRouter()
const loginFormRef = ref(null)
const loginLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loginLoading.value = true
        const response = await loginApi(loginForm)
        if (response.code === 200) {
          // 保存Token和用户信息到localStorage
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('userInfo', JSON.stringify(response.data.user))
          
          ElMessage.success('登录成功')
          // 跳转到首页并强制刷新，确保App.vue的onMounted钩子执行，更新isLoggedIn状态
          router.push('/home')
          // 强制刷新页面，确保顶栏和菜单正常显示
          setTimeout(() => {
            window.location.reload()
          }, 100)
        } else {
          ElMessage.error('登录失败：' + response.message)
        }
      } catch (error) {
        ElMessage.error('登录失败：' + error.message)
      } finally {
        loginLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form-wrapper {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
}

.login-title h2 {
  color: #333;
  margin-bottom: 10px;
}

.login-title p {
  color: #666;
  font-size: 14px;
}
</style>