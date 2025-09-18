'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizGenerationRequest } from '@/lib/quiz-schemas';

interface QuizFormProps {
  onGenerate: (request: QuizGenerationRequest) => void;
  isGenerating: boolean;
}

export function QuizForm({ onGenerate, isGenerating }: QuizFormProps) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onGenerate({
      topic: topic.trim(),
      difficulty,
      numberOfQuestions,
      language: 'zh-CN',
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧠 知识问答助手</CardTitle>
        <CardDescription>
          输入您想要测试的主题，AI 将为您生成个性化的知识测试
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium">
              测试主题
            </label>
            <Input
              id="topic"
              placeholder="例如：JavaScript 基础、中国历史、数学概率..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium">
                难度级别
              </label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as any)} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">🟢 简单</SelectItem>
                  <SelectItem value="medium">🟡 中等</SelectItem>
                  <SelectItem value="hard">🔴 困难</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="questions" className="text-sm font-medium">
                题目数量
              </label>
              <Select
                value={numberOfQuestions.toString()}
                onValueChange={(value) => setNumberOfQuestions(parseInt(value))}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num} 题</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!topic.trim() || isGenerating}
          >
            {isGenerating ? '🤖 AI 正在生成测试...' : '✨ 生成测试'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}