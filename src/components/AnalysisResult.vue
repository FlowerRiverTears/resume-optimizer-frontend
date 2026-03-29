<script setup>
import { ref, computed, onMounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  result: Object,
  resumeContent: String
})

const emit = defineEmits(['reset', 'compare'])

const activeSection = ref('overview')
const radarChartRef = ref(null)
const barChartRef = ref(null)
let radarChart = null
let barChart = null

const goBack = () => {
  emit('reset')
}

const getScoreColor = (score) => {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

const getScoreLabel = (score) => {
  if (score >= 80) return '优秀'
  if (score >= 60) return '良好'
  if (score >= 40) return '一般'
  return '待改进'
}

// 计算分类数据用于雷达图
const categoryData = computed(() => {
  if (!props.result.categoryScores) {
    return {
      categories: ['frontend', 'backend', 'database', 'devops'],
      values: [0, 0, 0, 0]
    }
  }

  const scores = props.result.categoryScores
  const categories = Object.keys(scores)
  const values = categories.map(cat => scores[cat].score || 0)

  return { categories, values }
})

// 初始化雷达图
const initRadarChart = () => {
  if (!radarChartRef.value) return

  radarChart = echarts.init(radarChartRef.value)

  const option = {
    title: {
      text: '技能匹配雷达图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: categoryData.value.categories.map(cat => ({
        name: getCategoryName(cat),
        max: 100
      })),
      radius: '65%',
      splitNumber: 4,
      axisName: {
        color: '#666'
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: categoryData.value.values,
        name: '匹配度',
        areaStyle: {
          color: 'rgba(37, 99, 235, 0.3)'
        },
        lineStyle: {
          color: '#2563eb'
        },
        itemStyle: {
          color: '#2563eb'
        }
      }]
    }]
  }

  radarChart.setOption(option)
}

// 获取分类中文名
const getCategoryName = (cat) => {
  const names = {
    frontend: '前端',
    backend: '后端',
    database: '数据库',
    devops: 'DevOps',
    tools: '工具'
  }
  return names[cat] || cat
}

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value || !props.result.categoryScores) return

  barChart = echarts.init(barChartRef.value)

  const scores = props.result.categoryScores
  const categories = Object.keys(scores).map(getCategoryName)
  const matched = categories.map(cat => {
    const key = Object.keys(scores).find(k => getCategoryName(k) === cat)
    return scores[key]?.matchedCount || 0
  })
  const total = categories.map(cat => {
    const key = Object.keys(scores).find(k => getCategoryName(k) === cat)
    return scores[key]?.totalCount || 0
  })

  const option = {
    title: {
      text: '技能数量对比',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['已匹配', '职位要求'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [{
      name: '已匹配',
      type: 'bar',
      data: matched,
      itemStyle: { color: '#10b981' }
    }, {
      name: '职位要求',
      type: 'bar',
      data: total,
      itemStyle: { color: '#94a3b8' }
    }]
  }

  barChart.setOption(option)
}

onMounted(() => {
  initRadarChart()
  initBarChart()

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    radarChart?.resize()
    barChart?.resize()
  })
})

const exportPDF = () => {
  window.print()
}
</script>

<template>
  <div class="result">
    <h2 class="title">简历分析报告</h2>

    <!-- 分数展示 -->
    <div class="score-cards">
      <div class="score-card main-score">
        <div class="score-label">ATS 综合评分</div>
        <div class="score-value" :style="{ color: getScoreColor(result.atsScore) }">
          {{ result.atsScore }}
        </div>
        <div class="score-desc">{{ getScoreLabel(result.atsScore) }}</div>
        <div class="score-bar">
          <div class="score-bar-fill" :style="{ width: result.atsScore + '%', backgroundColor: getScoreColor(result.atsScore) }"></div>
        </div>
      </div>

      <div class="score-card main-score">
        <div class="score-label">职位匹配度</div>
        <div class="score-value" :style="{ color: getScoreColor(result.matchScore) }">
          {{ result.matchScore }}%
        </div>
        <div class="score-desc">{{ getScoreLabel(result.matchScore) }}</div>
        <div class="score-bar">
          <div class="score-bar-fill" :style="{ width: result.matchScore + '%', backgroundColor: getScoreColor(result.matchScore) }"></div>
        </div>
      </div>

      <div class="score-card stat-card">
        <div class="stat-value">{{ result.foundKeywords?.length || 0 }}</div>
        <div class="stat-label">匹配技能</div>
      </div>

      <div class="score-card stat-card">
        <div class="stat-value warning">{{ result.missingKeywords?.length || 0 }}</div>
        <div class="stat-label">缺失技能</div>
      </div>
    </div>

    <!-- 导航 -->
    <div class="nav-tabs">
      <button
        :class="['nav-tab', { active: activeSection === 'overview' }]"
        @click="activeSection = 'overview'"
      >
        技能雷达图
      </button>
      <button
        :class="['nav-tab', { active: activeSection === 'keywords' }]"
        @click="activeSection = 'keywords'"
      >
        关键词详情
      </button>
      <button
        :class="['nav-tab', { active: activeSection === 'suggestions' }]"
        @click="activeSection = 'suggestions'"
      >
        优化建议
      </button>
      <button
        :class="['nav-tab', { active: activeSection === 'structure' }]"
        @click="activeSection = 'structure'"
      >
        结构分析
      </button>
    </div>

    <!-- 内容 -->
    <div class="content">
      <!-- 技能雷达图 -->
      <div v-if="activeSection === 'overview'" class="section">
        <div class="charts-container">
          <div ref="radarChartRef" class="chart"></div>
          <div ref="barChartRef" class="chart"></div>
        </div>

        <!-- 分类详情 -->
        <div v-if="result.categoryScores" class="category-details">
          <h4>各分类匹配详情</h4>
          <div class="category-list">
            <div
              v-for="(score, category) in result.categoryScores"
              :key="category"
              class="category-item"
            >
              <div class="category-header">
                <span class="category-name">{{ getCategoryName(category) }}</span>
                <span class="category-score" :style="{ color: getScoreColor(score.score) }">
                  {{ score.score }}%
                </span>
              </div>
              <div class="category-bar">
                <div
                  class="category-bar-fill"
                  :style="{ width: score.score + '%', backgroundColor: getScoreColor(score.score) }"
                ></div>
              </div>
              <div class="category-count">
                已匹配 {{ score.matchedCount }} / 要求 {{ score.totalCount }} 项
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 关键词详情 -->
      <div v-if="activeSection === 'keywords'" class="section">
        <h3>已匹配技能</h3>
        <div class="tags">
          <span
            v-for="keyword in result.foundKeywords"
            :key="keyword"
            class="tag tag-success"
          >
            {{ keyword }}
          </span>
        </div>

        <h3 style="margin-top: 32px;">缺失技能（建议补充）</h3>
        <div class="skill-gaps">
          <div
            v-for="gap in result.skillGaps"
            :key="gap.skill"
            class="gap-item"
          >
            <div class="gap-header">
              <span class="gap-skill">{{ gap.skill }}</span>
              <span class="gap-category">{{ getCategoryName(gap.category) }}</span>
              <span class="gap-importance">重要性: {{ gap.importance }}/5</span>
            </div>
            <div class="gap-suggestion">{{ gap.suggestion }}</div>
          </div>
        </div>

        <div v-if="!result.missingKeywords || result.missingKeywords.length === 0" class="empty-state">
          <p>没有缺失技能，您的简历与职位高度匹配！</p>
        </div>
      </div>

      <!-- 优化建议 -->
      <div v-if="activeSection === 'suggestions'" class="section">
        <h3>优化建议</h3>
        <ul class="suggestion-list">
          <li
            v-for="(suggestion, index) in result.suggestions"
            :key="index"
            class="suggestion-item"
          >
            {{ suggestion }}
          </li>
        </ul>

        <!-- 优化提示详情 -->
        <div v-if="result.optimizationTips && result.optimizationTips.length > 0" class="tips-section">
          <h4>详细优化提示</h4>
          <div
            v-for="(tip, index) in result.optimizationTips"
            :key="index"
            class="tip-card"
          >
            <div class="tip-type" :class="'tip-' + tip.type">
              {{ tip.type === 'add' ? '建议添加' : tip.type === 'improve' ? '建议改进' : '建议删除' }}
            </div>
            <div class="tip-content">
              <div v-if="tip.suggestedText" class="tip-suggested">
                {{ tip.suggestedText }}
              </div>
              <div v-if="tip.reason" class="tip-reason">
                原因: {{ tip.reason }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 结构分析 -->
      <div v-if="activeSection === 'structure'" class="section">
        <h3>简历结构分析</h3>
        <div class="structure-list">
          <div
            class="structure-item"
            :class="{ success: result.structure.hasContactInfo }"
          >
            <span class="icon">{{ result.structure.hasContactInfo ? '✓' : '✗' }}</span>
            <div class="structure-info">
              <div class="structure-name">联系方式</div>
              <div class="structure-status">
                {{ result.structure.hasContactInfo ? '已包含' : '建议添加邮箱、电话' }}
              </div>
            </div>
          </div>

          <div
            class="structure-item"
            :class="{ success: result.structure.hasSummary }"
          >
            <span class="icon">{{ result.structure.hasSummary ? '✓' : '✗' }}</span>
            <div class="structure-info">
              <div class="structure-name">个人简介</div>
              <div class="structure-status">
                {{ result.structure.hasSummary ? '已包含' : '建议添加简历摘要' }}
              </div>
            </div>
          </div>

          <div
            class="structure-item"
            :class="{ success: result.structure.hasExperience }"
          >
            <span class="icon">{{ result.structure.hasExperience ? '✓' : '✗' }}</span>
            <div class="structure-info">
              <div class="structure-name">工作经历</div>
              <div class="structure-status">
                {{ result.structure.hasExperience ? '已包含' : '建议添加工作经历' }}
              </div>
            </div>
          </div>

          <div
            class="structure-item"
            :class="{ success: result.structure.hasEducation }"
          >
            <span class="icon">{{ result.structure.hasEducation ? '✓' : '✗' }}</span>
            <div class="structure-info">
              <div class="structure-name">教育背景</div>
              <div class="structure-status">
                {{ result.structure.hasEducation ? '已包含' : '建议添加教育信息' }}
              </div>
            </div>
          </div>

          <div
            class="structure-item"
            :class="{ success: result.structure.hasSkills }"
          >
            <span class="icon">{{ result.structure.hasSkills ? '✓' : '✗' }}</span>
            <div class="structure-info">
              <div class="structure-name">技能特长</div>
              <div class="structure-status">
                {{ result.structure.hasSkills ? '已包含' : '建议添加技能清单' }}
              </div>
            </div>
          </div>
        </div>

        <div class="word-count">
          <div class="word-count-value">{{ result.structure.totalWords }}</div>
          <div class="word-count-label">总字数</div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button class="btn btn-outline" @click="goBack">
        重新编辑
      </button>
      <button class="btn btn-secondary" @click="emit('compare')">
        模板对比
      </button>
      <button class="btn btn-primary" @click="exportPDF">
        导出 PDF
      </button>
    </div>
  </div>
</template>

<style scoped>
.result {
  max-width: 900px;
  margin: 0 auto;
}

.title {
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32px;
  color: #1e293b;
}

/* 分数卡片 */
.score-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.score-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.score-card.main-score {
  grid-column: span 1;
}

.score-card.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.score-desc {
  font-size: 12px;
  color: #94a3b8;
}

.score-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #10b981;
}

.stat-value.warning {
  color: #f59e0b;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

/* 导航 */
.nav-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 20px;
}

.nav-tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-tab:hover {
  color: #1e293b;
}

.nav-tab.active {
  background: #fff;
  color: #2563eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 内容区 */
.content {
  background: #fafafa;
  border-radius: 12px;
  padding: 24px;
  min-height: 300px;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1e293b;
}

.section h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 24px 0 16px;
  color: #475569;
}

/* 图表容器 */
.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart {
  height: 280px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

/* 分类详情 */
.category-details {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.category-list {
  display: grid;
  gap: 16px;
}

.category-item {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-weight: 600;
  color: #1e293b;
}

.category-score {
  font-weight: 700;
  font-size: 18px;
}

.category-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.category-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.category-count {
  font-size: 12px;
  color: #64748b;
}

/* 标签 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.tag-success {
  background: #d1fae5;
  color: #059669;
}

.tag-warning {
  background: #fef3c7;
  color: #d97706;
}

/* 技能差距 */
.skill-gaps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gap-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #f59e0b;
}

.gap-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.gap-skill {
  font-weight: 600;
  color: #1e293b;
}

.gap-category {
  padding: 2px 8px;
  background: #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  color: #64748b;
}

.gap-importance {
  font-size: 12px;
  color: #94a3b8;
}

.gap-suggestion {
  font-size: 13px;
  color: #475569;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #10b981;
  background: #f0fdf4;
  border-radius: 8px;
}

/* 建议列表 */
.suggestion-list {
  list-style: none;
}

.suggestion-item {
  padding: 14px 18px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 4px solid #2563eb;
  font-size: 14px;
  color: #334155;
}

/* 优化提示卡片 */
.tips-section {
  margin-top: 24px;
}

.tip-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
}

.tip-type {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  height: fit-content;
}

.tip-add {
  background: #dbeafe;
  color: #1d4ed8;
}

.tip-improve {
  background: #fef3c7;
  color: #b45309;
}

.tip-delete {
  background: #fee2e2;
  color: #dc2626;
}

.tip-suggested {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
}

.tip-reason {
  font-size: 13px;
  color: #64748b;
}

/* 结构列表 */
.structure-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.structure-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 10px;
  color: #ef4444;
}

.structure-item.success {
  color: #10b981;
}

.structure-item .icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fee2e2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.structure-item.success .icon {
  background: #d1fae5;
}

.structure-info {
  flex: 1;
}

.structure-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.structure-status {
  font-size: 13px;
  color: #64748b;
}

.word-count {
  text-align: center;
  padding: 32px;
  margin-top: 24px;
  background: #fff;
  border-radius: 10px;
}

.word-count-value {
  font-size: 48px;
  font-weight: 700;
  color: #2563eb;
}

.word-count-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

/* 操作按钮 */
.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.btn {
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-outline {
  background: #fff;
  color: #333;
  border: 1px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f8fafc;
}

.btn-secondary {
  background: #10b981;
  color: #fff;
}

.btn-secondary:hover {
  background: #059669;
}

/* 响应式 */
@media (max-width: 768px) {
  .score-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .nav-tabs {
    flex-wrap: wrap;
  }

  .nav-tab {
    flex: 1 1 45%;
  }
}

/* 打印样式 */
@media print {
  .nav-tabs,
  .actions {
    display: none !important;
  }

  .charts-container {
    display: none;
  }
}
</style>
