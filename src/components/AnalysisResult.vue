<script setup>
import { ref } from 'vue'

const props = defineProps({
  result: Object,
  resumeContent: String
})

const emit = defineEmits(['reset'])

const activeSection = ref('score')

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

const exportPDF = () => {
  window.print()
}
</script>

<template>
  <div class="result">
    <h2 class="title">分析结果</h2>

    <!-- 分数展示 -->
    <div class="score-cards">
      <div class="score-card">
        <div class="score-label">ATS 综合评分</div>
        <div class="score-value" :style="{ color: getScoreColor(result.atsScore) }">
          {{ result.atsScore }}
        </div>
        <div class="score-desc">{{ getScoreLabel(result.atsScore) }}</div>
      </div>

      <div class="score-card">
        <div class="score-label">职位匹配度</div>
        <div class="score-value" :style="{ color: getScoreColor(result.matchScore) }">
          {{ result.matchScore }}%
        </div>
        <div class="score-desc">关键词匹配</div>
      </div>
    </div>

    <!-- 导航 -->
    <div class="nav-tabs">
      <button
        :class="['nav-tab', { active: activeSection === 'score' }]"
        @click="activeSection = 'score'"
      >
        评分详情
      </button>
      <button
        :class="['nav-tab', { active: activeSection === 'keywords' }]"
        @click="activeSection = 'keywords'"
      >
        关键词
      </button>
      <button
        :class="['nav-tab', { active: activeSection === 'suggestions' }]"
        @click="activeSection = 'suggestions'"
      >
        优化建议
      </button>
    </div>

    <!-- 内容 -->
    <div class="content">
      <!-- 评分详情 -->
      <div v-if="activeSection === 'score'" class="section">
        <h3>简历结构分析</h3>
        <div class="structure-list">
          <div
            class="structure-item"
            :class="{ success: result.structure.hasContactInfo }"
          >
            <span class="icon">{{ result.structure.hasContactInfo ? '✓' : '✗' }}</span>
            联系方式
          </div>
          <div
            class="structure-item"
            :class="{ success: result.structure.hasExperience }"
          >
            <span class="icon">{{ result.structure.hasExperience ? '✓' : '✗' }}</span>
            工作经历
          </div>
          <div
            class="structure-item"
            :class="{ success: result.structure.hasEducation }"
          >
            <span class="icon">{{ result.structure.hasEducation ? '✓' : '✗' }}</span>
            教育背景
          </div>
          <div
            class="structure-item"
            :class="{ success: result.structure.hasSkills }"
          >
            <span class="icon">{{ result.structure.hasSkills ? '✓' : '✗' }}</span>
            技能特长
          </div>
        </div>

        <div class="word-count">
          字数统计: {{ result.structure.totalWords }} 字
        </div>
      </div>

      <!-- 关键词 -->
      <div v-if="activeSection === 'keywords'" class="section">
        <h3>已识别技能</h3>
        <div class="tags">
          <span
            v-for="keyword in result.foundKeywords"
            :key="keyword"
            class="tag tag-success"
          >
            {{ keyword }}
          </span>
        </div>

        <template v-if="result.missingKeywords && result.missingKeywords.length > 0">
          <h3 style="margin-top: 32px;">缺失关键词</h3>
          <div class="tags">
            <span
              v-for="keyword in result.missingKeywords"
              :key="keyword"
              class="tag tag-warning"
            >
              {{ keyword }}
            </span>
          </div>
        </template>
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
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button class="btn btn-outline" @click="goBack">
        重新编辑
      </button>
      <button class="btn btn-primary" @click="exportPDF">
        导出 PDF
      </button>
    </div>
  </div>
</template>

<style scoped>
.result {
  max-width: 700px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32px;
}

/* 分数卡片 */
.score-cards {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.score-card {
  flex: 1;
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.score-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.score-desc {
  font-size: 14px;
  color: #999;
}

/* 导航 */
.nav-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
}

.nav-tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-tab:hover {
  color: #333;
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
  min-height: 200px;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

/* 结构列表 */
.structure-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.structure-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  color: #ef4444;
}

.structure-item.success {
  color: #10b981;
}

.structure-item .icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: currentColor;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.structure-item .icon {
  background: #fee2e2;
}

.structure-item.success .icon {
  background: #d1fae5;
}

.word-count {
  text-align: center;
  color: #666;
  font-size: 14px;
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
  font-size: 14px;
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

/* 建议列表 */
.suggestion-list {
  list-style: none;
}

.suggestion-item {
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
  border-left: 3px solid #2563eb;
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
  font-size: 16px;
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
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
}

/* 打印样式 */
@media print {
  .nav-tabs,
  .actions {
    display: none !important;
  }

  .score-cards,
  .content {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style>
