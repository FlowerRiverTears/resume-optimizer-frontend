<script setup>
import { ref } from 'vue'
import { testResume } from './TestResume.js'

const emit = defineEmits(['parsed'])
const isDragging = ref(false)
const fileInput = ref(null)

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
  const extension = file.name.split('.').pop().toLowerCase()

  if (extension === 'pdf') {
    await parsePDF(file)
  } else if (extension === 'docx' || extension === 'doc') {
    await parseDocx(file)
  } else if (extension === 'txt') {
    await parseTxt(file)
  } else {
    alert('不支持的文件格式，请上传 PDF、Word 或 TXT 文件')
  }
}

const parsePDF = async (file) => {
  // 使用 PDF.js 解析 PDF
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const typedArray = new Uint8Array(e.target.result)

      // 动态加载 PDF.js
      if (!window.pdfjsLib) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        script.onload = async () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          const pdf = await window.pdfjsLib.getDocument(typedArray).promise
          let text = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            text += content.items.map(item => item.str).join(' ') + '\n'
          }
          emit('parsed', text)
        }
        document.head.appendChild(script)
      } else {
        const pdf = await window.pdfjsLib.getDocument(typedArray).promise
        let text = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map(item => item.str).join(' ') + '\n'
        }
        emit('parsed', text)
      }
    } catch (error) {
      console.error('PDF 解析失败:', error)
      alert('PDF 解析失败，请尝试复制文本粘贴')
    }
  }
  reader.readAsArrayBuffer(file)
}

const parseDocx = async (file) => {
  // 使用 mammoth.js 解析 docx
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
  script.onload = async () => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const result = await window.mammoth.extractRawText({ arrayBuffer: e.target.result })
        emit('parsed', result.value)
      } catch (error) {
        console.error('Word 解析失败:', error)
        alert('Word 文档解析失败')
      }
    }
    reader.readAsArrayBuffer(file)
  }
  document.head.appendChild(script)
}

const parseTxt = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    emit('parsed', e.target.result)
  }
  reader.readAsText(file)
}

const useTestResume = () => {
  emit('parsed', testResume)
}
</script>

<template>
  <div class="uploader">
    <h2 class="title">上传您的简历</h2>
    <p class="subtitle">支持 PDF、Word (.docx)、TXT 格式</p>

    <!-- 上传区域 -->
    <div
      class="upload-area"
      :class="{ dragging: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop="handleDrop"
      @click="fileInput.click()"
    >
      <div class="upload-icon">📄</div>
      <p class="upload-text">拖拽文件到此处，或点击选择文件</p>
      <p class="upload-hint">文件大小不超过 10MB</p>
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        @change="handleFileSelect"
        hidden
      />
    </div>

    <!-- 或者粘贴文本 -->
    <div class="divider">
      <span>或者直接粘贴简历内容</span>
    </div>

    <textarea
      class="paste-area"
      placeholder="粘贴您的简历内容..."
      @keydown.ctrl.v.prevent="true"
    ></textarea>

    <button class="btn btn-primary" @click="emit('parsed', document.querySelector('.paste-area').value)">
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

.upload-area:hover,
.upload-area.dragging {
  border-color: #2563eb;
  background: #eff6ff;
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
