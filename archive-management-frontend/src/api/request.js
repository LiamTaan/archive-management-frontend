import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 请求缓存对象
const requestCache = new Map()

// 创建axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 60000 // 超时时间改为60秒，适应大文件下载
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加Token到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const config = response.config
    // 如果是blob类型的响应，直接返回response.data
    if (config.responseType === 'blob') {
      return response.data
    }
    
    const res = response.data
    // 如果响应不是200，说明请求失败
    if (res.code !== 200) {
      // 处理业务层面的认证失败
        if (res.code === 401 || res.code === 403) {
          // 不显示错误信息，直接跳转登录页
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          router.push('/login')
        } else {
          ElMessage.error(res.message || '请求失败')
        }
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      // 缓存GET请求结果
      if (config.method === 'get') {
        const cacheKey = `${config.baseURL}${config.url}${JSON.stringify(config.params || {})}`
        requestCache.set(cacheKey, response)
        // 设置缓存过期时间（5分钟）
        setTimeout(() => {
          requestCache.delete(cacheKey)
        }, 5 * 60 * 1000)
      }
      return res
    }
  },
  error => {
    console.error('响应错误:', error)
    if (error.response) {
    // 处理HTTP状态码层面的认证失败
    if (error.response.status === 401 || error.response.status === 403) {
      // 不显示错误信息，直接跳转登录页
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
    } else if (error.response.status === 500) {
      ElMessage.error('服务器内部错误')
    } else {
      ElMessage.error(error.response.data?.message || '请求失败')
    }
    } else if (error.request) {
      ElMessage.error('网络错误，请稍后重试')
    } else {
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

// 清除指定URL的缓存
export const clearCache = (url) => {
  for (const key of requestCache.keys()) {
    if (key.includes(url)) {
      requestCache.delete(key)
    }
  }
}

// 清除所有缓存
export const clearAllCache = () => {
  requestCache.clear()
}

export default service