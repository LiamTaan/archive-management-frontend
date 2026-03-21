/**
 * 大文件下载工具类
 * 支持分片下载、并发控制、断点续传
 */

import { getFileChunkInfoApi, downloadChunkApi } from '../api/archiveInfo'
import { ElMessage } from 'element-plus'

class LargeFileDownloader {
  constructor() {
    this.chunkSize = 1024 * 1024 * 5 // 5MB per chunk
    this.concurrent = 3 // 并发数控制在3-5之间
    this.chunks = [] // 分片数组
    this.downloadedChunks = new Set() // 已下载的分片索引
    this.isPaused = false // 暂停状态
    this.fileInfo = null // 文件信息
    this.progressCallback = null // 进度回调
    this.completeCallback = null // 完成回调
  }

  /**
   * 初始化下载
   * @param {number} fileId 档案ID
   * @param {Function} progressCallback 进度回调
   * @param {Function} completeCallback 完成回调
   */
  async initDownload(fileId, progressCallback, completeCallback) {
    this.progressCallback = progressCallback
    this.completeCallback = completeCallback
    
    try {
      // 获取分片信息
      const response = await getFileChunkInfoApi(fileId)
      this.fileInfo = response.data
      this.chunkSize = this.fileInfo.chunkSize
      
      // 初始化分片数组
      this.chunks = new Array(this.fileInfo.totalChunks).fill(null)
      
      ElMessage.success('开始下载文件: ' + this.fileInfo.fileName)
      return this.fileInfo
    } catch (error) {
      ElMessage.error('获取文件信息失败: ' + error.message)
      throw error
    }
  }

  /**
   * 开始下载
   * @param {number} fileId 档案ID
   */
  async start(fileId) {
    if (!this.fileInfo) {
      await this.initDownload(fileId, this.progressCallback, this.completeCallback)
    }
    
    this.isPaused = false
    await this.downloadChunks(fileId)
  }

  /**
   * 下载分片
   * @param {number} fileId 档案ID
   */
  async downloadChunks(fileId) {
    const totalChunks = this.fileInfo.totalChunks
    const chunkSize = this.fileInfo.chunkSize
    let activeTasks = 0
    let currentIndex = 0
    const taskQueue = []

    // 创建并发控制函数
    const executeTask = async (index) => {
      if (this.isPaused) return
      
      activeTasks++
      try {
        // 跳过已下载的分片
        if (this.downloadedChunks.has(index)) {
          activeTasks--
          return
        }
        
        // 下载分片
        const response = await downloadChunkApi(fileId, index, chunkSize)
        this.chunks[index] = await this.blobToArrayBuffer(response)
        this.downloadedChunks.add(index)
        
        // 更新进度
        this.updateProgress()
        
        // 检查是否所有分片都已下载完成
        if (this.downloadedChunks.size === totalChunks) {
          await this.mergeChunks()
          return
        }
      } catch (error) {
        ElMessage.error(`分片 ${index + 1}/${totalChunks} 下载失败: ${error.message}`)
      } finally {
        activeTasks--
        
        // 继续执行下一个任务
        if (currentIndex < totalChunks) {
          taskQueue.push(executeTask(currentIndex++))
        }
      }
    }

    // 启动初始并发任务
    while (activeTasks < this.concurrent && currentIndex < totalChunks) {
      taskQueue.push(executeTask(currentIndex++))
    }

    // 等待所有任务完成
    await Promise.all(taskQueue)
  }

  /**
   * 暂停下载
   */
  pause() {
    this.isPaused = true
    ElMessage.info('下载已暂停')
  }

  /**
   * 继续下载
   * @param {number} fileId 档案ID
   */
  async resume(fileId) {
    await this.start(fileId)
  }

  /**
   * 更新下载进度
   */
  updateProgress() {
    if (this.progressCallback) {
      const progress = (this.downloadedChunks.size / this.fileInfo.totalChunks) * 100
      this.progressCallback(progress)
    }
  }

  /**
   * 合并分片
   */
  async mergeChunks() {
    try {
      // 计算总大小
      const totalSize = this.chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
      
      // 创建ArrayBuffer并合并所有分片
      const result = new Uint8Array(totalSize)
      let offset = 0
      
      for (let i = 0; i < this.chunks.length; i++) {
        const chunk = this.chunks[i]
        result.set(new Uint8Array(chunk), offset)
        offset += chunk.byteLength
      }
      
      // 转换为Blob
      const blob = new Blob([result], { type: this.getFileContentType(this.fileInfo.fileType) })
      
      // 触发下载
      this.triggerDownload(blob)
      
      // 调用完成回调
      if (this.completeCallback) {
        this.completeCallback(blob)
      }
      
      ElMessage.success('文件下载完成: ' + this.fileInfo.fileName)
    } catch (error) {
      ElMessage.error('文件合并失败: ' + error.message)
      throw error
    }
  }

  /**
   * Blob转ArrayBuffer
   * @param {Blob} blob Blob对象
   * @returns {Promise<ArrayBuffer>} ArrayBuffer对象
   */
  blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(blob)
    })
  }

  /**
   * 触发浏览器下载
   * @param {Blob} blob Blob对象
   */
  triggerDownload(blob) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = this.fileInfo.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 获取文件内容类型
   * @param {string} fileType 文件类型
   * @returns {string} MIME类型
   */
  getFileContentType(fileType) {
    const contentTypeMap = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      txt: 'text/plain'
    }
    return contentTypeMap[fileType.toLowerCase()] || 'application/octet-stream'
  }

  /**
   * 获取已下载的分片数量
   * @returns {number} 已下载分片数量
   */
  getDownloadedCount() {
    return this.downloadedChunks.size
  }

  /**
   * 获取总分片数量
   * @returns {number} 总分片数量
   */
  getTotalChunks() {
    return this.fileInfo ? this.fileInfo.totalChunks : 0
  }

  /**
   * 重置下载器
   */
  reset() {
    this.chunks = []
    this.downloadedChunks.clear()
    this.isPaused = false
    this.fileInfo = null
    this.progressCallback = null
    this.completeCallback = null
  }
}

// 导出单例实例
export default new LargeFileDownloader()