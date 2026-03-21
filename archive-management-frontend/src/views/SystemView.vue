<template>
  <div class="system-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="接口配置" name="interface">
          <div class="tab-content">
            <el-button type="primary" @click="showAddInterfaceDialog" style="margin-bottom: 20px;">
              <el-icon><Plus /></el-icon>
              新增接口配置
            </el-button>

            <el-table :data="interfaces" border style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="interfaceName" label="接口名称" width="180" />
              <el-table-column prop="interfaceCode" label="接口编码" width="150" />
              <el-table-column prop="businessSystem" label="业务系统" width="150" />
              <el-table-column prop="interfaceUrl" label="接口URL" width="300" show-overflow-tooltip />
              <el-table-column prop="metadataUrl" label="元信息URL" width="300" show-overflow-tooltip />
              <el-table-column prop="requestMethod" label="请求方法" width="100" />
              <el-table-column prop="transferMode" label="传输模式" width="100" />
              <el-table-column prop="maxFileSize" label="最大文件大小" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @change="handleStatusChange(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column label="操作" width="180">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="showEditInterfaceDialog(scope.row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" @click="handleDeleteInterface(scope.row.id)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              v-if="interfaceTotal > 0"
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="interfaceTotal"
              layout="prev, pager, next, sizes, jumper"
              @update:current-page="handlePageChange"
              style="margin-top: 20px; text-align: right;"
            />

            <!-- 新增/编辑接口配置对话框 -->
            <el-dialog v-model="interfaceDialogVisible" title="接口配置" width="60%">
              <el-form :model="interfaceForm" label-width="120px" :rules="interfaceRules" ref="interfaceFormRef">
                <el-form-item label="接口名称" prop="interfaceName">
                  <el-input v-model="interfaceForm.interfaceName" placeholder="请输入接口名称" />
                </el-form-item>
                <el-form-item label="接口编码" prop="interfaceCode">
                  <el-input v-model="interfaceForm.interfaceCode" placeholder="请输入接口编码" />
                </el-form-item>
                <el-form-item label="业务系统" prop="businessSystem">
                  <el-input v-model="interfaceForm.businessSystem" placeholder="请输入业务系统名称" />
                </el-form-item>
                <el-form-item label="接口URL" prop="interfaceUrl">
                  <el-input v-model="interfaceForm.interfaceUrl" placeholder="请输入接口URL" />
                </el-form-item>
                <el-form-item label="元信息URL" prop="metadataUrl">
                  <el-input v-model="interfaceForm.metadataUrl" placeholder="请输入文件元信息接口URL" />
                </el-form-item>
                <el-form-item label="请求方法" prop="requestMethod">
                  <el-select v-model="interfaceForm.requestMethod" placeholder="请选择请求方法">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                  </el-select>
                </el-form-item>
                <el-form-item label="请求参数">
                  <el-input
                    v-model="interfaceForm.requestParams"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入请求参数（JSON格式）"
                  />
                </el-form-item>
                <el-form-item label="请求头">
                  <el-input
                    v-model="interfaceForm.requestHeaders"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入请求头（JSON格式）"
                  />
                </el-form-item>
                <el-form-item label="接口密钥">
                  <el-input v-model="interfaceForm.secretKey" placeholder="请输入接口密钥" />
                </el-form-item>
                <el-form-item label="超时时间">
                  <el-input v-model="interfaceForm.timeout" placeholder="请输入超时时间（秒）" type="number" min="1" max="300" />
                </el-form-item>
                <el-form-item label="单文件大小限制">
                  <el-input v-model="interfaceForm.maxFileSize" placeholder="请输入单文件大小限制（MB）" type="number" min="1" max="1024" />
                </el-form-item>
                <el-form-item label="传输模式" prop="transferMode">
                  <el-select v-model="interfaceForm.transferMode" placeholder="请选择传输模式">
                    <el-option label="直传（DIRECT）" value="DIRECT" />
                    <el-option label="分片（SHARD）" value="SHARD" />
                  </el-select>
                </el-form-item>
                <el-form-item label="采集调度规则">
                  <el-input v-model="interfaceForm.cronExpression" placeholder="请输入Cron表达式，如：0 0 2 * * ?" />
                </el-form-item>
                <el-form-item label="分片大小">
                  <el-input v-model="interfaceForm.chunkSize" placeholder="请输入分片大小（MB）" type="number" min="1" max="100" />
                </el-form-item>
                <el-form-item label="文件存储路径">
                  <el-input v-model="interfaceForm.storagePath" placeholder="请输入文件存储路径" />
                </el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="interfaceDialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="handleSaveInterface">保存</el-button>
                </span>
              </template>
            </el-dialog>
          </div>
        </el-tab-pane>

        <el-tab-pane label="系统参数" name="params">
          <div class="tab-content">
            <el-form :model="paramForm" label-width="150px" style="max-width: 800px;">
              <el-form-item label="文件最大上传大小">
                <el-input v-model="paramForm.maxFileSize" placeholder="请输入文件最大上传大小（MB）" />
              </el-form-item>
              <el-form-item label="批量上传最大数量">
                <el-input v-model="paramForm.maxBatchSize" placeholder="请输入批量上传最大数量" />
              </el-form-item>
              <el-form-item label="默认存储路径">
                <el-input v-model="paramForm.defaultStoragePath" placeholder="请输入默认存储路径" />
              </el-form-item>
              <el-form-item label="日志保留天数">
                <el-input v-model="paramForm.logRetentionDays" placeholder="请输入日志保留天数" />
              </el-form-item>
              <el-form-item label="自动挂接频率">
                <el-select v-model="paramForm.autoHangOnFrequency" placeholder="请选择自动挂接频率">
                  <el-option label="每天" value="daily" />
                  <el-option label="每周" value="weekly" />
                  <el-option label="每月" value="monthly" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveParams">保存参数</el-button>
                <el-button @click="resetParamForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import {
  getInterfaceConfigsApi,
  addInterfaceConfigApi,
  updateInterfaceConfigApi,
  deleteInterfaceConfigApi,
  updateInterfaceConfigStatusApi
} from '../api/interfaceConfig'
import {
  getAllSystemParamsApi,
  saveSystemParamsApi
} from '../api/systemParam'

const activeTab = ref('interface')

// 接口配置
const interfaces = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const interfaceTotal = ref(0)
const interfaceDialogVisible = ref(false)
const interfaceForm = reactive({})
const interfaceFormRef = ref(null)

const interfaceRules = {
  interfaceName: [
    { required: true, message: '请输入接口名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  interfaceCode: [
    { required: true, message: '请输入接口编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  businessSystem: [
    { required: true, message: '请输入业务系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  interfaceUrl: [
    { required: true, message: '请输入接口URL', trigger: 'blur' }
  ],
  metadataUrl: [
    { required: true, message: '请输入文件元信息接口URL', trigger: 'blur' }
  ],
  requestMethod: [
    { required: true, message: '请选择请求方法', trigger: 'change' }
  ],
  transferMode: [
    { required: true, message: '请选择传输模式', trigger: 'change' }
  ]
}

const getInterfaces = async () => {
  try {
    // 调用API获取接口配置列表
    const params = {
      current: currentPage.value,
      size: pageSize.value
    }
    
    const response = await getInterfaceConfigsApi(params)
    if (response.code === 200) {
      interfaces.value = response.data.records
      interfaceTotal.value = response.data.total
      ElMessage.success('获取接口配置成功')
    } else {
      ElMessage.error('获取接口配置失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('获取接口配置失败：' + error.message)
  }
}

const showAddInterfaceDialog = () => {
  resetInterfaceForm()
  interfaceDialogVisible.value = true
}

const showEditInterfaceDialog = (row) => {
  Object.assign(interfaceForm, row)
  interfaceDialogVisible.value = true
}

const resetInterfaceForm = () => {
  if (interfaceFormRef.value) {
    interfaceFormRef.value.resetFields()
  }
  Object.keys(interfaceForm).forEach(key => {
    delete interfaceForm[key]
  })
}

const handleSaveInterface = async () => {
  if (!interfaceFormRef.value) return

  await interfaceFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response
        if (interfaceForm.id) {
          // 编辑接口配置
          response = await updateInterfaceConfigApi(interfaceForm.id, interfaceForm)
        } else {
          // 新增接口配置
          response = await addInterfaceConfigApi(interfaceForm)
        }
        
        if (response.code === 200) {
          ElMessage.success(interfaceForm.id ? '编辑接口配置成功' : '新增接口配置成功')
          interfaceDialogVisible.value = false
          getInterfaces() // 刷新列表
        } else {
          ElMessage.error(interfaceForm.id ? '编辑接口配置失败：' + response.message : '新增接口配置失败：' + response.message)
        }
      } catch (error) {
        ElMessage.error('保存接口配置失败：' + error.message)
      }
    }
  })
}

const handleDeleteInterface = async (id) => {
  try {
    // 调用API删除接口配置
    const response = await deleteInterfaceConfigApi(id)
    if (response.code === 200) {
      ElMessage.success('删除接口配置成功')
      getInterfaces() // 刷新列表
    } else {
      ElMessage.error('删除接口配置失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('删除接口配置失败：' + error.message)
  }
}

const handleStatusChange = async (row) => {
  try {
    // 调用API更新接口配置状态
    const response = await updateInterfaceConfigStatusApi(row.id, row.status)
    if (response.code === 200) {
      ElMessage.success('更新接口状态成功')
    } else {
      // 回滚状态
      row.status = row.status === 1 ? 0 : 1
      ElMessage.error('更新接口状态失败：' + response.message)
    }
  } catch (error) {
    // 回滚状态
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('更新接口状态失败：' + error.message)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  getInterfaces()
}

// 系统参数
const paramForm = reactive({
  maxFileSize: '',
  maxBatchSize: '',
  defaultStoragePath: '',
  logRetentionDays: '',
  autoHangOnFrequency: ''
})

// 获取系统参数
const getSystemParams = async () => {
  try {
    const response = await getAllSystemParamsApi()
    if (response.code === 200) {
      const params = response.data
      // 将获取到的系统参数赋值给表单
      paramForm.maxFileSize = params.maxFileSize || ''
      paramForm.maxBatchSize = params.maxBatchSize || ''
      paramForm.defaultStoragePath = params.defaultStoragePath || ''
      paramForm.logRetentionDays = params.logRetentionDays || ''
      paramForm.autoHangOnFrequency = params.autoHangOnFrequency || ''
    } else {
      ElMessage.error('获取系统参数失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('获取系统参数失败：' + error.message)
  }
}

// 保存系统参数
const handleSaveParams = async () => {
  try {
    // 准备保存的数据
    const paramMap = {
      maxFileSize: paramForm.maxFileSize,
      maxBatchSize: paramForm.maxBatchSize,
      defaultStoragePath: paramForm.defaultStoragePath,
      logRetentionDays: paramForm.logRetentionDays,
      autoHangOnFrequency: paramForm.autoHangOnFrequency
    }
    
    const response = await saveSystemParamsApi(paramMap)
    if (response.code === 200 && response.data) {
      ElMessage.success('保存系统参数成功')
    } else {
      ElMessage.error('保存系统参数失败：' + (response.message || '未知错误'))
    }
  } catch (error) {
    ElMessage.error('保存系统参数失败：' + error.message)
  }
}

const resetParamForm = () => {
  paramForm.maxFileSize = ''
  paramForm.maxBatchSize = ''
  paramForm.defaultStoragePath = ''
  paramForm.logRetentionDays = ''
  paramForm.autoHangOnFrequency = ''
}

const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
  // 当切换到系统参数标签页时，获取最新的系统参数
  if (tab.props.name === 'params') {
    getSystemParams()
  }
}

onMounted(() => {
  getInterfaces()
  // 如果默认显示系统参数标签页，获取系统参数
  if (activeTab.value === 'params') {
    getSystemParams()
  }
})
</script>

<style scoped>
.system-container {
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
</style>