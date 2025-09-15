import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';


const prompt = '请返回给我一个知识大纲，关于学习<中国近代史>, 控制内容大概 8 个章节';

const schemaOfOutline = z.object({
    title: z.string(),
    chapters: z.array(z.object({
        title: z.string(),
        content: z.string(),
    })),
});

const { object } = await generateObject({
    model: openai('gpt-5-mini'),
    schema: schemaOfOutline,
    prompt,
});

console.log(JSON.stringify(object, null, 2));