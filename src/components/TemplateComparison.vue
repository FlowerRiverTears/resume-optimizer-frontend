<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  originalResume: String,
  optimizedResume: String,
  matchedSkills: Array,
  missingSkills: Array
})

const emit = defineEmits(['close', 'useTemplate'])

// 高亮差异文本
const highlightDifferences = (text, matched, missing) => {
  if (!text) return ''

  let result = text

  // 高亮匹配技能（绿色）
  if (matched && matched.length > 0) {
    matched.forEach(skill => {
      const regex = new RegExp(`\\b(${skill})\\b`, 'gi')
      result = result.replace(regex, '<mark class="skill-matched">$1</mark>')
    })
  }

  // 高亮缺失技能（红色）
  if (missing && missing.length > 0) {
    missing.forEach(skill => {
      const regex = new RegExp(`\\b(${skill})\\b`, 'gi')
      result = result.replace(regex, '<mark class="skill-missing">$1</mark>')
    })
  }

  return result
}

// 使用优化模板
const useTemplate = () => {
  emit('useTemplate', props.optimizedResume)
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<template>
  <div class="comparison-overlay">
    <div class="comparison-modal">
      <div class="modal-header">
        <h2>模板对比视图</h2>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="comparison-container">
        <!-- 左侧：原简历 -->
        <div class="comparison-panel original">
          <div class="panel-header">
            <h3>原简历</h3>
            <span class="badge">原始版本</span>
          </div>
          <div class="panel-content" v-html="highlightDifferences(originalResume, matchedSkills, missingSkills)"></div>
          <div class="panel-footer">
            <button class="btn btn-outline btn-sm" @click="copyToClipboard(originalResume)">
              复制文本
            </button>
          </div>
        </div>

        <!-- 中间：对比箭头 -->
        <div class="comparison-arrow">
          <span class="arrow-icon">→</span>
        </div>

        <!-- 右侧：优化版简历 -->
        <div class="comparison-panel optimized">
          <div class="panel-header">
            <h3>优化版</h3>
            <span class="badge badge-success">推荐使用</span>
          </div>
          <div class="panel-content optimized-content" v-html="optimizedResume"></div>
          <div class="panel-footer">
            <button class="btn btn-primary btn-sm" @click="useTemplate">
              使用此模板
            </button>
          </div>
        </div>
      </div>

      <!-- 差异说明 -->
      <div class="diff-legend">
        <div class="legend-item">
          <span class="legend-color matched"></span>
          <span>已匹配技能（保留）</span>
        </div>
        <div class="legend-item">
          <span class="legend-color missing"></span>
          <span>缺失技能（建议补充）</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comparison-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.comparison-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.comparison-container {
  display: flex;
  gap: 16px;
  padding: 24px;
  flex: 1;
  overflow: hidden;
}

.comparison-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.badge {
  padding: 4px 12px;
  background: #e2e8f0;
  border-radius: 20px;
  font-size: 12px;
  color: #64748b;
}

.badge-success {
  background: #d1fae5;
  color: #059669;
}

.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.panel-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 20px 0 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.panel-content h3:first-child {
  margin-top: 0;
}

.optimized-content {
  background: #f0fdf4;
}

.optimized-content :deep(.section-suggestion) {
  background: #fef3c7;
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
}

.optimized-content :deep(.section-skills) {
  background: #dbeafe;
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
}

.optimized-content :deep(.section-gaps) {
  background: #fee2e2;
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
}

.optimized-content :deep(.section-gaps ul) {
  list-style: none;
  padding: 0;
  margin: 0;
}

.optimized-content :deep(.section-gaps li) {
  padding: 8px 0;
  border-bottom: 1px solid #fecaca;
}

.optimized-content :deep(.section-gaps li:last-child) {
  border-bottom: none;
}

.optimized-content :deep(.skills-list),
.optimized-content :deep(.skills-suggestion) {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.optimized-content :deep(.skills-list li),
.optimized-content :deep(.skills-suggestion li) {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
}

.optimized-content :deep(.skill-matched) {
  background: #d1fae5;
  color: #059669;
  padding: 2px 6px;
  border-radius: 4px;
}

.optimized-content :deep(.skill-keep) {
  background: #e2e8f0;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
}

.optimized-content :deep(.skill-add) {
  background: #fef3c7;
  color: #b45309;
  padding: 2px 6px;
  border-radius: 4px;
}

.optimized-content :deep(.importance) {
  font-size: 11px;
  color: #94a3b8;
}

.optimized-content :deep(.skill-matched) {
  background: #d1fae5 !important;
  color: #059669 !important;
  padding: 1px 4px;
  border-radius: 3px;
}

.optimized-content :deep(.skill-missing) {
  background: #fee2e2 !important;
  color: #dc2626 !important;
  padding: 1px 4px;
  border-radius: 3px;
  text-decoration: line-through;
}

.panel-footer {
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.comparison-arrow {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.arrow-icon {
  font-size: 32px;
  color: #2563eb;
  font-weight: bold;
}

.diff-legend {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.matched {
  background: #d1fae5;
  border: 1px solid #059669;
}

.legend-color.missing {
  background: #fee2e2;
  border: 1px solid #dc2626;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
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
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f8fafc;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .comparison-container {
    flex-direction: column;
  }

  .comparison-arrow {
    display: none;
  }

  .comparison-panel {
    max-height: 300px;
  }
}
</style>
