<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  resumeContent: String,
  jobDescription: String
})

const emit = defineEmits(['analyze', 'update:jobDescription'])

const localResume = ref(props.resumeContent)
const localJobDesc = ref(props.jobDescription)

watch(() => props.resumeContent, (val) => {
  localResume.value = val
})

const handleAnalyze = () => {
  // 简单的规则引擎分析
  const result = analyzeResume(localResume.value, localJobDesc.value)
  emit('analyze', result)
}

const analyzeResume = (resume, jobDesc) => {
  const resumeLower = resume.toLowerCase()
  const jobDescLower = jobDesc.toLowerCase()

  // 提取关键词
  const skills = [
    'java', 'python', 'javascript', 'typescript', 'c#', 'c++', 'go', 'rust',
    'spring', 'vue', 'react', 'angular', 'nodejs', 'mysql', 'postgresql',
    'mongodb', 'redis', 'docker', 'kubernetes', 'git', 'linux', 'aws',
    '微服务', '分布式', '数据库', '前端', '后端', '全栈'
  ]

  // 计算找到的技能
  const foundSkills = skills.filter(skill => resumeLower.includes(skill))

  // 从职位描述中提取关键词
  const jobKeywords = jobDesc ? extractKeywords(jobDescLower) : []
  const matchedKeywords = jobKeywords.filter(k => foundSkills.includes(k))
  const missingKeywords = jobKeywords.filter(k => !foundSkills.includes(k))

  // 计算 ATS 分数
  let atsScore = 0

  // 基础分数 - 有内容
  if (resume.length > 100) atsScore += 10
  if (resume.length > 300) atsScore += 10

  // 结构分数
  if (resumeLower.includes('经验') || resumeLower.includes('工作')) atsScore += 15
  if (resumeLower.includes('技能') || resumeLower.includes('技术')) atsScore += 15
  if (resumeLower.includes('教育') || resumeLower.includes('学历')) atsScore += 10
  if (resumeLower.includes('项目')) atsScore += 10
  if (resumeLower.includes('@') || resumeLower.includes('邮箱')) atsScore += 10

  // 关键词匹配分数
  if (jobDesc) {
    const matchRate = matchedKeywords.length / Math.max(jobKeywords.length, 1)
    atsScore += Math.round(matchRate * 30)
  }

  // 生成建议
  const suggestions = []

  if (!resumeLower.includes('@') && !resumeLower.includes('邮箱')) {
    suggestions.push('添加邮箱联系方式')
  }

  if (!resumeLower.includes('经验') && !resumeLower.includes('工作')) {
    suggestions.push('添加工作经历描述')
  }

  if (foundSkills.length < 5) {
    suggestions.push('添加更多技术技能关键词')
  }

  if (jobDesc && missingKeywords.length > 0) {
    suggestions.push(`建议添加: ${missingKeywords.slice(0, 5).join(', ')}`)
  }

  if (resume.length < 200) {
    suggestions.push('简历内容较少，建议补充更多细节')
  }

  if (resume.length > 2000) {
    suggestions.push('简历较长，建议精简到1-2页')
  }

  // 计算匹配度
  const matchScore = jobDesc && jobKeywords.length > 0
    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
    : 0

  return {
    atsScore: Math.min(atsScore, 100),
    missingKeywords: missingKeywords.slice(0, 10),
    foundKeywords: foundSkills,
    suggestions: suggestions.length > 0 ? suggestions : ['简历结构良好，继续保持！'],
    keywordFrequency: {},
    structure: {
      hasContactInfo: resumeLower.includes('@') || resumeLower.includes('邮箱'),
      hasExperience: resumeLower.includes('经验') || resumeLower.includes('工作'),
      hasEducation: resumeLower.includes('教育') || resumeLower.includes('学历'),
      hasSkills: resumeLower.includes('技能') || resumeLower.includes('技术'),
      totalWords: resume.split(/\s+/).length
    },
    matchScore: matchScore
  }
}

const extractKeywords = (text) => {
  const keywords = []
  const techTerms = [
    'java', 'python', 'javascript', 'typescript', 'c#', 'c++', 'go', 'rust',
    'spring', 'vue', 'react', 'angular', 'nodejs', 'mysql', 'postgresql',
    'mongodb', 'redis', 'docker', 'kubernetes', 'git', 'linux', 'aws',
    '微服务', '分布式', '数据库', '前端', '后端', '全栈', '算法', '架构'
  ]

  for (const term of techTerms) {
    if (text.includes(term)) {
      keywords.push(term)
    }
  }

  return keywords
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
        @input="emit('update:jobDescription', localJobDesc)"
      ></textarea>
    </div>

    <div class="actions">
      <button class="btn btn-primary" @click="handleAnalyze">
        开始分析
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

.btn-primary:hover {
  background: #1d4ed8;
}
</style>
