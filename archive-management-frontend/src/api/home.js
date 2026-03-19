import request from './request'

/**
 * 首页相关API
 */

/**
 * 获取首页统计数据
 * @returns {Promise} 统计数据
 */
export const getHomeStatsApi = () => {
  return request.get('/home/stats')
}

/**
 * 获取最近活动列表
 * @param {number} limit 限制条数
 * @returns {Promise} 活动列表
 */
export const getRecentActivitiesApi = (limit = 5) => {
  return request.get('/home/activities', { params: { limit } })
}

/**
 * 获取待办事项列表
 * @returns {Promise} 待办事项列表
 */
export const getTodosApi = () => {
  return request.get('/home/todos')
}