import request from './request'

/**
 * 档案信息API
 */

/**
 * 分页查询档案信息
 * @param {object} queryDTO 查询条件
 * @returns {Promise}
 */
export const queryArchiveByPageApi = (queryDTO) => {
  return request.post('/info/query', queryDTO)
}

/**
 * 根据ID查询档案详情
 * @param {number} id 档案ID
 * @returns {Promise}
 */
export const getArchiveByIdApi = (id) => {
  return request.get(`/info/${id}`)
}

/**
 * 预览档案文件
 * @param {number} id 档案ID
 * @returns {Promise}
 */
export const previewArchiveApi = (id) => {
  return request.get('/info/preview', { 
    params: { id }, 
    responseType: 'blob',
    timeout: 120000 // 预览请求超时时间设置为120秒
  })
}

/**
 * 下载档案文件
 * @param {number} id 档案ID
 * @returns {Promise}
 */
export const downloadArchiveApi = (id) => {
  return request.get('/info/download', { 
    params: { id }, 
    responseType: 'blob',
    timeout: 300000 // 下载请求超时时间设置为300秒（5分钟）
  })
}

// ------------------------------ 大文件下载新接口 ------------------------------

/**
 * 获取文件分片信息（预下载接口）
 * @param {number} id 档案ID
 * @returns {Promise}
 */
export const getFileChunkInfoApi = (id) => {
  return request.get('/info/download/pre', { 
    params: { id },
    timeout: 300000
  })
}

/**
 * 下载指定分片（核心下载接口）
 * @param {number} id 档案ID
 * @param {number} chunkIndex 分片索引
 * @param {number} chunkSize 分片大小
 * @returns {Promise}
 */
export const downloadChunkApi = (id, chunkIndex, chunkSize) => {
  return request.get('/info/download/chunk', { 
    params: { id, chunkIndex, chunkSize },
    responseType: 'blob',
    timeout: 300000
  })
}

// ------------------------------ 大文件预览新接口 ------------------------------

/**
 * 获取预览基础信息
 * @param {number} id 档案ID
 * @returns {Promise}
 */
export const getPreviewInfoApi = (id) => {
  return request.get('/info/preview/info', { 
    params: { id },
    timeout: 300000
  })
}

/**
 * PDF分页预览
 * @param {number} id 档案ID
 * @param {number} page 页码
 * @returns {Promise}
 */
export const previewPdfPageApi = (id, page) => {
  // 直接使用完整的API路径，避免路径问题
  return request.get('/info/preview/pdf/page', { 
    params: { id, page },
    responseType: 'blob',
    timeout: 300000,
    headers: {
      // 确保认证头被正确传递
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    },
    // 禁用响应头处理，避免中文文件名导致的问题
    transformResponse: [function (data) {
      // 直接返回原始数据，不进行任何转换
      return data
    }]
  })
}

/**
 * 视频分片预览
 * @param {number} id 档案ID
 * @param {number} startTime 起始时间（秒）
 * @param {number} endTime 结束时间（秒）
 * @returns {Promise}
 */
export const previewVideoSegmentApi = (id, startTime, endTime) => {
  // 直接使用完整的API路径，避免路径问题
  return request.get('/info/preview/video/segment', { 
    params: { id, startTime, endTime },
    responseType: 'blob',
    timeout: 300000,
    headers: {
      // 确保认证头被正确传递
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    },
    // 禁用响应头处理，避免中文文件名导致的问题
    transformResponse: [function (data) {
      // 直接返回原始数据，不进行任何转换
      return data
    }]
  })
}

