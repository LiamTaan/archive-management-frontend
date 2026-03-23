import request from './request'

// 获取通知列表
export const getNotifications = (params) => {
  return request({
    url: '/notification/list',
    method: 'get',
    params
  })
}


// 标记通知为已读
export const markNotificationAsRead = (id) => {
  return request({
    url: `/notification/${id}/read`,
    method: 'put'
  })
}

// 批量标记通知为已读
export const batchMarkAsRead = (ids) => {
  return request({
    url: '/notification/batch/read',
    method: 'put',
    data: ids
  })
}

// 删除通知
export const deleteNotification = (id) => {
  return request({
    url: `/notification/${id}`,
    method: 'delete'
  })
}

// 批量删除通知
export const batchDeleteNotifications = (ids) => {
  return request({
    url: '/notification/batch',
    method: 'delete',
    data: ids
  })
}
