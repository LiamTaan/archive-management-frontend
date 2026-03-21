<template>
  <div class="notification-view">
    <el-card class="notification-card">
      <template #header>
        <div class="card-header">
          <span>通知列表</span>
          <el-button type="primary" size="small" @click="refreshNotifications">刷新通知</el-button>
        </div>
      </template>
      
      <div class="notification-content">
        <!-- 通知类型筛选 -->
        <div class="filter-bar">
          <el-radio-group v-model="activeFilter" size="small">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="unread">未读</el-radio-button>
            <el-radio-button value="read">已读</el-radio-button>
            <el-radio-button value="system">系统通知</el-radio-button>
            <el-radio-button value="business">业务通知</el-radio-button>
          </el-radio-group>
          <div class="batch-buttons">
            <el-button type="danger" size="small" @click="batchDelete" :disabled="selectedNotifications.length === 0">批量删除</el-button>
            <el-button type="success" size="small" @click="batchMarkAsRead" :disabled="selectedNotifications.length === 0">批量已读</el-button>
          </div>
        </div>
        
        <!-- 通知列表 -->
        <el-table 
          :data="notifications" 
          style="width: 100%" 
          border
          @selection-change="handleSelectionChange"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="通知ID" width="100"></el-table-column>
          <el-table-column prop="title" label="通知标题" min-width="200">
            <template #default="scope">
              <span :class="{ 'unread-title': !scope.row.isRead }">
                {{ scope.row.title }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="通知内容" min-width="300">
            <template #default="scope">
              <el-tooltip :content="scope.row.content" placement="top">
                <span class="content-text">{{ scope.row.content }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="通知类型" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'system' ? 'info' : 'success'">
                {{ scope.row.type === 'system' ? '系统通知' : '业务通知' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isRead" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.isRead ? 'success' : 'warning'">
                {{ scope.row.isRead ? '已读' : '未读' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
          <el-table-column prop="readTime" label="阅读时间" width="180"></el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="scope">
              <div style="display: flex; gap: 8px;">
                <el-button type="primary" size="small" @click="viewNotification(scope.row)">查看</el-button>
                <el-button v-if="!scope.row.isRead" type="success" size="small" @click="markAsRead(scope.row)">标记已读</el-button>
                <el-button type="danger" size="small" @click="deleteNotification(scope.row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            v-model:current-page="page"
            @update:current-page="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </el-card>
    
    <!-- 通知详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentNotification.title"
      width="60%"
      :close-on-click-modal="false"
    >
      <div class="detail-content">
        <div class="notification-meta">
          <span class="meta-item">
            <el-tag :type="currentNotification.type === 'system' ? 'info' : 'success'">
              {{ currentNotification.type === 'system' ? '系统通知' : '业务通知' }}
            </el-tag>
          </span>
          <span class="meta-item">
            创建时间：{{ currentNotification.createTime }}
          </span>
          <span class="meta-item" v-if="currentNotification.readTime">
            阅读时间：{{ currentNotification.readTime }}
          </span>
        </div>
        <div class="notification-body">
          {{ currentNotification.content }}
        </div>
        <div class="notification-actions" v-if="currentNotification.actionUrl">
          <el-button type="primary" @click="handleNotificationAction">
            处理
          </el-button>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  getNotifications,
  markNotificationAsRead,
  batchMarkAsRead as batchMarkAsReadApi,
  deleteNotification as deleteNotificationApi,
  batchDeleteNotifications
} from '../api/notification'

// 数据定义
const router = useRouter()
const activeFilter = ref('all')
const notifications = ref([])
const selectedNotifications = ref([])
const detailDialogVisible = ref(false)
const currentNotification = ref({})
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取通知列表
const fetchNotifications = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      type: activeFilter.value === 'all' ? '' : activeFilter.value,
      isRead: activeFilter.value === 'unread' ? 0 : activeFilter.value === 'read' ? 1 : ''
    }
    const response = await getNotifications(params)
    notifications.value = response.data.list
    total.value = Number(response.data.total) || 0
  } catch (error) {
    console.error('获取通知列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化数据
const initData = () => {
  fetchNotifications()
}

// 筛选通知
const filteredNotifications = computed(() => {
  let result = [...notifications.value]
  
  // 根据筛选条件过滤
  if (activeFilter.value === 'unread') {
    result = result.filter(item => !item.isRead)
  } else if (activeFilter.value === 'read') {
    result = result.filter(item => item.isRead)
  } else if (activeFilter.value === 'system') {
    result = result.filter(item => item.type === 'system')
  } else if (activeFilter.value === 'business') {
    result = result.filter(item => item.type === 'business')
  }
  
  return result
})

// 刷新通知
const refreshNotifications = () => {
  fetchNotifications()
  ElMessage.success('通知刷新成功')
}

// 批量删除
const batchDelete = () => {
  ElMessageBox.confirm('确定要删除选中的通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedNotifications.value.map(item => item.id)
      await batchDeleteNotifications(ids)
      ElMessage.success('批量删除成功')
      selectedNotifications.value = []
      fetchNotifications()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 批量标记已读
const batchMarkAsRead = () => {
  ElMessageBox.confirm('确定要将选中的通知标记为已读吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedNotifications.value.map(item => item.id)
      await batchMarkAsReadApi(ids)
      ElMessage.success('批量标记已读成功')
      selectedNotifications.value = []
      fetchNotifications()
    } catch (error) {
      console.error('批量标记已读失败:', error)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedNotifications.value = selection
}

// 分页
const handleCurrentChange = (currentPage) => {
  page.value = currentPage
  fetchNotifications()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  page.value = 1
  fetchNotifications()
}

// 查看通知
const viewNotification = (row) => {
  currentNotification.value = row
  detailDialogVisible.value = true
  // 如果是未读通知，自动标记为已读
  if (!row.isRead) {
    markAsRead(row)
  }
}

// 标记已读
const markAsRead = async (row) => {
  try {
    await markNotificationAsRead(row.id)
    ElMessage.success('标记已读成功')
    row.isRead = true
    row.readTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 删除通知
const deleteNotification = (row) => {
  ElMessageBox.confirm('确定要删除该通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteNotificationApi(row.id)
      ElMessage.success('删除成功')
      fetchNotifications()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 处理通知操作
const handleNotificationAction = () => {
  if (currentNotification.value.actionUrl) {
    ElMessage.success(`跳转到：${currentNotification.value.actionUrl}`)
    // 执行路由跳转
    router.push(currentNotification.value.actionUrl)
    // 关闭对话框
    detailDialogVisible.value = false
  }
}

// 筛选条件变化
const handleFilterChange = () => {
  page.value = 1
  fetchNotifications()
}

// 监听筛选条件变化
watch(activeFilter, handleFilterChange)

// 初始化数据
onMounted(() => {
  initData()
})</script>

<style scoped>
.notification-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-content {
  padding: 20px 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.batch-buttons {
  display: flex;
  gap: 16px;
}

.unread-title {
  font-weight: bold;
  color: #303133;
}

.content-text {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.detail-content {
  padding: 10px 0;
}

.notification-meta {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.meta-item {
  margin-right: 20px;
  font-size: 14px;
  color: #606266;
}

.notification-body {
  margin-bottom: 20px;
  line-height: 1.8;
  color: #303133;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
}
</style>