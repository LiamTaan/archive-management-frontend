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
      // 确保Authorization头被正确设置
      config.headers.Authorization = `Bearer ${token}`
      console.log('请求添加Token:', token.substring(0, 10) + '...')
    } else {
      console.warn('没有找到Token，请求可能会失败')
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 检查字符串是否包含HTML标签
const isHtmlContent = (str) => {
  if (!str) return false
  return /<(!DOCTYPE|html|body|head|title|meta|link|script|style|h\d|p|div|span|table|tr|td|th|ul|ol|li|a|img|br|hr|form|input|button|select|textarea|label|fieldset|legend|h1|h2|h3|h4|h5|h6|b|i|u|strong|em|small|sup|sub|del|ins|code|pre|blockquote|q|cite|abbr|acronym|address|dfn|kbd|samp|var|bdo|map|area|object|param|embed|applet|iframe|frame|frameset|noframes|noscript|script|style|base|link|meta|title|head|body|html|!DOCTYPE)/i.test(str)
}

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
          // 检查错误信息是否包含HTML标签
          let errorMessage = res.message || '请求失败'
          if (isHtmlContent(errorMessage)) {
            // 如果是404相关的HTML内容，给出正常提示
            if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
              errorMessage = '请求的资源不存在（404）'
            } else {
              errorMessage = '请求失败：返回格式异常'
            }
          }
          ElMessage.error(errorMessage)
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
    let errorMessage = '请求失败'
    
    if (error.response) {
      // 处理HTTP状态码层面的认证失败
      if (error.response.status === 401 || error.response.status === 403) {
        // 不显示错误信息，直接跳转登录页
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
        return Promise.reject(error)
      } else if (error.response.status === 500) {
        errorMessage = '服务器内部错误'
      } else if (error.response.status === 404) {
        // 404错误，给出正常提示
        errorMessage = '请求的资源不存在（404）'
      } else {
        // 检查错误信息是否包含HTML标签
        const dataMessage = error.response.data?.message || error.response.data
        if (isHtmlContent(dataMessage)) {
          errorMessage = '请求失败：返回格式异常'
        } else {
          errorMessage = dataMessage || `请求失败，状态码：${error.response.status}`
        }
      }
    } else if (error.request) {
      errorMessage = '网络错误，请稍后重试'
    } else {
      errorMessage = '请求配置错误'
    }
    
    ElMessage.error(errorMessage)
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