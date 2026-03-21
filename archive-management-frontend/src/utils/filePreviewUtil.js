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
      this.isPreviewing = true
      const previewInfo = await this.initPreview(archive.id)
      
      // 根据预览类型选择预览方式
      switch (previewInfo.previewType) {
        case 'pdf':
          this.openPdfPreview(archive.id, archive.fileName)
          break
        case 'video':
          this.openVideoPreview(archive.id, archive.fileName)
          break
        case 'image':
          this.openImagePreview(archive)
          break
        case 'office':
          // 等待转换完成后预览PDF
          this.waitForConvertAndPreview(archive)
          break
        default:
          // 使用传统方式预览
          this.openTraditionalPreview(archive)
          break
      }
    } catch (error) {
      ElMessage.error('预览失败: ' + error.message)
      this.isPreviewing = false
    }
  }

  /**
   * 打开PDF预览
   * @param {number} fileId 档案ID
   * @param {string} fileName 文件名
   */
  openPdfPreview(fileId, fileName) {
    // 这里实现PDF分页预览的UI逻辑
    // 可以创建一个新窗口或弹出层，实现页码导航
    console.log('打开PDF预览:', fileId, fileName)
    ElMessage.info('PDF预览功能开发中')
  }

  /**
   * 打开视频预览
   * @param {number} fileId 档案ID
   * @param {string} fileName 文件名
   */
  openVideoPreview(fileId, fileName) {
    // 这里实现视频分片预览的UI逻辑
    // 可以创建一个视频播放器，支持按需加载
    console.log('打开视频预览:', fileId, fileName)
    ElMessage.info('视频预览功能开发中')
  }

  /**
   * 打开图片预览
   * @param {Object} archive 档案对象
   */
  openImagePreview(archive) {
    // 图片可以直接使用传统方式预览
    this.openTraditionalPreview(archive)
  }

  /**
   * 使用传统方式预览（直接打开链接）
   * @param {Object} archive 档案对象
   */
  openTraditionalPreview(archive) {
    const previewUrl = `${import.meta.env.VITE_API_BASE_URL}/archive/info/preview?id=${archive.id}`
    window.open(previewUrl, archive.fileName)
  }

  /**
   * 等待转换完成后预览
   * @param {Object} archive 档案对象
   */
  waitForConvertAndPreview(archive) {
    // 模拟轮询转换状态
    const checkStatus = async () => {
      if (!this.isPreviewing) return
      
      const previewInfo = await this.initPreview(archive.id)
      if (previewInfo.convertStatus === 2) {
        // 转换完成，开始预览
        this.openPdfPreview(archive.id, archive.fileName)
      } else if (previewInfo.convertStatus === 3) {
        // 转换失败
        ElMessage.error('文件转换失败，无法预览')
        this.isPreviewing = false
      } else {
        // 继续等待
        setTimeout(checkStatus, 2000)
      }
    }
    
    setTimeout(checkStatus, 2000)
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