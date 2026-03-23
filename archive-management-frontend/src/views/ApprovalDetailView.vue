<template>
  <div class="approval-detail-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>审批详情</span>
          <el-button type="primary" size="small" @click="handleBack">返回列表</el-button>
        </div>
      </template>

      <!-- 审批基本信息 -->
      <div class="info-section">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="申请ID">{{ formatValue(approvalDetail.applyId) }}</el-descriptions-item>
          <el-descriptions-item label="档案ID">{{ formatValue(approvalDetail.archiveId) }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ formatValue(approvalDetail.applyBy) }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDateTime(approvalDetail.applyTime) }}</el-descriptions-item>
          <el-descriptions-item label="审批状态">
            <el-tag :type="getStatusTagType(approvalDetail.applyStatus)">
              {{ getStatusText(approvalDetail.applyStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前环节">{{ formatValue(getCurrentNodeName()) }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 档案信息 -->
      <div class="info-section" v-if="archiveInfo">
        <el-descriptions title="档案信息" :column="3" border>
          <el-descriptions-item label="档案名称">
            <span 
              v-if="archiveInfo.fileName && archiveInfo.fileName !== 'null'" 
              style="color: #409EFF; cursor: pointer; text-decoration: underline;" 
              @click="handleFileClick"
            >
              {{ archiveInfo.fileName }}
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="档案编号">{{ formatValue(archiveInfo.businessNo, '-') }}</el-descriptions-item>
          <el-descriptions-item label="所属部门">{{ formatValue(archiveInfo.department, '-') }}</el-descriptions-item>
          <el-descriptions-item label="档案类型">{{ formatValue(archiveInfo.archiveType, '-') }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(archiveInfo.createTime) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="文件数量">{{ 1 }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 审批历史 -->
      <div class="info-section">
        <h3 class="section-title">审批历史</h3>
        <div class="approval-history">
          <el-timeline>
            <el-timeline-item
              v-for="(history, index) in approvalDetail.history"
              :key="index"
              :timestamp="formatDateTime(history.operationTime)"
              :type="history.operationType === 1 ? 'success' : 'danger'"
            >
              <div class="history-content">
                <div class="history-title">
                  <span>{{ history.nodeId == 1 ? '部门审核' : history.nodeId == 2 ? '档案复核' : history.nodeId == 3 ? '最终入库' : '未知环节' }}</span>
                  <el-tag :type="history.operationType === 1 ? 'success' : 'danger'" size="small" style="margin-left: 10px;">
                    {{ history.operationType === 1 ? '通过' : '驳回' }}
                  </el-tag>
                </div>
                <div class="history-info">
                  <span>操作人：{{ formatValue(history.operatorName) }}</span>
                </div>
                <div class="history-comment" v-if="history.operationOpinion">
                  <p>审批意见：{{ formatValue(history.operationOpinion) }}</p>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <!-- 审批操作区域 -->
      <div class="approval-section" v-if="canApprove">
        <el-divider content-position="left">审批操作</el-divider>
        <el-form :model="approvalForm" label-width="80px">
          <el-form-item label="审批意见">
            <el-input
              v-model="approvalForm.opinion"
              type="textarea"
              :rows="4"
              placeholder="请输入审批意见"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="handleApprove('1')">通过</el-button>
            <el-button type="danger" @click="handleApprove('0')">驳回</el-button>
            <el-button @click="handleBack">取消</el-button>
          </el-form-item>
        </el-form>
      </div>


    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getApprovalDetailApi, deptAuditApi, archiveAuditApi } from '../api/approval'
import { getArchiveByIdApi, previewArchiveApi, downloadArchiveApi } from '../api/archiveInfo'

const router = useRouter()
const route = useRoute()

// 审批详情数据
const approvalDetail = ref({
  applyId: '',
  archiveId: '',
  applyBy: '',
  applyTime: '',
  applyStatus: '',
  history: []
})

// 档案信息
const archiveInfo = ref(null)

// 审批表单
const approvalForm = ref({
  comment: ''
})



// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime || dateTime === 'null') return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 处理字符串"null"的情况
const formatValue = (value, defaultValue = '') => {
  if (value === null || value === undefined || value === 'null') {
    return defaultValue
  }
  return value
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待审批',
    1: '部门审核通过',
    2: '档案复核通过',
    3: '已入库',
    4: '驳回'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'info',
    2: 'primary',
    3: 'success',
    4: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取当前登录用户信息
const getCurrentUser = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  return userInfoStr ? JSON.parse(userInfoStr) : { username: 'admin' }
}

// 判断当前用户是否可以审批
const canApprove = computed(() => {
  const status = approvalDetail.value.applyStatus
  const currentUser = getCurrentUser()
  
  // 待审批（0）- 只有部门负责人可以审批
  if (status === 0) {
    return currentUser.userId === approvalDetail.value.deptLeaderId
  }
  
  // 部门审核通过（1）- 只有档案管理员可以审批
  if (status === 1) {
    return currentUser.userId === approvalDetail.value.archiveAdminId || currentUser.roles?.includes('ARCHIVE_ADMIN')
  }
  
  return false
})





// 获取当前节点名称
const getCurrentNodeName = () => {
  const status = approvalDetail.value.applyStatus
  if (status === 0) return '部门审核'
  if (status === 1) return '档案复核'
  if (status === 2) return '档案复核通过'
  if (status === 3) return '已入库'
  if (status === 4) return '已驳回'
  return ''
}

// 获取审批详情
const getApprovalDetail = async () => {
  try {
    const applyId = route.params.id
    const response = await getApprovalDetailApi(applyId)
    if (response.code === 200) {
      approvalDetail.value = response.data.apply || {}
      // 处理审批历史
      approvalDetail.value.history = response.data.history || []
      archiveInfo.value = response.data.archiveInfo || {}
    } else {
      ElMessage.error('获取审批详情失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('获取审批详情失败：' + error.message)
  }
}



// 文件点击处理
const handleFileClick = () => {
  downloadFile()
}

// 下载文件
const downloadFile = async () => {
  try {
    if (!archiveInfo.value || !archiveInfo.value.id) {
      ElMessage.warning('档案信息不完整，无法下载')
      return
    }
    
    const response = await downloadArchiveApi(archiveInfo.value.id)
    
    // 处理文件名
    const fileName = archiveInfo.value.fileName || `archive_${archiveInfo.value.id}`
    
    // 创建下载链接
    const blob = new Blob([response], { type: response.type || 'application/octet-stream' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    
    // 清理临时资源
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('文件下载成功')
  } catch (error) {
    ElMessage.error('下载文件失败：' + error.message)
  }
}

// 执行审批操作
const handleApprove = async (result) => {
  try {
    const applyId = route.params.id
    const params = {
      applyId: applyId,
      pass: result === '1',
      opinion: approvalForm.value.opinion,
      operatorId: getCurrentUser().userId
    }
    
    let response
    const currentStatus = approvalDetail.value.applyStatus
    
    if (currentStatus === 0) {
      // 部门审核
      response = await deptAuditApi(params)
    } else if (currentStatus === 1) {
      // 档案复核
      response = await archiveAuditApi(params)
    } else {
      ElMessage.warning('当前状态不可审批')
      return
    }
    
    if (response.code === 200) {
      ElMessage.success('审批操作成功')
      router.push('/approval')
    } else {
      ElMessage.error('审批操作失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('审批操作失败：' + error.message)
  }
}



// 返回列表
const handleBack = () => {
  router.push('/approval')
}

// 页面加载时获取数据
onMounted(() => {
  getApprovalDetail()
})
</script>

<style scoped>
.approval-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.approval-history {
  margin-top: 15px;
}

.history-content {
  padding: 10px;
  background-color: #fafafa;
  border-radius: 4px;
}

.history-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.history-info {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.history-comment {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ddd;
  color: #333;
}

.approval-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
}
</style>