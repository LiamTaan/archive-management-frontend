import { createRouter, createWebHistory } from 'vue-router'

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
    meta: { requiresAuth: true }
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
    meta: { requiresAuth: true }
  },
  {
    path: '/hang-on',
    name: 'HangOn',
    // 路由懒加载
    component: () => import('../views/HangOnView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/validation',
    name: 'Validation',
    // 路由懒加载
    component: () => import('../views/ValidationView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/log',
    name: 'Log',
    // 路由懒加载
    component: () => import('../views/LogView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/system',
    name: 'System',
    // 路由懒加载
    component: () => import('../views/SystemView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/archive-query',
    name: 'ArchiveQuery',
    // 路由懒加载
    component: () => import('../views/ArchiveQueryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    // 路由懒加载
    component: () => import('../views/UserManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/role-management',
    name: 'RoleManagement',
    // 路由懒加载
    component: () => import('../views/RoleManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/menu-management',
    name: 'MenuManagement',
    // 路由懒加载
    component: () => import('../views/MenuManagementView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/relation-visualization',
    name: 'RelationVisualization',
    // 路由懒加载
    component: () => import('../views/RelationVisualizationView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/approval',
    name: 'Approval',
    // 路由懒加载
    component: () => import('../views/ApprovalView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/api-monitor',
    name: 'ApiMonitor',
    // 路由懒加载
    component: () => import('../views/ApiMonitorView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/combination-hang-on',
    name: 'CombinationHangOn',
    // 路由懒加载
    component: () => import('../views/CombinationHangOnView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/audit-report',
    name: 'AuditReport',
    // 路由懒加载
    component: () => import('../views/AuditReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notification',
    name: 'Notification',
    // 路由懒加载
    component: () => import('../views/NotificationView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.meta.requiresAuth !== false) {
    // 需要认证，检查用户是否已登录
    const token = localStorage.getItem('token')
    if (token) {
      // 已登录，继续访问
      next()
    } else {
      // 未登录，跳转到登录页
      next('/login')
    }
  } else {
    // 不需要认证，直接访问
    next()
  }
})

export default router