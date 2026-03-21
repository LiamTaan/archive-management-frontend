<template>
  <div class="pdf-preview-container">
    <!-- 头部信息 -->
    <div class="preview-header">
      <h2>{{ fileName }}</h2>
      <el-button type="primary" @click="closePreview">关闭预览</el-button>
    </div>
    
    <!-- PDF内容区域 -->
    <div class="pdf-content">
      <!-- 加载状态 -->
      <el-skeleton v-if="loading" animated :rows="10" />
      
      <!-- PDF显示区域 -->
      <div v-else-if="pdfUrl" class="pdf-page-container">
        <!-- 使用embed标签替代iframe，更好地支持PDF预览 -->
        <embed :src="pdfUrl" class="pdf-embed" type="application/pdf" />
      </div>
      
      <!-- 错误状态 -->
      <div v-else class="pdf-error">
        <el-alert
          title="PDF加载失败"
          type="error"
          description="无法加载PDF文件，请稍后重试或联系管理员"
          show-icon
        />
        <el-button type="primary" @click="loadPdfPage(1)">重试加载</el-button>
      </div>
    </div>
    
    <!-- 页码导航 -->
    <div class="pdf-controls">
      <el-button 
        type="primary" 
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        上一页
      </el-button>
      
      <div class="page-info">
        <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      </div>
      
      <el-button 
        type="primary" 
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        下一页
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { previewPdfPageApi, getPreviewInfoApi } from '../api/archiveInfo'

// 从URL参数中获取fileId和fileName
import { useRoute } from 'vue-router'
const route = useRoute()
const fileId = ref(parseInt(route.query.fileId) || 0)
const fileName = ref(route.query.fileName || '')

// Emits
const emit = defineEmits(['close'])

// State
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const pdfUrl = ref('')

// 关闭预览
const closePreview = () => {
  emit('close')
}

// 获取预览信息
const getPreviewInfo = async () => {
  try {
    const response = await getPreviewInfoApi(fileId.value)
    console.log('预览信息获取成功:', response.data)
    totalPages.value = response.data.totalPages || 1
    // 如果totalPages为0，设置默认值1
    if (totalPages.value === 0) {
      totalPages.value = 1
      console.log('totalPages为0，设置默认值1')
    }
  } catch (error) {
    ElMessage.error('获取预览信息失败: ' + error.message)
    console.error('获取预览信息失败:', error)
    // 出错时设置默认页码
    totalPages.value = 1
  }
}

// 加载PDF页面
const loadPdfPage = async (page) => {
  console.log('开始加载PDF页面:', page, 'fileId:', fileId.value)
  loading.value = true
  try {
    console.log('直接使用fetch调用API:', fileId.value, page)
    
    // 使用fetch直接调用API，避免axios拦截器可能导致的问题
    const token = localStorage.getItem('token') || ''
    const response = await fetch(`/api/info/preview/pdf/page?id=${fileId.value}&page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      },
      credentials: 'include'
    })
    
    console.log('fetch响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      // 处理HTTP错误
      throw new Error(`HTTP错误! 状态: ${response.status} ${response.statusText}`)
    }
    
    // 获取blob对象
    const blob = await response.blob()
    console.log('获取到Blob对象:', blob.size, blob.type)
    
    // 检查blob是否有效
    if (!blob || blob.size === 0) {
      throw new Error('返回的Blob对象为空')
    }
    
    // 创建Blob URL
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }
    // 如果blob没有type，手动设置为application/pdf
    const blobWithType = blob.type ? blob : new Blob([blob], { type: 'application/pdf' })
    pdfUrl.value = URL.createObjectURL(blobWithType)
    currentPage.value = page
    console.log('PDF页面加载成功:', page, 'Blob URL:', pdfUrl.value)
  } catch (error) {
    console.error('PDF页面加载失败:', error)
    let errorMsg = `PDF页码 ${page} 预览失败`
    if (error.message.includes('403') || error.message.includes('Access Denied')) {
      errorMsg += ': 权限不足，请联系管理员'
    } else if (error.message.includes('401')) {
      errorMsg += ': 登录已过期，请重新登录'
    } else if (error.message.includes('network') || error.message.includes('Network')) {
      errorMsg += ': 网络错误，请检查网络连接'
    } else {
      errorMsg += `: ${error.message}`
    }
    ElMessage.error(errorMsg)
    loading.value = false
  } finally {
    console.log('loadPdfPage函数执行完成')
    loading.value = false
  }
}

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    loadPdfPage(currentPage.value - 1)
  }
}

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    loadPdfPage(currentPage.value + 1)
  }
}

// 初始化
onMounted(async () => {
  // 先获取预览信息，再加载PDF
  await getPreviewInfo()
  loadPdfPage(1)
})

// 清理Blob URL
watch(() => fileId.value, () => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value)
  }
})
</script>

<style scoped>
.pdf-preview-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  border-bottom: 1px solid #eee;
}

.pdf-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.pdf-page-container {
  text-align: center;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.pdf-embed {
  width: 100%;
  height: 700px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pdf-error {
  text-align: center;
  padding: 50px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.pdf-error .el-alert {
  margin-bottom: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.pdf-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: white;
  border-top: 1px solid #eee;
}

.page-info {
  font-size: 14px;
  color: #666;
}
</style>
