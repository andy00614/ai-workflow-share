'use client';

import { useState, useCallback } from 'react';
import { QuizForm } from '@/components/quiz/QuizForm';
import { QuizDisplay } from '@/components/quiz/QuizDisplay';
import { QuizResult } from '@/components/quiz/QuizResult';
import { QuizStreamDisplay } from '@/components/quiz/QuizStreamDisplay';
import { Quiz, QuizGenerationRequest, UserAnswer, QuizResult as QuizResultType } from '@/lib/quiz-schemas';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { QuizSchema } from '@/lib/quiz-schemas';
import { Button } from '@/components/ui/button';

type QuizState = 'form' | 'generating' | 'quiz' | 'result';

export default function QuizAgentPage() {
  const [state, setState] = useState<QuizState>('form');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResultType | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [useStreamMode, setUseStreamMode] = useState(true);

  const { object: streamingQuiz, submit, isLoading: isGenerating } = useObject({
    api: '/api/quiz/generate-stream',
    schema: QuizSchema,
    onFinish: (quiz) => {
      if (quiz) {
        setQuiz(quiz);
        setState('quiz');
      }
    },
  });

  const handleGenerateQuiz = useCallback(async (request: QuizGenerationRequest) => {
    if (useStreamMode) {
      setState('generating');
      submit(request);
    } else {
      try {
        const response = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error('Failed to generate quiz');
        }

        const generatedQuiz = await response.json();
        setQuiz(generatedQuiz);
        setState('quiz');
      } catch (error) {
        console.error('Error generating quiz:', error);
        alert('生成测试失败，请重试');
      }
    }
  }, [useStreamMode, submit]);

  const handleSubmitAnswers = useCallback(async (answers: UserAnswer[]) => {
    if (!quiz) return;

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz,
          userAnswers: answers.map(a => ({
            questionId: a.questionId,
            selectedAnswer: a.selectedAnswer,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate quiz');
      }

      const evaluation = await response.json();
      setResult(evaluation);
      setState('result');
    } catch (error) {
      console.error('Error evaluating quiz:', error);
      alert('评分失败，请重试');
    } finally {
      setIsEvaluating(false);
    }
  }, [quiz]);

  const handleRestart = useCallback(() => {
    setQuiz(null);
    setResult(null);
    setState('form');
  }, []);

  const handleStreamComplete = useCallback((quiz: Quiz) => {
    setQuiz(quiz);
    setState('quiz');
  }, []);

  const handleStartQuiz = useCallback(() => {
    if (quiz) {
      setState('quiz');
    }
  }, [quiz]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🧠 AI 知识问答助手
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            演示 Tool Calling + Object Structure + Stream 技术栈的完整AI应用流程
          </p>

          {/* Technical Stack Badges */}
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              🔧 Tool Calling
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              📋 Object Structure
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              🌊 Stream Response
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              🤖 Claude 3.5 Sonnet
            </span>
          </div>
        </div>

        {/* Stream Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border">
            <span className="text-sm font-medium">演示模式：</span>
            <button
              onClick={() => setUseStreamMode(false)}
              className={`px-3 py-1 rounded text-sm transition-colors ${!useStreamMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              🚀 快速生成
            </button>
            <button
              onClick={() => setUseStreamMode(true)}
              className={`px-3 py-1 rounded text-sm transition-colors ${useStreamMode
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              🌊 流式展示
            </button>
          </div>
        </div>

        {/* Main Content */}
        {state === 'form' && (
          <QuizForm onGenerate={handleGenerateQuiz} isGenerating={isGenerating} />
        )}

        {state === 'generating' && (
          <div className="space-y-6">
            <QuizStreamDisplay
              partialQuiz={streamingQuiz || {}}
              isComplete={!isGenerating && !!streamingQuiz?.title && !!streamingQuiz?.questions}
              onComplete={handleStreamComplete}
            />
            {!isGenerating && streamingQuiz?.title && streamingQuiz?.questions && (
              <div className="flex justify-center">
                <Button onClick={handleStartQuiz} size="lg" className="animate-pulse">
                  🎯 开始答题
                </Button>
              </div>
            )}
          </div>
        )}

        {state === 'quiz' && quiz && (
          <QuizDisplay
            quiz={quiz}
            onSubmit={handleSubmitAnswers}
            isEvaluating={isEvaluating}
          />
        )}

        {state === 'result' && result && quiz && (
          <QuizResult
            result={result}
            quiz={quiz}
            onRestart={handleRestart}
          />
        )}

        {/* Technical Flow Explanation */}
        {state === 'form' && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">🔄 技术流程演示</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🛠️</span>
                  </div>
                  <h3 className="font-medium">Tool Calling</h3>
                  <p className="text-sm text-muted-foreground">
                    AI 调用题目生成和评分工具
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-medium">Object Structure</h3>
                  <p className="text-sm text-muted-foreground">
                    结构化数据生成与验证
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-medium">Real-time UI</h3>
                  <p className="text-sm text-muted-foreground">
                    实时响应与用户交互
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}