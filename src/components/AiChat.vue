<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { API, apiPost, apiGet } from '../api.js'

const props = defineProps({
  keyId: String,
  resumeContent: String,
  jobDescription: String
})

const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
const selectedKeyId = ref('')
const availableKeys = ref([])

const loadKeys = async () => {
  try {
    availableKeys.value = await apiGet(API.ai.keys.list)
  } catch (err) {
    availableKeys.value = []
  }
}

const sendMessage = async () => {
  const msg = inputMessage.value.trim()
  if (!msg || isLoading.value) return

  messages.value.push({ role: 'user', content: msg })
  inputMessage.value = ''
  isLoading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const body = {
      message: msg,
      provider: getProviderFromKeyId(),
      keyId: selectedKeyId.value || props.keyId || null
    }

    if (props.resumeContent) {
      body.context = `当前简历内容摘要：${props.resumeContent.substring(0, 500)}...`
    }

    const result = await apiPost(API.ai.chat, body)

    messages.value.push({
      role: 'assistant',
      content: result.answer,
      provider: result.provider,
      model: result.model,
      responseTime: result.responseTimeMs,
      searchResults: result.searchResults || []
    })
  } catch (err) {
    messages.value.push({
      role: 'error',
      content: 'AI 响应失败：' + (err.message || '请检查API Key是否正确')
    })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const getProviderFromKeyId = () => {
  if (!selectedKeyId.value) return null
  const key = availableKeys.value.find(k => k.keyId === selectedKeyId.value)
  return key?.provider || null
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const quickQuestions = [
  '帮我分析这份简历的优缺点',
  '如何优化我的简历以匹配目标职位？',
  '我需要补充哪些技能？',
  '帮我写一段个人简介',
  '简历中哪些描述需要量化？'
]

const askQuick = (q) => {
  inputMessage.value = q
  sendMessage()
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
  <div class="ai-chat">
    <div class="chat-header">
      <span class="chat-icon">🤖</span>
      <span class="chat-title">AI 简历助手</span>
      <div class="key-selector">
        <select v-model="selectedKeyId" class="select-key">
          <option value="">使用默认模型</option>
          <option v-for="key in availableKeys" :key="key.keyId" :value="key.keyId">
            {{ key.provider }} - {{ key.modelName }}
          </option>
        </select>
      </div>
    </div>

    <div ref="chatContainer" class="chat-messages">
      <div v-if="messages.length === 0" class="welcome">
        <div class="welcome-icon">👋</div>
        <h3>你好！我是 AI 简历助手</h3>
        <p>我可以帮你分析简历、提供优化建议、查找匹配技能。</p>
        <p v-if="!availableKeys.length" class="hint">
          ⚠️ 请先在上方「AI 模型配置」中输入 API Key
        </p>
        <div class="quick-questions">
          <button
            v-for="q in quickQuestions"
            :key="q"
            class="quick-btn"
            @click="askQuick(q)"
          >
            {{ q }}
          </button>
        </div>
      </div>

      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        :class="['message', msg.role]"
      >
        <div class="message-avatar">
          {{ msg.role === 'user' ? '👤' : msg.role === 'error' ? '⚠️' : '🤖' }}
        </div>
        <div class="message-body">
          <div class="message-content" v-html="msg.content.replace(/\n/g, '<br/>')"></div>
          <div v-if="msg.searchResults && msg.searchResults.length" class="search-results">
            <div class="results-header">📎 检索到 {{ msg.searchResults.length }} 条相关数据</div>
            <div v-for="(r, i) in msg.searchResults" :key="i" class="result-item">
              <span class="result-source">{{ r.source }}</span>
              <span class="result-score">{{ (r.weightedScore * 100).toFixed(0) }}%</span>
            </div>
          </div>
          <div v-if="msg.responseTime" class="message-meta">
            {{ msg.provider }} · {{ msg.model }} · {{ formatTime(msg.responseTime) }}
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="message assistant">
        <div class="message-avatar">🤖</div>
        <div class="message-body">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="inputMessage"
        class="input"
        placeholder="输入问题，如：帮我分析简历的匹配度..."
        @keyup.enter="sendMessage"
        :disabled="isLoading"
      />
      <button
        class="btn-send"
        @click="sendMessage"
        :disabled="isLoading || !inputMessage.trim()"
      >
        {{ isLoading ? '思考中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.chat-icon {
  font-size: 20px;
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.key-selector {
  flex-shrink: 0;
}

.select-key {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #475569;
  background: #fff;
  outline: none;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.welcome {
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.welcome h3 {
  font-size: 20px;
  color: #1e293b;
  margin-bottom: 8px;
}

.welcome p {
  color: #64748b;
  font-size: 14px;
}

.welcome .hint {
  color: #f59e0b;
  font-weight: 500;
  margin-top: 12px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 24px;
}

.quick-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #dbeafe;
}

.message-body {
  max-width: 75%;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
}

.message.user .message-content {
  background: #2563eb;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: #f1f5f9;
  border-bottom-left-radius: 4px;
}

.message.error .message-content {
  background: #fef2f2;
  color: #dc2626;
  border-bottom-left-radius: 4px;
}

.search-results {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.results-header {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12px;
}

.result-source {
  color: #475569;
}

.result-score {
  color: #2563eb;
  font-weight: 500;
}

.message-meta {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #2563eb;
}

.btn-send {
  padding: 12px 24px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-send:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-send:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
</style>
