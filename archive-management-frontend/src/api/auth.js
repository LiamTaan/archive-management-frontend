import request from './request'

/**
 * 认证管理API
 */

/**
 * 用户登录
 * @param {object} data 请求参数
 * @returns {Promise}
 */
export const loginApi = (data) => {
  return request.post('/auth/login', data)
}

/**
 * 用户注销
 * @returns {Promise}
 */
export const logoutApi = () => {
  return request.post('/auth/logout')
}

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export const getCurrentUserApi = () => {
  return request.get('/auth/currentUser')
}