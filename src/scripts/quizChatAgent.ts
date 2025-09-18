#!/usr/bin/env bun

/**
 * Quiz Chat Agent Demo - 基于聊天的知识问答助手演示
 *
 * 这个演示展示了如何使用 AI Elements + Tool Calling 构建聊天式的知识问答应用，包含：
 * - Chat Interface: 自然语言交互界面
 * - Tool Calling: AI 调用专用工具生成测试和评分
 * - Stream Response: 实时聊天响应
 * - Element Components: 现代化的聊天 UI 组件
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText, tool } from 'ai';
import { z } from 'zod';

console.log('💬 Quiz Chat Agent Demo - 基于聊天的知识问答助手');
console.log('===============================================\n');

// 模拟聊天交互
async function simulateChatInteraction() {
  console.log('🎭 Demo 1: 模拟聊天交互流程');
  console.log('----------------------------');

  const messages = [
    {
      role: 'user' as const,
      content: '我想测试 JavaScript 基础知识，生成 3 道中等难度的题目'
    }
  ];

  console.log('👤 用户:', messages[0].content);
  console.log('\n🤖 AI 助手正在处理...\n');

  try {
    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages,
      system: `你是一个专业的知识问答助手。当用户描述测试需求时，你要：
1. 解析用户需求（主题、难度、题目数量）
2. 使用 generateQuiz 工具生成测试
3. 友好地展示题目给用户

请用中文回应。`,

      tools: {
        generateQuiz: tool({
          description: '根据用户需求生成个性化的知识测试题目',
          parameters: z.object({
            topic: z.string().describe('测试主题'),
            difficulty: z.enum(['easy', 'medium', 'hard']).describe('难度级别'),
            numberOfQuestions: z.number().min(1).max(10).describe('题目数量'),
            language: z.string().default('zh-CN').describe('语言设置'),
          }),
          execute: async ({ topic, difficulty, numberOfQuestions }) => {
            console.log(`  🔧 调用工具: generateQuiz`);
            console.log(`     - 主题: ${topic}`);
            console.log(`     - 难度: ${difficulty}`);
            console.log(`     - 题目数: ${numberOfQuestions}`);

            // 模拟生成的测试数据
            const mockQuiz = {
              title: `${topic} 知识测试`,
              description: `${difficulty} 难度的 ${topic} 测试，共 ${numberOfQuestions} 题`,
              questions: [
                {
                  id: '1',
                  question: '以下哪个关键字用于声明 JavaScript 中的常量？',
                  options: ['var', 'let', 'const', 'constant'],
                  correctAnswer: 2,
                  explanation: 'const 关键字用于声明常量，声明后值不能被重新赋值。'
                },
                {
                  id: '2',
                  question: 'JavaScript 中哪个方法可以将字符串转换为数字？',
                  options: ['toString()', 'parseInt()', 'valueOf()', 'concat()'],
                  correctAnswer: 1,
                  explanation: 'parseInt() 方法可以将字符串解析为整数。'
                },
                {
                  id: '3',
                  question: '以下哪个不是 JavaScript 的数据类型？',
                  options: ['string', 'boolean', 'float', 'undefined'],
                  correctAnswer: 2,
                  explanation: 'JavaScript 中没有 float 类型，数字统一使用 number 类型。'
                }
              ].slice(0, numberOfQuestions),
              totalQuestions: numberOfQuestions,
              estimatedTime: `${numberOfQuestions * 2} 分钟`
            };

            return {
              success: true,
              quiz: mockQuiz,
              message: `成功生成关于"${topic}"的${numberOfQuestions}道${difficulty}难度题目`
            };
          },
        }),
      },

      maxSteps: 3,
    });

    console.log('💬 AI 回复:');
    console.log(result.text);

    if (result.toolCalls.length > 0) {
      console.log('\n🔧 工具调用结果:');
      result.toolCalls.forEach((toolCall, index) => {
        console.log(`  ${index + 1}. ${toolCall.toolName}:`);
        console.log(`     参数:`, JSON.stringify(toolCall.args, null, 6));
      });

      if (result.toolResults.length > 0) {
        console.log('\n📊 工具执行结果:');
        result.toolResults.forEach((toolResult, index) => {
          console.log(`  ${index + 1}. 结果:`, JSON.stringify(toolResult.result, null, 6));
        });
      }
    }

    return result;

  } catch (error) {
    console.error('❌ 聊天交互失败:', error);
    return null;
  }
}

// 演示答题和评分流程
async function simulateAnsweringFlow() {
  console.log('\n\n🎯 Demo 2: 模拟答题和评分流程');
  console.log('--------------------------------');

  const answerMessages = [
    {
      role: 'user' as const,
      content: '我已经回答完了：第1题选择 const，第2题选择 parseInt()，第3题选择 float。请帮我评分。'
    }
  ];

  console.log('👤 用户:', answerMessages[0].content);
  console.log('\n🤖 AI 助手正在评分...\n');

  try {
    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: answerMessages,
      system: `你是一个专业的知识问答助手。当用户提交答案时，你要：
1. 解析用户的答案
2. 使用 evaluateAnswers 工具进行评分
3. 提供详细的反馈和建议

请用中文回应。`,

      tools: {
        evaluateAnswers: tool({
          description: '评估用户的答题结果并提供详细反馈',
          parameters: z.object({
            quizTitle: z.string().describe('测试标题'),
            userAnswers: z.array(z.object({
              questionText: z.string().describe('题目内容'),
              userAnswer: z.string().describe('用户的答案'),
              correctAnswer: z.string().describe('正确答案'),
              isCorrect: z.boolean().describe('是否回答正确'),
            })).describe('用户答题情况'),
          }),
          execute: async ({ quizTitle, userAnswers }) => {
            console.log(`  🔧 调用工具: evaluateAnswers`);
            console.log(`     - 测试: ${quizTitle}`);
            console.log(`     - 答题数: ${userAnswers.length}`);

            const correctCount = userAnswers.filter(answer => answer.isCorrect).length;
            const totalCount = userAnswers.length;
            const percentage = Math.round((correctCount / totalCount) * 100);

            console.log(`     - 正确率: ${percentage}% (${correctCount}/${totalCount})`);

            let feedback = '';
            if (percentage >= 90) {
              feedback = '🏆 优秀！您对这个主题掌握得非常好！';
            } else if (percentage >= 80) {
              feedback = '🎉 很好！您已经掌握了大部分知识点！';
            } else if (percentage >= 60) {
              feedback = '👍 不错的开始！建议重点复习基础概念。';
            } else {
              feedback = '💪 继续努力！建议从基础开始系统性地学习。';
            }

            return {
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
          },
        }),
      },

      maxSteps: 3,
    });

    console.log('💬 AI 评分回复:');
    console.log(result.text);

    if (result.toolResults.length > 0) {
      console.log('\n📊 详细评分结果:');
      const evaluation = result.toolResults[0].result as any;
      if (evaluation.success) {
        console.log(`  🏆 得分: ${evaluation.result.percentage}%`);
        console.log(`  📝 反馈: ${evaluation.result.feedback}`);
        console.log(`  📋 详细分析:`);
        evaluation.result.detailedAnalysis.forEach((analysis: any) => {
          console.log(`    ${analysis.questionNumber}. ${analysis.question}`);
          console.log(`       您的答案: ${analysis.userAnswer}`);
          console.log(`       正确答案: ${analysis.correctAnswer}`);
          console.log(`       结果: ${analysis.status}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 评分流程失败:', error);
  }
}

// 主程序
async function main() {
  console.log('🚀 开始演示基于聊天的知识问答助手\n');

  // 验证环境变量
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ 错误: 请设置 ANTHROPIC_API_KEY 环境变量');
    process.exit(1);
  }

  try {
    // Demo 1: 聊天交互
    await simulateChatInteraction();

    // Demo 2: 答题评分
    await simulateAnsweringFlow();

    console.log('\n\n🎉 演示完成!');
    console.log('\n💡 要体验完整的聊天界面，请访问: http://localhost:3000/quiz-chat');
    console.log('   在那里你可以：');
    console.log('   - 🗣️  用自然语言描述测试需求');
    console.log('   - 📝 实时看到 AI 生成题目的过程');
    console.log('   - 💬 通过聊天方式回答问题');
    console.log('   - 🎯 获得智能化的评分和反馈');
    console.log('\n✨ 这展示了 Chat Interface + Tool Calling 的强大组合！');

  } catch (error) {
    console.error('\n❌ 演示过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行主程序
if (import.meta.main) {
  main().catch(console.error);
}