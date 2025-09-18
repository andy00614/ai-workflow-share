'use client';

import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { StreamingToolCallsMessage } from '../api/use-chat-streaming-tool-calls/route';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/components/ai-elements/prompt-input';
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Tool, ToolHeader, ToolContent } from '@/components/ai-elements/tool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Chat() {
  const { messages, status, sendMessage, addToolResult } =
    useChat<StreamingToolCallsMessage>({
      transport: new DefaultChatTransport({
        api: '/api/use-chat-streaming-tool-calls',
      }),

      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'showWeatherInformation') {
          // display tool. add tool result that informs the llm that the tool was executed.
          addToolResult({
            tool: 'showWeatherInformation',
            toolCallId: toolCall.toolCallId,
            output: 'Weather information was shown to the user.',
          });
        }

        if (toolCall.toolName === 'showKnowledgeOutline') {
          // display knowledge outline. add tool result that informs the llm that the outline was shown.
          addToolResult({
            tool: 'showKnowledgeOutline',
            toolCallId: toolCall.toolCallId,
            output: 'Knowledge outline was displayed to the user.',
          });
        }
      },
    });

  return (
    <div className='h-full flex flex-col overflow-hidden'>
      <div className='flex-1 flex flex-col min-h-[calc(100vh-4rem)]'>
        {/* 主要聊天区域 */}
        <div className='flex-1 overflow-hidden'>
          <div className='h-full max-w-5xl mx-auto px-6 py-4'>
            <Conversation className="h-full">
              <ConversationContent className="space-y-6 h-full overflow-y-auto pr-2">
                {messages.map(({ role, parts }, index) => (
                  <Message from={role} key={index}>
                    <MessageContent className="space-y-4">
                      {parts.map((part, i) => {
                        switch (part.type) {
                          case 'text':
                            return <Response key={`${role}-${i}`}>{part.text}</Response>;

                          case 'tool-showWeatherInformation':
                            const weatherEmoji = {
                              sunny: '☀️',
                              cloudy: '☁️',
                              rainy: '🌧️',
                              snowy: '🌨️',
                              windy: '💨'
                            };

                            const currentWeather = part.input?.weather;
                            const emoji = weatherEmoji[currentWeather as keyof typeof weatherEmoji] || '🌤️';

                            return (
                              <Tool key={`${role}-${i}`} defaultOpen>
                                <ToolHeader
                                  type="tool-showWeatherInformation"
                                  state="output-available"
                                />
                                <ToolContent>
                                  <Card>
                                    <CardHeader className="pb-4">
                                      <CardTitle className="flex items-center gap-3">
                                        <span className="text-2xl">{emoji}</span>
                                        <div>
                                          <div className="text-xl">{part.input?.city ?? ''}</div>
                                          <div className="text-sm text-muted-foreground font-normal">
                                            天气信息
                                          </div>
                                        </div>
                                      </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                      {/* 主要天气信息 */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {part.input?.weather && (
                                          <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">当前天气</div>
                                            <div className="flex items-center gap-2">
                                              <Badge variant="default" className="text-base px-3 py-1">
                                                {part.input.weather}
                                              </Badge>
                                            </div>
                                          </div>
                                        )}

                                        {part.input?.temperature !== undefined && (
                                          <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">当前温度</div>
                                            <div className="text-3xl font-bold">
                                              {part.input.temperature}°C
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* 典型天气描述 */}
                                      {part.input?.typicalWeather && (
                                        <Alert>
                                          <AlertDescription className="text-sm leading-relaxed">
                                            <strong className="text-foreground">春季典型天气:</strong>{' '}
                                            {part.input.typicalWeather}
                                          </AlertDescription>
                                        </Alert>
                                      )}
                                    </CardContent>
                                  </Card>
                                </ToolContent>
                              </Tool>
                            );

                          case 'tool-showKnowledgeOutline':
                            const outline = part.input;

                            // 递归渲染知识点的组件
                            const renderKnowledgePoint = (point: any, level = 0) => (
                              <Card key={point.id} className={`ml-${level * 6} mb-4 ${level > 0 ? 'border-l-4 border-l-muted' : ''} transition-all duration-200 hover:shadow-md`}>
                                <CardHeader className="pb-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <CardTitle className={level === 0 ? "text-xl" : "text-lg"}>
                                      {point.title}
                                    </CardTitle>
                                    {point.timeRange && (
                                      <Badge variant="secondary" className="shrink-0 text-xs">
                                        {point.timeRange}
                                      </Badge>
                                    )}
                                  </div>
                                  {point.description && (
                                    <CardDescription className="text-sm leading-relaxed mt-2">
                                      {point.description}
                                    </CardDescription>
                                  )}
                                </CardHeader>

                                <CardContent className="space-y-5">
                                  {/* 关键要点 */}
                                  {point.keyPoints && point.keyPoints.length > 0 && (
                                    <div className="space-y-3">
                                      <h5 className="text-sm font-semibold flex items-center gap-2 text-primary">
                                        🔑 关键要点
                                      </h5>
                                      <ul className="text-sm space-y-2 pl-1">
                                        {point.keyPoints.map((keyPoint: string, idx: number) => (
                                          <li key={idx} className="flex items-start gap-3 group">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0 group-hover:bg-primary/80 transition-colors" />
                                            <span className="text-muted-foreground leading-relaxed">{keyPoint}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* 重要人物 */}
                                  {point.importantFigures && point.importantFigures.length > 0 && (
                                    <div className="space-y-3">
                                      <h5 className="text-sm font-semibold flex items-center gap-2 text-violet-600 dark:text-violet-400">
                                        👥 重要人物
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {point.importantFigures.map((figure: string, idx: number) => (
                                          <Badge key={idx} variant="outline" className="hover:bg-muted/80 transition-colors">
                                            {figure}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 关键事件 */}
                                  {point.keyEvents && point.keyEvents.length > 0 && (
                                    <div className="space-y-3">
                                      <h5 className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        📅 关键事件
                                      </h5>
                                      <ul className="text-sm space-y-2 pl-1">
                                        {point.keyEvents.map((event: string, idx: number) => (
                                          <li key={idx} className="flex items-start gap-3 group">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 group-hover:bg-emerald-400 transition-colors" />
                                            <span className="text-muted-foreground leading-relaxed">{event}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* 重要概念 */}
                                  {point.concepts && point.concepts.length > 0 && (
                                    <div className="space-y-3">
                                      <h5 className="text-sm font-semibold flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                        💡 重要概念
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {point.concepts.map((concept: string, idx: number) => (
                                          <Badge key={idx} variant="secondary" className="hover:bg-secondary/80 transition-colors">
                                            {concept}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>

                                {point.subPoints && point.subPoints.length > 0 && (
                                  <div className="px-6 pb-6 space-y-3">
                                    <div className="border-t pt-4">
                                      {point.subPoints.map((subPoint: any) => renderKnowledgePoint(subPoint, level + 1))}
                                    </div>
                                  </div>
                                )}
                              </Card>
                            );

                            return (
                              <Tool key={`${role}-${i}`} defaultOpen>
                                <ToolHeader
                                  type="tool-showKnowledgeOutline"
                                  state="output-available"
                                />
                                <ToolContent>
                                  <div className="space-y-8">
                                    {/* 主题头部 */}
                                    <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-2">
                                      <CardHeader className="pb-6">
                                        <CardTitle className="text-2xl flex items-center gap-3">
                                          📖 {outline?.topic || '知识大纲'}
                                        </CardTitle>
                                        {outline?.description && (
                                          <CardDescription className="text-base leading-relaxed mt-3">
                                            {outline.description}
                                          </CardDescription>
                                        )}
                                      </CardHeader>

                                      <CardContent>
                                        {/* 元信息 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="space-y-3">
                                            <div className="text-sm font-medium text-muted-foreground">学科分类</div>
                                            <Badge variant="default" className="text-sm px-3 py-1.5">
                                              {outline?.category || '通用'}
                                            </Badge>
                                          </div>
                                          <div className="space-y-3">
                                            <div className="text-sm font-medium text-muted-foreground">知识点数量</div>
                                            <Badge variant="secondary" className="text-sm px-3 py-1.5">
                                              {outline?.structure?.length || 0} 个主要知识点
                                            </Badge>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* 知识点列表 */}
                                    <div className="space-y-6">
                                      <h4 className="text-xl font-bold flex items-center gap-3 pb-2 border-b border-border">
                                        📚 知识点结构
                                      </h4>
                                      <div className="space-y-6">
                                        {outline?.structure?.map((point: any) => renderKnowledgePoint(point))}
                                      </div>
                                    </div>
                                  </div>
                                </ToolContent>
                              </Tool>
                            );

                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                ))}
              </ConversationContent>
            </Conversation>
          </div>
        </div>

        {/* 固定在底部的输入区域 */}
        <div className='border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <div className='max-w-5xl mx-auto px-6 py-4'>
            <PromptInput
              onSubmit={(message, event) => {
                if (message.text?.trim()) {
                  sendMessage({ text: message.text });
                  // 重置表单以清空输入框
                  event.currentTarget.reset();
                }
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  placeholder="询问天气信息或知识大纲... 例如：'中国近代史大纲' 或 '北京的天气如何？'"
                />
              </PromptInputBody>
              <PromptInputToolbar>
                <PromptInputSubmit status={status} />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}
