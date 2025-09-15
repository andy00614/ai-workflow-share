'use client'

import { Message, MessageContent } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response';
import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/components/ai-elements/prompt-input';
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';

export default function Page() {
  const { messages, sendMessage, status } = useChat()
  const [input, setInput] = useState('')

  console.log(messages)

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
                      case 'reasoning':
                        return <Reasoning isStreaming={parts[parts.length - 1]?.type === 'reasoning' && status === 'streaming'} key={`${role}-${i}`}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {part.text}
                          </ReasoningContent>
                        </Reasoning>;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>
      </div>
      <PromptInput onSubmit={(message) => {
        sendMessage({ text: input })
        setInput('')
      }} className="mt-4">
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
        </PromptInputBody>
        <PromptInputToolbar>
          <PromptInputSubmit disabled={!input} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  )
}