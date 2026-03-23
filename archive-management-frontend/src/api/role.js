import request from './request'

/**
 * 角色管理API
 */

/**
 * 获取角色列表
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getRoleListApi = (params) => {
  return request.get('/role/list', { params })
}

/**
 * 获取角色详情
 * @param {number} id 角色ID
 * @returns {Promise}
 */
export const getRoleDetailApi = (id) => {
  return request.get(`/role/detail/${id}`)
}

/**
 * 新增角色
 * @param {object} data 角色数据
 * @returns {Promise}
 */
export const addRoleApi = (data) => {
  return request.post('/role/add', data)
}

/**
 * 更新角色
 * @param {object} data 角色数据
 * @returns {Promise}
 */
export const updateRoleApi = (data) => {
  return request.put('/role/update', data)
}

/**
 * 删除角色
 * @param {number} id 角色ID
 * @returns {Promise}
 */
export const deleteRoleApi = (id) => {
  return request.delete(`/role/delete/${id}`)
}

/**
 * 更新角色状态
 * @param {number} id 角色ID
 * @param {number} status 状态
 * @returns {Promise}
 */
export const updateRoleStatusApi = (id, status) => {
  return request.put(`/role/status/${id}`, { status })
}

/**
 * 获取角色权限列表
 * @param {number} roleId 角色ID
 * @returns {Promise}
 */
export const getRolePermissionsApi = (roleId) => {
  return request.get(`/role/permissions/${roleId}`)
}

/**
 * 保存角色权限
 * @param {number} roleId 角色ID
 * @param {array} permissions 权限ID列表
 * @returns {Promise}
 */
export const saveRolePermissionsApi = (roleId, permissions) => {
  return request.post(`/role/permissions/${roleId}`, permissions)
}

/**
 * 获取所有权限列表
 * @returns {Promise}
 */
export const getAllPermissionsApi = () => {
  return request.get('/role/permission/list')
}
