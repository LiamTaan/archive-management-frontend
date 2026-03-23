import request from './request'

/**
 * 挂接管理API
 */


/**
 * 手动挂接档案
 * @param {number} archiveId 档案ID
 * @param {Array} systemCode 目标系统代码数组
 * @param {string} operateBy 操作人
 * @returns {Promise}
 */
export const manualHangOnApi = (archiveId, systemCode, operateBy) => {
  return request.post(`/hang-on/manual/${archiveId}`, {
    systemCode,
    operateBy
  })
}

/**
 * 批量挂接档案
 * @param {object} data 请求参数
 * @returns {Promise}
 */
export const batchHangOnApi = (data) => {
  return request.post('/hang-on/batch', data)
}

/**
 * 校验档案挂接前的业务状态
 * @param {object} data 请求参数，包含archiveId和systemCode
 * @returns {Promise}
 */
export const checkHangOnValidApi = (data) => {
  return request.post('/hang-on/check-valid', data)
}

/**
 * 解除挂接档案
 * @param {number} archiveId 档案ID
 * @param {string} systemCode 目标系统代码
 * @param {string} operateBy 操作人
 * @returns {Promise}
 */
export const unhookApi = (archiveId, systemCode, operateBy) => {
  return request.post(`/hang-on/unhook/${archiveId}?systemCode=${systemCode}&operateBy=${operateBy}`)
}


/**
 * 获取挂接关系
 * @param {number} archiveId 档案ID
 * @returns {Promise}
 */
export const getRelationsApi = (archiveId) => {
  return request.get(`/hang-on/relations/${archiveId}`)
}

// 导出别名，兼容RelationVisualizationView.vue中的导入
export const getHangOnRelations = getRelationsApi

/**
 * 修改档案挂接关系
 * @param {number} archiveId 档案ID
 * @param {string} systemCode 目标系统代码
 * @param {object} data 修改数据
 * @returns {Promise}
 */
export const modifyHangOnRelationApi = (archiveId, systemCode, data) => {
  return request.put(`/hang-on/modify/${archiveId}?systemCode=${systemCode}`, data)
}

/**
 * 获取挂接日志
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getLogsApi = (params) => {
  return request.get(`/hang-on/log/query`, { params })
}