<template>
  <div class="log-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>日志管理</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="挂接日志" name="hang-on">
          <div class="tab-content">
            <el-form :model="hangOnLogForm" label-width="120px" :inline="true">
              <el-form-item label="档案ID">
                <el-input v-model="hangOnLogForm.archiveId" placeholder="请输入档案ID" />
              </el-form-item>
              <el-form-item label="操作人">
                <el-input v-model="hangOnLogForm.operateBy" placeholder="请输入操作人" />
              </el-form-item>
              <el-form-item label="挂接结果">
                <el-select v-model="hangOnLogForm.result" placeholder="请选择挂接结果">
                  <el-option label="全部" value="" />
                  <el-option label="成功" value="1" />
                  <el-option label="失败" value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="挂接类型">
                <el-select v-model="hangOnLogForm.hangOnType" placeholder="请选择挂接类型">
                  <el-option label="全部" value="" />
                  <el-option label="自动挂接" value="1" />
                  <el-option label="手动挂接" value="2" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleGetHangOnLogs" :loading="hangOnLogLoading">查询</el-button>
                <el-button @click="resetHangOnLogForm">重置</el-button>
              </el-form-item>
            </el-form>

            <div class="result-info">
              <el-table :data="hangOnLogs" stripe style="width: 100%" :loading="hangOnLogLoading">
                <el-table-column prop="id" label="日志ID" width="100" />
                <el-table-column prop="archiveId" label="档案ID" width="120" />
                <el-table-column prop="hangOnType" label="挂接类型" width="100">
                  <template #default="scope">
                    {{ scope.row.hangOnType === 0 ? '挂接' : scope.row.hangOnType === 1 ? '修改' : '解除' }}
                  </template>
                </el-table-column>
                <el-table-column prop="result" label="挂接结果" width="100">
                  <template #default="scope">
                    <span :class="scope.row.result === 1 ? 'success' : 'fail'">
                      {{ scope.row.result === 1 ? '成功' : '失败' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="operateBy" label="操作人" width="100" />
                <el-table-column label="挂接方式" width="100">
                  <template #default="scope">
                    {{ parseHangOnMethod(scope.row.description) }}
                  </template>
                </el-table-column>
                <el-table-column label="目标系统" width="120">
                  <template #default="scope">
                    {{ parseTargetSystem(scope.row.description) }}
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="挂接描述" />
                <el-table-column prop="errorInfo" label="错误信息" />
                <el-table-column prop="createTime" label="创建时间" width="200" />
              </el-table>

              <el-pagination
                v-model:current-page="hangOnLogCurrentPage"
                :page-size="pageSize"
                :total="hangOnLogTotal"
                layout="prev, pager, next, sizes, jumper"
                @update:current-page="handleHangOnLogPageChange"
                style="margin-top: 20px; text-align: right;"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="采集日志" name="collection">
          <div class="tab-content">
            <el-form :model="collectionLogForm" label-width="120px" :inline="true">
              <el-form-item label="采集类型">
                <el-select v-model="collectionLogForm.collectionType" placeholder="请选择采集类型">
                  <el-option label="全部" value="" />
                  <el-option label="自动采集" value="2" />
                  <el-option label="手动采集" value="0" />
                  <el-option label="批量采集" value="1" />
                  <el-option label="外部导入" value="3" />
                </el-select>
              </el-form-item>
              <el-form-item label="操作人">
                <el-input v-model="collectionLogForm.operateBy" placeholder="请输入操作人" />
              </el-form-item>
              <el-form-item label="采集结果">
                <el-select v-model="collectionLogForm.result" placeholder="请选择采集结果">
                  <el-option label="全部" value="" />
                  <el-option label="成功" value="1" />
                  <el-option label="失败" value="2" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleGetCollectionLogs" :loading="collectionLogLoading">查询</el-button>
                <el-button @click="resetCollectionLogForm">重置</el-button>
              </el-form-item>
            </el-form>

            <div class="result-info">
              <el-table :data="collectionLogs" stripe style="width: 100%" :loading="collectionLogLoading">
                <el-table-column prop="id" label="日志ID" width="100" />
                <el-table-column prop="collectionType" label="采集类型" width="100">
                  <template #default="scope">
                    {{ getCollectionTypeLabel(scope.row.collectionType) }}
                  </template>
                </el-table-column>
                <el-table-column prop="result" label="采集结果" width="100">
                  <template #default="scope">
                    <span :class="scope.row.result === 1 ? 'success' : 'fail'">
                      {{ scope.row.result === 1 ? '成功' : '失败' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="operateBy" label="操作人" width="100" />
                <el-table-column prop="description" label="采集描述" />
                <el-table-column prop="createTime" label="创建时间" width="200" />
              </el-table>

              <el-pagination
                v-model:current-page="collectionLogCurrentPage"
                :page-size="pageSize"
                :total="collectionLogTotal"
                layout="prev, pager, next, sizes, jumper"
                @update:current-page="handleCollectionLogPageChange"
                style="margin-top: 20px; text-align: right;"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="系统日志" name="system">
          <div class="tab-content">
            <el-form :model="systemLogForm" label-width="120px" :inline="true">
              <el-form-item label="操作人">
                <el-input v-model="systemLogForm.operateBy" placeholder="请输入操作人" />
              </el-form-item>
              <el-form-item label="操作类型">
                <el-select v-model="systemLogForm.operationType" placeholder="请选择操作类型">
                  <el-option label="全部" value="" />
                  <el-option label="登录" value="login" />
                  <el-option label="退出" value="logout" />
                  <el-option label="配置修改" value="config" />
                </el-select>
              </el-form-item>
              <el-form-item label="操作结果">
                <el-select v-model="systemLogForm.result" placeholder="请选择操作结果">
                  <el-option label="全部" value="" />
                  <el-option label="成功" value="1" />
                  <el-option label="失败" value="2" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleGetSystemLogs" :loading="systemLogLoading">查询</el-button>
                <el-button @click="resetSystemLogForm">重置</el-button>
              </el-form-item>
            </el-form>

            <div class="result-info">
              <el-table :data="systemLogs" stripe style="width: 100%" :loading="systemLogLoading">
                <el-table-column prop="id" label="日志ID" width="100" />
                <el-table-column prop="operateBy" label="操作人" width="100" />
                <el-table-column prop="logType" label="操作类型" width="100">
                  <template #default="scope">
                    {{ getOperationTypeLabel(scope.row.logType) }}
                  </template>
                </el-table-column>
                <el-table-column prop="content" label="操作内容" />
                <el-table-column prop="title" label="日志标题" />
                <el-table-column prop="operateIp" label="IP地址" width="150" />
                <el-table-column prop="createTime" label="创建时间" width="200" />
              </el-table>

              <el-pagination
                v-model:current-page="systemLogCurrentPage"
                :page-size="pageSize"
                :total="systemLogTotal"
                layout="prev, pager, next, sizes, jumper"
                @update:current-page="handleSystemLogPageChange"
                style="margin-top: 20px; text-align: right;"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLogsApi } from '../api/hangOn'
import { getCollectionLogsApi, getSystemLogsApi } from '../api/log'

const activeTab = ref('hang-on')
const pageSize = ref(10)

// 挂接日志
const hangOnLogForm = reactive({
  archiveId: '',
  operateBy: '',
  result: '',
  hangOnType: ''
})

const hangOnLogs = ref([])
const hangOnLogCurrentPage = ref(1)
const hangOnLogTotal = ref(0)
const hangOnLogLoading = ref(false)

const handleGetHangOnLogs = async () => {
  try {
    hangOnLogLoading.value = true
    // 构建查询参数
    const params = {
      archiveId: hangOnLogForm.archiveId || undefined,
      operateBy: hangOnLogForm.operateBy || undefined,
      hangOnType: hangOnLogForm.hangOnType || undefined,
      result: hangOnLogForm.result || undefined,
      currentPage: hangOnLogCurrentPage.value,
      pageSize: pageSize.value
    }
    
    // 调用API查询挂接日志
    const response = await getLogsApi(params)
    if (response.code === 200) {
      hangOnLogs.value = response.data.records
      hangOnLogTotal.value = Number(response.data.total)
    } else {
      ElMessage.error('查询挂接日志失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('查询挂接日志失败：' + error.message)
  } finally {
    hangOnLogLoading.value = false
  }
}

const resetHangOnLogForm = async () => {
  hangOnLogForm.archiveId = ''
  hangOnLogForm.operateBy = ''
  hangOnLogForm.result = ''
  hangOnLogForm.hangOnType = ''
  hangOnLogCurrentPage.value = 1 // 重置页码
  await handleGetHangOnLogs() // 调用查询函数刷新日志
}

const handleHangOnLogPageChange = (page) => {
  hangOnLogCurrentPage.value = page
  handleGetHangOnLogs()
}

// 采集日志
const collectionLogForm = reactive({
  collectionType: '',
  operateBy: '',
  result: ''
})

const collectionLogs = ref([])
const collectionLogCurrentPage = ref(1)
const collectionLogTotal = ref(0)
const collectionLogLoading = ref(false)

const handleGetCollectionLogs = async () => {
  try {
    collectionLogLoading.value = true
    // 构建查询参数
    const params = {
      collectionType: collectionLogForm.collectionType || undefined,
      operateBy: collectionLogForm.operateBy || undefined,
      result: collectionLogForm.result || undefined,
      currentPage: collectionLogCurrentPage.value,
      pageSize: pageSize.value
    }
    
    // 调用API查询采集日志
    const response = await getCollectionLogsApi(params)
    if (response.code === 200) {
      collectionLogs.value = response.data.records
      collectionLogTotal.value = Number(response.data.total)
    } else {
      ElMessage.error('查询采集日志失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('查询采集日志失败：' + error.message)
  } finally {
    collectionLogLoading.value = false
  }
}

const resetCollectionLogForm = async () => {
  collectionLogForm.collectionType = ''
  collectionLogForm.operateBy = ''
  collectionLogForm.result = ''
  collectionLogCurrentPage.value = 1 // 重置页码
  await handleGetCollectionLogs() // 调用查询函数刷新日志
}

const handleCollectionLogPageChange = (page) => {
  collectionLogCurrentPage.value = page
  handleGetCollectionLogs()
}

const getCollectionTypeLabel = (type) => {
  const typeMap = {
    2: '自动采集',
    0: '手动采集',
    1: '批量采集',
    3: '外部导入'
  }
  return typeMap[type] || '未知类型'
}

// 系统日志
const systemLogForm = reactive({
  operateBy: '',
  operationType: '',
  result: ''
})

const systemLogs = ref([])
const systemLogCurrentPage = ref(1)
const systemLogTotal = ref(0)
const systemLogLoading = ref(false)

const handleGetSystemLogs = async () => {
  try {
    systemLogLoading.value = true
    // 构建查询参数
    const params = {
      operateBy: systemLogForm.operateBy || undefined,
      // 操作类型转换为数字类型
      logType: convertOperationTypeToNumber(systemLogForm.operationType),
      operateIp: undefined,
      logLevel: undefined,
      currentPage: systemLogCurrentPage.value,
      pageSize: pageSize.value
    }
    
    // 调用API查询系统日志
    const response = await getSystemLogsApi(params)
    if (response.code === 200) {
      systemLogs.value = response.data.records
      systemLogTotal.value = Number(response.data.total)
    } else {
      ElMessage.error('查询系统日志失败：' + response.message)
    }
  } catch (error) {
    ElMessage.error('查询系统日志失败：' + error.message)
  } finally {
    systemLogLoading.value = false
  }
}

const resetSystemLogForm = async () => {
  systemLogForm.operateBy = ''
  systemLogForm.operationType = ''
  systemLogForm.result = ''
  systemLogCurrentPage.value = 1 // 重置页码
  await handleGetSystemLogs() // 调用查询函数刷新日志
}

const handleSystemLogPageChange = (page) => {
  systemLogCurrentPage.value = page
  handleGetSystemLogs()
}

const getOperationTypeLabel = (type) => {
  const typeMap = {
    0: '系统启动',
    1: '系统关闭',
    2: '配置变更',
    3: '异常记录',
    4: '性能监控'
  }
  return typeMap[type] || '未知类型'
}

const convertOperationTypeToNumber = (type) => {
  if (!type) return undefined
  const typeMap = {
    'login': 0,
    'logout': 1,
    'config': 2
  }
  return typeMap[type] || undefined
}

const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
  // 切换标签时加载对应的数据
  loadTabData(tab.props.name)
}

// 加载标签页数据
const loadTabData = async (tabName) => {
  switch (tabName) {
    case 'hang-on':
      await handleGetHangOnLogs()
      break
    case 'collection':
      await handleGetCollectionLogs()
      break
    case 'system':
      await handleGetSystemLogs()
      break
    default:
      break
  }
}

// 页面加载时初始化数据
onMounted(async () => {
  await loadTabData(activeTab.value)
})

// 解析挂接方式
const parseHangOnMethod = (description) => {
  if (!description) return ''
  const regex = /方式:\s*([^\s,]+)/
  const match = description.match(regex)
  return match ? match[1] : ''
}

// 解析目标系统
const parseTargetSystem = (description) => {
  if (!description) return ''
  const regex = /目标系统:\s*([^\],]+)/
  const match = description.match(regex)
  return match ? match[1] : ''
}
</script>

<style scoped>
.log-container {
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