import request from './request'  
import { clearCache } from './request'  

// 档案组合API
export default {
  // 获取档案组合列表
  getArchiveCombinationList(queryParams) {
    return request({
      url: '/archive-combination/list',
      method: 'post',
      data: queryParams
    })
  },
  
  // 获取单个档案组合详情
  getArchiveCombinationDetail(id) {
    return request({
      url: `/archive-combination/detail/${id}`,
      method: 'get'
    })
  },
  
  // 创建档案组合
  createArchiveCombination(data) {
    // 清除列表缓存
    clearCache('/archive-combination/list')
    return request({
      url: '/archive-combination/create',
      method: 'post',
      data
    })
  },
  
  // 更新档案组合
  updateArchiveCombination(data) {
    // 清除列表缓存
    clearCache('/archive-combination/list')
    return request({
      url: '/archive-combination/update',
      method: 'put',
      data
    })
  },
  
  // 删除档案组合
  deleteArchiveCombination(id) {
    // 清除列表缓存
    clearCache('/archive-combination/list')
    return request({
      url: `/archive-combination/delete/${id}`,
      method: 'delete'
    })
  },
  
  // 获取档案组合的档案关系列表
  getArchiveCombinationRelations(combinationId) {
    return request({
      url: `/archive-combination/relations/${combinationId}`,
      method: 'get'
    })
  },
  
  // 批量保存档案组合关系（档案组合挂接）
  saveArchiveCombinationRelations(data) {
    // 清除列表缓存
    clearCache('/archive-combination/list')
    return request({
      url: '/archive-combination/save-relations',
      method: 'post',
      data
    })
  },
  
  // 删除档案组合关系
  deleteArchiveCombinationRelation(id) {
    // 清除列表缓存
    clearCache('/archive-combination/list')
    return request({
      url: `/archive-combination/relation/${id}`,
      method: 'delete'
    })
  }
}
