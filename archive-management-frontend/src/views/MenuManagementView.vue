<template>
  <div class="menu-management-container">
    <h2 class="page-title">菜单管理</h2>
    
    <div class="menu-actions">
      <el-button type="primary" @click="openAddMenuDialog">
        <el-icon><Plus /></el-icon>
        添加菜单
      </el-button>
    </div>
    
    <div class="menu-table">
      <el-tree
        :data="menuList"
        :props="treeProps"
        node-key="menuId"
        default-expand-all
        :expand-on-click-node="false"
        style="width: 100%"
      >
        <template #default="{ node, data }">
          <div class="tree-node-content">
            <div class="menu-info-container">
              <div class="menu-basic-info">
                <el-icon v-if="data.menuType === 0" class="menu-type-icon folder-icon"><Folder /></el-icon>
                <el-icon v-else-if="data.menuType === 1" class="menu-type-icon menu-icon"><MenuIcon /></el-icon>
                <el-icon v-else class="menu-type-icon button-icon"><ButtonIcon /></el-icon>
                <span class="menu-name">{{ data.menuName }}</span>
              </div>
              <div class="menu-meta-info">
                <el-tag size="small" class="menu-type-tag">
                  {{ data.menuType === 0 ? '目录' : data.menuType === 1 ? '菜单' : '按钮' }}
                </el-tag>
                <el-tag :type="data.status === 1 ? 'success' : 'danger'" size="small" class="menu-status-tag">
                  {{ data.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </div>
            </div>
            <div class="menu-actions-container">
              <el-button type="primary" size="small" class="edit-button" @click="openEditMenuDialog(data)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" size="small" class="delete-button" @click="deleteMenu(data)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
    
    <!-- 添加/编辑菜单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="100px" :rules="formRules" ref="menuFormRef">
        <el-form-item label="父菜单" prop="parentId">
          <el-select v-model="formData.parentId" placeholder="请选择父菜单">
            <el-option label="顶级菜单" value="0" />
            <el-option
              v-for="menu in menuOptions"
              :key="menu.menuId"
              :label="menu.menuName"
              :value="menu.menuId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="formData.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入菜单路径" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="formData.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-select v-model="formData.menuType" placeholder="请选择菜单类型">
            <el-option label="目录" :value="0" />
            <el-option label="菜单" :value="1" />
            <el-option label="按钮" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入菜单图标" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch 
            v-model="formData.status" 
            :active-value="1" 
            :inactive-value="0" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { Plus, Edit, Delete, Folder, Menu as MenuIcon, CirclePlus as ButtonIcon } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllMenusApi, addMenuApi, updateMenuApi, deleteMenuApi } from '../api/menu'

// 菜单列表
const menuList = ref([])
// 菜单选项（用于父菜单选择）
const menuOptions = ref([])
// 对话框可见性
const dialogVisible = ref(false)
// 对话框标题
const dialogTitle = ref('添加菜单')
// 树形结构配置
const treeProps = {
  children: 'children',
  label: 'menuName'
}
// 表单数据
const formData = reactive({
  menuId: null,
  parentId: 0,
  menuName: '',
  path: '',
  component: '',
  menuType: 0,
  icon: '',
  sort: 0,
  status: 1
})
// 表单验证规则
const formRules = reactive({
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
})
// 表单引用
const menuFormRef = ref(null)

// 将树形结构转换为扁平结构
const flattenMenuTree = (menuTree) => {
  let flatList = []
  
  const traverse = (menu) => {
    flatList.push(menu)
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(child => traverse(child))
    }
  }
  
  menuTree.forEach(menu => traverse(menu))
  return flatList
}

// 获取菜单列表
const getMenuList = async () => {
  try {
    const response = await getAllMenusApi()
    menuList.value = response.data
    
    // 将树形结构转换为扁平结构，然后构建菜单选项（只包含目录和菜单，不包含按钮）
    const flatMenuList = flattenMenuTree(response.data)
    menuOptions.value = flatMenuList.filter(menu => menu.menuType !== 2)
  } catch (error) {
    ElMessage.error('获取菜单列表失败：' + error.message)
  }
}

// 打开添加菜单对话框
const openAddMenuDialog = () => {
  dialogTitle.value = '添加菜单'
  // 重置表单
  Object.assign(formData, {
    menuId: null,
    parentId: 0,
    menuName: '',
    path: '',
    component: '',
    menuType: 0,
    icon: '',
    sort: 0,
    status: 1
  })
  dialogVisible.value = true
}

// 打开编辑菜单对话框
const openEditMenuDialog = (menu) => {
  dialogTitle.value = '编辑菜单'
  // 填充表单数据
  Object.assign(formData, {
    menuId: menu.menuId,
    parentId: menu.parentId || 0,
    menuName: menu.menuName,
    path: menu.path || '',
    component: menu.component || '',
    menuType: menu.menuType,
    icon: menu.icon || '',
    sort: menu.sort || 0,
    status: menu.status
  })
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!menuFormRef.value) return
  await menuFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 处理父菜单ID，如果是0则设置为null
        const submitData = { ...formData }
        if (submitData.parentId === 0) {
          submitData.parentId = null
        }
        
        let response
        if (formData.menuId) {
          // 更新菜单
          response = await updateMenuApi(submitData)
          ElMessage.success('更新菜单成功')
        } else {
          // 添加菜单
          response = await addMenuApi(submitData)
          ElMessage.success('添加菜单成功')
        }
        
        // 关闭对话框
        dialogVisible.value = false
        // 重新获取菜单列表
        getMenuList()
      } catch (error) {
        ElMessage.error('操作失败：' + error.message)
      }
    }
  })
}

// 删除菜单
const deleteMenu = async (menu) => {
  try {
    await ElMessageBox.confirm('确定要删除这个菜单吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteMenuApi(menu.menuId)
    ElMessage.success('删除菜单成功')
    // 重新获取菜单列表
    getMenuList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

// 页面加载时获取菜单列表
onMounted(() => {
  getMenuList()
})
</script>

<style scoped>
.menu-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.menu-actions {
  margin-bottom: 20px;
}

.menu-table {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 树形节点样式 */
.tree-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.tree-node-content:hover {
  background-color: #f0f9ff;
}

/* 菜单信息容器 */
.menu-info-container {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

/* 菜单基本信息 */
.menu-basic-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* 菜单类型图标 */
.menu-type-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.folder-icon {
  color: #e6a23c;
}

.menu-icon {
  color: #67c23a;
}

.button-icon {
  color: #409eff;
}

/* 菜单名称 */
.menu-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 菜单元信息 */
.menu-meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-type-tag {
  background-color: #ecf5ff;
  color: #409eff;
}

.menu-status-tag {
  font-size: 12px;
}

/* 操作按钮容器 */
.menu-actions-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

/* 按钮样式 */
.menu-actions-container .el-button {
  padding: 4px 12px;
  font-size: 12px;
  height: 28px;
}

.edit-button {
  margin-right: 4px;
}

.delete-button {
  margin-left: 4px;
}

/* 调整树形控件样式 */
:deep(.el-tree-node__content) {
  padding: 0;
  height: auto;
}

:deep(.el-tree-node__expand-icon) {
  margin-right: 8px;
}
</style>