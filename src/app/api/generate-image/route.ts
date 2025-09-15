import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow image generation up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, size = '1024x1024' } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const { image } = await generateImage({
      model: openai.image('dall-e-3'),
      prompt,
      size,
    });

    // Return the base64 image data
    return Response.json({
      success: true,
      image: image.base64,
      prompt,
      size,
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return Response.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}