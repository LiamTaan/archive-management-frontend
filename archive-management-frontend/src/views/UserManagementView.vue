<template>
  <div class="user-management-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="showAddUserDialog">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <div class="filter-section">
        <el-form :model="searchForm" label-width="80px" :inline="true">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable /> 
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
      </div>

      <!-- 用户列表 -->
      <div class="table-section">
        <div class="table-container">
          <el-table :data="users" border style="width: 100%;" fit>
          <el-table-column prop="userId" label="用户ID" min-width="80" /> 
          <el-table-column prop="username" label="用户名" min-width="100" />
          <el-table-column prop="nickname" label="昵称" min-width="100" />
          <el-table-column prop="email" label="邮箱" min-width="150" />
          <el-table-column prop="phone" label="手机号" min-width="110" />
          <el-table-column label="所属部门" min-width="100">
            <template #default="scope">
              {{ getDeptName(scope.row.deptId) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="80">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="140" />
          <el-table-column label="操作" min-width="150">
            <template #default="scope">
              <div class="operation-buttons">
                <div class="button-row">
                  <el-button type="primary" size="small" @click="showEditUserDialog(scope.row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="warning" size="small" @click="showAssignRolesDialog(scope.row)">
                    <el-icon><User /></el-icon>
                    分配角色
                  </el-button>
                </div>
                <div class="button-row">
                  <el-button type="danger" size="small" @click="handleDeleteUser(scope.row.userId)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                  <el-button type="info" size="small" @click="showResetPasswordDialog(scope.row)">
                    <el-icon><Key /></el-icon>
                    重置密码
                  </el-button>
                </div>
              </div>
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
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <!-- 新增/编辑用户对话框 -->
      <el-dialog v-model="userDialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="50%">
        <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password" v-if="!isEdit">
            <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
            <el-input v-model="userForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="userForm.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="userForm.status" placeholder="请选择状态">
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="部门" prop="deptId">
            <el-tree-select
              v-model="userForm.deptId"
              :data="deptOptions"
              :props="{ label: 'deptName', value: 'deptId', children: 'children' }"
              placeholder="请选择部门"
              node-key="deptId"
              check-strictly
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="userDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSaveUser">保存</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 角色分配对话框 -->
      <el-dialog v-model="roleDialogVisible" title="分配角色" width="50%">
        <el-form :model="roleForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="roleForm.username" disabled />
          </el-form-item>
          <el-form-item label="角色列表">
            <el-checkbox-group v-model="roleForm.selectedRoles">
              <el-checkbox v-for="role in allRoles" :key="role.roleId" :label="role.roleId" :disabled="!role.status">
                {{ role.roleName }}
                <span v-if="!role.status" style="color: #909399; margin-left: 5px;">(已禁用)</span>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="roleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSaveRoles">保存</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 重置密码对话框 -->
      <el-dialog v-model="resetPasswordDialogVisible" title="重置密码" width="50%">
        <el-form :model="resetPasswordForm" :rules="resetPasswordRules" ref="resetPasswordFormRef" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model="resetPasswordForm.username" disabled />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="resetPasswordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="resetPasswordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleResetPassword">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElTreeSelect } from 'element-plus'
import { Plus, Edit, Delete, User, Key } from '@element-plus/icons-vue'
import { getUserListApi, updateUserStatusApi, addUserApi, updateUserApi, deleteUserApi, getAllRolesApi, getUserRolesApi, saveUserRolesApi, resetPasswordApi } from '../api/user'
import { getDeptTreeApi } from '../api/dept'
import { transformPageRequest, transformPageResponse } from '../utils/pagination'

// 搜索表单
const searchForm = reactive({
  username: '',
  status: ''
})

// 用户列表
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 部门列表
const deptOptions = ref([])

// 对话框
const userDialogVisible = ref(false)
const isEdit = ref(false)
const userFormRef = ref(null)
const userForm = reactive({
  userId: '',
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  phone: '',
  status: '1',
  deptId: ''
})

// 角色分配对话框
const roleDialogVisible = ref(false)
const allRoles = ref([])
const roleForm = reactive({
  userId: '',
  username: '',
  selectedRoles: []
})

// 重置密码对话框
const resetPasswordDialogVisible = ref(false)
const resetPasswordForm = reactive({
  userId: '',
  username: '',
  newPassword: '',
  confirmPassword: ''
})
const resetPasswordFormRef = ref(null)

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 重置密码验证规则
const resetPasswordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ]
}

// 获取用户列表
const getUsers = async () => {
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    }
    const response = await getUserListApi(params)
    const pageData = transformPageResponse(response.data)
    users.value = pageData.records || []
    total.value = pageData.total || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败：' + error.message)
  }
}

// 加载部门列表
const loadDepts = async () => {
  try {
    const response = await getDeptTreeApi()
    // 直接使用树状结构数据
    deptOptions.value = response.data || []
  } catch (error) {
    ElMessage.error('获取部门列表失败')
  }
}

// 根据部门ID获取部门名称
const getDeptName = (deptId) => {
  if (!deptId) return ''
  
  // 在树状结构中递归查找部门
  const findDeptById = (depts, id) => {
    for (const dept of depts) {
      if (Number(dept.deptId) === Number(id)) {
        return dept
      }
      if (dept.children && dept.children.length > 0) {
        const found = findDeptById(dept.children, id)
        if (found) return found
      }
    }
    return null
  }
  
  const dept = findDeptById(deptOptions.value, deptId)
  return dept ? dept.deptName : ''
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getUsers()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getUsers()
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
  getUsers()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  getUsers()
}

// 显示新增用户对话框
const showAddUserDialog = () => {
  isEdit.value = false
  resetUserForm()
  userDialogVisible.value = true
}

// 显示编辑用户对话框
const showEditUserDialog = (row) => {
  isEdit.value = true
  Object.assign(userForm, row)
  userDialogVisible.value = true
}

// 重置用户表单
const resetUserForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  Object.keys(userForm).forEach(key => {
    userForm[key] = ''
  })
  userForm.status = '1'
  userForm.deptId = ''
}

// 保存用户
const handleSaveUser = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑用户
          await updateUserApi(userForm)
          ElMessage.success('编辑用户成功')
        } else {
          // 新增用户
          await addUserApi(userForm)
          ElMessage.success('新增用户成功')
        }
        userDialogVisible.value = false
        getUsers() // 重新获取用户列表
      } catch (error) {
        ElMessage.error('保存用户失败：' + error.message)
      }
    }
  })
}

// 删除用户
const handleDeleteUser = async (userId) => {
  try {
    await deleteUserApi(userId)
    ElMessage.success('删除用户成功')
    getUsers() // 重新获取用户列表
  } catch (error) {
    ElMessage.error('删除用户失败：' + error.message)
  }
}

// 切换用户状态
const handleStatusChange = async (row) => {
  try {
    await updateUserStatusApi(row.userId, row.status)
    ElMessage.success('更新用户状态成功')
  } catch (error) {
    // 回滚状态
    row.status = row.status === '1' ? '0' : '1'
    ElMessage.error('更新用户状态失败：' + error.message)
  }
}

// 获取所有角色
const getAllRoles = async () => {
  try {
    const response = await getAllRolesApi()
    allRoles.value = response.data || []
  } catch (error) {
    ElMessage.error('获取角色列表失败：' + error.message)
  }
}

// 显示分配角色对话框
const showAssignRolesDialog = async (row) => {
  roleForm.userId = row.userId
  roleForm.username = row.username
  roleForm.selectedRoles = []
  
  // 获取所有角色
  await getAllRoles()
  
  // 获取用户已分配的角色
  try {
    const response = await getUserRolesApi(row.userId)
    roleForm.selectedRoles = response.data || []
  } catch (error) {
    ElMessage.error('获取用户角色失败：' + error.message)
  }
  
  roleDialogVisible.value = true
}

// 保存角色分配
const handleSaveRoles = async () => {
  try {
    await saveUserRolesApi(roleForm.userId, roleForm.selectedRoles)
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
  } catch (error) {
    ElMessage.error('角色分配失败：' + error.message)
  }
}

// 显示重置密码对话框
const showResetPasswordDialog = (row) => {
  resetPasswordForm.userId = row.userId
  resetPasswordForm.username = row.username
  resetPasswordForm.newPassword = ''
  resetPasswordForm.confirmPassword = ''
  resetPasswordDialogVisible.value = true
}

// 处理重置密码
const handleResetPassword = async () => {
  if (!resetPasswordFormRef.value) return
  
  await resetPasswordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await resetPasswordApi(resetPasswordForm.userId, resetPasswordForm.newPassword)
        ElMessage.success('重置密码成功')
        resetPasswordDialogVisible.value = false
      } catch (error) {
        ElMessage.error('重置密码失败：' + error.message)
      }
    }
  })
}

// 页面加载时获取用户列表和部门列表
onMounted(() => {
  getUsers()
  loadDepts()
})
</script>

<style scoped>
.user-management-container {
  padding: 0 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 16px;
}

.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
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
  display: inline-block;
}
</style>