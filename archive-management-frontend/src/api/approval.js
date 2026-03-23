import request from './request'

/**
 * 审批管理API
 */

/**
 * 提交挂接申请
 * @param {number} archiveId 档案ID
 * @returns {Promise}
 */
export const submitApplyApi = (archiveId) => {
  return request.post('/approval/apply', { archiveId })
}

/**
 * 获取审批列表
 * @param {object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.size 每页大小
 * @param {number} [params.archiveId] 档案ID
 * @param {number} [params.status] 审批状态（0-待审批，1-部门审核通过，2-档案复核通过，3-已入库，4-驳回）
 * @returns {Promise}
 */
export const getApprovalListApi = (params) => {
  return request.get('/approval/list', { params })
}

/**
 * 获取审批详情
 * @param {number} applyId 申请ID
 * @returns {Promise}
 */
export const getApprovalDetailApi = (applyId) => {
  return request.get(`/approval/${applyId}`)
}

/**
 * 部门审核
 * @param {object} data 审核参数
 * @param {number} data.applyId 申请ID
 * @param {boolean} data.pass 是否通过
 * @param {string} data.opinion 审核意见
 * @returns {Promise}
 */
export const deptAuditApi = (data) => {
  return request.post('/approval/dept-audit', data)
}

/**
 * 档案复核
 * @param {object} data 复核参数
 * @param {number} data.applyId 申请ID
 * @param {boolean} data.pass 是否通过
 * @param {string} data.opinion 复核意见
 * @returns {Promise}
 */
export const archiveAuditApi = (data) => {
  return request.post('/approval/archive-audit', data)
}

/**
 * 最终入库
 * @param {number} applyId 申请ID
 * @returns {Promise}
 */
export const finalArchiveApi = (applyId) => {
  return request.post('/approval/final-archive', { applyId })
}

/**
 * 获取审批历史记录
 * @param {number} applyId 申请ID
 * @returns {Promise}
 */
export const getApprovalHistoryApi = (applyId) => {
  return request.get(`/approval/${applyId}/history`)
}

/**
 * 获取审批统计信息
 * @returns {Promise}
 */
export const getApprovalStatisticsApi = () => {
  return request.get('/approval/statistics')
}
