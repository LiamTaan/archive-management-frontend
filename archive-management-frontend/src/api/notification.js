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
    url: `/notification/read/${id}`,
    method: 'put'
  })
}

// 批量标记通知为已读
export const batchMarkAsRead = (ids) => {
  return request({
    url: '/notification/batch-read',
    method: 'put',
    data: { ids }
  })
}

// 删除通知
export const deleteNotification = (id) => {
  return request({
    url: `/notification/delete/${id}`,
    method: 'delete'
  })
}

// 批量删除通知
export const batchDeleteNotifications = (ids) => {
  return request({
    url: '/notification/batch-delete',
    method: 'delete',
    data: { ids }
  })
}
