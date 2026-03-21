<template>
  <div class="api-monitor-view">
    <el-card class="monitor-card">
      <template #header>
        <div class="card-header">
          <span>接口调用统计</span>
          <el-button type="primary" size="small" @click="refreshData">刷新数据</el-button>
        </div>
      </template>
      
      <div class="monitor-content">
        <!-- 时间范围选择 -->
        <el-form :inline="true" class="query-form">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :format="'YYYY-MM-DD HH:mm:ss'"
              :value-format="'YYYY-MM-DD HH:mm:ss'"
              @change="handleDateChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryData">查询</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 统计概览 -->
        <div class="statistics-overview">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">总请求数</div>
                <div class="stat-value">{{ totalRequests }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">成功请求</div>
                <div class="stat-value success">{{ successRequests }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">失败请求</div>
                <div class="stat-value error">{{ errorRequests }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-label">平均响应时间(ms)</div>
                <div class="stat-value">{{ averageResponseTime }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 图表区域 -->
        <div class="chart-container">
          <el-card class="chart-card">
            <template #header>
              <span>接口调用趋势</span>
            </template>
            <div id="trendChart" ref="trendChart" class="chart"></div>
          </el-card>
          
          <el-card class="chart-card">
            <template #header>
              <span>接口成功率分布</span>
            </template>
            <div id="successRateChart" ref="successRateChart" class="chart"></div>
          </el-card>
        </div>
        
        <!-- 接口详情列表 -->
        <el-card class="detail-card">
          <template #header>
            <span>接口调用详情</span>
          </template>
          <el-table :data="apiDetails" style="width: 100%" border>
            <el-table-column prop="apiPath" label="接口路径" min-width="200"></el-table-column>
            <el-table-column prop="method" label="请求方式" width="100"></el-table-column>
            <el-table-column prop="requestCount" label="请求次数" width="120"></el-table-column>
            <el-table-column prop="successCount" label="成功次数" width="120"></el-table-column>
            <el-table-column prop="errorCount" label="失败次数" width="120"></el-table-column>
            <el-table-column prop="avgResponseTime" label="平均响应时间(ms)" width="150"></el-table-column>
            <el-table-column prop="maxResponseTime" label="最大响应时间(ms)" width="150"></el-table-column>
            <el-table-column prop="minResponseTime" label="最小响应时间(ms)" width="150"></el-table-column>
          </el-table>
          
          <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                layout="prev, pager, next, sizes, jumper"
                :total="total"
                v-model:page-size="pageSize"
                v-model:current-page="currentPage"
                @update:current-page="handleCurrentChange"
                @update:page-size="handleSizeChange"
              ></el-pagination>
            </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getApiStatisticsApi, getApiTrendApi, getApiDetailsApi } from '../api/apiMonitor'

// 数据定义
const dateRange = ref([])
const totalRequests = ref(0)
const successRequests = ref(0)
const errorRequests = ref(0)
const averageResponseTime = ref(0)
const apiDetails = ref([])
const trendChart = ref(null)
const successRateChart = ref(null)
const loading = ref(false)
const chartLoading = ref(false)
let trendChartInstance = null
let successRateChartInstance = null
let trendData = null
// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    // 获取统计数据
    const statisticsResponse = await getApiStatisticsApi()
    if (statisticsResponse.code === 200) {
      const statistics = statisticsResponse.data
      totalRequests.value = statistics.totalRequests
      successRequests.value = statistics.successRequests
      errorRequests.value = statistics.errorRequests
      averageResponseTime.value = statistics.averageResponseTime
    }
    
    // 获取接口详情，传递分页参数
    const detailsResponse = await getApiDetailsApi({
      currentPage: currentPage.value,
      pageSize: pageSize.value
    })
    if (detailsResponse.code === 200) {
      apiDetails.value = detailsResponse.data.records || []
      total.value = detailsResponse.data.total || 0
    }
    
    ElMessage.success('数据加载成功')
  } catch (error) {
    ElMessage.error('数据加载失败：' + error.message)
    console.error('数据加载失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = async () => {
  chartLoading.value = true
  try {
    // 获取趋势数据
    const trendResponse = await getApiTrendApi()
    if (trendResponse.code === 200) {
      trendData = trendResponse.data
      
      // 趋势图
      trendChartInstance = echarts.init(trendChart.value)
      const trendOption = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['请求数', '成功数', '失败数']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: trendData.xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: trendData.series.map(item => ({
          name: item.name,
          type: 'line',
          stack: 'Total',
          data: item.data
        }))
      }
      trendChartInstance.setOption(trendOption)
      
      // 成功率饼图
      successRateChartInstance = echarts.init(successRateChart.value)
      const successRateOption = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '接口调用结果',
            type: 'pie',
            radius: '50%',
            data: [
              {
                value: successRequests.value,
                name: '成功'
              },
              {
                value: errorRequests.value,
                name: '失败'
              }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      successRateChartInstance.setOption(successRateOption)
      
      // 监听窗口大小变化，自动调整图表大小
      window.addEventListener('resize', handleResize)
    }
  } catch (error) {
    ElMessage.error('图表数据加载失败：' + error.message)
    console.error('图表数据加载失败:', error)
  } finally {
    chartLoading.value = false
  }
}

// 更新图表数据
const updateCharts = () => {
  // 更新成功率饼图
  if (successRateChartInstance) {
    successRateChartInstance.setOption({
      series: [
        {
          data: [
            {
              value: successRequests.value,
              name: '成功'
            },
            {
              value: errorRequests.value,
              name: '失败'
            }
          ]
        }
      ]
    })
  }
}

// 处理窗口大小变化
const handleResize = () => {
  trendChartInstance?.resize()
  successRateChartInstance?.resize()
}

// 刷新数据
const refreshData = async () => {
  await initData()
  updateCharts()
  ElMessage.success('数据刷新成功')
}

// 查询数据
const queryData = async () => {
  await initData()
  updateCharts()
  ElMessage.success('查询成功')
}

// 处理日期范围变化
const handleDateChange = () => {
  // 这里可以添加日期范围变化处理逻辑
  // 例如：根据日期范围重新获取数据
}

// 处理分页
const handleCurrentChange = (page) => {
  currentPage.value = page
  initData()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  initData()
}

// 组件挂载时初始化
onMounted(async () => {
  await initData()
  await initCharts()
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChartInstance?.dispose()
  successRateChartInstance?.dispose()
})
</script>

<style scoped>
.api-monitor-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-content {
  padding: 20px 0;
}

.query-form {
  margin-bottom: 20px;
}

.statistics-overview {
  margin-bottom: 20px;
}

.stat-item {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.error {
  color: #f56c6c;
}

.chart-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  flex: 1;
}

.chart {
  height: 300px;
  width: 100%;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>