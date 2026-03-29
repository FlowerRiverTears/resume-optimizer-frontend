# 简历优化器 - 前端

Vue 3 构建的简历分析与优化工具前端应用。

## 功能特性

- 📄 **简历上传** - 支持 PDF、Word、TXT 文件解析，也可直接粘贴文本
- 🎯 **技能匹配分析** - 智能提取简历与职位描述中的技能关键词
- 📊 **可视化报告** - 雷达图展示技能匹配度，分类评分一目了然
- 💡 **针对性建议** - 根据缺失技能生成个性化优化建议
- 📝 **模板对比** - 原简历与优化版左右对比，支持一键应用
- 📱 **响应式设计** - 适配桌面端与移动端

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **ECharts** - 数据可视化图表库
- **原生 CSS** - 简洁轻量的样式方案

## 隐私声明

- 🔒 **本地处理** - 所有简历数据仅在本地浏览器处理
- 🚫 **不上传云端** - 不调用任何外部 API 或大模型服务
- 💾 **不持久化** - 数据不保存到任何服务器

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

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
# 克隆后端仓库
git clone https://github.com/your-username/resume-optimizer.git

# 启动后端
cd resume-optimizer
./mvnw spring-boot:run
```

确保后端运行在 `http://localhost:9000`（可在 `src/components/` 中修改 API 地址）

## 项目结构

```
src/
├── App.vue              # 根组件
├── main.js              # 入口文件
└── components/
    ├── ResumeUploader.vue     # 简历上传组件
    ├── ResumeEditor.vue       # 简历编辑组件
    ├── AnalysisResult.vue     # 分析结果展示组件
    └── TemplateComparison.vue  # 模板对比组件
```

## License

MIT License
