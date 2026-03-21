<template>
  <div class="video-preview-container">
    <!-- 头部信息 -->
    <div class="preview-header">
      <h2>{{ fileName }}</h2>
      <el-button type="primary" @click="closePreview">关闭预览</el-button>
    </div>
    
    <!-- 视频播放区域 -->
    <div class="video-content">
      <!-- 加载状态 -->
      <el-skeleton v-if="loading" animated :rows="8" />
      
      <!-- 视频播放器 -->
      <div v-else class="video-player-container">
        <video 
          ref="videoPlayer" 
          class="video-player" 
          controls 
          @timeupdate="handleTimeUpdate" 
          @loadedmetadata="handleLoadedMetadata"
          @error="handleVideoError"
        ></video>
      </div>
    </div>
    
    <!-- 视频信息 -->
    <div class="video-info" v-if="!loading">
      <el-progress 
        :percentage="progressPercentage" 
        :stroke-width="8" 
        :text-inside="true"
      />
      <div class="time-info">
        <span>当前时间: {{ formatTime(currentTime) }}</span>
        <span>总时长: {{ formatTime(totalDuration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getPreviewInfoApi, previewVideoSegmentApi } from '../api/archiveInfo'

// 从URL参数中获取fileId和fileName
import { useRoute } from 'vue-router'
const route = useRoute()
const fileId = ref(parseInt(route.query.fileId) || 0)
const fileName = ref(route.query.fileName || '')

// Emits
const emit = defineEmits(['close'])

// State
const loading = ref(false)
const videoPlayer = ref(null)
const currentTime = ref(0)
const totalDuration = ref(0)
const progressPercentage = ref(0)
const currentSegmentStart = ref(0)
const segmentDuration = 30 // 每个视频片段的时长（秒）
const currentBlobUrl = ref('')

// 关闭预览
const closePreview = () => {
  emit('close')
}

// 获取预览信息
const getPreviewInfo = async () => {
  try {
    const response = await getPreviewInfoApi(fileId.value)
    console.log('视频预览信息获取成功:', response.data)
    totalDuration.value = response.data.totalDuration || 0
  } catch (error) {
    ElMessage.error('获取预览信息失败: ' + error.message)
    console.error('获取视频预览信息失败:', error)
  }
}

// 加载视频片段
const loadVideoSegment = async (startTime, endTime) => {
  console.log('开始加载视频片段:', startTime, '-', endTime, 'fileId:', fileId.value)
  loading.value = true
  try {
    // 调用视频分片预览接口
    const blob = await previewVideoSegmentApi(fileId.value, startTime, endTime)
    console.log('previewVideoSegmentApi返回:', blob)
    
    // 检查blob是否有效
    if (!blob || !(blob instanceof Blob)) {
      throw new Error('返回的不是有效的Blob对象')
    }
    
    // 检查blob大小
    console.log('Blob大小:', blob.size, '类型:', blob.type)
    
    // 清理之前的Blob URL
    if (currentBlobUrl.value) {
      URL.revokeObjectURL(currentBlobUrl.value)
    }
    
    // 创建新的Blob URL
    const url = URL.createObjectURL(blob)
    currentBlobUrl.value = url
    
    // 更新视频源
    if (videoPlayer.value) {
      videoPlayer.value.src = url
      videoPlayer.value.currentTime = startTime
      videoPlayer.value.play()
    }
    
    // 记录当前片段范围
    currentSegmentStart.value = startTime
    console.log('视频片段加载成功:', startTime, '-', endTime, 'Blob URL:', url)
  } catch (error) {
    console.error('加载视频片段失败:', error)
    ElMessage.error('加载视频片段失败: ' + error.message)
  } finally {
    loading.value = false
    console.log('loadVideoSegment函数执行完成')
  }
}

// 处理视频播放时间更新
const handleTimeUpdate = () => {
  if (videoPlayer.value) {
    currentTime.value = videoPlayer.value.currentTime
    progressPercentage.value = Math.floor((currentTime.value / totalDuration.value) * 100)
    
    // 预加载下一个片段
    const nextSegmentStart = currentSegmentStart.value + segmentDuration
    const preloadThreshold = currentSegmentStart.value + segmentDuration * 0.7
    
    if (currentTime.value >= preloadThreshold && nextSegmentStart < totalDuration.value) {
      // 预加载下一个片段，不影响当前播放
      loadVideoSegment(nextSegmentStart, nextSegmentStart + segmentDuration)
    }
  }
}

// 处理视频元数据加载完成
const handleLoadedMetadata = () => {
  if (videoPlayer.value && !totalDuration.value) {
    totalDuration.value = videoPlayer.value.duration
  }
}

// 处理视频错误
const handleVideoError = () => {
  ElMessage.error('视频播放失败')
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 初始化
onMounted(() => {
  getPreviewInfo()
  // 加载第一个视频片段
  loadVideoSegment(0, segmentDuration)
})

// 清理资源
watch(() => fileId.value, () => {
  if (currentBlobUrl.value) {
    URL.revokeObjectURL(currentBlobUrl.value)
  }
})
</script>

<style scoped>
.video-preview-container {
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

.video-content {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.video-player-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
}

.video-player {
  width: 100%;
  max-width: 1200px;
  height: auto;
  border-radius: 4px;
}

.video-info {
  padding: 20px;
  background-color: white;
  border-top: 1px solid #eee;
}

.time-info {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}
</style>
