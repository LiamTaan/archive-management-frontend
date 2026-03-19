<template>
  <div class="home-container">
    <div class="home-content">
      <h1>欢迎使用电子档案管理系统</h1>
      <p>这是系统的首页，您可以通过左侧菜单访问各个功能模块</p>
      
      <div class="stats-card">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-item">
              <div class="stat-content">
                <h3>档案总数</h3>
                <div class="stat-number">{{ formatNumber(stats.archiveCount || 0) }}</div>
                <div class="stat-desc">份电子档案</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-item">
              <div class="stat-content">
                <h3>挂接数量</h3>
                <div class="stat-number">{{ formatNumber(stats.hangOnCount || 0) }}</div>
                <div class="stat-desc">次挂接操作</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-item">
              <div class="stat-content">
                <h3>审批流程</h3>
                <div class="stat-number">{{ formatNumber(stats.pendingApprovals || 0) }}</div>
                <div class="stat-desc">个待处理审批</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-item">
              <div class="stat-content">
                <h3>系统用户</h3>
                <div class="stat-number">{{ formatNumber(stats.userCount || 0) }}</div>
                <div class="stat-desc">位活跃用户</div>
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
                <el-row :gutter="20">
                  <el-col :span="4" v-for="(operation, index) in quickOperations" :key="index">
                    <div class="operation-item" @click="handleQuickOperation(operation)">
                      <el-icon :size="32" class="operation-icon">
                        <component :is="operation.icon" />
                      </el-icon>
                      <div class="operation-text">{{ operation.text }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
        </el-card>
      </div>
      
      <div class="bottom-section">
        <el-row :gutter="20">
          <!-- 待办事项 -->
          <el-col :span="12">
            <el-card shadow="hover" class="todo-card">
              <template #header>
                <div class="card-header">
                  <span>待办事项</span>
                  <el-button link size="small" @click="viewAllTodos">查看全部</el-button>
                </div>
              </template>
              <div class="todo-content">
                <el-empty v-if="todos.length === 0" description="暂无待办事项" />
                <div v-else class="todo-list">
                  <div v-for="(todo, index) in todos" :key="index" class="todo-item">
                    <el-badge
                      :value="todo.badge"
                      :type="todo.type || 'primary'"
                      class="todo-badge"
                    />
                    <div class="todo-title">{{ todo.title }}</div>
                    <div class="todo-desc">{{ todo.desc }}</div>
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="handleTodoClick(todo)"
                      :disabled="todo.disabled"
                    >
                      {{ todo.actionText || '处理' }}
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <!-- 最近活动 -->
          <el-col :span="12">
            <el-card shadow="hover" class="activity-card">
              <template #header>
                <div class="card-header">
                  <span>最近活动</span>
                  <el-button link size="small" @click="viewAllActivities">查看全部</el-button>
                </div>
              </template>
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in recentActivities"
                  :key="index"
                  :timestamp="activity.time"
                >
                  {{ activity.content }}
                </el-timeline-item>
                <el-timeline-item v-if="recentActivities.length === 0">
                  暂无活动记录
                </el-timeline-item>
              </el-timeline>
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
  Message, Key, Lock, Setting, Refresh, ArrowRight, User
} from '@element-plus/icons-vue'
import { getHomeStatsApi, getRecentActivitiesApi, getTodosApi } from '../api/home'

// 路由
const router = useRouter()

// 统计数据
const stats = ref({
  archiveCount: 0,
  hangOnCount: 0,
  pendingApprovals: 0,
  userCount: 0
})

// 最近活动数据
const recentActivities = ref([])

// 快捷操作数据
const quickOperations = ref([
  { text: '档案上传', icon: markRaw(Upload), route: '/collection' },
  { text: '档案查询', icon: markRaw(Search), route: '/archive-query' },
  { text: '手动挂接', icon: markRaw(SetUp), route: '/hang-on' },
  { text: '审批流程', icon: markRaw(Message), route: '/approval' },
  { text: '角色管理', icon: markRaw(Key), route: '/role-management' },
  { text: '用户管理', icon: markRaw(User), route: '/user-management' },
  { text: '系统设置', icon: markRaw(Setting), route: '/system' },
  { text: '日志查看', icon: markRaw(Calendar), route: '/log' }
])

// 待办事项数据
const todos = ref([])

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

// 处理待办事项点击
const handleTodoClick = (todo) => {
  if (todo.route) {
    router.push(todo.route)
  } else if (todo.action) {
    todo.action()
  }
  ElMessage.success(`处理${todo.title}待办事项`)
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

// 获取待办事项
const getTodos = async () => {
  try {
    const response = await getTodosApi()
    todos.value = response.data || []
  } catch (error) {
    ElMessage.error('获取待办事项失败：' + error.message)
  }
}

// 获取最近活动
const getRecentActivities = async () => {
  try {
    const response = await getRecentActivitiesApi()
    recentActivities.value = response.data || []
  } catch (error) {
    ElMessage.error('获取最近活动失败：' + error.message)
  }
}

// 查看全部待办事项
const viewAllTodos = () => {
  router.push('/approval/my/pending')
}

// 查看全部最近活动
const viewAllActivities = () => {
  router.push('/log')
}

// 页面加载时获取数据
onMounted(() => {
  getStats()
  getTodos()
  getRecentActivities()
  ElMessage.success('欢迎回到电子档案管理系统')
})
</script>

<style scoped>
.home-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.home-content {
  max-width: 1200px;
  margin: 0 auto;
}

.home-content h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.home-content p {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.stats-card {
  margin-bottom: 30px;
}

.stat-item {
  text-align: center;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-content h3 {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-desc {
  font-size: 14px;
  color: #999;
}

/* 快捷操作样式 */
.quick-operations {
  margin-bottom: 30px;
}

.operation-card {
  transition: all 0.3s ease;
}

.operation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.operation-content {
  padding: 20px 0;
}

.operation-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: #f0f2f5;
  height: 120px;
}

.operation-item:hover {
  background-color: #e6f7ff;
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.operation-icon {
  color: #409eff;
  margin-bottom: 10px;
}

.operation-text {
  font-size: 14px;
  color: #333;
}

/* 底部区域样式 */
.bottom-section {
  margin-top: 30px;
}

/* 待办事项样式 */
.todo-card {
  height: 100%;
  transition: all 0.3s ease;
}

.todo-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.todo-content {
  padding: 10px 0;
}

.todo-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-badge {
  margin-right: 8px;
}

.todo-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
}

.todo-desc {
  font-size: 14px;
  color: #666;
  margin-left: 24px;
  margin-bottom: 8px;
}

/* 最近活动样式 */
.activity-card {
  height: 100%;
  transition: all 0.3s ease;
}

.activity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>