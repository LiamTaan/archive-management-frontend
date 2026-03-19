import request from './request'

/**
 * 系统参数相关API
 */

/**
 * 获取所有系统参数
 * @returns {Promise}
 */
export const getAllSystemParamsApi = () => {
  return request.get('/system/param/all')
}

/**
 * 根据参数键名获取参数值
 * @param {string} paramKey 参数键名
 * @returns {Promise}
 */
export const getSystemParamByKeyApi = (paramKey) => {
  return request.get('/system/param/get', { params: { paramKey } })
}

/**
 * 保存系统参数
 * @param {object} paramMap 参数映射
 * @returns {Promise}
 */
export const saveSystemParamsApi = (paramMap) => {
  return request.post('/system/param/save', paramMap)
}
