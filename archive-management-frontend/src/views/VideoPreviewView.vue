<template>
  <div class="video-preview-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>视频文件预览</span>
          <el-button type="primary" @click="handleClose">关闭预览</el-button>
        </div>
      </template>

      <div class="preview-content">
        <!-- 视频预览区域 -->
        <div class="video-viewer" v-if="previewInfo">
          <!-- 视频播放器 -->
          <div class="video-player">
            <video
              ref="videoRef"
              controls
              :src="videoUrl"
              :poster="posterUrl"
              :preload="'metadata'"
              @loadedmetadata="handleLoadedMetadata"
              @timeupdate="handleTimeUpdate"
              @error="handleVideoError"
              style="width: 100%; height: auto; max-height: 500px;"
            >
              您的浏览器不支持HTML5视频播放。
            </video>
          </div>

          <!-- 视频信息 -->
          <div class="video-info" style="margin-top: 20px;">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="文件名">{{ previewInfo.fileName }}</el-descriptions-item>
              <el-descriptions-item label="文件大小">{{ formatFileSize(previewInfo.fileSize) }}</el-descriptions-item>
              <el-descriptions-item label="视频时长">{{ formatDuration(videoDuration) }}</el-descriptions-item>
              <el-descriptions-item label="当前时间">{{ formatDuration(currentTime) }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 分片加载控制 -->
          <div class="segment-controls" style="margin-top: 20px;">
            <el-button type="primary" @click="handlePlaySegment">
              播放当前片段
            </el-button>
            <el-button @click="handlePlayFullVideo">
              播放完整视频
            </el-button>
            <el-input-number
              v-model="segmentDuration"
              :min="5"
              :max="60"
              :step="5"
              label="片段时长(秒)"
              style="margin-left: 20px;"
            />
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getPreviewInfoApi, previewVideoSegmentApi } from '../api/archiveInfo'

const route = useRoute()
const router = useRouter()

// 视频播放器引用
const videoRef = ref(null)

// 预览状态
const previewInfo = ref(null)
const isLoading = ref(false)
const segmentDuration = ref(30) // 默认片段时长30秒
const videoDuration = ref(0) // 视频总时长
const currentTime = ref(0) // 当前播放时间
const videoBlob = ref(null) // 当前视频片段Blob
const posterUrl = ref('') // 视频封面

// 计算属性：视频预览URL
const videoUrl = computed(() => {
  if (videoBlob.value) {
    return URL.createObjectURL(videoBlob.value)
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
    
    // 加载初始视频片段
    await loadVideoSegment(0, segmentDuration.value)
  } catch (error) {
    ElMessage.error('获取预览信息失败: ' + error.message)
    router.back()
  }
}

// 加载视频片段
const loadVideoSegment = async (startTime, endTime) => {
  try {
    isLoading.value = true
    let fileId = route.query.fileId
    
    // 如果route.query.fileId获取不到，尝试从window.location.search中直接解析
    if (!fileId) {
      const urlParams = new URLSearchParams(window.location.search)
      fileId = urlParams.get('id')
    }
    
    // 调用视频分片预览接口
    const response = await previewVideoSegmentApi(fileId, startTime, endTime)
    videoBlob.value = response
    
    // 重置播放器
    if (videoRef.value) {
      videoRef.value.load()
      videoRef.value.play()
    }
  } catch (error) {
    ElMessage.error(`加载视频片段失败: ` + error.message)
  } finally {
    isLoading.value = false
  }
}

// 播放当前片段
const handlePlaySegment = () => {
  if (videoRef.value) {
    const currentTime = videoRef.value.currentTime
    loadVideoSegment(currentTime, currentTime + segmentDuration.value)
  }
}

// 播放完整视频
const handlePlayFullVideo = () => {
  if (videoRef.value && previewInfo.value) {
    // 构建完整视频播放URL
    let fileId = route.query.fileId
    
    // 如果route.query.fileId获取不到，尝试从window.location.search中直接解析
    if (!fileId) {
      const urlParams = new URLSearchParams(window.location.search)
      fileId = urlParams.get('id')
    }
    
    const fullVideoUrl = `${import.meta.env.VITE_API_BASE_URL}/archive/info/download?id=${fileId}`
    
    // 设置完整视频URL
    videoRef.value.src = fullVideoUrl
    videoRef.value.load()
    videoRef.value.play()
  }
}

// 视频元数据加载完成
const handleLoadedMetadata = () => {
  if (videoRef.value) {
    videoDuration.value = videoRef.value.duration
  }
}

// 视频播放时间更新
const handleTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    
    // 如果接近当前片段末尾，自动加载下一个片段
    if (videoBlob.value && videoRef.value.duration - currentTime.value < 5) {
      handlePlaySegment()
    }
  }
}

// 视频播放错误处理
const handleVideoError = (event) => {
  console.error('视频播放错误:', event)
  ElMessage.error('视频播放错误，请尝试重新加载。')
}

// 关闭预览
const handleClose = () => {
  // 释放URL对象
  if (videoBlob.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
  router.back()
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let fileSize = size
  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }
  return `${fileSize.toFixed(2)} ${units[unitIndex]}`
}

// 格式化时长（秒转换为时分秒）
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00:00'
  
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// 页面加载时初始化预览
onMounted(() => {
  initPreview()
})
</script>

<style scoped>
.video-preview-container {
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

.video-viewer {
  display: flex;
  flex-direction: column;
}

.video-player {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  background-color: #000;
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

.is-loading {
  font-size: 32px;
  color: #409eff;
  margin-right: 10px;
}
</style>