<template>
  <div class="approval-list-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>审批管理</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :model="filterForm" label-width="100px" inline>
          <el-form-item label="档案ID">
            <el-input v-model="filterForm.archiveId" placeholder="请输入档案ID" />
          </el-form-item>
          <el-form-item label="审批状态">
            <el-select v-model="filterForm.status" placeholder="请选择审批状态">
              <el-option label="全部" value="" />
              <el-option label="待审批" value="0" />
              <el-option label="部门审核通过" value="1" />
              <el-option label="档案复核通过" value="2" />
              <el-option label="已入库" value="3" />
              <el-option label="驳回" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 审批列表 -->
      <div class="table-section">
        <el-table :data="approvalList" border style="width: 100%" fit>
          <el-table-column prop="applyId" label="申请ID" min-width="100" />
          <el-table-column prop="archiveId" label="档案ID" min-width="100" />
          <el-table-column prop="applyBy" label="申请人" min-width="120" />
          <el-table-column prop="applyTime" label="申请时间" min-width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.applyTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="applyStatus" label="审批状态" min-width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.applyStatus)">
                {{ getStatusText(scope.row.applyStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="200">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleViewDetail(scope.row.applyId)">
                查看详情
              </el-button>
              <el-button 
                v-if="canApprove(scope.row)" 
                type="success" 
                size="small" 
                @click="handleApprove(scope.row.applyId, scope.row.applyStatus)"
              >
                审批
              </el-button>
              <el-button 
                v-if="canFinalArchive(scope.row)" 
                type="warning" 
                size="small" 
                @click="handleFinalArchive(scope.row)"
              >
                最终入库
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="pageInfo.currentPage"
            v-model:page-size="pageInfo.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageInfo.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getApprovalListApi, finalArchiveApi } from '../api/approval'

const router = useRouter()

// 筛选条件
const filterForm = ref({
  archiveId: '',
  status: ''
})

// 审批列表数据
const approvalList = ref([])

// 分页信息
const pageInfo = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
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

// 判断是否可以审批
const canApprove = (row) => {
  const status = row.applyStatus
  const currentUser = getCurrentUser()
  
  // 待审批（0）- 只有部门负责人可以审批
  if (status === 0) {
    return currentUser.userId === row.deptLeaderId
  }
  
  // 部门审核通过（1）- 只有档案管理员可以审批
  if (status === 1) {
    return currentUser.userId === row.archiveAdminId || currentUser.roles?.includes('ARCHIVE_ADMIN')
  }
  
  return false
}

// 判断是否可以执行最终入库操作
const canFinalArchive = (row) => {
  const status = row.applyStatus
  const currentUser = getCurrentUser()
  
  // 档案复核通过（2）- 只有档案管理员可以执行最终入库
  if (status === 2) {
    return currentUser.roles?.includes('ARCHIVE_ADMIN')
  }
  
  return false
}

// 获取审批列表
const getApprovalList = async () => {
  try {
    const params = {
      page: pageInfo.value.currentPage,
      size: pageInfo.value.pageSize,
      status: filterForm.value.status || undefined,
      archiveId: filterForm.value.archiveId ? parseInt(filterForm.value.archiveId) : undefined
    }
    
    // 获取当前登录用户信息，用于数据隔离
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      params.userId = userInfo.userId || userInfo.id
      params.username = userInfo.username
      params.userDept = userInfo.deptId || userInfo.departmentId
      params.userRoles = userInfo.roles || []
    }
    
    const response = await getApprovalListApi(params)
    if (response.code === 200) {
      approvalList.value = response.data.records || []
      pageInfo.value.total = response.data.total || 0
    } else {
      ElMessage.error('获取审批列表失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('获取审批列表失败：' + error.message)
  }
}

// 查询
const handleSearch = () => {
  pageInfo.value.currentPage = 1
  getApprovalList()
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.value = {
    archiveId: '',
    status: ''
  }
  pageInfo.value.currentPage = 1
  getApprovalList()
}

// 查看详情
const handleViewDetail = (applyId) => {
  router.push(`/approval/${applyId}`)
}

// 审批操作
const handleApprove = (applyId, status) => {
  router.push(`/approval/${applyId}`)
}

// 最终入库操作
const handleFinalArchive = async (row) => {
  try {
    // 弹出确认提示
    await ElMessageBox.confirm(
      '确定要执行最终入库操作吗？',
      '操作确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 构建最终入库参数
    const response = await finalArchiveApi(row.applyId)
    
    if (response.code === 200) {
      ElMessage.success('最终入库操作成功')
      getApprovalList() // 刷新列表
    } else {
      ElMessage.error('最终入库操作失败：' + response.message)
    }
  } catch (error) {
    // 如果是用户取消操作，则不显示错误信息
    if (error.name !== 'ElMessageBoxCancel') {
      ElMessage.error('最终入库操作失败：' + error.message)
    }
  }
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageInfo.value.pageSize = size
  getApprovalList()
}

// 当前页码变化
const handleCurrentChange = (current) => {
  pageInfo.value.currentPage = current
  getApprovalList()
}

// 页面加载时获取数据
onMounted(() => {
  getApprovalList()
})
</script>

<style scoped>
.approval-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
}

.table-section {
  margin-top: 20px;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 表格样式 */
:deep(.el-table) {
  margin-bottom: 20px;
}
</style>
