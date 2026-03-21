<template>
  <div class="role-management-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="showAddRoleDialog">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" label-width="80px" :inline="true" style="margin-bottom: 20px;">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 角色列表 -->
      <el-table :data="roles" border style="width: 100%">
        <el-table-column prop="roleId" label="角色ID" width="100" />
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleDesc" label="角色描述" />
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
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <div class="operation-buttons">
              <div class="button-row">
                <el-button type="primary" size="small" @click="showEditRoleDialog(scope.row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="warning" size="small" @click="showPermissionDialog(scope.row)">
                  <el-icon><Setting /></el-icon>
                  分配权限
                </el-button>
              </div>
              <div class="button-row">
                <el-button type="danger" size="small" @click="handleDeleteRole(scope.row.roleId)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
                <div class="button-placeholder"></div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, sizes, jumper"
        @update:current-page="handlePageChange"
        style="margin-top: 20px; text-align: right;"
      />

      <!-- 新增/编辑角色对话框 -->
      <el-dialog v-model="roleDialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="50%">
        <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input
              v-model="roleForm.roleDesc"
              type="textarea"
              :rows="3"
              placeholder="请输入角色描述"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="roleForm.status" placeholder="请选择状态">
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="roleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSaveRole">保存</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 分配权限对话框 -->
      <el-dialog v-model="permissionDialogVisible" title="分配权限" width="60%">
        <div v-if="rolePermissions.length > 0">
          <el-tree
            ref="permissionTreeRef"
            :data="rolePermissions"
            :props="permissionTreeProps"
            show-checkbox
            node-key="permissionId"
            default-expand-all
          />
        </div>
        <div v-else>
          <el-empty description="暂无权限数据" />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="permissionDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSavePermissions">保存权限</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete, SwitchButton } from '@element-plus/icons-vue'
import { getRoleListApi, updateRoleStatusApi, addRoleApi, updateRoleApi, deleteRoleApi, getAllPermissionsApi, getRolePermissionsApi, saveRolePermissionsApi } from '../api/role'
import { transformPageRequest, transformPageResponse } from '../utils/pagination'

// 搜索表单
const searchForm = reactive({
  roleName: '',
  status: ''
})

// 角色列表
const roles = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const isEdit = ref(false)
const roleFormRef = ref(null)
const roleForm = reactive({
  roleId: '',
  roleName: '',
  roleDesc: '',
  status: '1'
})

// 权限树
const permissionTreeRef = ref(null)
const rolePermissions = ref([])
const permissionTreeProps = {
  label: 'permissionName',
  children: 'children',
  disabled: 'disabled'
}

// 表单验证规则
const roleRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  roleDesc: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取角色列表
const getRoles = async () => {
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    }
    const response = await getRoleListApi(params)
    const pageData = transformPageResponse(response.data)
    roles.value = pageData.records || []
    total.value = pageData.total || 0
  } catch (error) {
    ElMessage.error('获取角色列表失败：' + error.message)
  }
}

// 获取权限树
const getPermissions = async () => {
  try {
    // 获取所有权限列表
    const permissionResponse = await getAllPermissionsApi()
    rolePermissions.value = permissionResponse.data || []
    
    // 获取角色已有权限
    if (roleForm.roleId) {
      const rolePermissionResponse = await getRolePermissionsApi(roleForm.roleId)
      const rolePermissionIds = rolePermissionResponse.data || []
      
      // 设置默认勾选状态
      setTimeout(() => {
        if (permissionTreeRef.value) {
          permissionTreeRef.value.setCheckedKeys(rolePermissionIds)
        }
      }, 100)
    }
  } catch (error) {
    ElMessage.error('获取权限树失败：' + error.message)
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getRoles()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getRoles()
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
  getRoles()
}

// 显示新增角色对话框
const showAddRoleDialog = () => {
  isEdit.value = false
  resetRoleForm()
  roleDialogVisible.value = true
}

// 显示编辑角色对话框
const showEditRoleDialog = (row) => {
  isEdit.value = true
  Object.assign(roleForm, row)
  roleDialogVisible.value = true
}

// 显示分配权限对话框
const showPermissionDialog = (row) => {
  Object.assign(roleForm, row)
  getPermissions()
  permissionDialogVisible.value = true
}

// 重置角色表单
const resetRoleForm = () => {
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
  Object.keys(roleForm).forEach(key => {
    roleForm[key] = ''
  })
  roleForm.status = '1'
}

// 保存角色
const handleSaveRole = async () => {
  if (!roleFormRef.value) return

  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑角色
          await updateRoleApi(roleForm)
          ElMessage.success('编辑角色成功')
        } else {
          // 新增角色
          await addRoleApi(roleForm)
          ElMessage.success('新增角色成功')
        }
        roleDialogVisible.value = false
        getRoles() // 重新获取角色列表
      } catch (error) {
        ElMessage.error('保存角色失败：' + error.message)
      }
    }
  })
}

// 删除角色
const handleDeleteRole = async (roleId) => {
  try {
    await deleteRoleApi(roleId)
    ElMessage.success('删除角色成功')
    getRoles() // 重新获取角色列表
  } catch (error) {
    ElMessage.error('删除角色失败：' + error.message)
  }
}

// 切换角色状态
const handleStatusChange = async (row) => {
  try {
    await updateRoleStatusApi(row.roleId, row.status)
    ElMessage.success('更新角色状态成功')
  } catch (error) {
    // 回滚状态
    row.status = row.status === '1' ? '0' : '1'
    ElMessage.error('更新角色状态失败：' + error.message)
  }
}

// 保存权限
const handleSavePermissions = async () => {
  if (!permissionTreeRef.value) return

  try {
    // 获取选中的权限ID
    const selectedPermissions = permissionTreeRef.value.getCheckedKeys()
    
    // 保存角色权限
    if (roleForm.roleId) {
      await saveRolePermissionsApi(roleForm.roleId, selectedPermissions)
      ElMessage.success('保存权限成功')
    }
    permissionDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存权限失败：' + error.message)
  }
}

// 页面加载时获取角色列表
onMounted(() => {
  getRoles()
})
</script>

<style scoped>
.role-management-container {
  padding: 0 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.button-row {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

/* 调整按钮样式，使其根据内容自适应宽度 */
.operation-buttons .el-button {
  border-radius: 4px;
  font-size: 12px;
  padding: 4px 10px;
  min-width: auto;
  height: 26px;
  line-height: 18px;
  width: auto;
  box-sizing: border-box;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 只有一个按钮时居中显示 */
.button-row:only-child .el-button {
  margin: 0 auto;
}

/* 占位符样式，确保删除按钮与编辑按钮对齐 */
.button-placeholder {
  width: auto;
  height: 26px;
  border-radius: 4px;
  opacity: 0;
}
</style>