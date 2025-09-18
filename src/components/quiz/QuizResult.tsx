'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QuizResult as QuizResultType, Quiz } from '@/lib/quiz-schemas';

interface QuizResultProps {
  result: QuizResultType;
  quiz: Quiz;
  onRestart: () => void;
}

export function QuizResult({ result, quiz, onRestart }: QuizResultProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (percentage: number) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🎉';
    if (percentage >= 70) return '👍';
    if (percentage >= 60) return '😊';
    return '💪';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Score Summary */}
      <Card>
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">{getScoreEmoji(result.percentage)}</div>
          <CardTitle className="text-2xl">测试完成！</CardTitle>
          <CardDescription>您的得分结果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </div>
            <div className="text-lg text-muted-foreground">
              {result.correctAnswers} / {result.totalQuestions} 题正确
            </div>
            <Progress value={result.percentage} className="w-full max-w-md mx-auto" />
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">AI 评价反馈</h3>
            <p className="text-muted-foreground">{result.feedback}</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>详细答题情况</CardTitle>
          <CardDescription>查看每题的答题详情和解析</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.questions.map((question, index) => {
            const userAnswer = result.answers.find(a => a.questionId === question.id);
            const isCorrect = userAnswer?.isCorrect ?? false;
            const selectedIndex = userAnswer?.selectedAnswer ?? -1;

            return (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">
                    {index + 1}. {question.question}
                  </h4>
                  <Badge variant={isCorrect ? 'default' : 'destructive'}>
                    {isCorrect ? '✓ 正确' : '✗ 错误'}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {question.options.map((option, optionIndex) => {
                    const isUserSelection = selectedIndex === optionIndex;
                    const isCorrectOption = question.correctAnswer === optionIndex;

                    let className = 'p-2 rounded border';
                    if (isCorrectOption) {
                      className += ' bg-green-100 border-green-300 text-green-800';
                    } else if (isUserSelection && !isCorrect) {
                      className += ' bg-red-100 border-red-300 text-red-800';
                    } else {
                      className += ' bg-gray-50 border-gray-200';
                    }

                    return (
                      <div key={optionIndex} className={className}>
                        <div className="flex items-center gap-2">
                          {isCorrectOption && <span>✅</span>}
                          {isUserSelection && !isCorrect && <span>❌</span>}
                          <span>{option}</span>
                          {isUserSelection && (
                            <Badge variant="outline" className="ml-auto">
                              您的选择
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h5 className="font-medium text-blue-900 mb-1">💡 解析</h5>
                  <p className="text-blue-800 text-sm">{question.explanation}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center gap-4">
            <Button onClick={onRestart} size="lg">
              🔄 重新开始测试
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = '/'}>
              🏠 返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}