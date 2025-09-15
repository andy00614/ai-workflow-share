import { streamObject } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Simplified schema - only chapters
const chaptersSchema = z.object({
  topic: z.string().describe('The main topic being taught'),
  totalChapters: z.number().describe('Total number of chapters'),
  chapters: z.array(z.object({
    chapterNumber: z.number().describe('Chapter number'),
    title: z.string().describe('Chapter title'),
    description: z.string().describe('Brief chapter overview'),
    topics: z.array(z.string()).describe('Key topics covered'),
    estimatedTime: z.string().describe('Estimated time to complete'),
  })).describe('Course chapters with detailed breakdown'),
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamObject({
    model: 'openai/gpt-oss-20b',
    schema: chaptersSchema,
    prompt: prompt || 'Create 5-7 chapters for learning TypeScript',
    system: 'You are an expert educator. Generate a well-structured chapter outline for the given topic. Each chapter should build upon the previous one with clear progression. Focus on practical, hands-on learning.',
  });

  return result.toTextStreamResponse();
}