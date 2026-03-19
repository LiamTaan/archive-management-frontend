<template>
  <div class="relation-visualization-container">
    <el-card shadow="hover" class="visualization-card">
      <template #header>
        <div class="card-header">
          <span>档案关联关系可视化</span>
          <el-input
            v-model="archiveId"
            placeholder="输入档案ID"
            style="width: 200px; margin-left: 20px"
            clearable
          />
          <el-button type="primary" @click="loadRelationData" :loading="loading">
            加载关系图
          </el-button>
        </div>
      </template>
      <div class="chart-container">
        <v-chart
          class="relation-chart"
          :option="chartOption"
          autoresize
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import {
  GraphChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { getHangOnRelations } from '../api/hangOn'

// 注册必须的组件
use([
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
])

const archiveId = ref('')
const loading = ref(false)
const chartOption = reactive({
  title: {
    text: '档案关联关系图',
    left: 'center'
  },
  tooltip: {
    formatter: (params) => {
      if (params.dataType === 'node') {
        return `${params.name}<br/>类型: ${params.data.category === 0 ? '主档案' : '关联系统'}<br/>状态: ${params.data.status}`
      } else {
        return `关系类型: ${params.data.name}`
      }
    }
  },
  legend: {
    data: ['主档案', '关联系统'],
    bottom: 10
  },
  animationDurationUpdate: 1500,
  animationEasingUpdate: 'quinticInOut',
  series: [
    {
      type: 'graph',
      layout: 'force',
      force: {
        repulsion: 300,
        edgeLength: [80, 150]
      },
      roam: true,
      label: {
        show: true,
        formatter: '{b}'
      },
      edgeLabel: {
        fontSize: 12
      },
      data: [],
      links: [],
      categories: [
        {
          name: '主档案',
          itemStyle: {
            color: '#ff7f50'
          }
        },
        {
          name: '关联系统',
          itemStyle: {
            color: '#87cefa'
          }
        }
      ]
    }
  ]
})

// 加载关联关系数据
const loadRelationData = async () => {
  if (!archiveId.value) {
    return
  }
  
  loading.value = true
  try {
    const response = await getHangOnRelations(archiveId.value)
      if (response.code === 200) {
        const relations = response.data
        const nodes = []
        const links = []
        
        // 添加主档案节点
        nodes.push({
          id: archiveId.value,
          name: `档案${archiveId.value}`,
          category: 0,
          status: '已存在'
        })
        
        // 添加关联系统节点和关系
        relations.forEach((relation, index) => {
          const systemId = `system-${relation.systemCode}`
          nodes.push({
            id: systemId,
            name: relation.systemName,
            category: 1,
            status: relation.status
          })
          
          links.push({
            source: archiveId.value,
            target: systemId,
            name: '挂接关系',
            value: 1
          })
        })
        
        // 更新图表数据（使用深拷贝方式确保响应式更新）
        chartOption.series[0].data = JSON.parse(JSON.stringify(nodes))
        chartOption.series[0].links = JSON.parse(JSON.stringify(links))
      }
  } catch (error) {
    console.error('加载关联关系数据失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.relation-visualization-container {
  padding: 20px;
}

.visualization-card {
  height: calc(100vh - 80px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-container {
  height: calc(100% - 60px);
  width: 100%;
}

.relation-chart {
  height: 100%;
  width: 100%;
}
</style>