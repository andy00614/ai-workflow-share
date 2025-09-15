import { openai } from '@ai-sdk/openai';
import { AsyncIterableStream, generateText, streamText } from 'ai';

const prompt = '请返回给我一个知识大纲，关于学习<中国近代史>, 控制内容大概 8 个章节';

const { text } = await generateText({
    model: openai('gpt-5'),
    prompt
});


console.log(text);

// const { textStream } = streamText({
//     model: openai('gpt-5-mini'),
//     prompt
// });

// async function printStream(textStream: AsyncIterableStream<string>) {
//     for await (const textPart of textStream) {
//         process.stdout.write(textPart);
//     }
// }

// printStream(textStream);
