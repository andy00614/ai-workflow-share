import { streamObject } from 'ai';
import { z } from 'zod';

const prompt = '请返回给我一个知识大纲，关于学习<中国近代史>, 控制内容大概 5 个章节';

const schemaOfOutline = z.object({
    title: z.array(z.string()),
});

const { partialObjectStream } = streamObject({
    model: 'azure/gpt-4o',
    schema: schemaOfOutline,
    prompt,
});

for await (const partialObject of partialObjectStream) {
    console.log(JSON.stringify(partialObject, null, 2));
}