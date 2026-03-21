<template>
  <div class="collection-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>档案采集</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="自动接口采集" name="auto">
          <div class="tab-content">
            <el-form :model="autoForm" label-width="120px">
              <el-form-item label="接口配置">
                <el-select v-model="autoForm.interfaceId" placeholder="请选择接口配置">
                  <el-option
                    v-for="option in interfaceOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleAutoCollect">开始采集</el-button>
                <el-button @click="resetAutoForm">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 进度显示 -->
            <div class="progress-info" v-if="autoProgress">
              <el-divider />
              <h3>采集进度</h3>
              <el-progress :percentage="autoProgress.progress" :status="autoProgress.status === 1 ? 'success' : (autoProgress.status === 2 ? 'exception' : 'active')" :stroke-width="20" show-text>
                <template #text>
                  <span>{{ autoProgress.description }}</span>
                </template>
              </el-progress>
              <div class="progress-details" style="margin-top: 10px;">
                <span>已处理：{{ autoProgress.processedCount }}/{{ autoProgress.totalCount }}</span>
              </div>
            </div>

            <div class="result-info" v-if="autoResult">
              <el-divider />
              <h3>采集结果</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="采集总数">{{ autoResult.totalCount }}</el-descriptions-item>
                <el-descriptions-item label="成功数量">{{ autoResult.successCount }}</el-descriptions-item>
                <el-descriptions-item label="失败数量">{{ autoResult.failCount }}</el-descriptions-item>
                <el-descriptions-item label="结果描述">{{ autoResult.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="手动上传采集" name="manual">
          <div class="tab-content">
            <el-upload
              class="upload-demo"
              action=""
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="manualFiles"
              multiple
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传 PDF 文件，单个文件不超过 50MB
                </div>
              </template>
            </el-upload>

            <el-form :model="manualForm" label-width="120px" style="margin-top: 20px;">
              <el-form-item label="档案类型">
                <el-select v-model="manualForm.archiveType" placeholder="请选择档案类型">
                  <el-option label="文书档案" value="1" />
                  <el-option label="科技档案" value="2" />
                  <el-option label="会计档案" value="3" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleManualUpload" :disabled="manualFiles.length === 0">上传采集</el-button>
                <el-button @click="resetManualForm">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 进度显示 -->
            <div class="progress-info" v-if="manualProgress">
              <el-divider />
              <h3>采集进度</h3>
              <el-progress :percentage="manualProgress.progress" :status="manualProgress.status === 1 ? 'success' : (manualProgress.status === 2 ? 'exception' : 'active')" :stroke-width="20" show-text>
                <template #text>
                  <span>{{ manualProgress.description }}</span>
                </template>
              </el-progress>
              <div class="progress-details" style="margin-top: 10px;">
                <span>已处理：{{ manualProgress.processedCount }}/{{ manualProgress.totalCount }}</span>
              </div>
            </div>

            <div class="result-info" v-if="manualResult">
              <el-divider />
              <h3>采集结果</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="采集总数">{{ manualResult.totalCount }}</el-descriptions-item>
                <el-descriptions-item label="成功数量">{{ manualResult.successCount }}</el-descriptions-item>
                <el-descriptions-item label="失败数量">{{ manualResult.failCount }}</el-descriptions-item>
                <el-descriptions-item label="结果描述">{{ manualResult.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="批量上传采集" name="batch">
          <div class="tab-content">
            <el-upload
              class="upload-demo"
              action=""
              :auto-upload="false"
              :on-change="handleBatchFileChange"
              :file-list="batchFiles"
              multiple
            >
              <el-button type="primary">选择多个文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持批量上传 PDF、DOC、DOCX 文件，单个文件不超过 100MB
                </div>
              </template>
            </el-upload>

            <el-form :model="batchForm" label-width="120px" style="margin-top: 20px;">
              <el-form-item label="档案类型">
                <el-select v-model="batchForm.archiveType" placeholder="请选择档案类型">
                  <el-option label="文书档案" value="1" />
                  <el-option label="科技档案" value="2" />
                  <el-option label="会计档案" value="3" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleBatchUpload" :disabled="batchFiles.length === 0">批量上传</el-button>
                <el-button @click="resetBatchForm">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 进度显示 -->
            <div class="progress-info" v-if="batchProgress">
              <el-divider />
              <h3>采集进度</h3>
              <el-progress :percentage="batchProgress.progress" :status="batchProgress.status === 1 ? 'success' : (batchProgress.status === 2 ? 'exception' : 'active')" :stroke-width="20" show-text>
                <template #text>
                  <span>{{ batchProgress.description }}</span>
                </template>
              </el-progress>
              <div class="progress-details" style="margin-top: 10px;">
                <span>已处理：{{ batchProgress.processedCount }}/{{ batchProgress.totalCount }}</span>
              </div>
            </div>

            <div class="result-info" v-if="batchResult">
              <el-divider />
              <h3>采集结果</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="采集总数">{{ batchResult.totalCount }}</el-descriptions-item>
                <el-descriptions-item label="成功数量">{{ batchResult.successCount }}</el-descriptions-item>
                <el-descriptions-item label="失败数量">{{ batchResult.failCount }}</el-descriptions-item>
                <el-descriptions-item label="结果描述">{{ batchResult.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="外部导入采集" name="external">
          <div class="tab-content">
            <el-form :model="externalForm" label-width="120px">
              <el-form-item label="导入文件">
                <el-upload
                  class="upload-demo"
                  action=""
                  :auto-upload="false"
                  :on-change="handleExternalFileChange"
                  :file-list="externalFiles"
                >
                  <el-button type="primary">选择导入文件</el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持导入 Excel 文件，文件不超过 50MB
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
              <el-form-item label="档案类型">
                <el-select v-model="externalForm.archiveType" placeholder="请选择档案类型">
                  <el-option label="文书档案" value="1" />
                  <el-option label="科技档案" value="2" />
                  <el-option label="会计档案" value="3" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleExternalImport" :disabled="externalFiles.length === 0">开始导入</el-button>
                <el-button @click="resetExternalForm">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 进度显示 -->
            <div class="progress-info" v-if="externalProgress">
              <el-divider />
              <h3>采集进度</h3>
              <el-progress :percentage="externalProgress.progress" :status="externalProgress.status === 1 ? 'success' : (externalProgress.status === 2 ? 'exception' : 'active')" :stroke-width="20" show-text>
                <template #text>
                  <span>{{ externalProgress.description }}</span>
                </template>
              </el-progress>
              <div class="progress-details" style="margin-top: 10px;">
                <span>已处理：{{ externalProgress.processedCount }}/{{ externalProgress.totalCount }}</span>
              </div>
            </div>

            <div class="result-info" v-if="externalResult">
              <el-divider />
              <h3>采集结果</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="采集总数">{{ externalResult.totalCount }}</el-descriptions-item>
                <el-descriptions-item label="成功数量">{{ externalResult.successCount }}</el-descriptions-item>
                <el-descriptions-item label="失败数量">{{ externalResult.failCount }}</el-descriptions-item>
                <el-descriptions-item label="结果描述">{{ externalResult.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { ElMessage, ElProgress } from 'element-plus'
import { autoCollectApi, manualUploadApi, batchUploadApi, externalImportApi, uploadChunkApi, mergeChunksApi, checkChunkApi, checkFileApi, getCollectionProgressApi } from '../api/collection'
import { getInterfaceConfigsApi } from '../api/interfaceConfig'

// 分片大小（10MB）
const CHUNK_SIZE = 10 * 1024 * 1024

// 计算文件MD5（简化版本，使用时间戳+随机数作为临时MD5）
const calculateFileMd5 = (file) => {
  // 简化实现，实际项目中应该使用真正的MD5计算
  return Promise.resolve(Date.now() + '_' + Math.random().toString(36).substr(2, 9))
}

// 分片上传函数
const uploadFileInChunks = async (file, uploadType, archiveType, metadata, operateBy) => {
  try {
    // 计算文件MD5
    const fileMd5 = await calculateFileMd5(file)
    
    // 检查文件是否已上传
    const checkFileResponse = await checkFileApi(fileMd5)
    if (checkFileResponse.code === 200 && checkFileResponse.data) {
      ElMessage.success(`${file.name} 已上传完成`)
      return true
    }
    
    // 计算分片数量
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    
    // 上传进度
    const progress = ref(0)
    const uploadProgress = ref({
      total: totalChunks,
      uploaded: 0
    })
    
    // 显示上传进度
    const progressDialog = ElMessage({
      message: h(ElProgress, {
        percentage: progress.value,
        textInside: true,
        strokeWidth: 2
      }),
      duration: 0,
      type: 'info'
    })
    
    // 上传所有分片
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // 检查分片是否已上传
      const checkChunkResponse = await checkChunkApi(fileMd5, chunkIndex)
      if (checkChunkResponse.code === 200 && checkChunkResponse.data) {
        uploadProgress.value.uploaded++
        progress.value = Math.round((uploadProgress.value.uploaded / uploadProgress.value.total) * 100)
        continue
      }
      
      // 分割分片
      const start = chunkIndex * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)
      
      // 创建FormData
      const formData = new FormData()
      formData.append('fileMd5', fileMd5)
      formData.append('chunkIndex', chunkIndex)
      formData.append('totalChunks', totalChunks)
      formData.append('chunkSize', CHUNK_SIZE)
      formData.append('currentChunkSize', end - start)
      formData.append('totalSize', file.size)
      formData.append('fileName', file.name)
      formData.append('fileType', file.type)
      formData.append('uploadType', uploadType)
      formData.append('archiveType', archiveType)
      formData.append('metadata', metadata)
      formData.append('operateBy', operateBy)
      formData.append('chunk', chunk)
      
      // 上传分片
      const uploadResponse = await uploadChunkApi(formData)
      if (uploadResponse.code !== 200) {
        throw new Error(`分片上传失败：${uploadResponse.message}`)
      }
      
      // 更新进度
      uploadProgress.value.uploaded++
      progress.value = Math.round((uploadProgress.value.uploaded / uploadProgress.value.total) * 100)
    }
    
    // 合并分片
    const mergeResponse = await mergeChunksApi({
      fileMd5,
      fileName: file.name,
      totalSize: file.size,
      totalChunks,
      uploadType,
      archiveType,
      metadata,
      operateBy
    })
    
    if (mergeResponse.code !== 200) {
      throw new Error(`分片合并失败：${mergeResponse.message}`)
    }
    
    // 关闭进度提示
    progressDialog.close()
    ElMessage.success(`${file.name} 上传成功`)
    return true
  } catch (error) {
    console.error('文件上传失败：', error)
    ElMessage.error(`文件上传失败：${error.message}`)
    return false
  }
}

const activeTab = ref('auto')

// 接口配置列表
const interfaceOptions = ref([])

// 自动采集
const autoForm = reactive({
  interfaceId: ''
})

const autoResult = ref(null)
const autoProgress = ref(null)
const progressInterval = ref(null)

// 进度查询函数
const checkProgress = async (taskId, progressRef, resultRef) => {
  try {
    const response = await getCollectionProgressApi(taskId)
    if (response.code === 200) {
      progressRef.value = response.data
      // 如果进度已完成或失败，停止查询
      if (response.data.status === 1 || response.data.status === 2) {
        if (progressInterval.value) {
          clearInterval(progressInterval.value)
          progressInterval.value = null
        }
      }
    }
  } catch (error) {
    console.error('查询进度失败：', error)
  }
}

const handleAutoCollect = async () => {
  if (!autoForm.interfaceId) {
    ElMessage.warning('请选择接口配置')
    return
  }

  try {
    const response = await autoCollectApi(autoForm.interfaceId)
    if (response.code === 200) {
      autoResult.value = response.data
      // 如果返回了taskId，开始查询进度
      if (response.data.taskId) {
        // 清除之前的进度
        autoProgress.value = null
        // 设置定时器，每秒查询一次进度
        if (progressInterval.value) {
          clearInterval(progressInterval.value)
        }
        progressInterval.value = setInterval(() => {
          checkProgress(response.data.taskId, autoProgress, autoResult)
        }, 1000)
        // 立即查询一次进度
        checkProgress(response.data.taskId, autoProgress, autoResult)
      }
      ElMessage.success('自动采集成功')
    } else {
      ElMessage.error('自动采集失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('自动采集失败：' + error.message)
  }
}

const resetAutoForm = () => {
  autoForm.interfaceId = ''
  autoResult.value = null
  autoProgress.value = null
  // 清除定时器
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
}

// 手动上传
const manualForm = reactive({
  archiveType: ''
})

const manualFiles = ref([])
const manualResult = ref(null)
const manualProgress = ref(null)

const handleFileChange = (file) => {
  manualFiles.value.push(file)
}

const handleManualUpload = async () => {
  if (manualFiles.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }

  if (!manualForm.archiveType) {
    ElMessage.warning('请选择档案类型')
    return
  }

  try {
    // 创建FormData
    const formData = new FormData()
    formData.append('archiveType', manualForm.archiveType)
    formData.append('metadata', '{"title":"手动上传测试","author":"user"}')
    formData.append('operateBy', 'user')
    // 添加文件
    manualFiles.value.forEach(fileItem => {
      formData.append('files', fileItem.raw)
    })
    
    // 调用手动上传API
    const response = await manualUploadApi(formData)
    if (response.code === 200) {
      manualResult.value = response.data
      // 如果返回了taskId，开始查询进度
      if (response.data.taskId) {
        // 清除之前的进度
        manualProgress.value = null
        // 设置定时器，每秒查询一次进度
        if (progressInterval.value) {
          clearInterval(progressInterval.value)
        }
        progressInterval.value = setInterval(() => {
          checkProgress(response.data.taskId, manualProgress, manualResult)
        }, 1000)
        // 立即查询一次进度
        checkProgress(response.data.taskId, manualProgress, manualResult)
      }
      ElMessage.success('手动上传成功')
    } else {
      ElMessage.error('手动上传失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('手动上传失败：' + error.message)
  }
}

const resetManualForm = () => {
  manualForm.archiveType = ''
  manualFiles.value = []
  manualResult.value = null
  manualProgress.value = null
  // 清除定时器
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
}

// 批量上传
const batchForm = reactive({
  archiveType: ''
})

const batchFiles = ref([])
const batchResult = ref(null)
const batchProgress = ref(null)

const handleBatchFileChange = (file) => {
  batchFiles.value.push(file)
}

const handleBatchUpload = async () => {
  if (batchFiles.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }

  if (!batchForm.archiveType) {
    ElMessage.warning('请选择档案类型')
    return
  }

  try {
    // 创建FormData
    const formData = new FormData()
    formData.append('archiveType', batchForm.archiveType)
    formData.append('metadata', '{"title":"批量上传测试","author":"user"}')
    formData.append('operateBy', 'user')
    // 添加文件
    batchFiles.value.forEach(fileItem => {
      formData.append('files', fileItem.raw)
    })
    
    // 调用批量上传API
    const response = await batchUploadApi(formData)
    if (response.code === 200) {
      batchResult.value = response.data
      // 如果返回了taskId，开始查询进度
      if (response.data.taskId) {
        // 清除之前的进度
        batchProgress.value = null
        // 设置定时器，每秒查询一次进度
        if (progressInterval.value) {
          clearInterval(progressInterval.value)
        }
        progressInterval.value = setInterval(() => {
          checkProgress(response.data.taskId, batchProgress, batchResult)
        }, 1000)
        // 立即查询一次进度
        checkProgress(response.data.taskId, batchProgress, batchResult)
      }
      ElMessage.success('批量上传成功')
    } else {
      ElMessage.error('批量上传失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('批量上传失败：' + error.message)
  }
}

const resetBatchForm = () => {
  batchForm.archiveType = ''
  batchFiles.value = []
  batchResult.value = null
  batchProgress.value = null
  // 清除定时器
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
}

// 外部导入
const externalForm = reactive({
  archiveType: ''
})

const externalFiles = ref([])
const externalResult = ref(null)
const externalProgress = ref(null)

const handleExternalFileChange = (file) => {
  externalFiles.value = [file]
}

const handleExternalImport = async () => {
  if (externalFiles.value.length === 0) {
    ElMessage.warning('请选择导入文件')
    return
  }

  if (!externalForm.archiveType) {
    ElMessage.warning('请选择档案类型')
    return
  }

  try {
    // 创建FormData
    const formData = new FormData()
    formData.append('archiveType', externalForm.archiveType)
    formData.append('metadata', '{"title":"外部导入测试","author":"user"}')
    formData.append('operateBy', 'user')
    // 添加文件
    externalFiles.value.forEach(fileItem => {
      formData.append('files', fileItem.raw)
    })
    
    // 调用外部导入API
    const response = await externalImportApi(formData)
    if (response.code === 200) {
      externalResult.value = response.data
      // 如果返回了taskId，开始查询进度
      if (response.data.taskId) {
        // 清除之前的进度
        externalProgress.value = null
        // 设置定时器，每秒查询一次进度
        if (progressInterval.value) {
          clearInterval(progressInterval.value)
        }
        progressInterval.value = setInterval(() => {
          checkProgress(response.data.taskId, externalProgress, externalResult)
        }, 1000)
        // 立即查询一次进度
        checkProgress(response.data.taskId, externalProgress, externalResult)
      }
      ElMessage.success('外部导入成功')
    } else {
      ElMessage.error('外部导入失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('外部导入失败：' + error.message)
  }
}

const resetExternalForm = () => {
  externalForm.archiveType = ''
  externalFiles.value = []
  externalResult.value = null
  externalProgress.value = null
  // 清除定时器
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
}

const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
}

// 获取接口配置列表
const getInterfaceOptions = async () => {
  try {
    const response = await getInterfaceConfigsApi()
    if (response.code === 200) {
      // 将接口配置转换为选项格式，只显示接口编码
      interfaceOptions.value = response.data.records.map(config => ({
        label: config.businessSystem,
        value: config.id
      }))
    }
  } catch (error) {
    console.error('获取接口配置列表失败：', error)
  }
}

// 组件加载时获取接口配置列表
onMounted(() => {
  getInterfaceOptions()
})
</script>

<style scoped>
.collection-container {
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

.upload-demo {
  margin-bottom: 20px;
}
</style>