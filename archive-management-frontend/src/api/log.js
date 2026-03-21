import request from './request'

/**
 * 日志管理API
 */

/**
 * 获取采集日志
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export const getCollectionLogsApi = (params) => {
  return request.get('/collection/log/query', { params })
}

/**
 * 获取系统日志
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export const getSystemLogsApi = (params) => {
  return request.get('/system/log/query', { params })
}