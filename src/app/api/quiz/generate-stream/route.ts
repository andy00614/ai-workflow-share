import { NextRequest } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { streamObject } from 'ai';
import { QuizSchema, QuizGenerationRequestSchema } from '@/lib/quiz-schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, difficulty, numberOfQuestions, language } = QuizGenerationRequestSchema.parse(body);

    const result = streamObject({
      model: 'azure/gpt-4o',
      prompt: `请为以下主题生成一个知识测试：

主题：${topic}
难度：${difficulty}
题目数量：${numberOfQuestions}
语言：${language}

要求：
1. 题目应该有清晰的问题表述
2. 每个题目提供2-4个选项
3. 必须有正确答案的索引（从0开始）
4. 每个题目都要有详细的解释说明为什么这个答案是正确的
5. 整个测试要有标题和描述
6. 估算完成时间

请确保题目具有教育价值且符合指定难度级别。

请按照以下顺序逐步生成：
1. 首先生成测试的标题和描述
2. 然后逐个生成每个题目
3. 最后补充总题数和预估时间

这样可以让用户看到实时的生成过程。`,
      schema: QuizSchema,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error generating quiz stream:', error);
    return Response.json(
      { error: 'Failed to generate quiz stream' },
      { status: 500 }
    );
  }
}