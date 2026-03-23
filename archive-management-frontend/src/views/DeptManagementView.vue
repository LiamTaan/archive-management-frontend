<template>
  <div class="dept-management-container">
    <el-card shadow="hover" class="dept-card">
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
          <el-button type="primary" @click="openAddDialog">新增部门</el-button>
        </div>
      </template>
      
      <div class="dept-tree-container">
        <el-tree
          ref="deptTreeRef"
          :data="deptTree"
          :props="treeProps"
          default-expand-all
          @node-click="handleNodeClick"
          class="dept-tree"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <span>{{ node.label }}</span>
              <span class="tree-node-actions">
                <el-button
                  type="primary"
                  size="small"
                  circle
                  @click.stop="openEditDialog(data)"
                  icon="Edit"
                />
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="handleDelete(data)"
                  icon="Delete"
                />
                <el-button
                  type="success"
                  size="small"
                  circle
                  @click.stop="openAddChildDialog(data)"
                  icon="Plus"
                />
              </span>
            </span>
          </template>
        </el-tree>
      </div>
      
      <div class="dept-detail" v-if="selectedDept">
        <h4>部门详情</h4>
        <el-descriptions border :column="1">
          <el-descriptions-item label="部门ID">{{ selectedDept.deptId }}</el-descriptions-item>
          <el-descriptions-item label="部门名称">{{ selectedDept.deptName }}</el-descriptions-item>
          <el-descriptions-item label="部门编码">{{ selectedDept.deptCode }}</el-descriptions-item>
          <el-descriptions-item label="部门描述">{{ selectedDept.deptDesc }}</el-descriptions-item>
          <el-descriptions-item label="父部门ID">{{ selectedDept.parentId || '无' }}</el-descriptions-item>
          <el-descriptions-item label="父部门名称">{{ getParentDeptName(selectedDept.parentId) || '无' }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ selectedDept.sort }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ selectedDept.status === 1 ? '启用' : '禁用' }}</el-descriptions-item>
          <el-descriptions-item label="树路径">{{ selectedDept.treePath }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedDept.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(selectedDept.updateTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 新增/编辑部门对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form
        ref="deptFormRef"
        :model="deptForm"
        :rules="deptRules"
        label-width="80px"
      >
        <el-form-item label="父部门" prop="parentId">
          <el-select v-model="deptForm.parentId" placeholder="请选择父部门">
            <el-option label="无" value="0" />
            <el-option
              v-for="dept in deptOptions"
              :key="dept.deptId"
              :label="dept.deptName"
              :value="dept.deptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="deptForm.deptName" placeholder="请输入部门名称" maxlength="64" />
        </el-form-item>
        <el-form-item label="部门编码" prop="deptCode">
          <el-input v-model="deptForm.deptCode" placeholder="请输入部门编码" maxlength="64" />
        </el-form-item>
        <el-form-item label="部门描述" prop="deptDesc">
          <el-input
            v-model="deptForm.deptDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入部门描述"
            maxlength="255"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="deptForm.sort"
            :min="0"
            :max="999"
            placeholder="请输入排序"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="deptForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDeptTreeApi, addDeptApi, updateDeptApi, deleteDeptApi } from '../api/dept'

const deptTreeRef = ref(null)
const deptTree = ref([])
const deptOptions = ref([])
const selectedDept = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('新增部门')

const treeProps = {
  label: 'deptName',
  children: 'children'
}

const deptForm = reactive({
  deptId: null,
  parentId: 0,
  deptName: '',
  deptCode: '',
  deptDesc: '',
  sort: 0,
  status: 1
})

const deptRules = {
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 64, message: '部门名称长度在 2 到 64 个字符', trigger: 'blur' }
  ],
  deptCode: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { min: 2, max: 64, message: '部门编码长度在 2 到 64 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序必须在 0 到 999 之间', trigger: 'blur' }
  ]
}

const deptFormRef = ref(null)

// 获取部门树
const loadDeptTree = async () => {
  try {
    const response = await getDeptTreeApi()
    deptTree.value = response.data || []
    deptOptions.value = flattenDeptTree(response.data || [])
  } catch (error) {
    ElMessage.error('获取部门树失败：' + (error.message || '未知错误'))
    deptTree.value = []
    deptOptions.value = []
  }
}

// 扁平化部门树
const flattenDeptTree = (tree, result = []) => {
  tree.forEach(node => {
    result.push({
      deptId: node.deptId,
      deptName: node.deptName
    })
    if (node.children && node.children.length > 0) {
      flattenDeptTree(node.children, result)
    }
  })
  return result
}

// 节点点击事件
const handleNodeClick = (data) => {
  selectedDept.value = data
}

// 打开新增部门对话框
const openAddDialog = () => {
  resetForm()
  deptForm.parentId = 0
  dialogTitle.value = '新增部门'
  dialogVisible.value = true
}

// 打开编辑部门对话框
const openEditDialog = (data) => {
  Object.assign(deptForm, data)
  dialogTitle.value = '编辑部门'
  dialogVisible.value = true
}

// 打开新增子部门对话框
const openAddChildDialog = (parentDept) => {
  resetForm()
  deptForm.parentId = parentDept.deptId
  dialogTitle.value = `新增${parentDept.deptName}的子部门`
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(deptForm, {
    deptId: null,
    parentId: 0,
    deptName: '',
    deptCode: '',
    deptDesc: '',
    sort: 0,
    status: 1
  })
  if (deptFormRef.value) {
    deptFormRef.value.resetFields()
  }
}

// 获取父部门名称
const getParentDeptName = (parentId) => {
  const findParent = (tree, id) => {
    for (const node of tree) {
      if (node.deptId === id) {
        return node.deptName
      }
      if (node.children) {
        const result = findParent(node.children, id)
        if (result) {
          return result
        }
      }
    }
    return null
  }
  return findParent(deptTree.value, parentId)
}

// 提交表单
const submitForm = async () => {
  try {
    await deptFormRef.value.validate()
    
    const submitData = {
      ...deptForm,
      parentId: deptForm.parentId === 0 ? null : deptForm.parentId
    }
    
    if (submitData.deptId) {
      // 更新部门
      await updateDeptApi(submitData)
      ElMessage.success('部门更新成功')
    } else {
      // 新增部门
      await addDeptApi(submitData)
      ElMessage.success('部门新增成功')
    }
    
    dialogVisible.value = false
    loadDeptTree()
    selectedDept.value = null
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败：' + (error.message || '未知错误'))
    }
  }
}

// 删除部门
const handleDelete = async (dept) => {
  try {
    // 检查是否有子部门
    if (dept.children && dept.children.length > 0) {
      ElMessage.warning('该部门存在子部门，不能删除')
      return
    }
    
    await ElMessageBox.confirm('确定要删除该部门吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteDeptApi(dept.deptId)
    ElMessage.success('部门删除成功')
    
    if (selectedDept.value && selectedDept.value.deptId === dept.deptId) {
      selectedDept.value = null
    }
    
    loadDeptTree()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString()
  } catch (e) {
    return dateString
  }
}

onMounted(() => {
  loadDeptTree()
})
</script>

<style scoped>
.dept-management-container {
  padding: 20px;
}

.dept-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dept-tree-container {
  width: 300px;
  float: left;
  border-right: 1px solid #eee;
  padding-right: 20px;
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.dept-tree {
  background: #fff;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.tree-node-actions {
  visibility: hidden;
}

.tree-node:hover .tree-node-actions {
  visibility: visible;
}

.dept-detail {
  margin-left: 340px;
  padding: 20px;
}

.dept-detail h4 {
  margin-bottom: 20px;
  color: #333;
}
</style>