'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const chaptersSchema = z.object({
  topic: z.string(),
  chapters: z.array(z.object({
    title: z.string(),
    description: z.string(),
    topics: z.array(z.string()),
  })),
});

export default function ChaptersDemo() {
  const [prompt, setPrompt] = useState('');
  const { object, submit, isLoading } = useObject({
    api: '/api/chapters',
    schema: chaptersSchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ prompt: prompt || 'Create chapters for learning React' });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📚 Chapter Generator</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a topic (e.g., React, Python, CSS...)"
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {object && (
        <div className="space-y-4">
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold">{object.topic}</h2>
            </CardContent>
          </Card>

          {object.chapters?.map((chapter, index) => (
            chapter && (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    {chapter.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{chapter.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {chapter.topics?.map((topic, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
}