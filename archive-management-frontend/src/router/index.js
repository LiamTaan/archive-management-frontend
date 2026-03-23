import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    // 路由懒加载
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN', 'ARCHIVE_ADMIN', 'DEPT_LEADER', 'ARCHIVE_OPER'] }
  },
  {
    path: '/login',
    name: 'Login',
    // 路由懒加载
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/collection',
    name: 'Collection',
    // 路由懒加载
    component: () => import('../views/CollectionView.vue'),
    meta: { requiresAuth: true, permissions: ['ARCHIVE_OPER'] }
  },
  {
    path: '/hang-on',
    name: 'HangOn',
    // 路由懒加载
    component: () => import('../views/HangOnView.vue'),
    meta: { requiresAuth: true, permissions: ['ARCHIVE_OPER'] }
  },
  {
    path: '/validation',
    name: 'Validation',
    // 路由懒加载
    component: () => import('../views/ValidationView.vue'),
    meta: { requiresAuth: true, permissions: ['ARCHIVE_ADMIN'] }
  },
  {
    path: '/log',
    name: 'Log',
    // 路由懒加载
    component: () => import('../views/LogView.vue'),
    meta: { requiresAuth: true, permissions: ['ARCHIVE_ADMIN', 'SUPER_ADMIN'] }
  },
  {
    path: '/system',
    name: 'System',
    // 路由懒加载
    component: () => import('../views/SystemView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN'] }
  },
  {
    path: '/archive-query',
    name: 'ArchiveQuery',
    // 路由懒加载
    component: () => import('../views/ArchiveQueryView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN', 'ARCHIVE_ADMIN', 'DEPT_LEADER', 'ARCHIVE_OPER'] }
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    // 路由懒加载
    component: () => import('../views/UserManagementView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN'] }
  },
  {
    path: '/role-management',
    name: 'RoleManagement',
    // 路由懒加载
    component: () => import('../views/RoleManagementView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN'] }
  },
  {
    path: '/menu-management',
    name: 'MenuManagement',
    // 路由懒加载
    component: () => import('../views/MenuManagementView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN'] }
  },
  {
    path: '/relation-visualization',
    name: 'RelationVisualization',
    // 路由懒加载
    component: () => import('../views/RelationVisualizationView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN', 'ARCHIVE_ADMIN'] }
  },

  {
    path: '/api-monitor',
    name: 'ApiMonitor',
    // 路由懒加载
    component: () => import('../views/ApiMonitorView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN'] }
  },
  {
    path: '/combination-hang-on',
    name: 'CombinationHangOn',
    // 路由懒加载
    component: () => import('../views/CombinationHangOnView.vue'),
    meta: { requiresAuth: true, permissions: ['ARCHIVE_OPER'] }
  },
  {
    path: '/audit-report',
    name: 'AuditReport',
    // 路由懒加载
    component: () => import('../views/AuditReportView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN'] }
  },
  {
    path: '/notification',
    name: 'Notification',
    // 路由懒加载
    component: () => import('../views/NotificationView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN', 'ARCHIVE_ADMIN', 'DEPT_LEADER', 'ARCHIVE_OPER'] }
  },
  // PDF预览页面
  {
    path: '/pdf-preview',
    name: 'PdfPreview',
    // 路由懒加载
    component: () => import('../views/PdfPreviewView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN', 'ARCHIVE_ADMIN', 'DEPT_LEADER', 'ARCHIVE_OPER'] }
  },
  // 视频预览页面
  {
    path: '/video-preview',
    name: 'VideoPreview',
    // 路由懒加载
    component: () => import('../views/VideoPreviewView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN', 'ARCHIVE_ADMIN', 'DEPT_LEADER', 'ARCHIVE_OPER'] }
  },

  // 部门管理页面
  {
    path: '/dept-management',
    name: 'DeptManagement',
    // 路由懒加载
    component: () => import('../views/DeptManagementView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN'] }
  },
  // 审批管理路由
  {
    path: '/approval',
    name: 'ApprovalList',
    // 路由懒加载
    component: () => import('../views/ApprovalListView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN', 'ARCHIVE_ADMIN', 'DEPT_LEADER', 'ARCHIVE_OPER'] }
  },
  {
    path: '/approval/:id',
    name: 'ApprovalDetail',
    // 路由懒加载
    component: () => import('../views/ApprovalDetailView.vue'),
    meta: { requiresAuth: true, permissions: ['SUPER_ADMIN', 'ARCHIVE_ADMIN', 'DEPT_LEADER', 'ARCHIVE_OPER'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.path === '/login' ? '登录 - 电子档案管理系统' : '电子档案管理系统'
  
  // 只有登录页不需要认证，其他所有页面都需要认证
  if (to.path === '/login') {
    // 登录页，直接访问
    next()
  } else {
    // 其他页面都需要认证，检查用户是否已登录
    const token = localStorage.getItem('token')
    if (token) {
      // 已登录，检查是否需要权限验证
      if (to.meta.requiresAuth && to.meta.permissions) {
        // 获取当前用户信息
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr)
          // 检查用户是否有权限访问该路由
          const hasPermission = checkPermission(to.meta.permissions, userInfo.roles)
          if (hasPermission) {
            // 有权限，继续访问
            next()
          } else {
            // 无权限，跳转到首页或显示无权限提示
            ElMessage.warning('您没有权限访问该页面')
            next('/home')
          }
        } else {
          // 用户信息不存在，重新登录
          next('/login')
        }
      } else {
        // 不需要权限验证或没有配置权限，继续访问
        next()
      }
    } else {
      // 未登录，跳转到登录页
      next('/login')
    }
  }
})

// 权限检查函数
function checkPermission(requiredPermissions, userRoles) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    // 不需要权限
    return true
  }
  
  if (!userRoles || userRoles.length === 0) {
    // 用户没有角色
    return false
  }
  
  // 检查用户角色是否包含所需权限
  return requiredPermissions.some(permission => userRoles.includes(permission))
}

export default router