# Resume Optimizer - Frontend

**English** | **[中文](./README.md)**

---

A Vue 3 powered resume analysis and optimization tool frontend application, designed to work with the [backend service](../resume-optimizer).

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 Resume Upload | Support PDF, Word, TXT file parsing, or paste text directly |
| 🎯 Skill Matching | Intelligent extraction of skill keywords from resume and job description |
| 📊 Visual Reports | ECharts radar charts for skill matching, category scores at a glance |
| 🤖 AI Chat | LLM-based intelligent Q&A and resume generation, with thinking process display |
| 🔍 RAG Retrieval | Hybrid search (vector + keyword) + weighted ranking |
| 💡 Targeted Suggestions | Personalized optimization suggestions based on missing skills (High/Medium/Low priority) |
| 📝 Template Comparison | Side-by-side original vs. optimized resume, one-click apply |
| 🔑 API Key Management | Support 4 AI providers (OpenAI/DashScope/DeepSeek/MiniMax) |
| 📱 Responsive Design | Adapts to desktop and mobile |
| 📑 PDF Export | Export analysis reports to PDF format |

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | 3.5.30 | Frontend framework (Composition API + `<script setup>`) |
| Vite | 7.3.1 | Build tool |
| ECharts | 5.5.0 | Data visualization (radar chart / bar chart) |
| vue-echarts | 7.0.0 | Vue ECharts integration |
| Custom Markdown Parser | - | AI response rendering (no third-party dependencies, XSS protection) |

## 🚀 Quick Start

### Requirements

- Node.js 20.19+ or 22.12+

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Frontend service runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔗 Backend Integration

This frontend requires the Resume Optimizer backend service:

```bash
# Start backend
cd resume-optimizer
./mvnw spring-boot:run
```

Ensure the backend runs at `http://localhost:9000` (Vite proxy is configured in `vite.config.js`)

## 📁 Project Structure

```
src/
├── App.vue                    # Root component (state management / Tab navigation / component orchestration)
├── main.js                    # Application entry
├── api.js                     # API interface definitions + renderMarkdown re-export
├── markdown.js                # Markdown parser (custom implementation, XSS protection)
└── components/
    ├── AiChat.vue             # AI chat (Markdown rendering / thinking process / RAG results / quick questions)
    ├── AiAnalysis.vue         # AI deep analysis (model selection / analysis report / RAG references)
    ├── AnalysisResult.vue     # ATS scoring results (radar chart / bar chart / keywords / suggestions / structure / PDF export)
    ├── ApiKeyInput.vue        # API Key input (4 providers / advanced settings / collapsible panel)
    ├── ResumeEditor.vue       # Resume editor (text editing / job description / trigger analysis)
    ├── ResumeUploader.vue     # File upload (drag & drop / paste / sample resume)
    └── TemplateComparison.vue # Template comparison (side-by-side / skill highlighting / apply template)
```

## 🧩 Component Overview

| Component | Function |
|-----------|----------|
| ResumeUploader | Resume upload (drag & drop / paste / sample resume) |
| ResumeEditor | Resume editing + job description input + trigger analysis |
| AnalysisResult | ATS scoring display (score card / radar chart / bar chart / keywords / suggestions / structure / PDF export) |
| AiChat | AI chat assistant (Markdown rendering / thinking process / RAG results / quick questions) |
| AiAnalysis | AI deep analysis (model selection / analysis report / RAG references) |
| ApiKeyInput | API Key management (4 providers / advanced settings / collapsible panel) |
| TemplateComparison | Template comparison (side-by-side / skill highlighting / apply template) |

## 🎨 Custom Markdown Parser

This project uses a custom Markdown parser with the following features:

- ✅ No third-party dependencies
- ✅ Full Markdown syntax support (headings/tables/code blocks/lists/blockquotes/etc.)
- ✅ Built-in XSS protection
- ✅ Code block copy button
- ✅ Responsive table scrolling

## 🔒 Privacy Statement

- 🔒 **Local Processing** - All resume data is processed locally through the backend, not uploaded to third parties
- 🚫 **No Persistence** - API Keys are stored in memory only, cleared on restart
- 💾 **Secure Rendering** - Custom Markdown parser with built-in XSS protection

## 🤝 Contributing

Issues and Pull Requests are welcome!

### Development Flow

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Submit a Pull Request

## 📝 Changelog

### v1.0.0 (2026-05-01)

- ✨ Initial release
- ✅ 7 Vue components
- ✅ ECharts radar chart and bar chart
- ✅ Custom Markdown parser
- ✅ PDF export functionality
- ✅ Responsive design

## 📄 License

This project is for learning and research purposes only.

---

**Star** ⭐ this project for latest updates!
