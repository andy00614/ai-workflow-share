import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { experimental_transcribe as transcribe } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: '缺少音频文件' },
        { status: 400 }
      );
    }

    console.log('🎙️ 开始转录音频...');
    console.log(`文件大小: ${audioFile.size} bytes`);
    console.log(`文件类型: ${audioFile.type}`);

    // 将音频文件转换为 Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // 使用 OpenAI Whisper 进行转录
    const result = await transcribe({
      model: openai.transcription('whisper-1'),
      audio: audioBuffer,
    });

    console.log(`✅ 转录完成: "${result.text.substring(0, 100)}..."`);
    console.log(`📊 时长: ${result.durationInSeconds}秒, 语言: ${result.language}`);

    return NextResponse.json({
      text: result.text,
      duration: result.durationInSeconds,
      language: result.language
    });

  } catch (error) {
    console.error('❌ 转录失败:', error);

    // 根据错误类型返回不同的错误信息
    let errorMessage = '转录时发生未知错误';

    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorMessage = 'OpenAI API密钥无效或已过期，请检查环境变量配置';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'API调用配额已用完，请稍后重试';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '网络连接错误，请检查网络连接';
      } else if (error.message.includes('file') || error.message.includes('format')) {
        errorMessage = '音频文件格式不支持或文件损坏';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}