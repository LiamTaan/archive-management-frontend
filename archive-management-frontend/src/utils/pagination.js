// 分页工具函数，用于处理前后端分页数据映射

/**
 * 将前端分页参数转换为后端PageRequest格式
 * @param {Object} params 前端分页参数对象
 * @returns {Object} 后端分页参数对象
 */
export const transformPageRequest = (params) => {
  return {
    pageNum: params.currentPage || 1,
    pageSize: params.pageSize || 10,
    ...params,
    // 移除前端特有的分页字段，避免冲突
    currentPage: undefined,
    page: undefined,
    size: undefined
  }
}

/**
 * 将后端PageResult转换为前端所需格式
 * @param {Object} pageResult 后端分页响应对象
 * @returns {Object} 前端分页数据对象
 */
export const transformPageResponse = (pageResult) => {
  return {
    records: pageResult.list || [],
    total: Number(pageResult.total) || 0,
    current: Number(pageResult.pageNum) || 1,
    size: Number(pageResult.pageSize) || 10,
    pages: Number(pageResult.totalPages) || 0
  }
}
