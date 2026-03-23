<template>
  <div class="audit-report-view">
    <el-card class="report-card">
      <template #header>
        <div class="card-header">
          <span>审计报表管理</span>
          <el-button type="primary" size="small" @click="generateReport">生成报表</el-button>
        </div>
      </template>
      
      <div class="report-content">
        <!-- 查询条件 -->
        <div class="filter-section">
          <el-form :inline="true" :model="queryParams" label-width="100px">
            <el-form-item label="报表类型">
              <el-select v-model="queryParams.reportType" placeholder="请选择报表类型" clearable>
                <el-option label="挂接审计报表" value="HANG_ON_AUDIT"></el-option>
                <el-option label="采集审计报表" value="COLLECTION_AUDIT"></el-option>
                <el-option label="权限审计报表" value="PERMISSION_AUDIT"></el-option>
                <el-option label="操作审计报表" value="OPERATION_AUDIT"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="报表状态">
              <el-select v-model="queryParams.status" placeholder="请选择报表状态" clearable>
                <el-option label="生成中" value="GENERATING"></el-option>
                <el-option label="已完成" value="COMPLETED"></el-option>
                <el-option label="失败" value="FAILED"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="queryParams.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :format="'YYYY-MM-DD HH:mm:ss'"
                :value-format="'YYYY-MM-DD HH:mm:ss'"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 报表列表 -->
        <div class="table-section">
          <el-table :data="reportList" style="width: 100%" border fit>
            <el-table-column prop="id" label="报表ID" min-width="100"></el-table-column>
            <el-table-column prop="reportName" label="报表名称" min-width="200"></el-table-column>
            <el-table-column prop="reportType" label="报表类型" min-width="150">
              <template #default="scope">
                {{ getReportTypeText(scope.row.reportType) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="generateTime" label="生成时间" min-width="180"></el-table-column>
            <el-table-column prop="fileSize" label="文件大小" min-width="100">
              <template #default="scope">
                {{ formatFileSize(scope.row.fileSize) }}
              </template>
            </el-table-column>
            <el-table-column prop="generateBy" label="生成人" min-width="120"></el-table-column>
            <el-table-column label="操作" min-width="200">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewReport(scope.row)" :disabled="scope.row.status !== 1">查看</el-button>
                <el-button type="success" size="small" @click="downloadReport(scope.row)" :disabled="scope.row.status !== 1">下载</el-button>
                <el-button type="danger" size="small" @click="deleteReport(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </el-card>
    
    <!-- 生成报表弹窗 -->
    <el-dialog
      v-model="generateDialogVisible"
      title="生成报表"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-form ref="generateFormRef" :model="generateForm" label-width="100px" :rules="generateFormRules">
        <el-form-item label="报表类型" prop="reportType">
          <el-select v-model="generateForm.reportType" placeholder="请选择报表类型">
            <el-option label="挂接审计报表" value="HANG_ON_AUDIT"></el-option>
            <el-option label="采集审计报表" value="COLLECTION_AUDIT"></el-option>
            <el-option label="权限审计报表" value="PERMISSION_AUDIT"></el-option>
            <el-option label="操作审计报表" value="OPERATION_AUDIT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="报表名称" prop="reportName">
          <el-input v-model="generateForm.reportName" placeholder="请输入报表名称"></el-input>
        </el-form-item>
        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker
            v-model="generateForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :format="'YYYY-MM-DD HH:mm:ss'"
            :value-format="'YYYY-MM-DD HH:mm:ss'"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="生成方式" prop="generateMethod">
          <el-radio-group v-model="generateForm.generateMethod">
            <el-radio value="立即生成">立即生成</el-radio>
            <el-radio value="定时生成">定时生成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="定时时间" prop="scheduleTime" v-if="generateForm.generateMethod === '定时生成'">
          <el-time-picker
            v-model="generateForm.scheduleTime"
            placeholder="选择时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="generateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitGenerate">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 报表查看弹窗 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="报表查看"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="view-content">
        <h3>{{ currentReport.reportName }}</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="报表ID">{{ currentReport.id }}</el-descriptions-item>
          <el-descriptions-item label="报表类型">{{ getReportTypeText(currentReport.reportType) }}</el-descriptions-item>
          <el-descriptions-item label="生成时间">{{ currentReport.generateTime }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(currentReport.fileSize) }}</el-descriptions-item>
          <el-descriptions-item label="生成人" :span="2">{{ currentReport.generateBy }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 报表内容预览 -->
        <div class="report-preview">
          <h4>报表内容预览</h4>
          <!-- 统计数据展示 -->
          <div v-if="typeof reportPreviewData === 'object' && !Array.isArray(reportPreviewData)" class="statistic-data">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="总操作数" v-if="reportPreviewData.total">{{ reportPreviewData.total }}</el-descriptions-item>
              <el-descriptions-item label="成功数" v-if="reportPreviewData.success">{{ reportPreviewData.success }}</el-descriptions-item>
              <el-descriptions-item label="失败数" v-if="reportPreviewData.fail">{{ reportPreviewData.fail }}</el-descriptions-item>
              <el-descriptions-item label="成功率" v-if="reportPreviewData.success && reportPreviewData.total">
                {{ reportPreviewData.total > 0 ? Math.round((reportPreviewData.success / reportPreviewData.total) * 100) : 0 }}%
              </el-descriptions-item>
            </el-descriptions>
            
            <!-- 按挂接方式统计 -->
            <h5 v-if="Array.isArray(reportPreviewData.byHangOnType) && reportPreviewData.byHangOnType.length > 0">按挂接方式统计</h5>
            <el-table v-if="Array.isArray(reportPreviewData.byHangOnType) && reportPreviewData.byHangOnType.length > 0" :data="reportPreviewData.byHangOnType" style="width: 100%" border>
              <el-table-column prop="type" label="挂接方式" width="120"></el-table-column>
              <el-table-column prop="count" label="数量" width="100"></el-table-column>
              <el-table-column prop="successRate" label="成功率%" width="100"></el-table-column>
            </el-table>
            
            <!-- 挂接失败原因分析 -->
            <h5 v-if="Array.isArray(reportPreviewData.failReasons) && reportPreviewData.failReasons.length > 0">挂接失败原因分析</h5>
            <el-table v-if="Array.isArray(reportPreviewData.failReasons) && reportPreviewData.failReasons.length > 0" :data="reportPreviewData.failReasons" style="width: 100%" border>
              <el-table-column prop="reason" label="失败原因" min-width="300"></el-table-column>
              <el-table-column prop="count" label="数量" width="100"></el-table-column>
            </el-table>
          </div>
          
          <!-- 操作记录表格 -->
          <el-table v-else-if="Array.isArray(reportPreviewData)" :data="reportPreviewData" style="width: 100%" border>
            <el-table-column prop="operationType" label="操作类型" width="120"></el-table-column>
            <el-table-column prop="operationUser" label="操作人" width="120"></el-table-column>
            <el-table-column prop="operationTime" label="操作时间" width="180"></el-table-column>
            <el-table-column prop="operationDetail" label="操作详情" min-width="300"></el-table-column>
            <el-table-column prop="result" label="操作结果" width="100"></el-table-column>
          </el-table>
          
          <!-- 无数据提示 -->
          <div v-else class="no-data">
            <el-empty description="暂无报表数据"></el-empty>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import auditReportApi from '../api/auditReport'

// 数据定义
const queryParams = reactive({
  reportType: '',
  status: '',
  dateRange: []
})

const reportList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const generateDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const generateFormRef = ref(null)
const generateForm = reactive({
  reportType: '',
  reportName: '',
  dateRange: [],
  generateMethod: '立即生成',
  scheduleTime: ''
})

const currentReport = ref({})
const reportPreviewData = ref([])

// 表单验证规则
const generateFormRules = reactive({
  reportType: [
    { required: true, message: '请选择报表类型', trigger: 'change' }
  ],
  reportName: [
    { required: true, message: '请输入报表名称', trigger: 'blur' }
  ],
  dateRange: [
    { required: true, message: '请选择时间范围', trigger: 'change' }
  ]
})

// 初始化数据
const initData = () => {
  // 调用API获取审计报表列表
  auditReportApi.getAuditReportList({
    currentPage: currentPage.value,
    pageSize: pageSize.value
  }).then(res => {
    reportList.value = Array.isArray(res.data?.records) ? res.data.records : []
    total.value = Number(res.data?.total) || 0
  }).catch(err => {
    console.error('获取审计报表列表失败:', err)
    ElMessage.error('获取审计报表列表失败')
    reportList.value = []
    total.value = 0
  })
}

// 生命周期钩子，组件挂载时初始化数据
onMounted(() => {
  initData()
})

// 获取报表类型文本
const getReportTypeText = (reportType) => {
  const typeMap = {
    HANG_ON_AUDIT: '挂接审计报表',
    COLLECTION_AUDIT: '采集审计报表',
    PERMISSION_AUDIT: '权限审计报表',
    OPERATION_AUDIT: '操作审计报表'
  }
  return typeMap[reportType] || reportType
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '生成中',
    1: '已完成',
    2: '失败'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return typeMap[status] || 'info'
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size === null || size === undefined || isNaN(size)) return '-'
  if (size === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 查询
const handleQuery = () => {
  currentPage.value = 1
  // 调用API获取审计报表列表
  auditReportApi.getAuditReportList({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    ...queryParams
  }).then(res => {
    reportList.value = Array.isArray(res.data?.records) ? res.data.records : []
    total.value = res.data?.total || 0
    ElMessage.success('查询成功')
  }).catch(err => {
    console.error('查询审计报表失败:', err)
    ElMessage.error('查询审计报表失败')
    reportList.value = []
    total.value = 0
  })
}

// 重置
const handleReset = () => {
  Object.assign(queryParams, {
    reportType: '',
    status: '',
    dateRange: []
  })
  // 重置后重新查询
  handleQuery()
}

// 分页
const handleCurrentChange = (page) => {
  currentPage.value = page
  // 调用API获取指定页码的审计报表列表
  auditReportApi.getAuditReportList({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    ...queryParams
  }).then(res => {
    reportList.value = Array.isArray(res.data?.records) ? res.data.records : []
  }).catch(err => {
    console.error('获取审计报表列表失败:', err)
    ElMessage.error('获取审计报表列表失败')
    reportList.value = []
  })
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  initData()
}

// 生成报表
const generateReport = () => {
  Object.assign(generateForm, {
    reportType: '',
    reportName: '',
    dateRange: [],
    generateMethod: '立即生成',
    scheduleTime: ''
  })
  generateDialogVisible.value = true
}

// 提交生成报表
const submitGenerate = () => {
  if (!generateFormRef.value) return
  
  generateFormRef.value.validate((valid) => {
    if (valid) {
      // 调用API生成审计报表
      auditReportApi.generateAuditReport({
        reportName: generateForm.reportName,
        reportType: generateForm.reportType,
        periodType: 'month', // 根据实际情况调整
        startTime: generateForm.dateRange[0],
        endTime: generateForm.dateRange[1],
        generateBy: 'admin' // 实际应从登录信息获取
      }).then(res => {
        ElMessage.success('报表生成请求已发送')
        generateDialogVisible.value = false
        // 重新查询报表列表
        handleQuery()
      }).catch(err => {
        console.error('生成审计报表失败:', err)
        ElMessage.error('生成审计报表失败')
      })
    }
  })
}

// 查看报表
const viewReport = (row) => {
  // 调用API获取审计报表详情
  auditReportApi.getAuditReportDetail(row.id).then(res => {
    currentReport.value = res.data
    // 将reportData从JSON字符串转换为数组
    try {
      reportPreviewData.value = res.data.reportData ? JSON.parse(res.data.reportData) : []
    } catch (e) {
      console.error('解析报表数据失败:', e)
      reportPreviewData.value = []
    }
    viewDialogVisible.value = true
  }).catch(err => {
    console.error('获取审计报表详情失败:', err)
    ElMessage.error('获取审计报表详情失败')
  })
}

// 下载报表
const downloadReport = (row) => {
  // 调用API下载审计报表
  auditReportApi.downloadAuditReport(row.id).then(blob => {
    // 直接使用返回的Blob对象，不需要再次包装
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = row.reportName + '.xlsx'
    // 模拟点击下载
    document.body.appendChild(link)
    link.click()
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('报表下载成功')
  }).catch(err => {
    console.error('下载审计报表失败:', err)
    ElMessage.error('下载审计报表失败')
  })
}

// 删除报表
const deleteReport = (row) => {
  ElMessageBox.confirm('确定要删除该报表吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用API删除审计报表
    auditReportApi.deleteAuditReport(row.id).then(res => {
      ElMessage.success('删除成功')
      // 重新查询报表列表
      handleQuery()
    }).catch(err => {
      console.error('删除审计报表失败:', err)
      ElMessage.error('删除审计报表失败')
    })
  }).catch(() => {
    // 取消操作
  })
}

// 初始化数据
initData()
</script>

<style scoped>
.audit-report-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-content {
  padding: 20px 0;
}

.query-form {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.view-content {
  padding: 10px 0;
}

.report-preview {
  margin-top: 20px;
}
</style>