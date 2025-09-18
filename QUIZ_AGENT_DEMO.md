# 🧠 Quiz Agent Demo - 知识问答助手

一个展示 **Tool Calling + Object Structure + Stream** 完整技术栈的 AI 应用演示。

## 📋 功能特性

### 🔧 Tool Calling (工具调用)
- **题目生成工具**: AI 调用结构化数据生成 API
- **评分工具**: AI 调用智能评估和反馈 API
- **多步骤流程**: 生成 → 答题 → 评分的完整链路

### 📊 Object Structure (结构化数据)
- **Zod Schema 验证**: 严格的类型安全和数据验证
- **结构化题目**: 包含题目、选项、正确答案、解释等完整结构
- **结构化结果**: 分数、百分比、详细反馈等评估结果

### 🌊 Stream Response (流式响应)
- **实时生成展示**: 观察 AI 逐步生成题目的过程
- **动画效果**: 平滑的用户界面过渡
- **双模式切换**: 快速生成 vs 流式展示

## 🚀 使用方式

### 1. Web 界面演示
访问: `http://localhost:3000/quiz-agent`

**操作流程:**
1. 输入测试主题（如 "JavaScript 基础"）
2. 选择难度级别（简单/中等/困难）
3. 设置题目数量（3-10题）
4. 选择演示模式：
   - 🚀 **快速生成**: 一次性返回完整结果
   - 🌊 **流式展示**: 实时观察 AI 生成过程
5. 答题并获得 AI 智能评分反馈

### 2. 命令行演示
```bash
# 运行演示脚本
npm run demo
# 选择 "2. quizAgent"

# 或直接运行
bun src/scripts/quizAgent.ts
```

## 🏗️ 技术架构

### 前端组件
```
src/components/quiz/
├── QuizForm.tsx          # 测试配置表单
├── QuizDisplay.tsx       # 答题界面
├── QuizResult.tsx        # 结果展示
└── QuizStreamDisplay.tsx # 流式生成展示
```

### API 路由
```
src/app/api/quiz/
├── generate/route.ts        # 快速生成测试
├── generate-stream/route.ts # 流式生成测试
└── evaluate/route.ts        # 智能评分
```

### 数据结构
```typescript
// src/lib/quiz-schemas.ts
export const QuizSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(QuestionSchema),
  totalQuestions: z.number(),
  estimatedTime: z.string(),
});
```

## 💡 技术亮点

### 1. Tool Calling 展示
- 演示 AI 如何调用专用工具完成复杂任务
- 展示多步骤工作流的协调和管理
- 体现 AI Agent 的实际应用价值

### 2. Object Structure 展示
- 严格的类型安全和数据验证
- 复杂嵌套数据结构的处理
- 前后端类型一致性保证

### 3. Stream Response 展示
- 实时用户体验优化
- 长时间任务的进度反馈
- 流式数据的前端处理

## 🎯 演示要点

### 适合 PPT 展示的关键场景：

1. **输入 → 生成**: 展示从用户需求到结构化数据的转换
2. **流式过程**: 展示 AI 思考和生成的实时过程
3. **答题交互**: 展示用户友好的交互设计
4. **智能评分**: 展示 AI 的深度分析和个性化反馈

### 技术价值体现：

- **开发效率**: 类型安全 + 自动验证 = 更少 bug
- **用户体验**: 流式响应 + 实时反馈 = 更好感知
- **系统可靠**: Tool Calling + 结构化 = 更强能力

## 🔧 运行要求

### 环境变量
```bash
# .env.local
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 依赖包
- Next.js 15
- AI SDK (@ai-sdk/anthropic)
- Zod (数据验证)
- Tailwind CSS (样式)

### 启动命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行演示脚本
npm run demo
```

## 📈 扩展可能

这个 demo 可以轻松扩展为：
- 📚 **在线教育平台**: 自动生成课程测试
- 🏢 **企业培训系统**: 技能评估和认证
- 🎓 **学习助手**: 个性化学习路径规划
- 📊 **数据分析工具**: 知识图谱构建

---

**🎪 完美的 MVP 演示**: 5分钟内展示完整的 AI 应用开发技术栈！