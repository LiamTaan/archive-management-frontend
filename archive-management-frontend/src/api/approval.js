import request from './request'

/**
 * 审批相关API
 */

/**
 * 发起审批申请
 * @param {object} data 审批申请数据
 * @returns {Promise}
 */
export const submitApprovalApi = (data) => {
  return request.post('/approval/submit', data)
}

/**
 * 获取待审批列表
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getPendingApprovalsApi = (params) => {
  return request.get('/approval/pending', { params })
}

/**
 * 获取已审批列表
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getApprovedApprovalsApi = (params) => {
  return request.get('/approval/approved', { params })
}

/**
 * 获取当前用户的待办审批列表
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getMyPendingApprovalsApi = (params) => {
  return request.get('/approval/my/pending', { params })
}

/**
 * 获取当前用户的已办审批列表
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getMyApprovedApprovalsApi = (params) => {
  return request.get('/approval/my/approved', { params })
}

/**
 * 提交审批结果
 * @param {number} approvalId 审批ID
 * @param {object} data 审批结果数据
 * @returns {Promise}
 */
export const submitApprovalResultApi = (approvalId, data) => {
  return request.post(`/approval/result/${approvalId}`, data)
}