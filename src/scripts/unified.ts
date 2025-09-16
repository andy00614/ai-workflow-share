// import { openai } from '@ai-sdk/openai';
// import { deepseek } from '@ai-sdk/deepseek';
// import { xai } from '@ai-sdk/xai'
// import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai';
import { streamText } from 'ai'


const { text } = await generateText({
    model: google('gemini-2.0-flash'),
    prompt: '请讲一个简短的笑话给我',
});



const result = streamText({
    model: 'openai/gpt-5',
    prompt: 'Why is the sky blue?'
})

console.log(text);