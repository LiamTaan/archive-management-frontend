import request from './request'  

// 审计报表API
export default {
  // 获取审计报表列表
  getAuditReportList(params) {
    return request({
      url: '/audit-report/list',
      method: 'get',
      params
    })
  },
  
  // 获取单个审计报表详情
  getAuditReportDetail(id) {
    return request({
      url: `/audit-report/detail/${id}`,
      method: 'get'
    })
  },
  
  // 生成审计报表
  generateAuditReport(data) {
    return request({
      url: '/audit-report/generate',
      method: 'post',
      data
    })
  },
  
  // 删除审计报表
  deleteAuditReport(id) {
    return request({
      url: `/audit-report/delete/${id}`,
      method: 'delete'
    })
  },
  
  // 下载审计报表
  downloadAuditReport(id) {
    return request({
      url: `/audit-report/download/${id}`,
      method: 'get',
      responseType: 'blob' // 重要：设置响应类型为blob
    })
  }
}
