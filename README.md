# 简历优化器 - 前端

**[English](./README.en.md)** | **中文**

---

Vue 3 构建的简历分析与优化工具前端应用，配合 [后端服务](../resume-optimizer) 使用。

## 功能特性

| 功能 | 描述 |
|------|------|
| 📄 简历上传 | 支持 PDF、Word、TXT 文件解析，也可直接粘贴文本 |
| 🎯 技能匹配分析 | 智能提取简历与职位描述中的技能关键词 |
| 📊 可视化报告 | ECharts 雷达图展示技能匹配度，分类评分一目了然 |
| 🤖 AI 智能对话 | 基于 LLM 的智能问答与简历生成，支持思考过程展示 |
| 📚 RAG 检索增强 | 混合检索（向量+关键词）+ 权重排序 |
| 💡 针对性建议 | 根据缺失技能生成个性化优化建议（高/中/低优先级） |
| 📝 模板对比 | 原简历与优化版左右对比，支持一键应用 |
| 🔑 API Key 管理 | 支持 4 种 AI 提供商（OpenAI/通义千问/DeepSeek/MiniMax） |
| 📱 响应式设计 | 适配桌面端与移动端 |

## 技术栈

| 技术 | 版本 | 用途 |
|-----|------|-----|
| Vue.js | 3.5.30 | 前端框架（Composition API + `<script setup>`） |
| Vite | 7.3.1 | 构建工具 |
| ECharts | 5.5.0 | 数据可视化（雷达图/柱状图） |
| vue-echarts | 7.0.0 | Vue ECharts 集成 |
| 自定义 Markdown 解析器 | - | AI 回复渲染（无第三方依赖，XSS 防护） |

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

前端服务运行在 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 配合后端使用

本前端需要配合简历优化器后端服务使用：

```bash
# 启动后端
cd resume-optimizer
./mvnw spring-boot:run
```

确保后端运行在 `http://localhost:9000`（Vite 代理配置在 `vite.config.js` 中）

## 项目结构

```
src/
├── App.vue                    # 根组件（状态管理/Tab导航/组件编排）
├── main.js                    # 应用入口
├── api.js                     # API 接口定义 + renderMarkdown re-export
├── markdown.js                # Markdown 解析器（自定义实现，XSS防护）
└── components/
    ├── AiChat.vue             # AI 聊天组件（Markdown渲染/思考过程/RAG结果/快捷提问）
    ├── AiAnalysis.vue         # AI 深度分析组件（模型选择/分析报告/RAG引用）
    ├── AnalysisResult.vue     # ATS 评分结果（雷达图/柱状图/关键词/建议/结构/PDF导出）
    ├── ApiKeyInput.vue        # API Key 输入组件（4提供商/高级设置/折叠面板）
    ├── ResumeEditor.vue       # 简历编辑器（文本编辑/职位描述/触发分析）
    ├── ResumeUploader.vue     # 文件上传（拖拽/粘贴/示例简历）
    └── TemplateComparison.vue # 模板对比（左右对比/技能高亮/使用模板）
```

## 组件说明

| 组件 | 功能 |
|------|------|
| ResumeUploader | 简历上传（拖拽/粘贴/示例简历） |
| ResumeEditor | 简历编辑 + 职位描述输入 + 触发分析 |
| AnalysisResult | ATS 评分展示（评分卡片/雷达图/柱状图/关键词/建议/结构/PDF导出） |
| AiChat | AI 聊天助手（Markdown渲染/思考过程/RAG结果/快捷提问） |
| AiAnalysis | AI 深度分析（模型选择/分析报告/RAG引用） |
| ApiKeyInput | API Key 管理（4提供商/高级设置/折叠面板） |
| TemplateComparison | 模板对比（左右对比/技能高亮/使用模板） |

## 隐私声明

- 🔒 **本地处理** - 所有简历数据通过后端本地处理，不上传到第三方
- 🚫 **不持久化** - API Key 仅存储在内存中，重启后清空
- 💾 **安全渲染** - 自定义 Markdown 解析器内置 XSS 防护

## 相关文档

| 文档 | 描述 |
|-----|------|
| [后端 README](../resume-optimizer/README.md) | 后端项目文档 |
| [架构设计](../resume-optimizer/docs/ARCHITECTURE.md) | 系统架构设计 |
| [前端规范](../resume-optimizer/docs/FRONTEND.md) | 前端开发规范 |
| [安全规范](../resume-optimizer/docs/SECURITY.md) | 安全规范 |
