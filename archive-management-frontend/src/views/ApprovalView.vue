<template>
  <div class="approval-container">
    <el-card shadow="hover" class="approval-card">
      <template #header>
        <div class="card-header">
          <span>操作审批管理</span>
          <el-button type="primary" @click="openApprovalDialog">发起审批</el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="待审批" name="pending">
          <div class="approval-table">
            <el-table
              v-loading="loading"
              :data="pendingApprovals"
              border
              style="width: 100%"
            >
              <el-table-column prop="approvalId" label="审批ID" width="100" />
              <el-table-column prop="applyType" label="申请类型" width="120" />
              <el-table-column prop="applyContent" label="申请内容" />
              <el-table-column prop="applyBy" label="申请人" width="100" />
              <el-table-column prop="applyTime" label="申请时间" width="180" />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button size="small" type="primary" @click="approve(scope.row)">
                    审批
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="已审批" name="approved">
          <div class="approval-table">
            <el-table
              v-loading="loading"
              :data="approvedApprovals"
              border
              style="width: 100%"
            >
              <el-table-column prop="approvalId" label="审批ID" width="100" />
              <el-table-column prop="applyType" label="申请类型" width="120" />
              <el-table-column prop="applyContent" label="申请内容" />
              <el-table-column prop="applyBy" label="申请人" width="100" />
              <el-table-column prop="applyTime" label="申请时间" width="180" />
              <el-table-column prop="approveBy" label="审批人" width="100" />
              <el-table-column prop="approveTime" label="审批时间" width="180" />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column prop="result" label="审批结果" width="100" />
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我的待办" name="myPending">
          <div class="approval-table">
            <el-table
              v-loading="loading"
              :data="myPendingApprovals"
              border
              style="width: 100%"
            >
              <el-table-column prop="approvalId" label="审批ID" width="100" />
              <el-table-column prop="applyType" label="申请类型" width="120" />
              <el-table-column prop="applyContent" label="申请内容" />
              <el-table-column prop="applyBy" label="申请人" width="100" />
              <el-table-column prop="applyTime" label="申请时间" width="180" />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button size="small" type="primary" @click="approve(scope.row)">
                    审批
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我的已办" name="myApproved">
          <div class="approval-table">
            <el-table
              v-loading="loading"
              :data="myApprovedApprovals"
              border
              style="width: 100%"
            >
              <el-table-column prop="approvalId" label="审批ID" width="100" />
              <el-table-column prop="applyType" label="申请类型" width="120" />
              <el-table-column prop="applyContent" label="申请内容" />
              <el-table-column prop="applyBy" label="申请人" width="100" />
              <el-table-column prop="applyTime" label="申请时间" width="180" />
              <el-table-column prop="approveBy" label="审批人" width="100" />
              <el-table-column prop="approveTime" label="审批时间" width="180" />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column prop="result" label="审批结果" width="100" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 发起审批对话框 -->
    <el-dialog
      v-model="approvalDialogVisible"
      title="发起审批"
      width="600px"
    >
      <el-form
        ref="approvalFormRef"
        :model="approvalForm"
        :rules="approvalRules"
        label-width="80px"
      >
        <el-form-item label="操作类型" prop="operationType">
          <el-select v-model="approvalForm.operationType" placeholder="请选择操作类型">
            <el-option label="修改挂接" :value="1" />
            <el-option label="解除挂接" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作内容" prop="operationContent">
          <el-input
            v-model="approvalForm.operationContent"
            type="textarea"
            :rows="4"
            placeholder="请输入申请内容"
          />
        </el-form-item>
        <el-form-item label="操作对象ID" prop="objectId">
          <el-input
            v-model="approvalForm.objectId"
            placeholder="请输入档案ID"
            type="number"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval">提交</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="审批"
      width="600px"
    >
      <el-form :model="currentApproval" label-width="80px">
        <el-form-item label="审批ID">
          <el-input v-model="currentApproval.approvalId" disabled />
        </el-form-item>
        <el-form-item label="申请类型">
          <el-input v-model="currentApproval.applyType" disabled />
        </el-form-item>
        <el-form-item label="申请内容">
          <el-input v-model="currentApproval.applyContent" type="textarea" :rows="4" disabled />
        </el-form-item>
        <el-form-item label="申请时间">
          <el-input v-model="currentApproval.applyTime" disabled />
        </el-form-item>
        <el-form-item label="审批结果">
          <el-radio-group v-model="approvalResult">
            <el-radio value="approve">通过</el-radio>
            <el-radio value="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input
            v-model="approvalComment"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApprove">提交审批</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { submitApprovalApi, getPendingApprovalsApi, getApprovedApprovalsApi, getMyPendingApprovalsApi, getMyApprovedApprovalsApi, submitApprovalResultApi } from '../api/approval'

const activeTab = ref('pending')
const loading = ref(false)
const approvalDialogVisible = ref(false)
const approveDialogVisible = ref(false)
const approvalResult = ref('approve')
const approvalComment = ref('')

const pendingApprovals = ref([])
const approvedApprovals = ref([])
const myPendingApprovals = ref([])
const myApprovedApprovals = ref([])
const currentApproval = reactive({})

const approvalForm = reactive({
  operationType: '',
  operationContent: '',
  objectId: null
})

// 表单引用
const approvalFormRef = ref(null)

// 表单验证规则
const approvalRules = {
  operationType: [
    { required: true, message: '请选择操作类型', trigger: 'change' }
  ],
  operationContent: [
    { required: true, message: '请输入申请内容', trigger: 'blur' }
  ],
  objectId: [
    { required: true, message: '请输入档案ID', trigger: 'blur' },
    {
      type: 'number',
      message: '档案ID必须是数字',
      trigger: 'blur',
      transform: (value) => {
        // 将字符串转换为数字
        return value === '' ? null : Number(value);
      }
    }
  ]
}

// 转换操作类型为中文
const getOperationTypeName = (type) => {
  switch (type) {
    case 1:
      return '修改挂接'
    case 2:
      return '解除挂接'
    default:
      return '未知类型'
  }
}

// 转换审批状态为中文
const getStatusName = (status) => {
  switch (status) {
    case 1:
      return '待审批'
    case 2:
      return '已通过'
    case 3:
      return '已拒绝'
    default:
      return '未知状态'
  }
}

// 转换审批结果为中文
const getResultName = (result) => {
  switch (result) {
    case 1:
      return '通过'
    case 2:
      return '拒绝'
    default:
      return '未知结果'
  }
}

// 处理审批数据，转换字段名称和值
const processApprovalData = (approval) => {
  return {
    // 映射后端字段到前端字段
    approvalId: approval.applyId || approval.id || '',
    // 转换操作类型为中文
    applyType: getOperationTypeName(approval.operationType),
    // 从JSON操作内容中提取文本
    applyContent: approval.operationContent ? (() => {
      try {
        const contentObj = JSON.parse(approval.operationContent)
        return contentObj.content || JSON.stringify(contentObj)
      } catch (e) {
        return approval.operationContent
      }
    })() : '',
    // 申请人名称
    applyBy: approval.applicantName || '',
    // 申请时间
    applyTime: approval.applyTime || approval.createTime || '',
    // 转换状态为中文
    status: getStatusName(approval.status),
    // 审批人名称
    approveBy: approval.approverName || approval.approveBy || '',
    // 审批时间
    approveTime: approval.approveTime || approval.updateTime || '',
    // 转换审批结果为中文
    result: approval.result ? getResultName(approval.result) : ''
  }
}

// 加载审批数据
const loadApprovalData = async () => {
  loading.value = true
  try {
    // 调用真实API获取待审批列表
    const pendingResponse = await getPendingApprovalsApi()
    // 处理待审批数据
    pendingApprovals.value = (pendingResponse.data || []).map(processApprovalData)
    
    // 调用真实API获取已审批列表
    const approvedResponse = await getApprovedApprovalsApi()
    // 处理已审批数据
    approvedApprovals.value = (approvedResponse.data || []).map(processApprovalData)
    
    // 调用真实API获取我的待办审批列表
    const myPendingResponse = await getMyPendingApprovalsApi()
    // 处理我的待办数据
    myPendingApprovals.value = (myPendingResponse.data || []).map(processApprovalData)
    
    // 调用真实API获取我的已办审批列表
    const myApprovedResponse = await getMyApprovedApprovalsApi()
    // 处理我的已办数据
    myApprovedApprovals.value = (myApprovedResponse.data || []).map(processApprovalData)
  } catch (error) {
    ElMessage.error('获取审批数据失败：' + (error.message || '未知错误'))
    // 清空列表
    pendingApprovals.value = []
    approvedApprovals.value = []
    myPendingApprovals.value = []
    myApprovedApprovals.value = []
  } finally {
    loading.value = false
  }
}

// 打开发起审批对话框
const openApprovalDialog = () => {
  approvalDialogVisible.value = true
}

// 提交审批申请
const submitApproval = async () => {
  try {
    // 使用表单验证
    await approvalFormRef.value.validate()
    
    // 准备提交数据，确保与后端实体一致
    const submitData = {
      // 申请人信息，这里使用固定值，实际应该从登录用户获取
      applicantId: 1,
      applicantName: 'admin',
      // 操作类型：1-修改挂接，2-解除挂接
      operationType: approvalForm.operationType,
      // 操作对象ID（档案ID）
      objectId: parseInt(approvalForm.objectId),
      // 操作内容，直接存储纯文本
      operationContent: approvalForm.operationContent.trim(),
      // 审批状态默认为待审批（1）
      status: 1
    }
    
    // 调用真实API提交审批申请
    await submitApprovalApi(submitData)
    approvalDialogVisible.value = false
    ElMessage.success('审批申请提交成功')
    // 清空表单
    approvalForm.operationType = ''
    approvalForm.operationContent = ''
    approvalForm.objectId = null
    // 重新加载审批数据
    loadApprovalData()
  } catch (error) {
    // 表单验证失败时，ElMessage会自动显示错误信息
    if (error !== false) {
      const errorMessage = error.message || '未知错误'
      ElMessage.error('审批申请提交失败：' + errorMessage)
    }
  }
}

// 打开审批对话框
const approve = (row) => {
  Object.assign(currentApproval, row)
  approvalResult.value = 'approve'
  approvalComment.value = ''
  approveDialogVisible.value = true
}

// 提交审批结果
const submitApprove = async () => {
  try {
    // 调用真实API提交审批结果
    await submitApprovalResultApi(currentApproval.approvalId, {
      result: approvalResult.value,
      comment: approvalComment.value
    })
    approveDialogVisible.value = false
    ElMessage.success('审批完成')
    // 重新加载审批数据
    loadApprovalData()
  } catch (error) {
    ElMessage.error('审批提交失败：' + error.message)
  }
}

onMounted(() => {
  loadApprovalData()
})
</script>

<style scoped>
.approval-container {
  padding: 20px;
}

.approval-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.approval-table {
  margin-top: 20px;
}
</style>