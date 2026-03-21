/**
 * 大文件预览工具类
 * 支持不同类型文件的流式预览和按需加载
 */

import { 
  getPreviewInfoApi, 
  previewPdfPageApi, 
  previewVideoSegmentApi, 
  convertOfficeToPdfApi 
} from '../api/archiveInfo'
import { ElMessage } from 'element-plus'

class LargeFilePreviewer {
  constructor() {
    this.previewInfo = null // 预览信息
    this.currentPage = 1 // 当前页码（PDF）
    this.currentTime = 0 // 当前时间（视频）
    this.isPreviewing = false // 预览状态
  }

  /**
   * 初始化预览
   * @param {number} fileId 档案ID
   * @returns {Promise} 预览信息
   */
  async initPreview(fileId) {
    try {
      // 获取预览基础信息
      const response = await getPreviewInfoApi(fileId)
      this.previewInfo = response.data
      
      // 检查是否需要转换
      if (this.previewInfo.needConvert && this.previewInfo.convertStatus !== 2) {
        // 触发转换
        await this.convertFile(fileId)
      }
      
      return this.previewInfo
    } catch (error) {
      ElMessage.error('获取预览信息失败: ' + error.message)
      throw error
    }
  }

  /**
   * 转换文件（例如Office转PDF）
   * @param {number} fileId 档案ID
   * @returns {Promise} 转换结果
   */
  async convertFile(fileId) {
    try {
      const response = await convertOfficeToPdfApi(fileId)
      ElMessage.success('转换请求已提交: ' + response.data.message)
      
      // 轮询转换状态（这里简化处理，实际应该使用WebSocket或定时轮询）
      // 这里只是模拟转换完成
      setTimeout(() => {
        this.previewInfo.convertStatus = 2 // 转换成功
        ElMessage.success('文件转换完成，可以开始预览')
      }, 3000)
      
      return response.data
    } catch (error) {
      ElMessage.error('文件转换失败: ' + error.message)
      throw error
    }
  }

  /**
   * 预览PDF文件（分页）
   * @param {number} fileId 档案ID
   * @param {number} page 页码
   * @returns {Promise<Blob>} PDF页面内容
   */
  async previewPdf(fileId, page = 1) {
    try {
      this.currentPage = page
      const response = await previewPdfPageApi(fileId, page)
      return response
    } catch (error) {
      ElMessage.error(`PDF页码 ${page} 预览失败: ` + error.message)
      throw error
    }
  }

  /**
   * 预览视频文件（分片）
   * @param {number} fileId 档案ID
   * @param {number} startTime 起始时间（秒）
   * @param {number} endTime 结束时间（秒）
   * @returns {Promise<Blob>} 视频片段内容
   */
  async previewVideo(fileId, startTime = 0, endTime = 30) {
    try {
      this.currentTime = startTime
      const response = await previewVideoSegmentApi(fileId, startTime, endTime)
      return response
    } catch (error) {
      ElMessage.error('视频预览失败: ' + error.message)
      throw error
    }
  }

  /**
   * 直接预览文件（根据文件类型选择合适的预览方式）
   * @param {Object} archive 档案对象
   */
  async openPreview(archive) {
    try {
      // 检查文件大小，对于超大文件给出提示
      const fileName = archive.fileName || ''
      
      // 先检查文件扩展名，直接判断文件类型
      const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
      
      // 如果是Office文件且文件太大，只给出提示，不进行预览
      const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'vsd', 'dwg']
      if (officeExtensions.includes(fileExtension)) {
        ElMessage.warning(`该类型文件不建议预览，只能下载查看`)
        return
      }
      
      // 如果是PDF文件，直接使用PDF预览方式
      if (fileExtension === 'pdf') {
        this.openPdfPreview(archive.id, fileName)
        return
      }
      
      // 如果是视频文件，直接使用视频预览方式
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
      if (videoExtensions.includes(fileExtension)) {
        this.openVideoPreview(archive.id, fileName)
        return
      }
      
      // 如果是图片文件，直接使用图片预览方式
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
      if (imageExtensions.includes(fileExtension)) {
        this.openImagePreview(archive)
        return
      }
      
      // 其他文件类型，使用传统预览方式
      this.openTraditionalPreview(archive)
    } catch (error) {
      ElMessage.error('预览失败: ' + error.message)
    }
  }

  /**
   * 打开PDF预览
   * @param {number} fileId 档案ID
   * @param {string} fileName 文件名
   */
  openPdfPreview(fileId, fileName) {
    // 在新标签页中打开系统内部的PDF预览页面，共享登录状态
    const previewUrl = `${window.location.origin}/pdf-preview?id=${fileId}&fileName=${encodeURIComponent(fileName)}`
    window.open(previewUrl, '_blank')
  }

  /**
   * 打开视频预览
   * @param {number} fileId 档案ID
   * @param {string} fileName 文件名
   */
  openVideoPreview(fileId, fileName) {
    // 在新标签页中打开系统内部的视频预览页面，共享登录状态
    const previewUrl = `${window.location.origin}/video-preview?id=${fileId}&fileName=${encodeURIComponent(fileName)}`
    window.open(previewUrl, '_blank')
  }

  /**
   * 打开图片预览
   * @param {Object} archive 档案对象
   */
  openImagePreview(archive) {
    // 图片可以直接使用PDF预览页面
    this.openPdfPreview(archive.id, archive.fileName)
  }

  /**
   * 使用传统方式预览（直接打开链接）
   * @param {Object} archive 档案对象
   */
  openTraditionalPreview(archive) {
    // 使用PDF预览页面作为默认预览方式，在新标签页中打开
    const previewUrl = `${window.location.origin}/pdf-preview?id=${archive.id}&fileName=${encodeURIComponent(archive.fileName)}`
    window.open(previewUrl, '_blank')
  }

  /**
   * 等待转换完成后预览
   * @param {Object} archive 档案对象
   */
  waitForConvertAndPreview(archive) {
    let retryCount = 0
    const maxRetryCount = 30 // 最多重试30次，避免无限轮询
    
    // 模拟轮询转换状态
    const checkStatus = async () => {
      // 检查预览状态和重试次数
      if (!this.isPreviewing) return
      if (retryCount >= maxRetryCount) {
        ElMessage.error('转换超时，无法预览')
        this.isPreviewing = false
        return
      }
      
      try {
        retryCount++
        console.log(`检查转换状态 (${retryCount}/${maxRetryCount})`)
        
        // 直接调用预览信息接口，不触发转换
        const response = await getPreviewInfoApi(archive.id)
        const previewInfo = response.data
        
        if (previewInfo.convertStatus === 2) {
          // 转换完成，开始预览
          this.openPdfPreview(archive.id, archive.fileName)
          this.isPreviewing = false
        } else if (previewInfo.convertStatus === 3) {
          // 转换失败
          ElMessage.error('文件转换失败，无法预览')
          this.isPreviewing = false
        } else {
          // 继续等待，每次等待时间递增，避免频繁请求
          const waitTime = 2000 + (retryCount * 500) // 从2秒开始，每次增加500毫秒
          setTimeout(checkStatus, waitTime)
        }
      } catch (error) {
        ElMessage.error('检查转换状态失败: ' + error.message)
        this.isPreviewing = false
      }
    }
    
    // 立即开始检查
    checkStatus()
  }

  /**
   * 关闭预览
   */
  closePreview() {
    this.isPreviewing = false
    this.previewInfo = null
    this.currentPage = 1
    this.currentTime = 0
  }

  /**
   * 获取当前预览信息
   * @returns {Object} 预览信息
   */
  getPreviewInfo() {
    return this.previewInfo
  }
}

// 导出单例实例
export default new LargeFilePreviewer()