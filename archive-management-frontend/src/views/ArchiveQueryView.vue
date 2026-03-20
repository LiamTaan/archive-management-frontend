<template>
  <div class="archive-query-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>档案查询</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="档案查询" name="query">
          <div class="tab-content">
            <!-- 查询条件 -->
            <el-form :model="queryForm" label-width="120px" :inline="false">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="档案ID">
                    <el-input v-model="queryForm.id" placeholder="请输入档案ID" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="文件名">
                    <el-input v-model="queryForm.fileName" placeholder="请输入文件名" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="文件类型">
                    <el-input v-model="queryForm.fileType" placeholder="请输入文件类型" />
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="isExpanded || activeVisibleFields.includes('archiveType')">
                  <el-form-item label="档案分类">
                    <el-input v-model="queryForm.archiveType" placeholder="请输入档案分类" />
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="isExpanded || activeVisibleFields.includes('businessNo')">
                  <el-form-item label="业务单号">
                    <el-input v-model="queryForm.businessNo" placeholder="请输入业务单号" />
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="isExpanded || activeVisibleFields.includes('responsiblePerson')">
                  <el-form-item label="责任人">
                    <el-input v-model="queryForm.responsiblePerson" placeholder="请输入责任人" />
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="isExpanded || activeVisibleFields.includes('department')">
                  <el-form-item label="所属部门">
                    <el-input v-model="queryForm.department" placeholder="请输入所属部门" />
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="isExpanded || activeVisibleFields.includes('status')">
                  <el-form-item label="档案状态">
                    <el-select v-model="queryForm.status" placeholder="请选择档案状态">
                      <el-option label="未挂接" value="0" />
                      <el-option label="已挂接" value="1" />
                      <el-option label="挂接失败" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="isExpanded || activeVisibleFields.includes('hangOnType')">
                  <el-form-item label="挂接方式">
                    <el-select v-model="queryForm.hangOnType" placeholder="请选择挂接方式">
                      <el-option label="自动" value="0" />
                      <el-option label="手动" value="1" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8" v-if="isExpanded || activeVisibleFields.includes('createTime')">
                  <el-form-item label="创建时间范围">
                    <el-date-picker
                      v-model="dateRange"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      :format="'YYYY-MM-DD HH:mm:ss'"
                      :value-format="'YYYY-MM-DD HH:mm:ss'"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item>
                <el-button type="primary" @click="handleQuery" :loading="loading">开始查询</el-button>
                <el-button @click="resetQueryForm">重置</el-button>
                <el-button type="default" @click="toggleExpand">
                  {{ isExpanded ? '收起' : '展开' }}
                  <el-icon>
                    <component :is="isExpanded ? 'ArrowUp' : 'ArrowDown'" />
                  </el-icon>
                </el-button>
              </el-form-item>
            </el-form>

            <!-- 查询结果 -->
            <div class="result-info" v-if="tableData.length > 0 || loading">
              <el-divider />
              <div class="batch-operation">
                <h3 style="display: inline-block; margin-right: 20px;">查询结果</h3>
                <el-button 
                  type="success" 
                  @click="handleBatchHangOn" 
                  :disabled="selectedRows.length === 0"
                >
                  批量挂接 ({{ selectedRows.length }})
                </el-button>
              </div>
              <el-table :data="tableData" border style="width: 100%" :loading="loading" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="档案ID" width="100" />
                <el-table-column prop="fileName" label="文件名" width="300" />
                <el-table-column prop="fileType" label="文件类型" width="100" />
                <el-table-column prop="archiveType" label="档案分类" width="120" />
                <el-table-column prop="businessNo" label="业务单号" width="150" />
                <el-table-column prop="responsiblePerson" label="责任人" width="100" />
                <el-table-column prop="department" label="所属部门" width="120" />
                <el-table-column prop="status" label="档案状态" width="100">
                  <template #default="scope">
                    <span :class="getStatusClass(scope.row.status)">
                      {{ getStatusText(scope.row.status) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="hangOnType" label="挂接方式" width="100">
                  <template #default="scope">
                    {{ scope.row.hangOnType === 0 ? '自动' : '手动' }}
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="200" />
                <el-table-column label="操作" width="250">
                  <template #default="scope">
                    <el-button type="primary" size="small" @click="handleViewDetail(scope.row.id)">
                      查看详情
                    </el-button>
                    <el-button type="warning" size="small" @click="handlePreviewArchive(scope.row)">
                      预览
                    </el-button>
                    <el-button type="info" size="small" @click="handleDownloadArchive(scope.row)">
                      下载
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <el-pagination
                :current-page="currentPage"
                :page-size="pageSize"
                :total="total"
                layout="prev, pager, next, total, jumper"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
                style="margin-top: 20px; text-align: right;"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="档案详情" name="detail">
          <div class="tab-content">
            <div class="result-info" v-if="detailInfo || detailLoading">
              <el-descriptions :column="2" border :loading="detailLoading">
                <el-descriptions-item v-if="detailInfo" label="档案ID">{{ detailInfo.id }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="文件名">{{ detailInfo.fileName }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="文件路径">{{ detailInfo.filePath }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="文件类型">{{ detailInfo.fileType }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="文件大小">{{ formatFileSize(detailInfo.fileSize) }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="MD5值">{{ detailInfo.md5Value }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="档案分类">{{ detailInfo.archiveType }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="业务单号">{{ detailInfo.businessNo }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="业务类型">{{ detailInfo.businessType }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="责任人">{{ detailInfo.responsiblePerson }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="所属部门">{{ detailInfo.department }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="挂接时间">{{ detailInfo.hangOnTime }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="挂接方式">{{ detailInfo.hangOnType === 0 ? '自动' : '手动' }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="档案状态">
                  <span :class="getStatusClass(detailInfo.status)">
                    {{ getStatusText(detailInfo.status) }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="创建时间">{{ detailInfo.createTime }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="更新时间">{{ detailInfo.updateTime }}</el-descriptions-item>
                <el-descriptions-item v-if="detailInfo" label="备注" :span="2">{{ detailInfo.remark }}</el-descriptions-item>
              </el-descriptions>
              <el-button type="primary" @click="activeTab = 'query'" style="margin-top: 20px;">
                返回查询
              </el-button>
            </div>
            <div v-else>
              <el-empty description="暂无档案详情" />
              <el-button type="primary" @click="activeTab = 'query'" style="margin-top: 20px;">
                返回查询
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { queryArchiveByPageApi, getArchiveByIdApi, downloadArchiveApi, openPreviewArchive } from '../api/archiveInfo'
import { transformPageRequest, transformPageResponse } from '../utils/pagination'

const activeTab = ref('query')

// 查询条件
const queryForm = reactive({
  id: '',
  fileName: '',
  fileType: '',
  archiveType: '',
  businessNo: '',
  businessType: '',
  responsiblePerson: '',
  department: '',
  status: '',
  hangOnType: '',
  startTime: '',
  endTime: ''
})

// 日期范围
const dateRange = ref([])

// 展开收起控制
const isExpanded = ref(false)
const activeVisibleFields = ref(['archiveType', 'businessNo', 'responsiblePerson'])

// 查询结果
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const detailLoading = ref(false)

// 切换展开收起状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 批量操作
const selectedRows = ref([])

// 档案详情
const detailInfo = ref(null)

// 处理查询
const handleQuery = async () => {
  try {
    loading.value = true
    // 构建查询条件
    const queryDTO = {
      ...queryForm,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      queryDTO.startTime = new Date(dateRange.value[0])
      queryDTO.endTime = new Date(dateRange.value[1])
    }
    
    // 调用API
    const response = await queryArchiveByPageApi(queryDTO)
    const pageData = transformPageResponse(response.data)
    tableData.value = pageData.records || []
    total.value = pageData.total || 0
    ElMessage.success('查询成功')
  } catch (error) {
    ElMessage.error('查询失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 重置查询条件
const resetQueryForm = () => {
  Object.keys(queryForm).forEach(key => {
    queryForm[key] = ''
  })
  dateRange.value = []
  tableData.value = []
  total.value = 0
  currentPage.value = 1
}

// 查看详情
const handleViewDetail = async (id) => {
  try {
    detailLoading.value = true
    const response = await getArchiveByIdApi(id)
    detailInfo.value = response.data
    activeTab.value = 'detail'
    ElMessage.success('查询档案详情成功')
  } catch (error) {
    ElMessage.error('查询档案详情失败：' + error.message)
  } finally {
    detailLoading.value = false
  }
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  handleQuery()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  handleQuery()
}

// 标签切换
const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
}

// 处理选中行变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '未挂接'
    case 1: return '已挂接'
    case 2: return '挂接失败'
    default: return '未知'
  }
}

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-pending'
    case 1: return 'status-success'
    case 2: return 'status-fail'
    default: return ''
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let fileSize = size
  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }
  return `${fileSize.toFixed(2)} ${units[unitIndex]}`
}



// 预览档案
const handlePreviewArchive = (archive) => {
  try {
    // 直接在新窗口中打开预览链接，传递完整的档案对象
    openPreviewArchive(archive)
    ElMessage.success('档案预览成功')
  } catch (error) {
    console.error('预览档案失败:', error)
    ElMessage.error('预览档案失败：' + error.message)
  }
}

// 判断是否为图片文件
const isImageFile = (fileType) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif']
  return imageTypes.includes(fileType.toLowerCase())
}

// 下载档案
const handleDownloadArchive = async (archive) => {
  try {
    const response = await downloadArchiveApi(archive.id)
    const blob = new Blob([response], { type: getFileContentType(archive.fileType) })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = archive.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    ElMessage.success('档案下载成功')
  } catch (error) {
    ElMessage.error('下载档案失败：' + error.message)
  }
}

// 获取文件内容类型
const getFileContentType = (fileType) => {
  const contentTypeMap = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    txt: 'text/plain'
  }
  return contentTypeMap[fileType.toLowerCase()] || 'application/octet-stream'
}

// 批量挂接
const handleBatchHangOn = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择需要挂接的档案')
    return
  }

  try {
    // 弹出对话框，让用户选择目标系统和操作人
    const result = await ElMessageBox.prompt('请输入操作人', '批量挂接', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: '',
      inputPlaceholder: '操作人'
    })

    const operateBy = result.value
    if (!operateBy) {
      ElMessage.warning('请输入操作人')
      return
    }

    // 获取选中档案的ID列表
    const archiveIds = selectedRows.value.map(row => row.id)
    
    // 这里可以根据实际情况添加目标系统选择
    // 假设默认挂接到第一个系统
    const systemCode = 'default_system'
    
    // 调用批量挂接API
    // 注意：这里需要根据实际的API进行调整
    // const response = await batchHangOnApi({
    //   archiveIds,
    //   systemCode,
    //   operateBy,
    //   hangOnMethod: 'manual'
    // })
    
    // 模拟API调用
    ElMessage.success(`批量挂接请求已提交，共 ${archiveIds.length} 个档案`)
    
    // 清空选中记录
    selectedRows.value = []
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    ElMessage.error('批量挂接失败：' + error.message)
  }
}

// 页面加载时自动执行查询
onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.archive-query-container {
  padding: 0 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-content {
  padding: 20px 0;
}

.result-info {
  margin-top: 20px;
}

.tab-content {
  padding: 20px 0;
}

.el-form {
  margin-bottom: 0;
}

.status-success {
  color: #67c23a;
}

.status-pending {
  color: #e6a23c;
}

.status-fail {
  color: #f56c6c;
}

.batch-operation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}


</style>