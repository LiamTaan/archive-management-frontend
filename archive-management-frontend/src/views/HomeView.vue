<template>
  <div class="home-container">
    <div class="home-content">
      <!-- 头部欢迎区域 -->
      <div class="welcome-section">
        <h1>欢迎使用电子档案管理系统</h1>
        <p>这是系统的首页，您可以通过左侧菜单访问各个功能模块</p>
      </div>
      
      <!-- 统计卡片区域 -->
      <div class="stats-card">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-item">
              <div class="stat-content">
                <el-icon :size="24" class="stat-icon"><Document /></el-icon>
                <h3>档案总数</h3>
                <div class="stat-number">{{ formatNumber(stats.archiveCount || 0) }}</div>
                <div class="stat-desc">份电子档案</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-item">
              <div class="stat-content">
                <el-icon :size="24" class="stat-icon"><Link /></el-icon>
                <h3>挂接数量</h3>
                <div class="stat-number">{{ formatNumber(stats.hangOnCount || 0) }}</div>
                <div class="stat-desc">次挂接操作</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-item">
              <div class="stat-content">
                <el-icon :size="24" class="stat-icon"><User /></el-icon>
                <h3>系统用户</h3>
                <div class="stat-number">{{ formatNumber(stats.userCount || 0) }}</div>
                <div class="stat-desc">位活跃用户</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-item">
              <div class="stat-content">
                <el-icon :size="24" class="stat-icon"><Bell /></el-icon>
                <h3>待办事项</h3>
                <div class="stat-number">{{ todos.length || 0 }}</div>
                <div class="stat-desc">项待处理</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 快捷操作区域 -->
      <div class="quick-operations">
        <el-card shadow="hover" class="operation-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="operation-content">
                <el-row :gutter="24">
                  <el-col :span="4" v-for="(operation, index) in quickOperations" :key="index">
                    <div class="operation-item" @click="handleQuickOperation(operation)">
                      <el-icon :size="36" class="operation-icon">
                        <component :is="operation.icon" />
                      </el-icon>
                      <div class="operation-text">{{ operation.text }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
        </el-card>
      </div>
      
      <!-- 底部信息区域 -->
      <div class="bottom-section">
        <el-row :gutter="24">
          <!-- 通知列表 -->
          <el-col :span="12">
            <el-card shadow="hover" class="info-card">
              <template #header>
                <div class="card-header">
                  <span>系统通知</span>
                  <el-button link size="small" @click="viewAllNotifications">查看全部</el-button>
                </div>
              </template>
              <div class="notification-list">
                <div v-if="notifications.length === 0" class="empty-content">
                  <el-icon :size="48" class="empty-icon"><Message /></el-icon>
                  <p>暂无通知</p>
                </div>
                <el-timeline v-else>
                  <el-timeline-item
                    v-for="notification in notifications"
                    :key="notification.id"
                    :timestamp="notification.createTime"
                    :type="notification.isRead ? 'primary' : 'success'"
                  >
                    <div class="notification-item" @click="markAsRead(notification)">
                      <div class="notification-title" :class="{ 'read': notification.isRead }">
                        {{ notification.title }}
                      </div>
                      <div class="notification-content">{{ notification.content }}</div>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-card>
          </el-col>
          
          <!-- 待审核数据 -->
          <el-col :span="12">
            <el-card shadow="hover" class="info-card">
              <template #header>
                <div class="card-header">
                  <span>待审核数据</span>
                  <el-button link size="small" @click="viewAllTodos">查看全部</el-button>
                </div>
              </template>
              <div class="todo-list">
                <div v-if="todos.length === 0" class="empty-content">
                  <el-icon :size="48" class="empty-icon"><List /></el-icon>
                  <p>暂无待审核事项</p>
                </div>
                <div v-else>
                  <div 
                    v-for="todo in todos" 
                    :key="todo.id" 
                    class="todo-item"
                    @click="handleTodo(todo)"
                  >
                    <div class="todo-header">
                      <el-badge 
                        :type="todo.status === 'pending' ? 'warning' : 'info'"
                        class="todo-badge"
                        :value="todo.status === 'pending' ? '待审核' : '审核中'"
                        :text="todo.status === 'pending' ? '待审核' : '审核中'"
                      />
                      <span class="todo-title">{{ todo.title }}</span>
                    </div>
                    <div class="todo-desc">{{ todo.description }}</div>
                    <div class="todo-meta">
                      <span class="todo-time">{{ todo.createTime }}</span>
                      <el-button size="small" type="primary" link @click.stop="handleTodo(todo)">
                        处理
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  Upload, Download, Document, SetUp, Search, Calendar,
  Message, Key, Lock, Setting, Refresh, ArrowRight, User,
  Bell, List, Link
} from '@element-plus/icons-vue'
import { getHomeStatsApi, getTodosApi } from '../api/home'
import { getNotifications } from '../api/notification'

// 路由
const router = useRouter()

// 统计数据
const stats = ref({
  archiveCount: 0,
  hangOnCount: 0,
  userCount: 0
})

// 通知数据
const notifications = ref([])

// 待审核数据
const todos = ref([])

// 快捷操作数据
const quickOperations = ref([
  { text: '档案上传', icon: markRaw(Upload), route: '/collection' },
  { text: '档案查询', icon: markRaw(Search), route: '/archive-query' },
  { text: '手动挂接', icon: markRaw(SetUp), route: '/hang-on' },
  { text: '角色管理', icon: markRaw(Key), route: '/role-management' },
  { text: '用户管理', icon: markRaw(User), route: '/user-management' },
  { text: '系统设置', icon: markRaw(Setting), route: '/system' },
  { text: '日志查看', icon: markRaw(Calendar), route: '/log' }
])

// 格式化数字，添加千分位分隔符
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 处理快捷操作点击
const handleQuickOperation = (operation) => {
  if (operation.route) {
    router.push(operation.route)
  } else if (operation.action) {
    operation.action()
  }
  ElMessage.success(`执行${operation.text}操作`)
}

// 获取首页统计数据
const getStats = async () => {
  try {
    const response = await getHomeStatsApi()
    stats.value = response.data || {}
  } catch (error) {
    ElMessage.error('获取统计数据失败：' + error.message)
  }
}

// 获取通知列表
const getNotificationsList = async () => {
  try {
    // 从localStorage获取当前登录用户信息
    const userInfoStr = localStorage.getItem('userInfo')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : { username: 'admin' }
    
    const response = await getNotifications({
      status: 0,
      limit: 5,
      sortBy: 'createTime',
      sortOrder: 'desc'
    })
    notifications.value = response.data || []
  } catch (error) {
    ElMessage.error('获取通知失败：' + error.message)
  }
}

// 获取待审核数据
const getTodosList = async () => {
  try {
    const response = await getTodosApi()
    todos.value = response.data || []
  } catch (error) {
    ElMessage.error('获取待审核数据失败：' + error.message)
  }
}

// 标记通知为已读
const markAsRead = async (notification) => {
  try {
    // 这里应该调用标记已读的API
    // await markNotificationAsRead(notification.id)
    notification.isRead = true
    ElMessage.success('通知已标记为已读')
  } catch (error) {
    ElMessage.error('标记失败：' + error.message)
  }
}

// 处理待审核事项
const handleTodo = (todo) => {
  // 根据待办事项类型跳转到相应页面
  if (todo.type === 'approval') {
    router.push(`/approval/detail/${todo.businessId}`)
  } else if (todo.type === 'validation') {
    router.push('/validation')
  }
  ElMessage.success(`处理待办：${todo.title}`)
}

// 查看全部通知
const viewAllNotifications = () => {
  router.push('/notification')
}

// 查看全部待审核数据
const viewAllTodos = () => {
  router.push('/approval')
}

// 页面加载时获取数据
onMounted(() => {
  getStats()
  getNotificationsList()
  getTodosList()
  ElMessage.success('欢迎回到电子档案管理系统')
})
</script>

<style scoped>
.home-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.home-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 32px;
  padding: 24px 0;
}

.welcome-section h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.welcome-section p {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

/* 统计卡片区域 */
.stats-card {
  margin-bottom: 32px;
}

.stat-item {
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
}

.stat-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.stat-content {
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
}

.stat-icon {
  color: #409eff;
  margin-bottom: 16px;
  opacity: 0.8;
}

.stat-content h3 {
  font-size: 16px;
  font-weight: 500;
  color: #666;
  margin-bottom: 12px;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
  line-height: 1.2;
}

.stat-desc {
  font-size: 14px;
  color: #999;
  font-weight: 400;
}

/* 快捷操作区域 */
.quick-operations {
  margin-bottom: 32px;
}

.operation-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
}

.operation-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.operation-card :deep(.el-card__header) {
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.operation-content {
  padding: 32px 0;
}

.operation-content :deep(.el-row) {
  gap: 24px 0;
}

.operation-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  height: 140px;
  border: 1px solid transparent;
}

.operation-item:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.2);
  border-color: #91d5ff;
}

.operation-icon {
  color: #409eff;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.operation-item:hover .operation-icon {
  transform: scale(1.1);
}

.operation-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
}

.operation-item:hover .operation-text {
  color: #409eff;
}

/* 底部信息区域 */
.bottom-section {
  margin-top: 32px;
}

.info-card {
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
}

.info-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.info-card :deep(.el-card__header) {
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 通知列表样式 */
.notification-list {
  padding: 16px 0;
}

.notification-item {
  cursor: pointer;
  padding: 8px 0;
  transition: all 0.3s ease;
}

.notification-item:hover {
  color: #409eff;
}

.notification-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.notification-title.read {
  font-weight: normal;
  color: #999;
}

.notification-content {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* 待审核数据样式 */
.todo-list {
  padding: 16px 0;
}

.todo-item {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.todo-item:hover {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.todo-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.todo-badge {
  margin-right: 8px;
}

.todo-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.todo-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.todo-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.todo-time {
  font-family: monospace;
}

/* 空内容样式 */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 时间线样式 */
.info-card :deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #999;
  font-family: monospace;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .home-content {
    max-width: 100%;
  }
  
  .stat-number {
    font-size: 30px;
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 16px;
  }
  
  .welcome-section h1 {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 28px;
  }
  
  .operation-item {
    height: 120px;
  }
  
  .operation-icon {
    font-size: 28px;
  }
}
</style>