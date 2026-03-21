import request from './request'

/**
 * 档案采集API
 */

/**
 * 自动接口采集
 * @param {number} interfaceId 接口配置ID
 * @returns {Promise}
 */
export const autoCollectApi = (interfaceId) => {
  return request.post(`/collection/auto/${interfaceId}`)
}

/**
 * 手动上传采集
 * @param {FormData} data 请求参数
 * @returns {Promise}
 */
export const manualUploadApi = (data) => {
  return request.post('/collection/manual', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量上传采集
 * @param {FormData} data 请求参数
 * @returns {Promise}
 */
export const batchUploadApi = (data) => {
  return request.post('/collection/batch', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 外部导入采集
 * @param {FormData} data 请求参数
 * @returns {Promise}
 */
export const externalImportApi = (data) => {
  return request.post('/collection/external', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 分片上传API
 */

/**
 * 上传分片
 * @param {FormData} formData 分片上传请求参数
 * @returns {Promise}
 */
export const uploadChunkApi = (formData) => {
  return request.post('/chunk/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 合并分片
 * @param {Object} data 合并分片请求参数
 * @returns {Promise}
 */
export const mergeChunksApi = (data) => {
  return request.post('/chunk/merge', data)
}

/**
 * 检查分片是否已上传
 * @param {string} fileMd5 文件MD5
 * @param {number} chunkIndex 分片索引
 * @returns {Promise}
 */
export const checkChunkApi = (fileMd5, chunkIndex) => {
  return request.get('/chunk/check', { params: { fileMd5, chunkIndex } })
}

/**
 * 检查文件是否已上传完成
 * @param {string} fileMd5 文件MD5
 * @returns {Promise}
 */
export const checkFileApi = (fileMd5) => {
  return request.get('/chunk/checkFile', { params: { fileMd5 } })
}

/**
 * 查询采集进度
 * @param {string} taskId 任务ID
 * @returns {Promise}
 */
export const getCollectionProgressApi = (taskId) => {
  return request.get(`/collection/progress/${taskId}`)
}