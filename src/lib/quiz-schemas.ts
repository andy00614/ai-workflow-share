import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2).max(4),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string(),
});

export const QuizSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(QuestionSchema).min(1).max(10),
  totalQuestions: z.number(),
  estimatedTime: z.string(),
});

export const UserAnswerSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.number(),
  isCorrect: z.boolean(),
});

export const QuizResultSchema = z.object({
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  score: z.number(),
  percentage: z.number(),
  feedback: z.string(),
  answers: z.array(UserAnswerSchema),
});

export const QuizGenerationRequestSchema = z.object({
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  numberOfQuestions: z.number().min(1).max(10),
  language: z.string().default('zh-CN'),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type UserAnswer = z.infer<typeof UserAnswerSchema>;
export type QuizResult = z.infer<typeof QuizResultSchema>;
export type QuizGenerationRequest = z.infer<typeof QuizGenerationRequestSchema>;