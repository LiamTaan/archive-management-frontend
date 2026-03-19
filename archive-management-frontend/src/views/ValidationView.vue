<template>
  <div class="validation-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>校验管理</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="单文件校验" name="archive">
          <div class="tab-content">
            <el-form :model="archiveForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="档案ID">
                    <el-input v-model="archiveForm.archiveId" placeholder="请输入档案ID" />
                  </el-form-item>
                  <el-form-item label="档案分类">
                    <el-input v-model="archiveForm.archiveType" placeholder="请输入档案分类" />
                  </el-form-item>
                  <el-form-item label="业务单号">
                    <el-input v-model="archiveForm.businessNo" placeholder="请输入业务单号" />
                  </el-form-item>
                  <el-form-item label="责任人">
                    <el-input v-model="archiveForm.responsiblePerson" placeholder="请输入责任人" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="所属部门">
                    <el-input v-model="archiveForm.department" placeholder="请输入所属部门" />
                  </el-form-item>
                  <el-form-item label="文件路径">
                    <el-input v-model="archiveForm.filePath" placeholder="请输入文件路径" />
                  </el-form-item>
                  <el-form-item label="文件类型">
                    <el-input v-model="archiveForm.fileType" placeholder="请输入文件类型" />
                  </el-form-item>
                  <el-form-item label="MD5值">
                    <el-input v-model="archiveForm.md5Value" placeholder="请输入文件MD5值" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="操作人">
                <el-input v-model="archiveForm.operateBy" placeholder="请输入操作人" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleArchiveValidation">开始校验</el-button>
                <el-button @click="resetArchiveForm">重置</el-button>
              </el-form-item>
            </el-form>

            <div class="result-info" v-if="archiveResult">
              <el-divider />
              <h3>校验结果</h3>
              <div style="margin-bottom: 15px;">
                <el-button type="primary" @click="generateSingleReport">生成校验报告</el-button>
              </div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="校验状态">
                  <span :class="archiveResult.valid ? 'success' : 'fail'">
                    {{ archiveResult.valid ? '通过' : '不通过' }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="校验建议">{{ archiveResult.suggestion }}</el-descriptions-item>
              </el-descriptions>
              
              <h4 style="margin-top: 20px;">校验项详情</h4>
              <el-table :data="archiveResult.items" border style="width: 100%; margin-top: 10px;">
                <el-table-column prop="name" label="校验项名称" width="150" />
                <el-table-column prop="passed" label="校验结果" width="100">
                  <template #default="scope">
                    <span :class="scope.row.passed ? 'success' : 'fail'">
                      {{ scope.row.passed ? '通过' : '不通过' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="errorMsg" label="错误信息" />
                <el-table-column prop="type" label="校验类型" width="120" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="批量校验" name="batch">
          <div class="tab-content">
            <el-form :model="batchForm" label-width="120px">
              <el-form-item label="批量校验请求数据">
                <el-input
                  v-model="batchForm.validationRequests"
                  type="textarea"
                  :rows="8"
                  placeholder='请输入JSON格式的批量校验请求数据，例如：[{"archiveId": 1, "filePath": "/path/to/file.pdf", ...}]'
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleBatchValidation">开始批量校验</el-button>
                <el-button @click="resetBatchForm">重置</el-button>
              </el-form-item>
            </el-form>

            <div class="result-info" v-if="batchResult">
              <el-divider />
              <h3>批量校验结果</h3>
              <div style="margin-bottom: 15px;">
                <el-button type="primary" @click="generateBatchReport">生成校验报告</el-button>
              </div>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="校验总数">{{ batchResult.totalCount }}</el-descriptions-item>
                <el-descriptions-item label="通过数量">{{ batchResult.passCount }}</el-descriptions-item>
                <el-descriptions-item label="不通过数量">{{ batchResult.failCount }}</el-descriptions-item>
                <el-descriptions-item label="结果描述">{{ batchResult.description }}</el-descriptions-item>
              </el-descriptions>

              <el-table :data="batchResult.details" border style="width: 100%; margin-top: 20px;">
                <el-table-column prop="archiveId" label="档案ID" width="120" />
                <el-table-column prop="pass" label="校验结果" width="100">
                  <template #default="scope">
                    <span :class="scope.row.pass ? 'success' : 'fail'">
                      {{ scope.row.pass ? '通过' : '不通过' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="details" label="校验详情" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="手动修正" name="correct">
          <div class="tab-content">
            <el-form :model="correctForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="档案ID">
                    <el-input v-model="correctForm.archiveId" placeholder="请输入档案ID" />
                  </el-form-item>
                  <el-form-item label="档案分类">
                    <el-input v-model="correctForm.archiveType" placeholder="请输入档案分类" />
                  </el-form-item>
                  <el-form-item label="业务单号">
                    <el-input v-model="correctForm.businessNo" placeholder="请输入业务单号" />
                  </el-form-item>
                  <el-form-item label="责任人">
                    <el-input v-model="correctForm.responsiblePerson" placeholder="请输入责任人" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="所属部门">
                    <el-input v-model="correctForm.department" placeholder="请输入所属部门" />
                  </el-form-item>
                  <el-form-item label="文件路径">
                    <el-input v-model="correctForm.filePath" placeholder="请输入文件路径" />
                  </el-form-item>
                  <el-form-item label="文件类型">
                    <el-input v-model="correctForm.fileType" placeholder="请输入文件类型" />
                  </el-form-item>
                  <el-form-item label="MD5值">
                    <el-input v-model="correctForm.md5Value" placeholder="请输入文件MD5值" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="操作人">
                <el-input v-model="correctForm.operateBy" placeholder="请输入操作人" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleManualCorrect">开始修正</el-button>
                <el-button @click="resetCorrectForm">重置</el-button>
              </el-form-item>
            </el-form>

            <div class="result-info" v-if="correctResult">
              <el-divider />
              <h3>修正结果</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="修正状态">
                  <span :class="correctResult.code === 200 ? 'success' : 'fail'">
                    {{ correctResult.code === 200 ? '成功' : '失败' }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="响应消息">{{ correctResult.message }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { validateSingleHookApi, validateBatchHookApi, manualCorrectHookApi, generateSingleReportApi, generateBatchReportApi } from '../api/validation'

const activeTab = ref('archive')

// 档案校验
const archiveForm = reactive({
  archiveId: '',
  archiveType: '',
  businessNo: '',
  responsiblePerson: '',
  department: '',
  filePath: '',
  fileType: '',
  md5Value: '',
  operateBy: 'user'
})

const archiveResult = ref(null)

const handleArchiveValidation = async () => {
  if (!archiveForm.archiveId) {
    ElMessage.warning('请输入档案ID')
    return
  }

  try {
    const response = await validateSingleHookApi(archiveForm)
    archiveResult.value = response.data
    ElMessage.success('档案校验成功')
  } catch (error) {
    ElMessage.error('档案校验失败：' + error.message)
  }
}

const resetArchiveForm = () => {
  archiveForm.archiveId = ''
  archiveForm.archiveType = ''
  archiveForm.businessNo = ''
  archiveForm.responsiblePerson = ''
  archiveForm.department = ''
  archiveForm.filePath = ''
  archiveForm.fileType = ''
  archiveForm.md5Value = ''
  archiveForm.operateBy = 'user'
  archiveResult.value = null
}

// 批量校验
const batchForm = reactive({
  validationRequests: ''
})

const batchResult = ref(null)

const handleBatchValidation = async () => {
  if (!batchForm.validationRequests) {
    ElMessage.warning('请输入批量校验请求数据')
    return
  }

  try {
    // 解析批量校验请求数据（JSON格式）
    const validationRequests = JSON.parse(batchForm.validationRequests)
    if (!Array.isArray(validationRequests) || validationRequests.length === 0) {
      ElMessage.warning('请输入有效的批量校验请求数据')
      return
    }

    const response = await validateBatchHookApi(validationRequests)
    
    // 构建批量校验结果
    batchResult.value = {
      totalCount: validationRequests.length,
      passCount: response.data.filter(result => result.valid).length,
      failCount: response.data.filter(result => !result.valid).length,
      description: '批量校验完成',
      details: response.data.map((result, index) => ({
        archiveId: validationRequests[index].archiveId,
        pass: result.valid,
        details: result.suggestion
      }))
    }
    
    ElMessage.success('批量校验成功')
  } catch (error) {
    if (error instanceof SyntaxError) {
      ElMessage.error('批量校验请求数据格式错误：JSON格式无效')
    } else {
      ElMessage.error('批量校验失败：' + error.message)
    }
  }
}

const resetBatchForm = () => {
  batchForm.validationRequests = ''
  batchResult.value = null
}

// 手动修正
const correctForm = reactive({
  archiveId: '',
  archiveType: '',
  businessNo: '',
  responsiblePerson: '',
  department: '',
  filePath: '',
  fileType: '',
  md5Value: '',
  operateBy: 'user'
})

const correctResult = ref(null)

const handleManualCorrect = async () => {
  if (!correctForm.archiveId) {
    ElMessage.warning('请输入档案ID')
    return
  }

  try {
    const response = await manualCorrectHookApi(correctForm.archiveId, correctForm)
    correctResult.value = response.data
    ElMessage.success('手动修正成功')
  } catch (error) {
    ElMessage.error('手动修正失败：' + error.message)
  }
}

const resetCorrectForm = () => {
  correctForm.archiveId = ''
  correctForm.archiveType = ''
  correctForm.businessNo = ''
  correctForm.responsiblePerson = ''
  correctForm.department = ''
  correctForm.filePath = ''
  correctForm.fileType = ''
  correctForm.md5Value = ''
  correctForm.operateBy = 'user'
  correctResult.value = null
}

const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
}

// 生成单文件校验报告
const generateSingleReport = async () => {
  if (!archiveResult.value) {
    ElMessage.warning('请先执行单文件校验')
    return
  }

  try {
    const response = await generateSingleReportApi(archiveResult.value)
    if (response.code === 200) {
      downloadReport(JSON.stringify(response.data, null, 2), '单文件校验报告.json')
      ElMessage.success('单文件校验报告生成成功')
    } else {
      ElMessage.error('单文件校验报告生成失败：' + response.message)
    }
  } catch (error) {
    console.error('生成单文件校验报告失败:', error)
    ElMessage.error('生成单文件校验报告失败：' + error.message)
  }
}

// 生成批量校验报告
const generateBatchReport = async () => {
  if (!batchResult.value) {
    ElMessage.warning('请先执行批量校验')
    return
  }

  try {
    // 获取原始的批量校验结果，用于生成报告
    const validationResults = await validateBatchHookApi(JSON.parse(batchForm.validationRequests))
    const response = await generateBatchReportApi(validationResults.data)
    if (response.code === 200) {
      downloadReport(JSON.stringify(response.data, null, 2), '批量校验报告.json')
      ElMessage.success('批量校验报告生成成功')
    } else {
      ElMessage.error('批量校验报告生成失败：' + response.message)
    }
  } catch (error) {
    console.error('生成批量校验报告失败:', error)
    ElMessage.error('生成批量校验报告失败：' + error.message)
  }
}

// 下载报告
const downloadReport = (reportData, filename) => {
  const blob = new Blob([reportData], { type: 'application/json;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
</script>

<style scoped>
.validation-container {
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

.success {
  color: #67c23a;
}

.fail {
  color: #f56c6c;
}
</style>