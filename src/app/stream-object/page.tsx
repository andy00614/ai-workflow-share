'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, BookOpen, Target, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

// Define the same schema as the server
const learningOutlineSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.string(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  prerequisites: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  chapters: z.array(z.object({
    chapterNumber: z.number(),
    title: z.string(),
    description: z.string(),
    topics: z.array(z.string()),
    estimatedTime: z.string(),
    exercises: z.array(z.string()).optional(),
  })),
  resources: z.array(z.object({
    type: z.enum(['Book', 'Video', 'Article', 'Documentation', 'Tool']),
    title: z.string(),
    url: z.string().optional(),
  })),
});

export default function StreamObjectDemo() {
  const [prompt, setPrompt] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const { object, submit, isLoading, stop } = useObject({
    api: '/api/object',
    schema: learningOutlineSchema,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit({ prompt: prompt || 'Create a learning outline for Python programming' });
  };

  const toggleChapter = (index: number) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getDifficultyVariant = (difficulty?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (difficulty) {
      case 'Beginner':
        return 'secondary';
      case 'Intermediate':
        return 'default';
      case 'Advanced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getResourceIcon = (type?: string) => {
    switch (type) {
      case 'Book':
        return '📚';
      case 'Video':
        return '🎬';
      case 'Article':
        return '📄';
      case 'Documentation':
        return '📖';
      case 'Tool':
        return '🛠️';
      default:
        return '📌';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Learning Outline Generator</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a topic you want to learn (e.g., Machine Learning, Web Development, Data Science...)"
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Outline'}
          </Button>
          {isLoading && (
            <Button
              type="button"
              onClick={() => stop()}
              variant="destructive"
            >
              Stop
            </Button>
          )}
        </div>
      </form>

      {/* Loading Skeleton */}
      {isLoading && !object && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      )}

      {/* Display the streamed learning outline */}
      {object && (
        <div className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{object.title || <Skeleton className="h-8 w-3/4" />}</CardTitle>
              {object.description && (
                <CardDescription className="text-base mt-2">{object.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {object.difficulty && (
                  <Badge variant={getDifficultyVariant(object.difficulty)}>
                    {object.difficulty}
                  </Badge>
                )}
                {object.duration && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {object.duration}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {object.prerequisites && object.prerequisites.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Prerequisites</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {object.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Learning Objectives */}
          {object.learningObjectives && object.learningObjectives.length > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {object.learningObjectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Chapters */}
          {object.chapters && object.chapters.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-xl font-semibold">Course Chapters</h3>
              </div>
              {object.chapters.map((chapter, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleChapter(index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-2 flex-1">
                        {expandedChapters.has(index) ?
                          <ChevronDown className="w-5 h-5 mt-0.5 flex-shrink-0" /> :
                          <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        }
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Chapter {chapter.chapterNumber || index + 1}: {chapter.title || <Skeleton className="h-5 w-32 inline-block" />}
                          </CardTitle>
                          {chapter.description && (
                            <CardDescription className="mt-1">{chapter.description}</CardDescription>
                          )}
                        </div>
                      </div>
                      {chapter.estimatedTime && (
                        <Badge variant="outline" className="ml-4">
                          <Clock className="w-3 h-3 mr-1" />
                          {chapter.estimatedTime}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  {expandedChapters.has(index) && (
                    <CardContent className="pt-0">
                      {chapter.topics && chapter.topics.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Topics:</p>
                          <div className="flex flex-wrap gap-2">
                            {chapter.topics.map((topic, topicIndex) => (
                              <Badge key={topicIndex} variant="secondary">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {chapter.exercises && chapter.exercises.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Exercises:</p>
                          <ul className="space-y-1">
                            {chapter.exercises.map((exercise, exIndex) => (
                              <li key={exIndex} className="text-sm text-gray-600">• {exercise}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Resources */}
          {object.resources && object.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {object.resources.map((resource, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50/50">
                      <span className="text-xl">{getResourceIcon(resource.type)}</span>
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="text-xs mb-1">
                          {resource.type}
                        </Badge>
                        {resource.url ? (
                          <a href={resource.url} target="_blank" rel="noopener noreferrer"
                             className="block text-blue-600 hover:underline truncate">
                            {resource.title}
                          </a>
                        ) : (
                          <p className="text-sm">{resource.title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw JSON preview */}
          <details className="group">
            <summary className="cursor-pointer font-medium text-sm text-gray-600 hover:text-gray-900">
              View Raw JSON
            </summary>
            <Card className="mt-2">
              <CardContent className="pt-4">
                <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded">
                  {JSON.stringify(object, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </details>
        </div>
      )}
    </div>
  );
}