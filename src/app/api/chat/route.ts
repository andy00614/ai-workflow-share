import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: 'azure/gpt-4o',
        system: 'You are a helpful assistant.',
        messages: convertToModelMessages(messages),
        providerOptions: {
            openai: {
                reasoningEffort: 'medium',
                reasoningSummary: 'auto'
            }
        }
    });

    return result.toUIMessageStreamResponse();
}