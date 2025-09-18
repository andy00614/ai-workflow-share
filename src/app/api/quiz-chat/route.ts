import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool, convertToModelMessages, stepCountIs, type UIMessage } from 'ai';
import { z } from 'zod';
import { QuizSchema, QuestionSchema } from '@/lib/quiz-schemas';

// 定义工具 schemas
const generateQuizToolSchema = z.object({
  topic: z.string().describe('测试主题，如 JavaScript、React、历史等'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('难度级别'),
  numberOfQuestions: z.number().min(1).max(10).describe('题目数量'),
  language: z.string().default('zh-CN').describe('语言设置'),
});

const evaluateAnswersToolSchema = z.object({
  quizTitle: z.string().describe('测试标题'),
  userAnswers: z.array(z.object({
    questionText: z.string().describe('题目内容'),
    userAnswer: z.string().describe('用户的答案'),
    correctAnswer: z.string().describe('正确答案'),
    isCorrect: z.boolean().describe('是否回答正确'),
  })).describe('用户答题情况'),
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  console.log('Received body:', JSON.stringify(body, null, 2));

  const { messages } = body;

  // 如果消息格式是旧的 content 格式，转换为新的 parts 格式
  const uiMessages: UIMessage[] = messages.map((msg: any) => {
    if (msg.content && typeof msg.content === 'string') {
      // 旧格式：{ role, content }
      return {
        id: msg.id || Math.random().toString(),
        role: msg.role,
        parts: [{ type: 'text', text: msg.content }]
      };
    } else if (msg.parts) {
      // 新格式：{ role, parts }
      return msg;
    } else {
      // 兜底处理
      return {
        id: msg.id || Math.random().toString(),
        role: msg.role,
        parts: [{ type: 'text', text: String(msg.content || '') }]
      };
    }
  });

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages: convertToModelMessages(uiMessages),
    system: `你是一个专业的知识问答助手。你的任务是：

1. **理解用户需求**：当用户描述想要测试的知识领域时，分析其需求
2. **生成测试题目**：使用 generateQuiz 工具创建个性化测试
3. **指导答题**：清晰地展示题目，引导用户回答
4. **评估结果**：使用 evaluateAnswers 工具分析答题情况并提供反馈

交互要求：
- 使用友好、鼓励的语气
- 提供清晰的指导和反馈
- 根据用户表现给出建设性建议
- 支持中文交流

示例对话流程：
用户："我想测试 JavaScript 基础知识"
助手：使用工具生成测试 → 展示题目 → 收集答案 → 评估并反馈`,

    tools: {
      generateQuiz: tool({
        description: '根据用户需求生成个性化的知识测试题目',
        inputSchema: generateQuizToolSchema,
        execute: async ({ topic, difficulty, numberOfQuestions, language }) => {
          try {
            // 这里我们直接在工具内部生成测试，而不是调用外部 API
            const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/quiz/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                topic,
                difficulty,
                numberOfQuestions,
                language,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to generate quiz');
            }

            const quiz = await response.json();
            return {
              type: 'quiz_generated',
              success: true,
              quiz,
              message: `已为您生成关于"${topic}"的测试，共${numberOfQuestions}道${difficulty}难度题目。请逐一回答以下问题：`,
            };
          } catch (error) {
            return {
              success: false,
              error: `生成测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
            };
          }
        },
      }),

      evaluateAnswers: tool({
        description: '评估用户的答题结果并提供详细反馈',
        inputSchema: evaluateAnswersToolSchema,
        execute: async ({ quizTitle, userAnswers }) => {
          try {
            const correctCount = userAnswers.filter(answer => answer.isCorrect).length;
            const totalCount = userAnswers.length;
            const percentage = Math.round((correctCount / totalCount) * 100);

            // 生成个性化反馈
            let feedback = '';
            if (percentage >= 90) {
              feedback = '🏆 优秀！您对这个主题掌握得非常好，建议继续深入学习更高级的内容。';
            } else if (percentage >= 80) {
              feedback = '🎉 很好！您已经掌握了大部分知识点，可以针对错误的部分进行复习。';
            } else if (percentage >= 60) {
              feedback = '👍 不错的开始！建议重点复习基础概念，然后再尝试更多练习。';
            } else {
              feedback = '💪 继续努力！建议从基础开始系统性地学习这个主题。';
            }

            return {
              type: 'quiz_evaluated',
              success: true,
              result: {
                totalQuestions: totalCount,
                correctAnswers: correctCount,
                percentage,
                feedback,
                detailedAnalysis: userAnswers.map((answer, index) => ({
                  questionNumber: index + 1,
                  question: answer.questionText,
                  userAnswer: answer.userAnswer,
                  correctAnswer: answer.correctAnswer,
                  isCorrect: answer.isCorrect,
                  status: answer.isCorrect ? '✅ 正确' : '❌ 错误',
                })),
              },
            };
          } catch (error) {
            return {
              success: false,
              error: `评估失败: ${error instanceof Error ? error.message : '未知错误'}`,
            };
          }
        },
      }),
    },

    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}