'use client'
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response'
import { useChat } from '@ai-sdk/react';

export default function ChatWithFile() {
    const { messages } = useChat()
    return <div className='max-w-4xl mx-auto p-6 relative size-full h-screen'>
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
}