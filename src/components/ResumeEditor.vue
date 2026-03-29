<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  resumeContent: String,
  jobDescription: String
})

const emit = defineEmits(['analyze', 'update:jobDescription'])

const localResume = ref(props.resumeContent)
const localJobDesc = ref(props.jobDescription)
const isLoading = ref(false)
const error = ref('')

watch(() => props.resumeContent, (val) => {
  localResume.value = val
})

watch(() => props.jobDescription, (val) => {
  localJobDesc.value = val
})

const handleAnalyze = async () => {
  if (!localResume.value || localResume.value.trim().length === 0) {
    error.value = '请输入简历内容'
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    const response = await fetch('http://localhost:9001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeText: localResume.value,
        jobDescription: localJobDesc.value
      })
    })

    if (!response.ok) {
      throw new Error('分析失败，请重试')
    }

    const result = await response.json()

    // 转换后端返回格式为前端格式
    const formattedResult = {
      atsScore: result.atsScore,
      matchScore: result.matchScore,
      foundKeywords: result.foundKeywords || [],
      missingKeywords: result.missingKeywords || [],
      suggestions: result.suggestions || [],
      keywordFrequency: result.keywordFrequency || {},
      structure: result.structure || {
        hasContactInfo: false,
        hasExperience: false,
        hasEducation: false,
        hasSkills: true,
        totalWords: 0
      },
      // 新增字段
      categoryScores: result.categoryScores || {},
      skillGaps: result.skillGaps || [],
      optimizationTips: result.optimizationTips || []
    }

    emit('analyze', formattedResult)
  } catch (err) {
    console.error('分析失败:', err)
    error.value = '分析失败，请确保后端服务已启动'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="editor">
    <h2 class="title">编辑简历内容</h2>

    <div class="form-group">
      <label>简历内容</label>
      <textarea
        v-model="localResume"
        class="textarea"
        placeholder="在此编辑简历内容..."
      ></textarea>
    </div>

    <div class="form-group">
      <label>职位描述（可选）</label>
      <textarea
        v-model="localJobDesc"
        class="textarea"
        placeholder="粘贴目标职位描述，系统将分析简历与职位的匹配度..."
        @blur="emit('update:jobDescription', localJobDesc)"
      ></textarea>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="actions">
      <button class="btn btn-primary" @click="handleAnalyze" :disabled="isLoading">
        {{ isLoading ? '分析中...' : '开始分析' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.editor {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.textarea {
  width: 100%;
  height: 180px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
}

.textarea:focus {
  outline: none;
  border-color: #2563eb;
}

.error {
  color: #ef4444;
  text-align: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.btn {
  padding: 14px 48px;
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

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
</style>
