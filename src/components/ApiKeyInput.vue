<script setup>
import { ref, onMounted } from 'vue'
import { API, apiPost, apiGet } from '../api.js'

const emit = defineEmits(['key-validated', 'key-removed'])

const apiKey = ref('')
const provider = ref('openai')
const customBaseUrl = ref('')
const customModelName = ref('')
const isValidating = ref(false)
const validationResult = ref(null)
const storedKeys = ref([])
const showAdvanced = ref(false)
const showKeyInput = ref(false)

const providers = [
  { value: 'openai', label: 'OpenAI', defaultUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  { value: 'dashscope', label: '通义千问', defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-plus' },
  { value: 'deepseek', label: 'DeepSeek', defaultUrl: 'https://api.deepseek.com', defaultModel: 'deepseek-chat' },
  { value: 'minimax', label: 'Minimax M2.7', defaultUrl: 'https://api.minimaxi.com/v1', defaultModel: 'MiniMax-M2.7' }
]

const selectedProvider = () => providers.find(p => p.value === provider.value)

const onProviderChange = () => {
  const p = selectedProvider()
  if (p) {
    customBaseUrl.value = ''
    customModelName.value = ''
  }
}

const validateKey = async () => {
  if (!apiKey.value.trim()) return

  isValidating.value = true
  validationResult.value = null

  try {
    const p = selectedProvider()
    const body = {
      apiKey: apiKey.value.trim(),
      provider: provider.value,
      baseUrl: customBaseUrl.value.trim() || p?.defaultUrl,
      modelName: customModelName.value.trim() || p?.defaultModel
    }

    const result = await apiPost(API.ai.keys.validate, body)
    validationResult.value = result

    if (result.valid) {
      emit('key-validated', result)
      loadKeys()
      apiKey.value = ''
    }
  } catch (err) {
    validationResult.value = {
      valid: false,
      message: err.message || '验证失败'
    }
  } finally {
    isValidating.value = false
  }
}

const removeKey = async (keyId) => {
  try {
    await fetch(`${API.ai.keys.list}/${keyId}`, { method: 'DELETE' })
    loadKeys()
    emit('key-removed', keyId)
  } catch (err) {
    console.error('删除Key失败:', err)
  }
}

const loadKeys = async () => {
  try {
    storedKeys.value = await apiGet(API.ai.keys.list)
  } catch (err) {
    storedKeys.value = []
  }
}

const getProviderLabel = (p) => {
  const found = providers.find(x => x.value === p)
  return found ? found.label : p
}

onMounted(() => {
  loadKeys()
})
</script>

<template>
  <div class="api-key-panel">
    <div class="panel-header" @click="showKeyInput = !showKeyInput">
      <div class="header-left">
        <span class="icon">🔑</span>
        <span class="title">AI 模型配置</span>
      </div>
      <div class="header-right">
        <span v-if="storedKeys.length > 0" class="badge">{{ storedKeys.length }} 个Key</span>
        <span class="arrow" :class="{ open: showKeyInput }">▼</span>
      </div>
    </div>

    <div v-if="showKeyInput" class="panel-body">
      <div class="form-row">
        <label>选择模型提供商</label>
        <div class="provider-grid">
          <button
            v-for="p in providers"
            :key="p.value"
            :class="['provider-btn', { active: provider === p.value }]"
            @click="provider = p.value; onProviderChange()"
          >
            <span class="provider-name">{{ p.label }}</span>
            <span class="provider-model">{{ p.defaultModel }}</span>
          </button>
        </div>
      </div>

      <div class="form-row">
        <label>API Key</label>
        <div class="input-group">
          <input
            v-model="apiKey"
            type="password"
            class="input"
            :placeholder="'输入您的 ' + (selectedProvider()?.label || '') + ' API Key'"
            @keyup.enter="validateKey"
          />
          <button
            class="btn-validate"
            @click="validateKey"
            :disabled="isValidating || !apiKey.trim()"
          >
            {{ isValidating ? '验证中...' : '验证' }}
          </button>
        </div>
      </div>

      <div class="advanced-toggle" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? '收起高级设置 ▲' : '展开高级设置 ▼' }}
      </div>

      <div v-if="showAdvanced" class="advanced-settings">
        <div class="form-row">
          <label>自定义 Base URL（可选）</label>
          <input
            v-model="customBaseUrl"
            class="input"
            :placeholder="selectedProvider()?.defaultUrl || 'https://api.openai.com/v1'"
          />
        </div>
        <div class="form-row">
          <label>自定义模型名称（可选）</label>
          <input
            v-model="customModelName"
            class="input"
            :placeholder="selectedProvider()?.defaultModel || 'gpt-4o-mini'"
          />
        </div>
      </div>

      <div v-if="validationResult" :class="['validation-result', validationResult.valid ? 'success' : 'error']">
        <span class="result-icon">{{ validationResult.valid ? '✅' : '❌' }}</span>
        <span>{{ validationResult.message }}</span>
      </div>

      <div v-if="storedKeys.length > 0" class="stored-keys">
        <h4>已保存的 Key</h4>
        <div v-for="key in storedKeys" :key="key.keyId" class="key-item">
          <div class="key-info">
            <span class="key-provider">{{ getProviderLabel(key.provider) }}</span>
            <span class="key-model">{{ key.modelName }}</span>
            <span class="key-masked">{{ key.maskedKey }}</span>
          </div>
          <button class="btn-remove" @click="removeKey(key.keyId)" title="删除">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.api-key-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.panel-header:hover {
  background: #f8fafc;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 20px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  background: #dbeafe;
  color: #2563eb;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.arrow {
  font-size: 12px;
  color: #94a3b8;
  transition: transform 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
}

.panel-body {
  padding: 0 20px 20px;
}

.form-row {
  margin-bottom: 16px;
}

.form-row label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.provider-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.provider-btn:hover {
  border-color: #93c5fd;
}

.provider-btn.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.provider-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.provider-model {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #2563eb;
}

.btn-validate {
  padding: 10px 20px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-validate:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-validate:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.advanced-toggle {
  font-size: 13px;
  color: #2563eb;
  cursor: pointer;
  padding: 8px 0;
  user-select: none;
}

.advanced-settings {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.validation-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.validation-result.success {
  background: #f0fdf4;
  color: #166534;
}

.validation-result.error {
  background: #fef2f2;
  color: #991b1b;
}

.stored-keys h4 {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
}

.key-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.key-provider {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.key-model {
  font-size: 12px;
  color: #64748b;
}

.key-masked {
  font-size: 12px;
  color: #94a3b8;
  font-family: monospace;
}

.btn-remove {
  width: 28px;
  height: 28px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #fecaca;
}
</style>
