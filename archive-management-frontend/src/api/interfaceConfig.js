import request from './request'

/**
 * 接口配置API
 */

/**
 * 获取接口配置列表
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getInterfaceConfigsApi = (params) => {
  return request.get('/interface-config/list', { params })
}

/**
 * 获取接口配置详情
 * @param {number} id 接口配置ID
 * @returns {Promise}
 */
export const getInterfaceConfigApi = (id) => {
  return request.get(`/interface-config/${id}`)
}

/**
 * 新增接口配置
 * @param {object} data 接口配置数据
 * @returns {Promise}
 */
export const addInterfaceConfigApi = (data) => {
  return request.post('/interface-config', data)
}

/**
 * 更新接口配置
 * @param {number} id 接口配置ID
 * @param {object} data 接口配置数据
 * @returns {Promise}
 */
export const updateInterfaceConfigApi = (id, data) => {
  return request.put(`/interface-config/${id}`, data)
}

/**
 * 删除接口配置
 * @param {number} id 接口配置ID
 * @returns {Promise}
 */
export const deleteInterfaceConfigApi = (id) => {
  return request.delete(`/interface-config/${id}`)
}

/**
 * 更新接口配置状态
 * @param {number} id 接口配置ID
 * @param {number} status 状态（1-启用，0-禁用）
 * @returns {Promise}
 */
export const updateInterfaceConfigStatusApi = (id, status) => {
  return request.put(`/interface-config/${id}/status`, { status })
}
