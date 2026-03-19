import request from './request'

/**
 * 用户管理API
 */

/**
 * 获取用户列表
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getUserListApi = (params) => {
  return request.get('/user/list', { params })
}

/**
 * 获取用户详情
 * @param {number} id 用户ID
 * @returns {Promise}
 */
export const getUserDetailApi = (id) => {
  return request.get(`/user/detail/${id}`)
}

/**
 * 新增用户
 * @param {object} data 用户数据
 * @returns {Promise}
 */
export const addUserApi = (data) => {
  return request.post('/user/add', data)
}

/**
 * 更新用户
 * @param {object} data 用户数据
 * @returns {Promise}
 */
export const updateUserApi = (data) => {
  return request.put('/user/update', data)
}

/**
 * 删除用户
 * @param {number} id 用户ID
 * @returns {Promise}
 */
export const deleteUserApi = (id) => {
  return request.delete(`/user/delete/${id}`)
}

/**
 * 更新用户状态
 * @param {number} id 用户ID
 * @param {number} status 状态
 * @returns {Promise}
 */
export const updateUserStatusApi = (id, status) => {
  return request.put(`/user/status/${id}`, { status })
}

/**
 * 获取所有角色列表
 * @returns {Promise}
 */
export const getAllRolesApi = () => {
  return request.get('/user/roles')
}

/**
 * 获取用户已关联的角色列表
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
export const getUserRolesApi = (userId) => {
  return request.get(`/user/roles/${userId}`)
}

/**
 * 保存用户关联的角色
 * @param {number} userId 用户ID
 * @param {array} roleIds 角色ID列表
 * @returns {Promise}
 */
export const saveUserRolesApi = (userId, roleIds) => {
  return request.post(`/user/roles/${userId}`, roleIds)
}

/**
 * 重置用户密码
 * @param {number} userId 用户ID
 * @param {string} newPassword 新密码
 * @returns {Promise}
 */
export const resetPasswordApi = (userId, newPassword) => {
  return request.put(`/user/reset-password/${userId}`, { newPassword })
}

/**
 * 修改用户密码
 * @param {string} oldPassword 旧密码
 * @param {string} newPassword 新密码
 * @returns {Promise}
 */
export const updatePasswordApi = (oldPassword, newPassword) => {
  return request.put('/auth/update-password', { oldPassword, newPassword })
}
