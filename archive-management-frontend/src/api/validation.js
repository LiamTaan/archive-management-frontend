import request from './request'

/**
 * 挂接校验API
 */

/**
 * 单文件挂接校验
 * @param {object} data 校验请求参数
 * @returns {Promise}
 */
export const validateSingleHookApi = (data) => {
  return request.post('/validation/single', data)
}

/**
 * 批量文件挂接校验
 * @param {Array} data 校验请求参数列表
 * @returns {Promise}
 */
export const validateBatchHookApi = (data) => {
  return request.post('/validation/batch', data)
}

/**
 * 手动修正校验失败的挂接
 * @param {number} archiveId 档案ID
 * @param {object} data 修正后的校验请求参数
 * @returns {Promise}
 */
export const manualCorrectHookApi = (archiveId, data) => {
  return request.put(`/validation/correct/${archiveId}`, data)
}

/**
 * 仅校验档案格式
 * @param {string} fileType 文件类型
 * @param {string} filePath 文件路径
 * @returns {Promise}
 */
export const validateFileFormatApi = (fileType, filePath) => {
  return request.get('/validation/format', { params: { fileType, filePath } })
}

/**
 * 仅校验文件完整性
 * @param {string} filePath 文件路径
 * @param {string} expectedMd5 预期MD5值
 * @returns {Promise}
 */
export const validateFileIntegrityApi = (filePath, expectedMd5) => {
  return request.get('/validation/integrity', { params: { filePath, expectedMd5 } })
}

/**
 * 生成单文件校验报告
 * @param {object} validationResult 校验结果
 * @returns {Promise}
 */
export const generateSingleReportApi = (validationResult) => {
  return request.post('/validation/report/single', validationResult)
}

/**
 * 生成批量校验报告
 * @param {Array} validationResults 校验结果列表
 * @returns {Promise}
 */
export const generateBatchReportApi = (validationResults) => {
  return request.post('/validation/report/batch', validationResults)
}