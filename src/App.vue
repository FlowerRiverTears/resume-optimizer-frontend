<script setup>
import { ref } from 'vue'
import ResumeUploader from './components/ResumeUploader.vue'
import ResumeEditor from './components/ResumeEditor.vue'
import AnalysisResult from './components/AnalysisResult.vue'

const resumeContent = ref('')
const jobDescription = ref('')
const analysisResult = ref(null)
const activeTab = ref('upload')

const handleResumeParsed = (content) => {
  resumeContent.value = content
  activeTab.value = 'editor'
}

const handleAnalysisComplete = (result) => {
  analysisResult.value = result
  activeTab.value = 'result'
}
</script>

<template>
  <div class="app">
    <!-- 顶部导航 -->
    <header class="header">
      <h1 class="logo">简历优化器</h1>
    </header>

    <!-- 主内容 -->
    <main class="main">
      <!-- Tab 导航 -->
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
      </nav>

      <!-- Tab 内容 -->
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

        <AnalysisResult
          v-if="activeTab === 'result'"
          :result="analysisResult"
          :resume-content="resumeContent"
        />
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <p>简历优化器 - 开源免费 | 数据仅本地处理，保护隐私</p>
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

/* 头部 */
.header {
  background: #fff;
  padding: 20px 40px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.logo {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

/* 主内容 */
.main {
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
}

/* Tab 导航 */
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

/* Tab 内容 */
.tab-content {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  min-height: 500px;
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 14px;
}
</style>
