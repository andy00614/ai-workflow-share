'use client';

import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';

export default function VoiceDemo() {
    // 语音转文字相关状态
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);

    // 文字转语音相关状态
    const [textToSpeak, setTextToSpeak] = useState('');
    const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // 错误状态
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // 开始录音
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                }
            });

            audioChunksRef.current = [];
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                // 自动转录
                await transcribeAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setError('');
            setTranscribedText('');
        } catch (err) {
            setError('无法访问麦克风。请确保已授予麦克风权限。');
        }
    };

    // 停止录音
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // 转录音频
    const transcribeAudio = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch('/api/voice/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('转录失败');
            }

            const result = await response.json();
            setTranscribedText(result.text);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : '转录时发生错误');
        } finally {
            setIsTranscribing(false);
        }
    };

    // 生成语音
    const generateSpeech = async () => {
        if (!textToSpeak.trim()) {
            setError('请输入要转换为语音的文字');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/voice/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textToSpeak,
                }),
            });

            if (!response.ok) {
                throw new Error('语音生成失败');
            }

            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            setGeneratedAudioUrl(audioUrl);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : '生成语音时发生错误');
        } finally {
            setIsGenerating(false);
        }
    };

    // 清除转录结果
    const clearTranscription = () => {
        setTranscribedText('');
    };

    // 将转录结果复制到文字转语音输入框
    const copyToTextInput = () => {
        setTextToSpeak(transcribedText);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            {/* 语音转文字 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isTranscribing}
                        variant={isRecording ? 'destructive' : 'default'}
                    >
                        {isRecording ? '停止' : '录音'}
                    </Button>

                    {isRecording && (
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    )}

                    {isTranscribing && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                </div>

                {transcribedText && (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Button onClick={copyToTextInput} size="sm" variant="secondary">
                                复制
                            </Button>
                            <Button onClick={clearTranscription} size="sm" variant="secondary">
                                清除
                            </Button>
                        </div>
                        <div className="p-3 bg-gray-50 rounded border">
                            {transcribedText}
                        </div>
                    </div>
                )}
            </div>

            {/* 文字转语音 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <textarea
                    value={textToSpeak}
                    onChange={(e) => setTextToSpeak(e.target.value)}
                    placeholder="输入文字..."
                    className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none mb-4"
                    maxLength={1000}
                />

                <div className="flex justify-between items-center">
                    <Button
                        onClick={generateSpeech}
                        disabled={isGenerating || !textToSpeak.trim()}
                        variant="default"
                    >
                        {isGenerating ? '生成中...' : '生成语音'}
                    </Button>

                    <Button
                        onClick={() => setTextToSpeak('')}
                        size="sm"
                        variant="secondary"
                        disabled={!textToSpeak}
                    >
                        清空
                    </Button>
                </div>
            </div>

            {/* 生成的语音 */}
            {generatedAudioUrl && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <audio controls src={generatedAudioUrl} />
                        <a
                            href={generatedAudioUrl}
                            download="speech.mp3"
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                            下载
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}