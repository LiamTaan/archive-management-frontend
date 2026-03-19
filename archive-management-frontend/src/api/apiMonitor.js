import request from './request'

/**
 * 接口监控API
 */

/**
 * 获取接口监控统计数据
 * @returns {Promise}
 */
export const getApiStatisticsApi = () => {
  return request.get('/api-monitor/statistics')
}

/**
 * 获取接口调用趋势数据
 * @returns {Promise}
 */
export const getApiTrendApi = () => {
  return request.get('/api-monitor/trend')
}

/**
 * 获取接口调用详情列表
 * @param {Object} params 查询参数，包含currentPage和pageSize
 * @returns {Promise}
 */
export const getApiDetailsApi = (params) => {
  return request.get('/api-monitor/details', { params })
}
