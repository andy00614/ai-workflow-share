#!/usr/bin/env bun

/**
 * Quiz Agent Demo - 知识问答助手演示
 *
 * 这个演示展示了如何使用 AI SDK 构建一个完整的知识问答应用，包含：
 * - Tool Calling: AI 调用题目生成和评分工具
 * - Object Structure: 结构化数据生成与验证
 * - Stream Response: 实时流式响应
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, streamObject } from 'ai';
import { QuizSchema, QuizGenerationRequestSchema } from '../lib/quiz-schemas';

console.log('🧠 Quiz Agent Demo - 知识问答助手');
console.log('=====================================\n');

// Demo 1: 生成结构化测试题目
async function generateQuizDemo() {
  console.log('📝 Demo 1: 生成结构化测试题目');
  console.log('-----------------------------------');

  const request = {
    topic: 'JavaScript 异步编程',
    difficulty: 'medium' as const,
    numberOfQuestions: 3,
    language: 'zh-CN',
  };

  console.log('请求参数:', JSON.stringify(request, null, 2));
  console.log('\n🤖 AI 生成中...\n');

  try {
    const result = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: `请为以下主题生成一个知识测试：

主题：${request.topic}
难度：${request.difficulty}
题目数量：${request.numberOfQuestions}
语言：${request.language}

要求：
1. 题目应该有清晰的问题表述
2. 每个题目提供2-4个选项
3. 必须有正确答案的索引（从0开始）
4. 每个题目都要有详细的解释说明为什么这个答案是正确的
5. 整个测试要有标题和描述
6. 估算完成时间

请确保题目具有教育价值且符合指定难度级别。`,
      schema: QuizSchema,
    });

    console.log('✅ 生成完成!');
    console.log('\n📋 生成的测试:', JSON.stringify(result.object, null, 2));

    return result.object;
  } catch (error) {
    console.error('❌ 生成失败:', error);
    return null;
  }
}

// Demo 2: 流式生成展示
async function streamGenerationDemo() {
  console.log('\n\n🌊 Demo 2: 流式生成展示');
  console.log('----------------------------');

  const request = {
    topic: 'React Hooks',
    difficulty: 'easy' as const,
    numberOfQuestions: 2,
    language: 'zh-CN',
  };

  console.log('请求参数:', JSON.stringify(request, null, 2));
  console.log('\n🤖 AI 流式生成中...\n');

  try {
    const { partialObjectStream } = streamObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: `请为以下主题生成一个知识测试：

主题：${request.topic}
难度：${request.difficulty}
题目数量：${request.numberOfQuestions}
语言：${request.language}

请按照以下顺序逐步生成：
1. 首先生成测试的标题和描述
2. 然后逐个生成每个题目
3. 最后补充总题数和预估时间

这样可以让用户看到实时的生成过程。`,
      schema: QuizSchema,
    });

    let stepCount = 0;
    for await (const partialObject of partialObjectStream) {
      stepCount++;
      console.log(`\n📊 Step ${stepCount}:`);

      if (partialObject.title) {
        console.log(`  📝 标题: ${partialObject.title}`);
      }

      if (partialObject.description) {
        console.log(`  📄 描述: ${partialObject.description}`);
      }

      if (partialObject.questions && partialObject.questions.length > 0) {
        console.log(`  ❓ 已生成题目: ${partialObject.questions.length} 题`);

        // 显示最新生成的题目
        const latestQuestion = partialObject.questions[partialObject.questions.length - 1];
        if (latestQuestion && latestQuestion.question) {
          console.log(`    └─ 最新题目: ${latestQuestion.question}`);
        }
      }

      if (partialObject.totalQuestions) {
        console.log(`  🔢 总题数: ${partialObject.totalQuestions}`);
      }

      if (partialObject.estimatedTime) {
        console.log(`  ⏱️  预估时间: ${partialObject.estimatedTime}`);
      }

      // 添加一点延迟来模拟实时感
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ 流式生成完成!');
  } catch (error) {
    console.error('❌ 流式生成失败:', error);
  }
}

// Demo 3: 测试评分
async function evaluateQuizDemo(quiz: any) {
  if (!quiz || !quiz.questions) {
    console.log('\n⚠️  跳过评分演示 - 没有可用的测试题目');
    return;
  }

  console.log('\n\n🎯 Demo 3: 测试评分演示');
  console.log('-------------------------');

  // 模拟用户答题（故意答错一些）
  const userAnswers = quiz.questions.map((question: any, index: number) => ({
    questionId: question.id,
    selectedAnswer: index === 0 ? question.correctAnswer : (question.correctAnswer + 1) % question.options.length,
  }));

  console.log('📝 模拟用户答题:');
  userAnswers.forEach((answer: any, index: number) => {
    const question = quiz.questions[index];
    const isCorrect = answer.selectedAnswer === question.correctAnswer;
    console.log(`  ${index + 1}. ${question.question}`);
    console.log(`     用户选择: ${question.options[answer.selectedAnswer]}`);
    console.log(`     ${isCorrect ? '✅ 正确' : '❌ 错误'}`);
  });

  console.log('\n🤖 AI 评分中...\n');

  try {
    const result = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: `请对以下测试结果进行评估和反馈：

测试标题：${quiz.title}
总题数：${quiz.questions.length}

用户答题情况：
${userAnswers.map((ua: any, index: number) => {
  const q = quiz.questions[index];
  const isCorrect = q?.correctAnswer === ua.selectedAnswer;
  return `题目${index + 1}：${q?.question}
用户选择：${q?.options[ua.selectedAnswer] || '未选择'}
正确答案：${q?.options[q?.correctAnswer] || '未知'}
是否正确：${isCorrect ? '✓' : '✗'}`;
}).join('\n\n')}

请提供鼓励性但实事求是的反馈。`,
      schema: z.object({
        totalQuestions: z.number(),
        correctAnswers: z.number(),
        score: z.number(),
        percentage: z.number(),
        feedback: z.string(),
        answers: z.array(z.object({
          questionId: z.string(),
          selectedAnswer: z.number(),
          isCorrect: z.boolean(),
        })),
      }),
    });

    console.log('✅ 评分完成!');
    console.log('\n📊 评分结果:');
    console.log(`  🏆 得分: ${result.object.percentage}% (${result.object.correctAnswers}/${result.object.totalQuestions})`);
    console.log(`  💬 AI 反馈: ${result.object.feedback}`);

  } catch (error) {
    console.error('❌ 评分失败:', error);
  }
}

// 主程序
async function main() {
  console.log('🚀 开始演示 Tool Calling + Object Structure + Stream 技术栈\n');

  // 验证环境变量
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ 错误: 请设置 ANTHROPIC_API_KEY 环境变量');
    process.exit(1);
  }

  try {
    // Demo 1: 基础对象生成
    const quiz = await generateQuizDemo();

    // Demo 2: 流式生成
    await streamGenerationDemo();

    // Demo 3: 评分功能
    await evaluateQuizDemo(quiz);

    console.log('\n\n🎉 演示完成!');
    console.log('\n💡 要查看完整的 Web 界面演示，请访问: http://localhost:3000/quiz-agent');
    console.log('   在那里你可以体验完整的用户界面和交互流程。');

  } catch (error) {
    console.error('\n❌ 演示过程中发生错误:', error);
    process.exit(1);
  }
}

// 导入必要的依赖
import { z } from 'zod';

// 运行主程序
// if (import.meta.main) {
//   main().catch(console.error);
// }