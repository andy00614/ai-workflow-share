'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Target } from 'lucide-react';

interface Quiz {
  title: string;
  description: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  totalQuestions: number;
  estimatedTime: string;
}

interface QuizDisplayProps {
  quiz: Quiz;
  onAnswer: (questionId: string, selectedOption: number, optionText: string) => void;
  currentQuestionIndex?: number;
  userAnswers?: Record<string, number>;
}

export function QuizDisplay({
  quiz,
  onAnswer,
  currentQuestionIndex = 0,
  userAnswers = {}
}: QuizDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.totalQuestions) * 100;
  const answeredCount = Object.keys(userAnswers).length;
  const hasAnswered = currentQuestion.id in userAnswers;

  const handleOptionSelect = (optionIndex: number) => {
    if (hasAnswered) return; // 已回答的题目不允许修改

    setSelectedAnswer(optionIndex);
    const optionText = currentQuestion.options[optionIndex];
    onAnswer(currentQuestion.id, optionIndex, optionText);
  };

  const getOptionStyle = (optionIndex: number) => {
    const isSelected = hasAnswered
      ? userAnswers[currentQuestion.id] === optionIndex
      : selectedAnswer === optionIndex;

    let baseStyle = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:bg-muted/50 ";

    if (isSelected) {
      baseStyle += "border-blue-500 bg-blue-50 text-blue-900 ";
    } else {
      baseStyle += "border-border ";
    }

    if (hasAnswered) {
      baseStyle += "cursor-not-allowed ";
    } else {
      baseStyle += "cursor-pointer ";
    }

    return baseStyle;
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-blue-500" />
                {quiz.title}
              </CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="size-3" />
                {quiz.estimatedTime}
              </Badge>
              <Badge variant="outline">
                {answeredCount}/{quiz.totalQuestions} 完成
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>题目 {currentQuestionIndex + 1} / {quiz.totalQuestions}</span>
              <span>{Math.round(progress)}% 完成</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Question */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
              {currentQuestionIndex + 1}
            </div>
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={getOptionStyle(index)}
                disabled={hasAnswered}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    (hasAnswered ? userAnswers[currentQuestion.id] === index : selectedAnswer === index)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {(hasAnswered ? userAnswers[currentQuestion.id] === index : selectedAnswer === index) && (
                      <CheckCircle className="size-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      选项 {String.fromCharCode(65 + index)}
                    </div>
                    <div>{option}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {hasAnswered && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                <CheckCircle className="size-4" />
                已回答
              </div>
              <p className="text-sm text-green-700">
                您选择了：{currentQuestion.options[userAnswers[currentQuestion.id]]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            {hasAnswered ? (
              <p>✅ 此题已回答完成，继续回答下一题</p>
            ) : (
              <p>💡 请选择您认为正确的答案</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}