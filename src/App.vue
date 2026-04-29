<script setup>
import { ref } from 'vue'
import ResumeUploader from './components/ResumeUploader.vue'
import ResumeEditor from './components/ResumeEditor.vue'
import AnalysisResult from './components/AnalysisResult.vue'
import TemplateComparison from './components/TemplateComparison.vue'
import ApiKeyInput from './components/ApiKeyInput.vue'
import AiChat from './components/AiChat.vue'
import AiAnalysis from './components/AiAnalysis.vue'
import { API, apiPost } from './api.js'

const resumeContent = ref('')
const jobDescription = ref('')
const analysisResult = ref(null)
const activeTab = ref('upload')
const showComparison = ref(false)
const optimizedResume = ref('')
const activeKeyId = ref('')
const showAiAnalysis = ref(false)
const aiAnalysisResult = ref(null)

const handleResumeParsed = (content) => {
  resumeContent.value = content
  activeTab.value = 'editor'
}

const handleAnalysisComplete = async (result) => {
  analysisResult.value = result
  activeTab.value = 'result'

  try {
    const data = await apiPost(API.optimize, {
      resumeText: resumeContent.value,
      matchedSkills: result.foundKeywords || [],
      missingSkills: result.missingKeywords || [],
      skillGaps: result.skillGaps || []
    })

    optimizedResume.value = data.optimizedResume || ''
  } catch (err) {
    console.error('获取优化简历失败:', err)
  }
}

const handleReset = () => {
  analysisResult.value = null
  activeTab.value = 'editor'
}

const openComparison = () => {
  showComparison.value = true
}

const closeComparison = () => {
  showComparison.value = false
}

const useOptimizedTemplate = (template) => {
  resumeContent.value = template
  showComparison.value = false
  activeTab.value = 'editor'
}

const handleKeyValidated = (result) => {
  activeKeyId.value = result.keyId
}

const handleKeyRemoved = () => {
  activeKeyId.value = ''
}

const handleAiAnalysisDone = (result) => {
  aiAnalysisResult.value = result
}
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="logo">简历优化器</h1>
      <span class="logo-ai">AI Powered</span>
    </header>

    <main class="main">
      <ApiKeyInput
        @key-validated="handleKeyValidated"
        @key-removed="handleKeyRemoved"
      />

      <nav class="tabs">
        <button
          :class="['tab', { active: activeTab === 'upload' }]"
          @click="activeTab = 'upload'"
        >
          1. 上传简历
        </button>
        <button
          :class="['tab', { active: activeTab === 'editor' }]"
          @click="activeTab = 'editor'"
          :disabled="!resumeContent"
        >
          2. 编辑内容
        </button>
        <button
          :class="['tab', { active: activeTab === 'result' }]"
          @click="activeTab = 'result'"
          :disabled="!analysisResult"
        >
          3. 分析结果
        </button>
        <button
          :class="['tab', { active: activeTab === 'ai' }]"
          @click="activeTab = 'ai'"
        >
          🤖 AI 助手
        </button>
      </nav>

      <div class="tab-content">
        <ResumeUploader
          v-if="activeTab === 'upload'"
          @parsed="handleResumeParsed"
        />

        <ResumeEditor
          v-if="activeTab === 'editor'"
          :resume-content="resumeContent"
          :job-description="jobDescription"
          @analyze="handleAnalysisComplete"
          @update:job-description="jobDescription = $event"
        />

        <div v-if="activeTab === 'result'">
          <AnalysisResult
            :result="analysisResult"
            :resume-content="resumeContent"
            @reset="handleReset"
            @compare="openComparison"
          />

          <div style="margin-top: 24px;">
            <button
              class="btn-ai-analysis"
              @click="showAiAnalysis = !showAiAnalysis"
            >
              🧠 {{ showAiAnalysis ? '收起 AI 深度分析' : '展开 AI 深度分析' }}
            </button>

            <AiAnalysis
              v-if="showAiAnalysis"
              :resume-content="resumeContent"
              :job-description="jobDescription"
              :analysis-result="analysisResult"
              :key-id="activeKeyId"
              @close="showAiAnalysis = false"
              @analysis-done="handleAiAnalysisDone"
            />
          </div>
        </div>

        <AiChat
          v-if="activeTab === 'ai'"
          :key-id="activeKeyId"
          :resume-content="resumeContent"
          :job-description="jobDescription"
        />

        <TemplateComparison
          v-if="showComparison"
          :original-resume="resumeContent"
          :optimized-resume="optimizedResume"
          :matched-skills="analysisResult?.foundKeywords || []"
          :missing-skills="analysisResult?.missingKeywords || []"
          @close="closeComparison"
          @use-template="useOptimizedTemplate"
        />
      </div>
    </main>

    <footer class="footer">
      <p>简历优化器 - AI Powered | 数据仅本地处理，保护隐私</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  padding: 20px 40px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.logo-ai {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.main {
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: #fff;
  padding: 8px;
  border-radius: 12px;
}

.tab {
  flex: 1;
  padding: 14px 20px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.tab:hover:not(:disabled) {
  background: #f5f5f5;
}

.tab.active {
  background: #2563eb;
  color: #fff;
}

.tab:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tab-content {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  min-height: 500px;
}

.btn-ai-analysis {
  display: block;
  width: 100%;
  padding: 14px 24px;
  border: 2px solid #7c3aed;
  background: #fff;
  color: #7c3aed;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ai-analysis:hover {
  background: #f5f3ff;
}

.footer {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 14px;
}
</style>
