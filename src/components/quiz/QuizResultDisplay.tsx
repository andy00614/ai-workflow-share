'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  feedback: string;
  detailedAnalysis: Array<{
    questionNumber: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    status: string;
  }>;
}

interface QuizResultDisplayProps {
  result: QuizResult;
}

export function QuizResultDisplay({ result }: QuizResultDisplayProps) {
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

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">{getScoreEmoji(result.percentage)}</div>
          <CardTitle className="text-2xl">测试结果</CardTitle>
          <CardDescription>您的答题表现总结</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className={`text-5xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </div>
            <div className="text-lg text-muted-foreground">
              {result.correctAnswers} / {result.totalQuestions} 题正确
            </div>
            <Progress value={result.percentage} className="w-full max-w-md mx-auto h-3" />

            <div className="flex justify-center gap-4 text-sm">
              <Badge variant={getScoreBadgeVariant(result.percentage)} className="flex items-center gap-1">
                <BarChart3 className="size-3" />
                {result.percentage >= 80 ? '优秀' : result.percentage >= 60 ? '良好' : '需要提高'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="size-3" />
                {result.totalQuestions} 题测试
              </Badge>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
              <Trophy className="size-4" />
              AI 智能反馈
            </h3>
            <p className="text-blue-800">{result.feedback}</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-blue-500" />
            详细答题分析
          </CardTitle>
          <CardDescription>查看每题的答题情况和正确答案</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.detailedAnalysis.map((analysis, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium">
                  第 {analysis.questionNumber} 题：{analysis.question}
                </h4>
                <Badge
                  variant={analysis.isCorrect ? 'default' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  {analysis.isCorrect ? (
                    <CheckCircle className="size-3" />
                  ) : (
                    <XCircle className="size-3" />
                  )}
                  {analysis.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className={`p-3 rounded border ${
                  analysis.isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="font-medium text-gray-700 mb-1">您的答案</div>
                  <div className={analysis.isCorrect ? 'text-green-800' : 'text-red-800'}>
                    {analysis.userAnswer}
                  </div>
                </div>

                <div className="p-3 rounded border bg-blue-50 border-blue-200">
                  <div className="font-medium text-gray-700 mb-1">正确答案</div>
                  <div className="text-blue-800">
                    {analysis.correctAnswer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Suggestion */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="font-semibold">下一步建议</h3>
            {result.percentage >= 80 ? (
              <p className="text-muted-foreground">
                🎓 恭喜！您可以尝试更高难度的测试或学习新的知识领域
              </p>
            ) : result.percentage >= 60 ? (
              <p className="text-muted-foreground">
                📚 建议针对错误的题目进行复习，然后再次挑战
              </p>
            ) : (
              <p className="text-muted-foreground">
                💡 建议系统性地学习相关基础知识后再进行测试
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}