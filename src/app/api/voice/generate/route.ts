import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { experimental_generateSpeech as generateSpeech } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '缺少文本内容' },
        { status: 400 }
      );
    }

    const textContent = text.trim();
    console.log(`🔊 开始生成语音`);
    console.log(`📝 文本内容: "${textContent.substring(0, 100)}..."`);
    console.log(`📊 文本长度: ${textContent.length} 字符`);

    // 使用 OpenAI TTS 生成语音
    const result = await generateSpeech({
      model: openai.speech('tts-1'),
      text: textContent,
      voice: 'alloy', // 可选: 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
    });

    console.log('✅ 语音生成完成');
    console.log('音频信息:', {
      mediaType: result.audio.mediaType,
      size: result.audio.uint8Array.length,
      warnings: result.warnings
    });

    // 返回音频数据
    return new NextResponse(Buffer.from(result.audio.uint8Array), {
      headers: {
        'Content-Type': result.audio.mediaType || 'audio/mpeg',
        'Content-Length': result.audio.uint8Array.length.toString(),
        'Content-Disposition': 'attachment; filename="generated-speech.mp3"',
        'Cache-Control': 'no-cache', // 不缓存，因为每次生成的内容可能不同
      },
    });

  } catch (error) {
    console.error('❌ 语音生成失败:', error);

    // 根据错误类型返回不同的错误信息
    let errorMessage = '语音生成时发生未知错误';

    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorMessage = 'OpenAI API密钥无效或已过期，请检查环境变量配置';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = 'API调用配额已用完，请稍后重试';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = '网络连接错误，请检查网络连接';
      } else if (error.message.includes('length') || error.message.includes('too long')) {
        errorMessage = '文本内容过长，请缩短文本后重试';
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