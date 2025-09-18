import { AsyncIterableStream, streamText } from 'ai';

const prompt = '请返回给我一个知识大纲，关于学习<中国近代史>, 控制内容大概 8 个章节';

const { textStream } = streamText({
    model: 'azure/gpt-4o',
    prompt
});

async function printStream(textStream: AsyncIterableStream<string>) {
    for await (const textPart of textStream) {
        process.stdout.write(textPart);
    }
}

printStream(textStream);
