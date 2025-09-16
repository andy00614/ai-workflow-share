'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrbitingCircles } from '@/components/ui/orbiting-circles';
import { Ripple } from '@/components/ui/ripple';
import { Download, ImageIcon, Sparkles, AlertCircle, Wand2 } from 'lucide-react';
import Image from 'next/image';

interface GeneratedImage {
  image: string;
  prompt: string;
  size: string;
  timestamp: number;
}

export default function ImageGeneration() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState('');

  const predefinedPrompts = [
    'A futuristic cityscape at sunset with flying cars',
    'A cute cat wearing sunglasses on a beach',
    'A magical forest with glowing mushrooms',
    'A space station orbiting a purple planet',
    'A cozy coffee shop in a snowy mountain town',
    'A robot chef cooking in a modern kitchen',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      const newImage: GeneratedImage = {
        image: data.image,
        prompt: data.prompt,
        size: data.size,
        timestamp: Date.now(),
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image.image}`;
    link.download = `generated-image-${image.timestamp}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold text-foreground">
            AI Image Generator
          </h1>
          <p className="text-xl text-muted-foreground">
            Create stunning images from text descriptions
          </p>
        </div>

        {/* Generation Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Generate Image
            </CardTitle>
            <CardDescription>
              Describe what you want to see and let AI create it for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A beautiful landscape with mountains and a lake..."
                  className="flex-1"
                  disabled={isGenerating}
                />
                <Button
                  type="submit"
                  disabled={!prompt.trim() || isGenerating}
                  className="px-6"
                >
                  {isGenerating ? (
                    <>
                      <div className="relative w-4 h-4 mr-2">
                        <OrbitingCircles
                          className="w-4 h-4"
                          duration={20}
                          delay={20}
                          radius={6}
                        >
                          <div className="w-1 h-1 bg-current rounded-full" />
                        </OrbitingCircles>
                      </div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>

              {/* Quick prompt buttons */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Try these prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {predefinedPrompts.map((promptText) => (
                    <Button
                      key={promptText}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isGenerating}
                      onClick={() => setPrompt(promptText)}
                      className="text-xs"
                    >
                      {promptText}
                    </Button>
                  ))}
                </div>
              </div>
            </form>

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Loading State with Magic UI */}
        {isGenerating && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-5 h-5">
                  <OrbitingCircles
                    className="w-5 h-5"
                    duration={20}
                    delay={20}
                    radius={8}
                  >
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full" />
                  </OrbitingCircles>
                </div>
                <span className="text-lg font-medium">Creating your image...</span>
              </div>

              {/* Animated skeleton with ripple effect */}
              <div className="relative">
                <Skeleton className="w-full h-64 rounded-lg" />
                <Ripple className="absolute inset-0 rounded-lg" />
              </div>

              <div className="mt-3">
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Generated Images</h2>
            <div className="grid gap-6">
              {generatedImages.map((imageData) => (
                <Card key={imageData.timestamp} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative group">
                      <Image
                        src={`data:image/png;base64,${imageData.image}`}
                        alt={imageData.prompt}
                        width={1024}
                        height={1024}
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          onClick={() => downloadImage(imageData)}
                          size="sm"
                          variant="secondary"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="font-medium text-foreground mb-3">{imageData.prompt}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {imageData.size}
                        </Badge>
                        <Badge variant="outline">
                          DALL-E 3
                        </Badge>
                        <span>•</span>
                        <span>{new Date(imageData.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !isGenerating && (
          <Card className="text-center py-16">
            <CardContent>
              <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No images generated yet</h3>
              <p className="text-muted-foreground">
                Enter a prompt above to create your first AI-generated image
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}