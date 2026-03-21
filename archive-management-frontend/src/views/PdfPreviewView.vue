<template>
  <div class="pdf-preview-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>PDF 文件预览</span>
          <el-button type="primary" @click="handleClose">关闭预览</el-button>
        </div>
      </template>

      <div class="preview-content">
        <!-- PDF预览区域 -->
        <div class="pdf-viewer" v-if="previewInfo">
          <!-- 页码导航 -->
          <div class="page-navigation" v-if="previewInfo.params.totalPages > 0">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="1"
              :total="previewInfo.params.totalPages"
              layout="prev, pager, next"
              @update:current-page="handlePageChange"
            />
          </div>
          <div class="page-navigation" v-else>
            <el-alert
              title="提示"
              type="info"
              description="无法获取总页数，将加载完整PDF"
              :closable="false"
            />
          </div>

          <!-- PDF页面内容 -->
          <div class="pdf-content">
            <el-image
              v-if="pdfBlob"
              :src="pdfUrl"
              fit="contain"
              style="width: 100%; height: 100%;"
              :loading="isLoading"
            >
              <template #loading>
                <div class="image-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
              </template>
            </el-image>
            <div v-else class="no-content">
              <el-empty description="暂无预览内容" />
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-else class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载预览信息中...</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getPreviewInfoApi, previewPdfPageApi } from '../api/archiveInfo'

const route = useRoute()
const router = useRouter()

// 预览状态
const previewInfo = ref(null)
const isLoading = ref(false)
const currentPage = ref(1)
const pdfBlob = ref(null)

// 计算属性：PDF预览URL
const pdfUrl = computed(() => {
  if (pdfBlob.value) {
    return URL.createObjectURL(pdfBlob.value)
  }
  return ''
})

// 初始化预览
const initPreview = async () => {
  try {
    // 从URL中直接获取查询参数，确保能正确获取fileId
    let fileId = route.query.fileId
    
    // 如果route.query.fileId获取不到，尝试从window.location.search中直接解析
    if (!fileId) {
      const urlParams = new URLSearchParams(window.location.search)
      fileId = urlParams.get('id')
    }
    
    if (!fileId) {
      ElMessage.error('文件ID不能为空')
      router.back()
      return
    }

    // 获取预览信息
    const response = await getPreviewInfoApi(fileId)
    previewInfo.value = response.data
    
    // 加载第一页
    await loadPdfPage(1)
  } catch (error) {
    ElMessage.error('获取预览信息失败: ' + error.message)
    router.back()
  }
}

// 加载PDF页码
const loadPdfPage = async (page) => {
  try {
    isLoading.value = true
    let fileId = route.query.fileId
    
    // 如果route.query.fileId获取不到，尝试从window.location.search中直接解析
    if (!fileId) {
      const urlParams = new URLSearchParams(window.location.search)
      fileId = urlParams.get('id')
    }
    
    // 调用PDF分页预览接口
    const response = await previewPdfPageApi(fileId, page)
    pdfBlob.value = response
    
    // 更新当前页码
    currentPage.value = page
  } catch (error) {
    ElMessage.error(`加载页码 ${page} 失败: ` + error.message)
  } finally {
    isLoading.value = false
  }
}

// 页码变化处理
const handlePageChange = (page) => {
  loadPdfPage(page)
}

// 关闭预览
const handleClose = () => {
  // 释放URL对象
  if (pdfBlob.value) {
    URL.revokeObjectURL(pdfUrl.value)
  }
  router.back()
}

// 页面加载时初始化预览
onMounted(() => {
  initPreview()
})

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.fileId) {
      initPreview()
    }
  }
)
</script>

<style scoped>
.pdf-preview-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-content {
  padding: 20px 0;
}

.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.page-navigation {
  margin-bottom: 20px;
  text-align: center;
}

.pdf-content {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
}

.no-content {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-container {
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  color: #606266;
}

.image-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #606266;
}

.is-loading {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 16px;
}
</style>