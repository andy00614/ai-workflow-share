import { NextRequest } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { QuizResultSchema } from '@/lib/quiz-schemas';
import { z } from 'zod';

const EvaluationRequestSchema = z.object({
  quiz: z.object({
    title: z.string(),
    questions: z.array(z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number(),
      explanation: z.string(),
    })),
  }),
  userAnswers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.number(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quiz, userAnswers } = EvaluationRequestSchema.parse(body);

    // 计算正确答案数量
    const correctAnswers = userAnswers.filter(userAnswer => {
      const question = quiz.questions.find(q => q.id === userAnswer.questionId);
      return question && question.correctAnswer === userAnswer.selectedAnswer;
    }).length;

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    const result = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      prompt: `请对以下测试结果进行评估和反馈：

测试标题：${quiz.title}
总题数：${totalQuestions}
正确答案数：${correctAnswers}
正确率：${percentage}%

请生成：
1. 一个综合性的反馈评价
2. 具体的分数和百分比
3. 每个题目的详细答题情况

用户答题情况：
${userAnswers.map(ua => {
  const q = quiz.questions.find(q => q.id === ua.questionId);
  const isCorrect = q?.correctAnswer === ua.selectedAnswer;
  return `题目：${q?.question}
用户选择：${q?.options[ua.selectedAnswer] || '未选择'}
正确答案：${q?.options[q?.correctAnswer] || '未知'}
是否正确：${isCorrect ? '✓' : '✗'}`;
}).join('\n\n')}

请提供鼓励性但实事求是的反馈。`,
      schema: QuizResultSchema,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('Error evaluating quiz:', error);
    return Response.json(
      { error: 'Failed to evaluate quiz' },
      { status: 500 }
    );
  }
}