'use client';

import { useChat } from '@ai-sdk/react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';
import { Loader } from '@/components/ai-elements/loader';
import { QuizDisplay } from '@/components/quiz/QuizDisplay';
import { QuizResultDisplay } from '@/components/quiz/QuizResultDisplay';
import { MessageSquare, BookOpen, Brain, Zap } from 'lucide-react';
import { useState } from 'react';

export default function QuizChatPage() {
  const [input, setInput] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  const { messages, sendMessage, status } = useChat({
    api: '/api/quiz-chat',
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    if (!hasText || status === 'in_progress') return;

    sendMessage({ text: message.text || '' });
    setInput('');
  };

  const handleAnswer = (questionId: string, selectedOption: number, optionText: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));

    // 自动发送答案到聊天
    const question = currentQuiz.questions.find((q: any) => q.id === questionId);
    const answerMessage = `第${currentQuestionIndex + 1}题我选择：${optionText}`;
    sendMessage({ text: answerMessage });

    // 如果不是最后一题，自动跳到下一题
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1000);
    } else {
      // 所有题目回答完毕，提交评分
      setTimeout(() => {
        submitQuizForEvaluation();
      }, 1000);
    }
  };

  const submitQuizForEvaluation = () => {
    const answerDetails = currentQuiz.questions.map((question: any) => {
      const userSelectedIndex = userAnswers[question.id];
      const userSelectedText = question.options[userSelectedIndex];
      const correctAnswerText = question.options[question.correctAnswer];
      const isCorrect = userSelectedIndex === question.correctAnswer;

      return {
        questionText: question.question,
        userAnswer: userSelectedText,
        correctAnswer: correctAnswerText,
        isCorrect
      };
    });

    const evaluationMessage = `请评估我的答题结果。测试标题：${currentQuiz.title}，我的答案如下：${answerDetails.map((a: any, i: number) =>
      `第${i+1}题：${a.questionText} - 我的答案：${a.userAnswer}，正确答案：${a.correctAnswer}，${a.isCorrect ? '正确' : '错误'}`
    ).join('；')}`;

    sendMessage({ text: evaluationMessage });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🧠 AI 知识问答助手 (Chat)
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            通过聊天的方式生成个性化测试、答题和获得智能反馈
          </p>

          {/* Technical Stack Badges */}
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              💬 Chat Interface
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              🔧 Tool Calling
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              🌊 Stream Response
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              🤖 AI Elements
            </span>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border shadow-lg h-[600px] flex flex-col">
            <Conversation className="flex-1 p-4">
              <ConversationContent>
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    icon={<Brain className="size-12 text-blue-500" />}
                    title="开始知识问答之旅"
                    description="告诉我您想要测试的知识领域，我会为您生成个性化的测试题目"
                  />
                ) : (
                  messages.map((message) => (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case 'text':
                              return (
                                <Response key={`${message.id}-${i}`}>
                                  {part.text}
                                </Response>
                              );
                            case 'tool-call':
                              return (
                                <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                                  <ToolHeader
                                    type={part.toolName as any}
                                    state="input-available"
                                  />
                                  <ToolContent>
                                    <ToolInput input={part.args} />
                                  </ToolContent>
                                </Tool>
                              );
                            case 'tool-generateQuiz':
                              // 处理quiz生成工具的结果
                              switch (part.state) {
                                case 'input-streaming':
                                case 'input-available':
                                  return (
                                    <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                                      <ToolHeader
                                        type="generateQuiz"
                                        state="input-available"
                                      />
                                      <ToolContent>
                                        <ToolInput input={part.input} />
                                      </ToolContent>
                                    </Tool>
                                  );
                                case 'output-available':
                                  // 检查是否是quiz生成结果
                                  if (part.output && typeof part.output === 'object' && part.output.type === 'quiz_generated') {
                                    if (part.output.success && part.output.quiz) {
                                      // 设置当前quiz并显示专用组件
                                      if (!currentQuiz || currentQuiz.title !== part.output.quiz.title) {
                                        setCurrentQuiz(part.output.quiz);
                                        setCurrentQuestionIndex(0);
                                        setUserAnswers({});
                                        setQuizResult(null);
                                      }
                                      return (
                                        <div key={`${message.id}-${i}`} className="my-4">
                                          <QuizDisplay
                                            quiz={part.output.quiz}
                                            onAnswer={handleAnswer}
                                            currentQuestionIndex={currentQuestionIndex}
                                            userAnswers={userAnswers}
                                          />
                                        </div>
                                      );
                                    }
                                  }
                                  // 默认显示
                                  return (
                                    <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                                      <ToolHeader
                                        type="generateQuiz"
                                        state="output-available"
                                      />
                                      <ToolContent>
                                        <ToolOutput
                                          output={
                                            <Response>
                                              {typeof part.output === 'string'
                                                ? part.output
                                                : JSON.stringify(part.output, null, 2)
                                              }
                                            </Response>
                                          }
                                        />
                                      </ToolContent>
                                    </Tool>
                                  );
                                case 'output-error':
                                  return (
                                    <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                                      <ToolHeader
                                        type="generateQuiz"
                                        state="output-error"
                                      />
                                      <ToolContent>
                                        <div>Error: {part.errorText}</div>
                                      </ToolContent>
                                    </Tool>
                                  );
                              }
                              break;

                            case 'tool-evaluateAnswers':
                              // 处理答案评估工具的结果
                              switch (part.state) {
                                case 'input-streaming':
                                case 'input-available':
                                  return (
                                    <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                                      <ToolHeader
                                        type="evaluateAnswers"
                                        state="input-available"
                                      />
                                      <ToolContent>
                                        <ToolInput input={part.input} />
                                      </ToolContent>
                                    </Tool>
                                  );
                                case 'output-available':
                                  // 检查是否是评分结果
                                  if (part.output && typeof part.output === 'object' && part.output.type === 'quiz_evaluated') {
                                    if (part.output.success && part.output.result) {
                                      if (!quizResult) {
                                        setQuizResult(part.output.result);
                                      }
                                      return (
                                        <div key={`${message.id}-${i}`} className="my-4">
                                          <QuizResultDisplay result={part.output.result} />
                                        </div>
                                      );
                                    }
                                  }
                                  // 默认显示
                                  return (
                                    <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                                      <ToolHeader
                                        type="evaluateAnswers"
                                        state="output-available"
                                      />
                                      <ToolContent>
                                        <ToolOutput
                                          output={
                                            <Response>
                                              {typeof part.output === 'string'
                                                ? part.output
                                                : JSON.stringify(part.output, null, 2)
                                              }
                                            </Response>
                                          }
                                        />
                                      </ToolContent>
                                    </Tool>
                                  );
                                case 'output-error':
                                  return (
                                    <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                                      <ToolHeader
                                        type="evaluateAnswers"
                                        state="output-error"
                                      />
                                      <ToolContent>
                                        <div>Error: {part.errorText}</div>
                                      </ToolContent>
                                    </Tool>
                                  );
                              }
                              break;
                            default:
                              return null;
                          }
                        })}
                      </MessageContent>
                    </Message>
                  ))
                )}
                {status === 'in_progress' && (
                  <Message from="assistant">
                    <MessageContent>
                      <Loader />
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            {/* Input Area */}
            <div className="border-t p-4 bg-gray-50">
              {messages.length === 0 && (
                <div className="mb-4">
                  <Suggestions>
                    <Suggestion
                      onClick={() => {
                        const suggestion = '我想测试 JavaScript 基础知识，生成 5 道中等难度的题目';
                        setInput(suggestion);
                        sendMessage({ text: suggestion });
                      }}
                      suggestion="JavaScript 基础测试"
                    />
                    <Suggestion
                      onClick={() => {
                        const suggestion = '帮我生成 3 道关于 React Hooks 的简单题目';
                        setInput(suggestion);
                        sendMessage({ text: suggestion });
                      }}
                      suggestion="React Hooks 测试"
                    />
                    <Suggestion
                      onClick={() => {
                        const suggestion = '我想要一个关于中国历史的困难测试，6 道题';
                        setInput(suggestion);
                        sendMessage({ text: suggestion });
                      }}
                      suggestion="中国历史测试"
                    />
                    <Suggestion
                      onClick={() => {
                        const suggestion = '生成数学概率相关的题目，4 道中等难度';
                        setInput(suggestion);
                        sendMessage({ text: suggestion });
                      }}
                      suggestion="数学概率测试"
                    />
                  </Suggestions>
                </div>
              )}

              <PromptInput onSubmit={handleSubmit} className="flex-1">
                <PromptInputTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="描述您想要的测试内容，比如：'我想测试 JavaScript 基础知识，生成 5 道中等难度的题目'"
                  className="resize-none"
                  rows={2}
                />
                <PromptInputSubmit
                  disabled={!input.trim() || status === 'in_progress'}
                  status={status === 'in_progress' ? 'streaming' : 'ready'}
                />
              </PromptInput>
            </div>
          </div>

          {/* Flow Explanation */}
          <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">🔄 聊天式交互流程</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="size-6 text-blue-600" />
                </div>
                <h3 className="font-medium">1. 描述需求</h3>
                <p className="text-sm text-muted-foreground">
                  用自然语言描述测试主题和要求
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="size-6 text-green-600" />
                </div>
                <h3 className="font-medium">2. AI 生成题目</h3>
                <p className="text-sm text-muted-foreground">
                  AI 调用工具生成结构化测试
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="size-6 text-purple-600" />
                </div>
                <h3 className="font-medium">3. 交互答题</h3>
                <p className="text-sm text-muted-foreground">
                  通过聊天方式回答问题
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="size-6 text-orange-600" />
                </div>
                <h3 className="font-medium">4. 智能反馈</h3>
                <p className="text-sm text-muted-foreground">
                  获得详细的评分和建议
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}