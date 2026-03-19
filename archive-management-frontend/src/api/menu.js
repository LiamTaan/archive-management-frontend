import request from './request'

/**
 * 菜单管理API
 */

/**
 * 获取用户菜单列表
 * @returns {Promise}
 */
export const getUserMenusApi = () => {
  return request.get('/menu/getUserMenus')
}

/**
 * 获取所有菜单列表
 * @returns {Promise}
 */
export const getAllMenusApi = () => {
  return request.get('/menu/list')
}

/**
 * 添加菜单
 * @param {Object} menuData 菜单数据
 * @returns {Promise}
 */
export const addMenuApi = (menuData) => {
  return request.post('/menu/add', menuData)
}

/**
 * 更新菜单
 * @param {Object} menuData 菜单数据
 * @returns {Promise}
 */
export const updateMenuApi = (menuData) => {
  return request.put('/menu/update', menuData)
}

/**
 * 删除菜单
 * @param {number} menuId 菜单ID
 * @returns {Promise}
 */
export const deleteMenuApi = (menuId) => {
  return request.delete(`/menu/delete/${menuId}`)
}

/**
 * 获取菜单详情
 * @param {number} menuId 菜单ID
 * @returns {Promise}
 */
export const getMenuByIdApi = (menuId) => {
  return request.get(`/menu/${menuId}`)
}

/**
 * 获取菜单选择列表
 * @returns {Promise}
 */
export const getMenuSelectListApi = () => {
  return request.get('/menu/selectList')
}