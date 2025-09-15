import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the schema for learning outline
const learningOutlineSchema = z.object({
  title: z.string().describe('The main topic or subject title'),
  description: z.string().describe('Brief overview of what will be covered'),
  duration: z.string().describe('Estimated time to complete the learning'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('Difficulty level'),
  prerequisites: z.array(z.string()).describe('Required knowledge before starting'),
  learningObjectives: z.array(z.string()).describe('What learners will achieve'),
  chapters: z.array(z.object({
    chapterNumber: z.number().describe('Chapter number'),
    title: z.string().describe('Chapter title'),
    description: z.string().describe('Chapter overview'),
    topics: z.array(z.string()).describe('Topics covered in this chapter'),
    estimatedTime: z.string().describe('Time to complete this chapter'),
    exercises: z.array(z.string()).optional().describe('Practice exercises'),
  })).describe('Course chapters'),
  resources: z.array(z.object({
    type: z.enum(['Book', 'Video', 'Article', 'Documentation', 'Tool']),
    title: z.string(),
    url: z.string().optional(),
  })).describe('Additional learning resources'),
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamObject({
    model: 'xai/grok-3',
    schema: learningOutlineSchema,
    prompt: prompt || 'Create a comprehensive learning outline for React.js from beginner to advanced level',
    system: 'You are an expert educational content creator who designs structured learning paths. Generate detailed, practical learning outlines with clear progression, hands-on exercises, and valuable resources.',
  });

  return result.toTextStreamResponse();
}