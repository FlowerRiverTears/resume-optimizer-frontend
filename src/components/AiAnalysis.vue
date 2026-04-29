<script setup>
import { ref, onMounted } from 'vue'
import { API, apiPost, apiGet, renderMarkdown } from '../api.js'

const props = defineProps({
  resumeContent: String,
  jobDescription: String,
  analysisResult: Object,
  keyId: String
})

const emit = defineEmits(['close', 'analysis-done'])

const isLoading = ref(false)
const aiResult = ref(null)
const error = ref('')
const selectedKeyId = ref('')
const availableKeys = ref([])
const showThinking = ref(false)

const loadKeys = async () => {
  try {
    availableKeys.value = await apiGet(API.ai.keys.list)
  } catch (err) {
    availableKeys.value = []
  }
}

const runAiAnalysis = async () => {
  if (!props.resumeContent) {
    error.value = '请先输入简历内容'
    return
  }

  isLoading.value = true
  error.value = ''
  aiResult.value = null

  try {
    const body = {
      resumeText: props.resumeContent,
      jobDescription: props.jobDescription || ''
    }

    const params = new URLSearchParams()
    if (selectedKeyId.value || props.keyId) {
      params.set('keyId', selectedKeyId.value || props.keyId)
    }

    const url = API.ai.analyze + (params.toString() ? '?' + params.toString() : '')
    const result = await apiPost(url, body)

    aiResult.value = result
    emit('analysis-done', result)
  } catch (err) {
    error.value = 'AI 分析失败：' + (err.message || '请检查API Key是否正确')
  } finally {
    isLoading.value = false
  }
}

const formatTime = (ms) => {
  if (ms < 1000) return ms + 'ms'
  return (ms / 1000).toFixed(1) + 's'
}

onMounted(() => {
  loadKeys()
  if (props.keyId) selectedKeyId.value = props.keyId
})
</script>

<template>
  <div class="ai-analysis">
    <div class="analysis-header">
      <h3>🧠 AI 深度分析</h3>
      <button class="btn-close" @click="emit('close')">✕</button>
    </div>

    <div class="analysis-config">
      <div class="config-row">
        <label>选择模型</label>
        <select v-model="selectedKeyId" class="select-key">
          <option value="">使用默认模型</option>
          <option v-for="key in availableKeys" :key="key.keyId" :value="key.keyId">
            {{ key.provider }} - {{ key.modelName }}
          </option>
        </select>
      </div>
      <button
        class="btn-analyze"
        @click="runAiAnalysis"
        :disabled="isLoading"
      >
        {{ isLoading ? 'AI 分析中...' : '🚀 开始 AI 深度分析' }}
      </button>
    </div>

    <div v-if="!availableKeys.length && !isLoading" class="no-key-hint">
      ⚠️ 未检测到 API Key，请先在「AI 模型配置」中输入 Key 后再使用 AI 分析功能
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>AI 正在深度分析您的简历...</p>
      <p class="loading-hint">基于 RAG 检索增强生成 + 权重排序，分析更精准</p>
    </div>

    <div v-if="aiResult" class="analysis-result">
      <div class="result-header">
        <span class="result-badge">AI 分析报告</span>
        <span class="result-meta">
          {{ aiResult.provider }} · {{ aiResult.model }} · {{ formatTime(aiResult.responseTimeMs) }}
        </span>
      </div>

      <div v-if="aiResult.thinking" class="thinking-box">
        <div class="thinking-header" @click="showThinking = !showThinking">
          <span>💭</span>
          <span class="thinking-label">AI 思考过程</span>
          <span class="thinking-toggle">{{ showThinking ? '收起 ▲' : '展开 ▼' }}</span>
        </div>
        <div v-if="showThinking" class="thinking-content">{{ aiResult.thinking }}</div>
      </div>

      <div class="result-content" v-html="renderMarkdown(aiResult.answer)"></div>

      <div v-if="aiResult.searchResults && aiResult.searchResults.length" class="rag-results">
        <h4>📎 RAG 检索结果</h4>
        <div v-for="(r, i) in aiResult.searchResults" :key="i" class="rag-item">
          <div class="rag-header">
            <span class="rag-source">{{ r.source }}</span>
            <span class="rag-category">{{ r.category }}</span>
            <span class="rag-score">
              相关度: {{ (r.weightedScore * 100).toFixed(0) }}%
              (原始: {{ (r.score * 100).toFixed(0) }}%)
            </span>
          </div>
          <div class="rag-content">{{ r.content.substring(0, 200) }}{{ r.content.length > 200 ? '...' : '' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-analysis {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #1e40af, #7c3aed);
  color: #fff;
}

.analysis-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255,255,255,0.2);
  color: #fff;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: rgba(255,255,255,0.3);
}

.analysis-config {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-row label {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
}

.select-key {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  background: #fff;
  outline: none;
}

.btn-analyze {
  margin-left: auto;
  padding: 10px 24px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-analyze:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-analyze:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-key-hint {
  padding: 16px 20px;
  background: #fef3c7;
  color: #92400e;
  font-size: 14px;
  border-bottom: 1px solid #e2e8f0;
}

.error {
  padding: 12px 20px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 48px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: #475569;
  font-size: 16px;
  margin-bottom: 8px;
}

.loading-hint {
  color: #94a3b8;
  font-size: 13px;
}

.analysis-result {
  padding: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-badge {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.result-meta {
  font-size: 12px;
  color: #94a3b8;
}

.thinking-box {
  margin-bottom: 16px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  overflow: hidden;
  background: #eff6ff;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  user-select: none;
}

.thinking-header:hover { background: #dbeafe; }

.thinking-label {
  font-size: 12px;
  font-weight: 600;
  color: #1d4ed8;
  flex: 1;
}

.thinking-toggle {
  font-size: 11px;
  color: #3b82f6;
}

.thinking-content {
  padding: 12px 14px;
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  border-top: 1px solid #bfdbfe;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

.result-content {
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  font-size: 15px;
  line-height: 1.8;
  color: #334155;
}

.result-content :deep(h1) { font-size: 22px; font-weight: 700; margin: 16px 0 10px; color: #1e293b; }
.result-content :deep(h2) { font-size: 19px; font-weight: 700; margin: 14px 0 8px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
.result-content :deep(h3) { font-size: 17px; font-weight: 600; margin: 12px 0 6px; color: #334155; }
.result-content :deep(h4) { font-size: 15px; font-weight: 600; margin: 10px 0 4px; color: #475569; }
.result-content :deep(table) { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 14px; }
.result-content :deep(td) { border: 1px solid #e2e8f0; padding: 8px 12px; }
.result-content :deep(tr:nth-child(odd)) { background: #f1f5f9; }
.result-content :deep(ul) { padding-left: 24px; margin: 8px 0; }
.result-content :deep(li) { margin: 4px 0; }
.result-content :deep(hr) { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
.result-content :deep(strong) { color: #1e293b; }
.result-content :deep(blockquote) { border-left: 3px solid #7c3aed; padding-left: 14px; color: #64748b; margin: 10px 0; }

.rag-results {
  margin-top: 24px;
}

.rag-results h4 {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.rag-item {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
  border-left: 3px solid #7c3aed;
}

.rag-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.rag-source {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.rag-category {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.rag-score {
  font-size: 11px;
  color: #64748b;
  margin-left: auto;
}

.rag-content {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}
</style>
