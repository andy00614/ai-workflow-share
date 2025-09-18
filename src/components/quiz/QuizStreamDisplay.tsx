'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Quiz } from '@/lib/quiz-schemas';

interface QuizStreamDisplayProps {
  partialQuiz: Partial<Quiz>;
  isComplete: boolean;
  onComplete?: (quiz: Quiz) => void;
}

export function QuizStreamDisplay({ partialQuiz, isComplete, onComplete }: QuizStreamDisplayProps) {
  const [displayedQuestions, setDisplayedQuestions] = useState<number>(0);

  useEffect(() => {
    if (partialQuiz.questions) {
      const timer = setTimeout(() => {
        if (displayedQuestions < partialQuiz.questions.length) {
          setDisplayedQuestions(prev => prev + 1);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [partialQuiz.questions, displayedQuestions]);

  useEffect(() => {
    if (isComplete && partialQuiz.title && partialQuiz.questions && onComplete) {
      onComplete(partialQuiz as Quiz);
    }
  }, [isComplete, partialQuiz, onComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <div>
              <CardTitle>
                {partialQuiz.title || (
                  <Skeleton className="h-6 w-64" />
                )}
              </CardTitle>
              <CardDescription>
                {partialQuiz.description || (
                  <Skeleton className="h-4 w-96 mt-2" />
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {partialQuiz.estimatedTime ? (
              <Badge variant="secondary">⏱️ {partialQuiz.estimatedTime}</Badge>
            ) : (
              <Skeleton className="h-6 w-20" />
            )}
            {partialQuiz.totalQuestions ? (
              <Badge variant="outline">{partialQuiz.totalQuestions} 题</Badge>
            ) : (
              <Skeleton className="h-6 w-12" />
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Stream Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            <span>
              {!partialQuiz.title
                ? '🤖 AI 正在思考测试主题...'
                : !partialQuiz.questions || partialQuiz.questions.length === 0
                ? '📝 正在生成题目...'
                : partialQuiz.questions.length < (partialQuiz.totalQuestions || 5)
                ? `📊 已生成 ${partialQuiz.questions.length} 题，继续生成中...`
                : '✅ 题目生成完成，正在整理...'
              }
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Questions Preview */}
      {partialQuiz.questions && partialQuiz.questions.length > 0 && (
        <div className="space-y-4">
          {partialQuiz.questions.slice(0, displayedQuestions).map((question, index) => (
            <Card key={question.id || index} className="animate-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="text-lg">
                  {index + 1}. {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => {
                    const isCorrect = question.correctAnswer === optionIndex;
                    return (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect && <span className="text-green-600">✓</span>}
                          <span>{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-1">💡 解析</h5>
                    <p className="text-blue-800 text-sm">{question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Loading placeholder for next question */}
          {partialQuiz.questions.length > displayedQuestions && (
            <Card className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-3/4" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Completion Status */}
      {isComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-800">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <p className="font-medium">测试生成完成！</p>
                <p className="text-sm text-green-600">点击下方按钮开始答题</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}