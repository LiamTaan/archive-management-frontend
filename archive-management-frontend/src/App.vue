<template>
  <div id="app">
    <el-container v-if="isLoggedIn">
      <el-header height="64px">
        <div class="header-container">
          <div class="logo">
            <el-icon class="logo-icon"><Document /></el-icon>
            <span class="logo-text">电子档案管理系统</span>
          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-name">
                <el-icon><User /></el-icon>
                {{ userInfo.username || '管理员' }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item @click="showChangePasswordDialog">修改密码</el-dropdown-item>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside width="240px">
          <el-menu
            :default-active="activeMenu"
            class="el-menu-vertical-demo"
            @select="handleMenuSelect"
            background-color="transparent"
            text-color="#ffffff"
            active-text-color="#ffffff"
          >
            <!-- 动态生成菜单 -->
            <template v-for="menu in menus" :key="menu.index">
              <!-- 无子菜单的情况 -->
              <el-menu-item v-if="!menu.children || menu.children.length === 0" :index="menu.index">
                <el-icon><component :is="iconMap[menu.icon] || Document" /></el-icon>
                <span>{{ menu.title }}</span>
              </el-menu-item>
              <!-- 有子菜单的情况 -->
              <el-sub-menu v-else :index="menu.index">
                <template #title>
                  <el-icon><component :is="iconMap[menu.icon] || Document" /></el-icon>
                  <span>{{ menu.title }}</span>
                </template>
                <el-menu-item
                  v-for="subMenu in menu.children"
                  :key="subMenu.index"
                  :index="subMenu.index"
                >
                  <el-icon v-if="subMenu.icon"><component :is="iconMap[subMenu.icon] || Document" /></el-icon>
                  <span>{{ subMenu.title }}</span>
                </el-menu-item>
              </el-sub-menu>
            </template>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <!-- 未登录时只显示路由视图，用于登录页面 -->
    <div v-else>
      <router-view />
    </div>
    
    <!-- 修改密码对话框 -->
    <el-dialog v-model="changePasswordDialogVisible" title="修改密码" width="50%">
      <el-form :model="changePasswordForm" :rules="changePasswordRules" ref="changePasswordFormRef" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="changePasswordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="changePasswordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="changePasswordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="changePasswordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleChangePassword">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserMenusApi } from './api/menu'
import { logoutApi } from './api/auth'
import { updatePasswordApi } from './api/user'
import { 
  Document, User, Collection, Link, Check, View, Setting, ArrowDown,
  User as UserIcon, Lock, Setting as SettingIcon
} from '@element-plus/icons-vue'

const router = useRouter()
const activeMenu = ref('collection')
const menus = ref([])
const isLoggedIn = ref(false)
const userInfo = ref({})

// 修改密码对话框
const changePasswordDialogVisible = ref(false)
const changePasswordFormRef = ref(null)
const changePasswordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 修改密码验证规则
const changePasswordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== changePasswordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ]
}

// 图标映射，用于根据菜单的icon名称获取对应的组件
const iconMap = {
  Document,
  User: UserIcon,
  Collection,
  Link,
  Check,
  View,
  Setting: SettingIcon,
  Lock
}

// 初始化系统
onMounted(() => {
  // 检查用户是否已登录
  const token = localStorage.getItem('token')
  if (token) {
    isLoggedIn.value = true
    // 获取用户信息
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      userInfo.value = JSON.parse(userInfoStr)
    }
    // 获取菜单列表
    getMenus()
    // 设置初始激活菜单
    setActiveMenu()
  } else {
    // 未登录，跳转到登录页
    router.push('/login')
  }
})

// 获取菜单列表
const getMenus = async () => {
  try {
    // 调用后端API获取菜单列表
    const response = await getUserMenusApi()
    // 将后端返回的菜单数据转换为前端需要的格式
    const convertMenu = (menu) => {
      return {
        index: menu.menuName.toLowerCase().replace(/\s+/g, '-'),
        title: menu.menuName,
        icon: menu.icon,
        path: menu.path,
        children: menu.children ? menu.children.map(convertMenu) : []
      }
    }
    // 转换菜单数据格式
    menus.value = response.data.map(convertMenu)
    
    // 检查是否已包含首页菜单，如果没有则添加到菜单列表的最前面
    const hasHomeMenu = menus.value.some(menu => menu.path === '/home' || menu.index === 'home')
    if (!hasHomeMenu) {
      menus.value.unshift({
        index: 'home',
        title: '首页',
        icon: 'Document',
        path: '/home'
      })
    }
  } catch (error) {
    ElMessage.error('获取菜单列表失败：' + error.message)
    // 如果API调用失败，使用备用的模拟数据
    menus.value = [
      {
        index: 'home',
        title: '首页',
        icon: 'Document',
        path: '/home'
      },
      {
        index: 'archive-management',
        title: '档案管理',
        icon: 'Document',
        children: [
          {
            index: 'collection',
            title: '档案采集',
            icon: 'Collection',
            path: '/collection'
          },
          {
            index: 'archive-query',
            title: '档案查询',
            icon: 'Document',
            path: '/archive-query'
          }
        ]
      },
      {
        index: 'hang-on',
        title: '挂接管理',
        icon: 'Link',
        children: [
          {
            index: 'hang-on-main',
            title: '挂接管理',
            path: '/hang-on'
          },
          {
            index: 'combination-hang-on',
            title: '档案组合挂接',
            path: '/combination-hang-on'
          }
        ]
      },
      {
        index: 'process-management',
        title: '流程管理',
        icon: 'Check',
        children: [
          {
            index: 'validation',
            title: '校验管理',
            icon: 'Check',
            path: '/validation'
          },
          {
            index: 'approval',
            title: '操作审批',
            icon: 'Lock',
            path: '/approval'
          }
        ]
      },
      {
        index: 'monitoring-audit',
        title: '监控审计',
        icon: 'View',
        children: [
          {
            index: 'log',
            title: '日志管理',
            icon: 'View',
            path: '/log'
          },
          {
            index: 'api-monitor',
            title: '接口监控',
            icon: 'View',
            path: '/api-monitor'
          },
          {
            index: 'audit-report',
            title: '审计报表',
            icon: 'Document',
            path: '/audit-report'
          }
        ]
      },
      {
        index: 'notification',
        title: '通知提醒',
        icon: 'Link',
        path: '/notification'
      },
      {
        index: 'relation-visualization',
        title: '关联关系可视化',
        icon: 'Document',
        path: '/relation-visualization'
      },
      {
        index: 'system',
        title: '系统管理',
        icon: 'Setting',
        children: [
          {
            index: 'system-interface',
            title: '接口配置',
            path: '/system'
          },
          {
            index: 'user-management',
            title: '用户管理',
            path: '/user-management'
          },
          {
            index: 'role-management',
            title: '角色管理',
            path: '/role-management'
          }
        ]
      }
    ]
  }
}

// 设置激活菜单
const setActiveMenu = () => {
  const currentPath = router.currentRoute.value.path
  let matchedMenu = null
  
  // 遍历菜单查找匹配的路径
  const findMatchingMenu = (menuList) => {
    for (const menu of menuList) {
      if (currentPath.includes(menu.path)) {
        matchedMenu = menu
        return
      }
      if (menu.children && menu.children.length > 0) {
        findMatchingMenu(menu.children)
        if (matchedMenu) return
      }
    }
  }
  
  findMatchingMenu(menus.value)
  if (matchedMenu) {
    activeMenu.value = matchedMenu.index
  }
}

// 菜单选择事件
const handleMenuSelect = (key, keyPath) => {
  activeMenu.value = key
  
  // 根据key查找对应的菜单
  const findMenuByKey = (menuList, key) => {
    for (const menu of menuList) {
      if (menu.index === key) {
        return menu
      }
      if (menu.children && menu.children.length > 0) {
        const found = findMenuByKey(menu.children, key)
        if (found) return found
      }
    }
    return null
  }
  
  const menu = findMenuByKey(menus.value, key)
  if (menu && menu.path) {
    router.push(menu.path)
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await logoutApi()
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    isLoggedIn.value = false
    menus.value = []
    userInfo.value = {}
    // 跳转到登录页
    router.push('/login')
    ElMessage.success('退出登录成功')
  } catch (error) {
    ElMessage.error('退出登录失败：' + error.message)
  }
}

// 显示修改密码对话框
const showChangePasswordDialog = () => {
  changePasswordForm.oldPassword = ''
  changePasswordForm.newPassword = ''
  changePasswordForm.confirmPassword = ''
  changePasswordDialogVisible.value = true
}

// 处理修改密码
const handleChangePassword = async () => {
  if (!changePasswordFormRef.value) return
  
  await changePasswordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updatePasswordApi(changePasswordForm.oldPassword, changePasswordForm.newPassword)
        ElMessage.success('修改密码成功')
        changePasswordDialogVisible.value = false
      } catch (error) {
        ElMessage.error('修改密码失败：' + error.message)
      }
    }
  })
}
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  margin: 0;
  padding: 0;
}

.el-container {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* 顶部栏样式 */
.el-header {
  display: flex;
  align-items: center;
  background-color: #1e293b;
  color: #f8fafc;
  height: 64px !important;
  padding: 0 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 0;
  margin: 0;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
  color: #f8fafc;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #f8fafc;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  color: #f8fafc;
}

.user-name:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 侧边栏样式 */
.el-aside {
  width: 240px !important;
  background-color: #0f172a;
  box-shadow: none;
  border-radius: 0;
  margin: 0;
  padding: 0;
}

/* 菜单样式 */
.el-menu-vertical-demo {
  height: 100%;
  border-right: none;
  background-color: transparent;
  color: #94a3b8;
  border-radius: 0;
}

/* 菜单整体样式 */
.el-menu {
  background-color: transparent !important;
  border-right: none;
  border-radius: 0;
}

/* 菜单项目基础样式 */
.el-menu-item, .el-sub-menu__title {
  color: #94a3b8 !important;
  background-color: transparent !important;
  border-right: none;
  transition: all 0.3s ease;
  height: 60px;
  line-height: 60px;
  border-left: 4px solid transparent;
}

/* 菜单项目悬停样式 */
.el-menu-item:hover, .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: #cbd5e1 !important;
  border-left-color: transparent;
}

/* 菜单项目激活样式 */
.el-menu-item.is-active {
  background-color: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
  border-left: 4px solid #3b82f6;
}

/* 子菜单展开样式 */
.el-sub-menu.is-opened > .el-sub-menu__title {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: #cbd5e1 !important;
}

/* 子菜单内容样式 */
.el-sub-menu .el-menu {
  background-color: transparent !important;
}

/* 子菜单项目样式 */
.el-sub-menu .el-menu-item {
  background-color: transparent !important;
  color: #94a3b8 !important;
  padding-left: 50px !important;
}

/* 子菜单项目悬停样式 */
.el-sub-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  color: #cbd5e1 !important;
}

/* 子菜单项目激活样式 */
.el-sub-menu .el-menu-item.is-active {
  background-color: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
  border-left: 4px solid #3b82f6;
}

/* 确保父菜单始终显示正确颜色 */
.el-sub-menu__title {
  color: #94a3b8 !important;
}

/* 主内容区域样式 */
.el-main {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>

<style>
/* 统一设置下拉框宽度与输入框一致 */
.el-form-item .el-select {
  width: 100%;
}

/* 针对内联表单的特殊处理，确保下拉框和输入框宽度一致 */
.el-form--inline .el-form-item .el-select {
  width: 200px; /* 设置一个合适的固定宽度 */
}

/* 隐藏右上角的开关按钮 */
body > .el-switch {
  display: none !important;
}

/* 针对Element Plus主题切换开关的隐藏 */
.el-theme-toggle {
  display: none !important;
}
</style>