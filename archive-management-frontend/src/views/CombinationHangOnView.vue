<template>
  <div class="combination-hang-on-view">
    <el-card class="combination-card">
      <template #header>
        <div class="card-header">
          <span>档案组合挂接管理</span>
          <el-button type="primary" size="small" @click="handleAdd">添加组合</el-button>
        </div>
      </template>
      
      <div class="combination-content">
        <!-- 查询条件 -->
        <el-form :inline="true" class="query-form">
          <el-form-item label="组合名称">
            <el-input v-model="queryParams.combinationName" placeholder="请输入组合名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="组合状态">
            <el-select v-model="queryParams.status" placeholder="请选择组合状态" clearable>
              <el-option label="已创建(未挂接)" value="0"></el-option>
              <el-option label="挂接成功" value="1"></el-option>
              <el-option label="挂接失败" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 组合列表 -->
        <el-table :data="combinationList" style="width: 100%" border :loading="loading">
          <el-table-column prop="id" label="组合ID" width="150"></el-table-column>
          <el-table-column prop="combinationName" label="组合名称" min-width="150"></el-table-column>
          <el-table-column prop="combinationType" label="组合类型" width="120"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="scope">
              <div style="display: flex; gap: 8px;">
                <el-button type="primary" size="small" @click="handleViewDetails(scope.row)">查看详情</el-button>
                <el-button type="success" size="small" @click="handleHangOn(scope.row)" :disabled="scope.row.status === 1">挂接</el-button>
                <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            layout="prev, pager, next"
            :total="total"
            v-model:current-page="currentPage"
            :page-size="pageSize"
            @update:current-page="handleCurrentChange"
          ></el-pagination>
        </div>
      </div>
    </el-card>
    
    <!-- 组合详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="组合详情"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="detail-content">
        <h3>{{ currentCombination.combinationName }}</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="组合ID">{{ currentCombination.id }}</el-descriptions-item>
          <el-descriptions-item label="组合类型">{{ currentCombination.combinationType }}</el-descriptions-item>
          <el-descriptions-item label="档案数量">{{ currentCombination.totalArchives }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(currentCombination.status) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ currentCombination.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">{{ currentCombination.updateTime }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin-top: 20px;">档案列表</h4>
        <el-table :data="currentCombination.archives" style="width: 100%" border>
          <el-table-column prop="archiveId" label="档案ID" width="120"></el-table-column>
          <el-table-column prop="archiveName" label="档案名称" min-width="200"></el-table-column>
          <el-table-column prop="archiveType" label="档案类型" width="100"></el-table-column>
          <el-table-column prop="filePath" label="文件路径" min-width="300"></el-table-column>
          <el-table-column prop="status" label="挂接状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="errorInfo" label="错误信息" min-width="200"></el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 添加组合弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加组合"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-form ref="addFormRef" :model="addForm" label-width="100px" :rules="addFormRules">
        <el-form-item label="组合名称" prop="combinationName">
          <el-input v-model="addForm.combinationName" placeholder="请输入组合名称"></el-input>
        </el-form-item>
        <el-form-item label="组合类型" prop="combinationType">
          <el-select v-model="addForm.combinationType" placeholder="请选择组合类型">
            <el-option label="专题组合" value="SPECIAL"></el-option>
            <el-option label="年度组合" value="YEARLY"></el-option>
            <el-option label="部门组合" value="DEPARTMENT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="档案选择" prop="archives">
          <el-select
            v-model="addForm.archives"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请选择档案"
            :remote-method="remoteMethod"
            :loading="selectLoading"
            clearable
          >
            <el-option
              v-for="item in archiveOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 挂接设置弹窗 -->
    <el-dialog
      v-model="hangOnDialogVisible"
      title="组合挂接设置"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-form ref="hangOnFormRef" :model="hangOnForm" label-width="100px" :rules="hangOnFormRules">
        <el-form-item label="目标系统" prop="systemCode">
          <el-select v-model="hangOnForm.systemCode" placeholder="请选择要挂接的目标系统" :loading="systemOptionsLoading">
            <el-option
              v-for="option in systemOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="挂接方式" prop="hangOnMethod">
          <el-radio-group v-model="hangOnForm.hangOnMethod">
            <el-radio label="auto">自动挂接</el-radio>
            <el-radio label="manual">手动挂接</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="hangOnDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitHangOn">确定挂接</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import archiveCombinationApi from '../api/archiveCombination'
import { queryArchiveByPageApi } from '../api/archiveInfo'
import { batchHangOnApi } from '../api/hangOn'
import { getInterfaceConfigsApi } from '../api/interfaceConfig'
import { transformPageRequest, transformPageResponse } from '../utils/pagination'

// 数据定义
const queryParams = reactive({
  combinationName: '',
  status: ''
})

const combinationList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const detailDialogVisible = ref(false)
const addDialogVisible = ref(false)
const addFormRef = ref(null)
const addForm = reactive({
  combinationName: '',
  combinationType: '',
  archives: []
})

const currentCombination = ref({})
const archiveOptions = ref([])
const selectLoading = ref(false)

// 挂接设置相关数据
const hangOnDialogVisible = ref(false)
const hangOnFormRef = ref(null)
const hangOnForm = reactive({
  systemCode: '',
  hangOnMethod: 'manual' // 默认手动挂接
})
const selectedCombination = ref(null)
const systemOptions = ref([]) // 系统选项列表
const systemOptionsLoading = ref(false) // 系统选项加载状态

// 表单验证规则
const addFormRules = reactive({
  combinationName: [
    { required: true, message: '请输入组合名称', trigger: 'blur' }
  ],
  combinationType: [
    { required: true, message: '请选择组合类型', trigger: 'change' }
  ],
  archives: [
    { required: true, message: '请选择档案', trigger: 'change' }
  ]
})

// 挂接表单验证规则
const hangOnFormRules = reactive({
  systemCode: [
    { required: true, message: '请选择要挂接的目标系统', trigger: 'change' }
  ]
})

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
    ElMessage.error('获取目标系统列表失败')
  } finally {
    systemOptionsLoading.value = false
  }
}

// 初始化数据
const initData = () => {
  handleQuery()
}

// 生命周期钩子，组件挂载时初始化数据
onMounted(() => {
  initData()
  getSystemOptions()
})

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '未挂接',
    1: '已挂接',
    2: '挂接失败',
    'CREATED': '已创建',
    'HANGING': '挂接中',
    'SUCCESS': '挂接成功',
    'FAILED': '挂接失败'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'danger',
    'CREATED': 'info',
    'HANGING': 'warning',
    'SUCCESS': 'success',
    'FAILED': 'danger'
  }
  return typeMap[status] || 'info'
}

// 查询
const handleQuery = () => {
  loading.value = true
  
  // 构建查询参数
  const queryDTO = {
    ...queryParams,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  }
  
  // 调用API获取档案组合列表
  archiveCombinationApi.getArchiveCombinationList(queryDTO).then(res => {
    const pageData = transformPageResponse(res.data)
    combinationList.value = pageData.records || []
    total.value = pageData.total || 0
    ElMessage.success('查询成功')
  }).catch(err => {
    console.error('查询档案组合失败:', err)
    ElMessage.error('查询档案组合失败')
  }).finally(() => {
    loading.value = false
  })
}

// 重置
const handleReset = () => {
  Object.assign(queryParams, {
    combinationName: '',
    status: ''
  })
  currentPage.value = 1
  // 重置后重新查询
  handleQuery()
}

// 分页
const handleCurrentChange = (page) => {
  currentPage.value = page
  handleQuery()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  handleQuery()
}

// 查看详情
const handleViewDetails = (row) => {
  // 调用API获取档案组合详情
  archiveCombinationApi.getArchiveCombinationDetail(row.id).then(res => {
    currentCombination.value = res.data
    // 获取档案组合关系列表
    archiveCombinationApi.getArchiveCombinationRelations(row.id).then(relationsRes => {
      currentCombination.value.archives = relationsRes.data.map(relation => ({
        archiveId: relation.archiveId,
        archiveName: `档案${relation.archiveId}`, // 实际应从档案信息中获取
        archiveType: '未知', // 实际应从档案信息中获取
        filePath: '/path/to/file', // 实际应从档案信息中获取
        status: 'SUCCESS', // 实际应从档案信息中获取
        errorInfo: ''
      }))
      detailDialogVisible.value = true
    }).catch(err => {
      console.error('获取档案组合关系失败:', err)
      ElMessage.error('获取档案组合关系失败')
    })
  }).catch(err => {
    console.error('获取档案组合详情失败:', err)
    ElMessage.error('获取档案组合详情失败')
  })
}

// 添加组合
const handleAdd = () => {
  Object.assign(addForm, {
    combinationName: '',
    combinationType: '',
    archives: []
  })
  addDialogVisible.value = true
}

// 挂接
const handleHangOn = (row) => {
  // 保存当前选中的组合
  selectedCombination.value = row
  // 获取系统选项
  getSystemOptions()
  // 打开挂接设置对话框
  hangOnDialogVisible.value = true
}

// 提交挂接设置
const handleSubmitHangOn = () => {
  if (!hangOnFormRef.value) return
  
  hangOnFormRef.value.validate((valid) => {
    if (valid) {
      // 获取当前登录用户信息
      const userInfoStr = localStorage.getItem('userInfo')
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : { username: 'admin' } // 默认admin
      const operateBy = userInfo.username || 'admin'
      
      // 获取组合中的档案ID列表
        archiveCombinationApi.getArchiveCombinationRelations(selectedCombination.value.id).then(relationsRes => {
          const archiveIds = relationsRes.data.map(relation => {
            // 如果archiveId是大整数，直接使用字符串，否则转换为数字
            return typeof relation.archiveId === 'string' ? relation.archiveId : parseInt(relation.archiveId)
          })
          
          // 调用专门的批量挂接API
          batchHangOnApi({
            archiveIds: archiveIds,
            systemCode: hangOnForm.systemCode,
            operateBy: operateBy,
            hangOnMethod: hangOnForm.hangOnMethod
          }).then(res => {
            // 挂接成功，更新组合状态为已挂接(1)
            return archiveCombinationApi.updateArchiveCombination({
              id: selectedCombination.value.id,
              status: 1
            })
          }).then(() => {
            ElMessage.success('挂接成功')
            hangOnDialogVisible.value = false
            // 重新查询档案组合列表
            handleQuery()
          }).catch(err => {
            // 挂接失败，更新组合状态为挂接失败(2)
            archiveCombinationApi.updateArchiveCombination({
              id: selectedCombination.value.id,
              status: 2
            }).then(() => {
              console.error('档案组合挂接失败:', err)
              ElMessage.error('档案组合挂接失败')
              hangOnDialogVisible.value = false
              // 重新查询档案组合列表
              handleQuery()
            }).catch(updateErr => {
              console.error('更新组合状态失败:', updateErr)
              ElMessage.error('挂接失败，且更新状态失败')
            })
          })
      }).catch(err => {
        console.error('获取档案组合关系失败:', err)
        ElMessage.error('获取档案组合关系失败')
      })
    }
  })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该组合吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用API删除档案组合
    archiveCombinationApi.deleteArchiveCombination(row.id).then(res => {
      ElMessage.success('删除成功')
      // 重新查询档案组合列表
      handleQuery()
    }).catch(err => {
      console.error('删除档案组合失败:', err)
      ElMessage.error('删除档案组合失败')
    })
  }).catch(() => {
    // 取消操作
  })
}

// 提交添加
const handleSubmitAdd = () => {
  if (!addFormRef.value) return
  
  addFormRef.value.validate((valid) => {
    if (valid) {
      // 获取当前登录用户信息
      const userInfoStr = localStorage.getItem('userInfo')
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : { username: 'admin' } // 默认admin
      const createBy = userInfo.username || 'admin'
      
      // 调用API创建档案组合
      archiveCombinationApi.createArchiveCombination({
        combinationName: addForm.combinationName,
        combinationType: addForm.combinationType,
        status: 0, // 初始状态为未挂接
        createBy: createBy // 从登录信息获取
      }).then(res => {
        // 如果选择了档案，进行挂接
        if (addForm.archives && addForm.archives.length > 0) {
          return archiveCombinationApi.saveArchiveCombinationRelations({
            combinationId: res.data.id, // 直接使用字符串类型，避免大整数精度丢失
            archiveIds: addForm.archives.map(archiveId => parseInt(archiveId))
          })
        }
        return Promise.resolve()
      }).then(() => {
        ElMessage.success('添加成功')
        addDialogVisible.value = false
        // 重新查询档案组合列表
        handleQuery()
      }).catch(err => {
        console.error('添加档案组合失败:', err)
        ElMessage.error('添加档案组合失败')
      })
    }
  })
}

// 远程搜索档案
const remoteMethod = (query) => {
  if (query !== '') {
    selectLoading.value = true
    // 调用实际的档案搜索API
    queryArchiveByPageApi({
      pageNum: 1,
      pageSize: 10,
      fileName: query // 根据实际API参数调整
    }).then(res => {
      selectLoading.value = false
      archiveOptions.value = res.data.records.map(item => ({
        label: item.fileName || `档案-${item.id}`,
        value: item.id
      }))
    }).catch(err => {
      console.error('搜索档案失败:', err)
      selectLoading.value = false
      archiveOptions.value = []
    })
  } else {
    archiveOptions.value = []
  }
}

// 初始化数据
initData()
</script>

<style scoped>
.combination-hang-on-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.combination-content {
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

.detail-content {
  padding: 10px 0;
}
</style>