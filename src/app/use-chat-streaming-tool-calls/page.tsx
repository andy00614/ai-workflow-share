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
      },
    });

  return (
    <div className='max-w-4xl mx-auto p-6 relative size-full h-screen'>
      <div className='flex flex-col h-[calc(100vh-10rem)]'>
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map(({ role, parts }, index) => (
              <Message from={role} key={index}>
                <MessageContent>
                  {parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return <Response key={`${role}-${i}`}>{part.text}</Response>;

                      case 'tool-showWeatherInformation':
                        return (
                          <Tool key={`${role}-${i}`} defaultOpen>
                            <ToolHeader
                              type="tool-showWeatherInformation"
                              state="output-available"
                            />
                            <ToolContent>
                              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                                  🌤️ {part.input?.city ?? ''} 天气信息
                                </h4>
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center gap-4">
                                    {part.input?.weather && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-blue-700 dark:text-blue-300">天气:</span>
                                        <span className="font-medium text-blue-900 dark:text-blue-100">
                                          {part.input.weather}
                                        </span>
                                      </div>
                                    )}
                                    {part.input?.temperature !== undefined && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-blue-700 dark:text-blue-300">温度:</span>
                                        <span className="font-medium text-blue-900 dark:text-blue-100">
                                          {part.input.temperature}°C
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {part.input?.typicalWeather && (
                                    <div className="text-sm text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900 p-3 rounded">
                                      <strong>典型天气:</strong> {part.input.typicalWeather}
                                    </div>
                                  )}
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

      <PromptInput
        onSubmit={(message, event) => {
          if (message.text?.trim()) {
            sendMessage({ text: message.text });
            // 重置表单以清空输入框
            event.currentTarget.reset();
          }
        }}
        className="mt-4"
      >
        <PromptInputBody>
          <PromptInputTextarea
            placeholder="询问任何城市的天气信息..."
          />
        </PromptInputBody>
        <PromptInputToolbar>
          <PromptInputSubmit status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}
