<template>
  <div class="hang-on-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>挂接管理</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="手动挂接" name="manual">
          <div class="tab-content">
            <el-form :model="manualForm" label-width="120px">
              <el-form-item label="档案ID">
                <el-input v-model="manualForm.archiveId" placeholder="请输入档案ID" />
              </el-form-item>
              <el-form-item label="目标系统">
                <el-select v-model="manualForm.systemCode" placeholder="请选择目标系统" multiple>
                  <el-option
                    v-for="option in systemOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="操作人">
                <el-input v-model="manualForm.operateBy" placeholder="请输入操作人" disabled />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleManualHangOn" :loading="manualLoading">开始挂接</el-button>
                <el-button @click="resetManualForm">重置</el-button>
              </el-form-item>
            </el-form>

            <div class="result-info" v-if="manualResult">
              <el-divider />
              <h3>挂接结果</h3>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="挂接状态">
                  <span :class="manualResult.success ? 'success' : 'fail'">
                    {{ manualResult.success ? '成功' : '失败' }}
                  </span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="批量挂接" name="batch">
          <div class="tab-content">
            <el-form :model="batchForm" label-width="120px">
              <el-form-item label="档案ID列表">
                <el-input
                  v-model="batchForm.archiveIds"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入档案ID，多个ID用逗号分隔"
                />
              </el-form-item>
              <el-form-item label="目标系统">
                <el-select v-model="batchForm.systemCode" placeholder="请选择目标系统" multiple>
                  <el-option
                    v-for="option in systemOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="操作人">
                <el-input v-model="batchForm.operateBy" placeholder="请输入操作人" disabled />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleBatchHangOn" :loading="batchLoading">开始批量挂接</el-button>
                <el-button @click="resetBatchForm">重置</el-button>
              </el-form-item>
            </el-form>

            <div class="result-info" v-if="batchResult">
              <el-divider />
              <h3>挂接结果</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="挂接总数">{{ batchResult.totalCount }}</el-descriptions-item>
                <el-descriptions-item label="成功数量">{{ batchResult.successCount }}</el-descriptions-item>
                <el-descriptions-item label="失败数量">{{ batchResult.failCount }}</el-descriptions-item>
                <el-descriptions-item label="结果描述">{{ batchResult.description }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="挂接关系查询" name="relations">
          <div class="tab-content">
            <div class="filter-section">
              <el-form :model="relationForm" label-width="120px">
                <el-form-item label="档案ID">
                  <el-input v-model="relationForm.archiveId" placeholder="请输入档案ID" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleGetRelations" :loading="relationsLoading">查询挂接关系</el-button>
                  <el-button @click="resetRelationForm">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <div class="table-section">
              <el-table :data="relations" border style="width: 100%" fit :loading="relationsLoading">
                <el-table-column prop="id" label="ID" min-width="80" />
                <el-table-column prop="archiveId" label="档案ID" min-width="120" />
                <el-table-column prop="systemCode" label="系统代码" min-width="150" />
                <el-table-column prop="systemName" label="系统名称" min-width="150" />
                <el-table-column prop="hangOnTime" label="挂接时间" min-width="200" />
                <el-table-column prop="status" label="状态" min-width="100" />
                <el-table-column prop="operateBy" label="操作人" min-width="100" />
                <el-table-column label="操作" min-width="200">
                  <template #default="scope">
                    <el-button type="danger" size="small" @click="handleUnhook(scope.row)">
                      解除挂接
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="挂接日志查询" name="logs">
          <div class="tab-content">
            <div class="filter-section">
              <el-form :model="logForm" label-width="120px" inline>
                <el-form-item label="档案ID">
                  <el-input v-model="logForm.archiveId" placeholder="请输入档案ID" />
                </el-form-item>
                <el-form-item label="挂接类型">
                  <el-select v-model="logForm.hangOnType" placeholder="请选择挂接类型">
                    <el-option label="自动挂接" value="1" />
                    <el-option label="手动挂接" value="2" />
                    <el-option label="解除挂接" value="3" />
                  </el-select>
                </el-form-item>
                <el-form-item label="挂接结果">
                  <el-select v-model="logForm.result" placeholder="请选择挂接结果">
                    <el-option label="成功" value="1" />
                    <el-option label="失败" value="2" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleGetLogs" :loading="logsLoading">查询日志</el-button>
                  <el-button @click="resetLogForm">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <div class="table-section">
              <el-table :data="logs" border style="width: 100%" fit :loading="logsLoading">
                <el-table-column prop="id" label="日志ID" min-width="100" />
                <el-table-column prop="archiveId" label="档案ID" min-width="120" />
                <el-table-column prop="hangOnType" label="挂接类型" min-width="120">
                  <template #default="scope">
                    {{ scope.row.hangOnType === 0 ? '自动挂接' : (scope.row.hangOnType === 1 ? '手动挂接' : '解除挂接') }}
                  </template>
                </el-table-column>
                <el-table-column prop="result" label="挂接结果" min-width="100">
                  <template #default="scope">
                    <span :class="scope.row.result === 1 ? 'success' : 'fail'">
                      {{ scope.row.result === 1 ? '成功' : '失败' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="operateBy" label="操作人" min-width="100" />
                <el-table-column prop="description" label="挂接描述" min-width="200"/>
                <el-table-column prop="errorInfo" label="错误信息" min-width="200"/>
                <el-table-column prop="createTime" label="创建时间" min-width="200" />
              </el-table>

              <div class="pagination-section">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="logTotal"
                  @size-change="handleSizeChange"
                  @current-change="handlePageChange"
                  :loading="logsLoading"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 修改挂接关系对话框 -->
      <el-dialog v-model="modifyDialogVisible" title="修改挂接关系" width="50%">
        <el-form :model="modifyForm" label-width="120px">
          <el-form-item label="档案ID" prop="archiveId">
            <el-input v-model="modifyForm.archiveId" disabled />
          </el-form-item>
          <el-form-item label="系统代码" prop="systemCode">
            <el-input v-model="modifyForm.systemCode" disabled />
          </el-form-item>
          <el-form-item label="操作人" prop="operateBy">
            <el-input v-model="modifyForm.operateBy" placeholder="请输入操作人" />
          </el-form-item>
          <el-form-item label="档案分类" prop="archiveType">
            <el-input v-model="modifyForm.archiveType" placeholder="请输入档案分类" />
          </el-form-item>
          <el-form-item label="业务单号" prop="businessNo">
            <el-input v-model="modifyForm.businessNo" placeholder="请输入业务单号" />
          </el-form-item>
          <el-form-item label="业务类型" prop="businessType">
            <el-input v-model="modifyForm.businessType" placeholder="请输入业务类型" />
          </el-form-item>
          <el-form-item label="责任人" prop="responsiblePerson">
            <el-input v-model="modifyForm.responsiblePerson" placeholder="请输入责任人" />
          </el-form-item>
          <el-form-item label="所属部门" prop="department">
            <el-input v-model="modifyForm.department" placeholder="请输入所属部门" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="modifyDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSaveModify" :loading="modifyLoading">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { manualHangOnApi, batchHangOnApi, getRelationsApi, getLogsApi, unhookApi, modifyHangOnRelationApi, checkHangOnValidApi } from '../api/hangOn'
import { getInterfaceConfigsApi } from '../api/interfaceConfig'

// 获取当前登录用户信息
const getCurrentUser = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  return userInfoStr ? JSON.parse(userInfoStr).username : 'unknown'
}

const activeTab = ref('manual')

// 目标系统列表
const systemOptions = ref([])
const systemOptionsLoading = ref(false)

// 手动挂接
const manualForm = reactive({
  archiveId: '',
  systemCode: [],
  operateBy: getCurrentUser()
})

const manualResult = ref(null)
const manualLoading = ref(false)

const handleManualHangOn = async () => {
  if (!manualForm.archiveId) {
    ElMessage.warning('请输入档案ID')
    return
  }

  if (manualForm.systemCode.length === 0) {
    ElMessage.warning('请选择至少一个目标系统')
    return
  }

  try {
    manualLoading.value = true
    
    // 调用校验接口
    const checkData = {
      archiveId: parseInt(manualForm.archiveId),
      systemCode: manualForm.systemCode
    }
    await checkHangOnValidApi(checkData)
    
    // 校验通过，执行挂接
    const response = await manualHangOnApi(manualForm.archiveId, manualForm.systemCode, manualForm.operateBy)
    
    if (response.code === 200) {
      manualResult.value = response.data
      ElMessage.success(`已成功向 ${manualForm.systemCode.length} 个系统挂接档案`)
    } else {
      ElMessage.error('手动挂接失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('手动挂接失败：' + error.message)
  } finally {
    manualLoading.value = false
  }
}

const resetManualForm = () => {
  manualForm.archiveId = ''
  manualForm.systemCode = []
  manualForm.operateBy = getCurrentUser()
  manualResult.value = null
}

// 批量挂接
const batchForm = reactive({
  archiveIds: '',
  systemCode: [],
  operateBy: getCurrentUser()
})

const batchResult = ref(null)
const batchLoading = ref(false)

const handleBatchHangOn = async () => {
  if (!batchForm.archiveIds) {
    ElMessage.warning('请输入档案ID列表')
    return
  }

  if (batchForm.systemCode.length === 0) {
    ElMessage.warning('请选择至少一个目标系统')
    return
  }

  try {
    batchLoading.value = true
    const archiveIds = batchForm.archiveIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    if (archiveIds.length === 0) {
      ElMessage.warning('请输入有效的档案ID列表')
      return
    }

    // 调用校验接口
    const checkData = {
      archiveIds,
      systemCode: batchForm.systemCode
    }
    await checkHangOnValidApi(checkData)
    
    // 校验通过，执行批量挂接
    const requestDTO = {
      archiveIds,
      systemCode: batchForm.systemCode,
      operateBy: batchForm.operateBy,
      hangOnMethod: 'manual'
    }

    const response = await batchHangOnApi(requestDTO)
    if (response.code === 200) {
      batchResult.value = response.data
      ElMessage.success('批量挂接成功')
    } else {
      ElMessage.error('批量挂接失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('批量挂接失败：' + error.message)
  } finally {
    batchLoading.value = false
  }
}

const resetBatchForm = () => {
  batchForm.archiveIds = ''
  batchForm.systemCode = []
  batchForm.operateBy = getCurrentUser()
  batchResult.value = null
}

// 挂接关系查询
const relationForm = reactive({
  archiveId: ''
})

const relations = ref([])
const relationsLoading = ref(false)

const handleGetRelations = async () => {
  if (!relationForm.archiveId) {
    ElMessage.warning('请输入档案ID')
    return
  }

  try {
    relationsLoading.value = true
    const response = await getRelationsApi(relationForm.archiveId)
    if (response.code === 200) {
      relations.value = response.data
      ElMessage.success('查询挂接关系成功')
    } else {
      ElMessage.error('查询挂接关系失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('查询挂接关系失败：' + error.message)
  } finally {
    relationsLoading.value = false
  }
}

// 挂接关系查询
const resetRelationForm = () => {
  relationForm.archiveId = ''
  // 重置后不清空列表，保持现有数据显示
}

// 修改挂接关系对话框
const modifyDialogVisible = ref(false)
const modifyLoading = ref(false)
const modifyForm = reactive({
  archiveId: '',
  systemCode: '',
  operateBy: getCurrentUser(),
  archiveType: '',
  businessNo: '',
  businessType: '',
  responsiblePerson: '',
  department: ''
})

// 显示修改挂接关系对话框
const handleModifyRelation = (row) => {
  // 初始化表单数据
  modifyForm.archiveId = row.archiveId
  modifyForm.systemCode = row.systemCode
  modifyForm.operateBy = getCurrentUser()
  modifyForm.archiveType = ''
  modifyForm.businessNo = ''
  modifyForm.businessType = ''
  modifyForm.responsiblePerson = ''
  modifyForm.department = ''
  
  // 显示对话框
  modifyDialogVisible.value = true
}

// 保存修改的挂接关系
const handleSaveModify = async () => {
  try {
    modifyLoading.value = true
    
    // 调用修改挂接关系API
    const response = await modifyHangOnRelationApi(modifyForm.archiveId, modifyForm.systemCode, {
      operateBy: modifyForm.operateBy,
      archiveType: modifyForm.archiveType,
      businessNo: modifyForm.businessNo,
      businessType: modifyForm.businessType,
      responsiblePerson: modifyForm.responsiblePerson,
      department: modifyForm.department
    })
    
    if (response.code === 200) {
      ElMessage.success('修改挂接关系成功')
      modifyDialogVisible.value = false
      // 重新查询挂接关系
      await handleGetRelations()
    } else {
      ElMessage.error('修改挂接关系失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('修改挂接关系失败：' + error.message)
  } finally {
    modifyLoading.value = false
  }
}

// 解除挂接
const handleUnhook = async (row) => {
  try {
    // 调用解除挂接API
    const response = await unhookApi(row.archiveId, row.systemCode, 'user')
    if (response.code === 200) {
      ElMessage.success('解除挂接成功')
      // 重新查询挂接关系
      await handleGetRelations()
    } else {
      ElMessage.error('解除挂接失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('解除挂接失败：' + error.message)
  }
}

// 挂接日志查询
const logForm = reactive({
  archiveId: '',
  hangOnType: '',
  result: ''
})

const logs = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const logTotal = ref(0)
const logsLoading = ref(false)

const handleGetLogs = async () => {
  try {
    logsLoading.value = true
    // 构建查询参数
    const params = {
      archiveId: logForm.archiveId || undefined,
      hangOnType: logForm.hangOnType || undefined,
      result: logForm.result || undefined,
      currentPage: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 调用API查询日志
    const response = await getLogsApi(params)
    if (response.code === 200) {
      logs.value = response.data.records
      logTotal.value = Number(response.data.total) || 0
      ElMessage.success('查询挂接日志成功')
    } else {
      ElMessage.error('查询挂接日志失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('查询挂接日志失败：' + error.message)
  } finally {
    logsLoading.value = false
  }
}

// 挂接日志查询
const resetLogForm = () => {
  logForm.archiveId = ''
  logForm.hangOnType = ''
  logForm.result = ''
  currentPage.value = 1
  // 重置后自动执行查询，保持列表显示
  handleGetLogs()
}

const handlePageChange = (page) => {
  currentPage.value = page
  handleGetLogs()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  handleGetLogs()
}

const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
}

// 获取目标系统列表
const getSystemOptions = async () => {
  try {
    systemOptionsLoading.value = true
    // 只获取启用状态的接口配置
    const response = await getInterfaceConfigsApi({ status: 1 })
    if (response.code === 200) {
      // 从接口配置中提取接口编码作为目标系统选项
      systemOptions.value = response.data.records.map(config => ({
        label: config.businessSystem,
        value: config.interfaceCode
      }))
    }
  } catch (error) {
    console.error('获取目标系统列表失败：', error)
  } finally {
    systemOptionsLoading.value = false
  }
}

// 组件加载时自动查询日志和目标系统列表
onMounted(() => {
  handleGetLogs()
  getSystemOptions()
})
</script>

<style scoped>
.hang-on-container {
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