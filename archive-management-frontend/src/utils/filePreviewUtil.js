/**
 * 文件预览工具类
 * 只支持基础的预览功能，大文件直接要求下载查看
 */

import { previewArchiveApi } from '../api/archiveInfo'
import { ElMessage } from 'element-plus'

class FilePreviewer {
  constructor() {
    // 简化构造函数，只保留必要的属性
    this.isPreviewing = false // 预览状态
  }

  /**
   * 直接预览文件（根据文件类型和大小选择合适的预览方式）
   * @param {Object} archive 档案对象
   */
  async openPreview(archive) {
    try {
      const fileName = archive.fileName || ''
      const fileSize = archive.fileSize || 0 // 文件大小（字节）
      
      // 先检查文件大小，大文件（>10MB）直接提示下载
      const maxPreviewSize = 20 * 1024 * 1024 // 10MB
      // 如果fileSize为0或未定义，仍然允许预览，由浏览器处理
      if (fileSize > maxPreviewSize) {
        ElMessage.warning(`文件较大（${(fileSize / 1024 / 1024).toFixed(2)}MB），建议直接下载查看`)
        return
      }
      
      // 检查文件扩展名，判断文件类型
      const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
      
      // 不建议预览的文件类型，直接提示下载
      const noPreviewExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'vsd', 'dwg', 'zip', 'rar', '7z']
      if (noPreviewExtensions.includes(fileExtension)) {
        ElMessage.warning(`该类型文件不建议预览，建议直接下载查看`)
        return
      }
      
      // 使用基础预览方式
      this.openBasicPreview(archive)
    } catch (error) {
      ElMessage.error('预览失败: ' + error.message)
    }
  }

  /**
   * 使用基础方式预览（直接获取文件内容并打开）
   * @param {Object} archive 档案对象
   */
  async openBasicPreview(archive) {
    try {
      this.isPreviewing = true
      
      // 使用基础预览接口获取文件内容
      const blob = await previewArchiveApi(archive.id)
      
      // 创建临时URL
      const previewUrl = URL.createObjectURL(blob)
      
      // 在新标签页中打开文件
      window.open(previewUrl, '_blank')
      
      this.isPreviewing = false
    } catch (error) {
      ElMessage.error('文件预览失败: ' + error.message)
      this.isPreviewing = false
    }
  }


}

// 创建并导出单例实例
export const filePreviewUtil = new FilePreviewer()