<script setup>
import { ref } from 'vue'
import { testResume } from './TestResume.js'
import { API, apiUpload } from '../api.js'

const emit = defineEmits(['parsed'])
const isDragging = ref(false)
const isLoading = ref(false)
const error = ref('')
const fileInput = ref(null)
const pasteContent = ref('')

const handleDrop = async (e) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) await parseFile(file)
}

const handleFileSelect = async (e) => {
  const file = e.target.files[0]
  if (file) await parseFile(file)
}

const parseFile = async (file) => {
  error.value = ''
  isLoading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const result = await apiUpload(API.parse, formData)

    if (result.success) {
      emit('parsed', result.content)
    } else {
      throw new Error(result.error || '解析失败')
    }
  } catch (err) {
    console.error('解析失败:', err)
    error.value = '解析失败，请确保后端服务已启动，或尝试复制文本粘贴'
  } finally {
    isLoading.value = false
  }
}

const handlePasteSubmit = () => {
  if (pasteContent.value.trim()) {
    emit('parsed', pasteContent.value)
  }
}

const useTestResume = () => {
  emit('parsed', testResume)
}
</script>

<template>
  <div class="uploader">
    <h2 class="title">上传您的简历</h2>
    <p class="subtitle">支持 PDF、Word (.docx)、TXT 格式</p>

    <div
      class="upload-area"
      :class="{ dragging: isDragging, loading: isLoading }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop="handleDrop"
      @click="!isLoading && fileInput.click()"
    >
      <div class="upload-icon">{{ isLoading ? '⏳' : '📄' }}</div>
      <p class="upload-text">{{ isLoading ? '解析中...' : '拖拽文件到此处，或点击选择文件' }}</p>
      <p class="upload-hint">文件大小不超过 10MB</p>
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        @change="handleFileSelect"
        hidden
        :disabled="isLoading"
      />
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="divider">
      <span>或者直接粘贴简历内容</span>
    </div>

    <textarea
      v-model="pasteContent"
      class="paste-area"
      placeholder="粘贴您的简历内容..."
    ></textarea>

    <button class="btn btn-primary" @click="handlePasteSubmit">
      继续
    </button>

    <div class="divider">
      <span>或者</span>
    </div>

    <button class="btn btn-secondary" @click="useTestResume">
      使用示例简历体验
    </button>
  </div>
</template>

<style scoped>
.uploader {
  max-width: 600px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.upload-area:hover:not(.loading),
.upload-area.dragging {
  border-color: #2563eb;
  background: #eff6ff;
}

.upload-area.loading {
  cursor: wait;
  opacity: 0.7;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #999;
}

.error {
  color: #ef4444;
  text-align: center;
  margin: 16px 0;
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  font-size: 14px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 32px 0;
  color: #999;
  font-size: 14px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #eee;
}

.divider span {
  padding: 0 16px;
}

.paste-area {
  width: 100%;
  height: 200px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 24px;
}

.paste-area:focus {
  outline: none;
  border-color: #2563eb;
}

.btn {
  display: block;
  width: 100%;
  padding: 14px 24px;
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

.btn-secondary {
  background: #fff;
  color: #2563eb;
  border: 2px solid #2563eb;
}

.btn-secondary:hover {
  background: #eff6ff;
}
</style>
