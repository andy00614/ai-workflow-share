# 我的 AI 工作流

## 核心体验

- **代码产出**: 80%+ 的代码由 AI 生成，专注于架构设计和测试
- **效率提升**: 整体编程效率提升 3-5 倍
- **主要场景**: 代码编写、代码理解、技术调研
- **订阅建议**: AI 工具更新频繁，避免年度订阅

## 工具栈

### 编程
- **主力**: Claude Code
- **辅助**: Windsurf + CodeX

### 原型 ｜ 设计
- Claude Code subagent
- [v0.dev](http://v0.dev)
- SuperDesign
- https://tweakcn.com/

### 项目分析
- **Project Packer**: repomix 将项目打包为 AI 友好格式

### 命令行
- **Warp**: SSH 配置、环境设置等

### 内容处理
- **[r.jina.ai](https://r.jina.ai/)**: 网页转 Markdown，当做自己的知识库，喂给 AI

### 上下文增强
- **MCP Context7**: 代码生成必备

## 关键技巧

### 1. 精确提问

❌ **模糊请求**
```
写一个 Python 的限流器，限制用户每分钟 10 次请求。
```

✅ **精确需求**
```
用 Python 实现一个 Token 桶限流器，要求如下：
- 每个用户（通过 user_id 字符串识别）每分钟 10 次请求
- 线程安全，支持并发访问
- 自动清理过期条目
- 返回一个元组 (allowed: bool, retry_after_seconds: int)

请考虑：
- Token 是应该逐渐补充还是一次性补满？
- 当系统时钟发生变化时会怎样？
- 如何防止因不活跃用户导致的内存泄漏？

优先选择简单、可读的实现，而不是过早优化。
仅使用标准库（不要用 Redis 或其他外部依赖）。
```

### 2. 项目规则文件

创建 `AGENTS.md` 文件，定义项目规范：

```markdown
## Project: Analytics Dashboard

### Architecture Decisions
- Server Components by default, Client Components only when necessary
- tRPC for type-safe API calls
- Prisma for database access with explicit select statements
- Tailwind for styling (no custom CSS files)

### Code Style
- Formatting: Prettier with 100-char lines
- Imports: sorted with simple-import-sort
- Components: Pascal case, co-located with their tests
- Hooks: always prefix with 'use'

### Patterns to Follow
- Data fetching happens in Server Components
- Client Components receive data as props
- Use Zod schemas for all external data
- Error boundaries around every data display component

### What NOT to Do
- Don't use useEffect for data fetching
- Don't create global state without explicit approval
- Don't bypass TypeScript with 'any' types
```

### 3. 上下文管理

- **任务完成后清空会话**: Claude Code 使用 `/clear`
- **手动指定文件**: 用 `@` 引用相关文件和文件夹
- **避免全局搜索**: 明确目标，提高效率

## 实践应用

### 学习新技术
**方法**: repomix + MCP + Claude Code
1. 生成多个结构化 MD 文档
2. 按章节分步骤学习
3. 结合实际 demo 案例

### 自动化脚本
**示例**: 创建专注工作脚本
```bash
# 要求：创建 deep_work.sh 脚本
# 功能：打开 Obsidian，关闭浏览器和通讯软件，开启勿扰模式，播放白噪音
```

### 语音工具
- **[Wispr Flow](https://wisprflow.ai/)**: 语音编程辅助

## 总结：如何用 AI 辅助开发一款产品
1）编辑产品文档(越详细越好) -> 
2）使用 superdesign,或者 sub-agent 去生成一个 ascii 原型图 -> 
3）根据原型图，让 ai 生成 html 格式的交互模板（利用 gitworktree 生成多个版本）-> 
4）基于 shadcn 技术栈去让 ai 实现 html
5）基于一个限制完善的 agent.md，claudecode + mcp 去让 ai 驱动的修改代码，完成想要的逻辑
6) https://tweakcn.com/ 找到最适合自己的主题

## 参考资源

- [Git Worktree 实践指南](https://dev.to/yankee/practical-guide-to-git-worktree-58o0)
- [Julep AGENTS.md 示例](https://github.com/julep-ai/julep/blob/dev/AGENTS.md)
