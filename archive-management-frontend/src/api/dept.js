import request from './request'

// 获取部门树结构
export const getDeptTreeApi = () => {
  return request({
    url: '/dept/tree',
    method: 'get'
  })
}

// 新增部门
export const addDeptApi = (data) => {
  return request({
    url: '/dept/add',
    method: 'post',
    data
  })
}

// 更新部门
export const updateDeptApi = (data) => {
  return request({
    url: '/dept/update',
    method: 'put',
    data
  })
}

// 删除部门
export const deleteDeptApi = (deptId) => {
  return request({
    url: `/dept/${deptId}`,
    method: 'delete'
  })
}

// 获取所有部门列表 - 后端暂未实现
export const getAllDeptsApi = () => {
  return request({
    url: '/dept/tree',
    method: 'get'
  })
}

