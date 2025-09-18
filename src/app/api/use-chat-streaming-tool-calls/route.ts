import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIDataTypes, UIMessage } from 'ai';
import { z } from 'zod/v4';

// 知识大纲的数据结构
const KnowledgePointSchema: z.ZodType<any> = z.lazy(() => z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  keyPoints: z.array(z.string()).optional(), // 关键要点
  timeRange: z.string().optional(), // 时间范围（适用于历史等）
  importantFigures: z.array(z.string()).optional(), // 重要人物
  keyEvents: z.array(z.string()).optional(), // 关键事件
  concepts: z.array(z.string()).optional(), // 重要概念
  subPoints: z.array(KnowledgePointSchema).optional(), // 子知识点
}));

const KnowledgeOutlineSchema = z.object({
  topic: z.string(),
  description: z.string(),
  category: z.string(), // 学科分类，如"历史"、"科学"、"技术"等
  structure: z.array(KnowledgePointSchema),
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export type StreamingToolCallsMessage = UIMessage<
  never,
  UIDataTypes,
  {
    showWeatherInformation: {
      input: {
        city: string;
        weather: string;
        temperature: number;
        typicalWeather: string;
      };
      output: string;
    };
    showKnowledgeOutline: {
      input: {
        topic: string;
        description: string;
        category: string;
        structure: Array<{
          id: string;
          title: string;
          description?: string;
          keyPoints?: string[];
          timeRange?: string;
          importantFigures?: string[];
          keyEvents?: string[];
          concepts?: string[];
          subPoints?: Array<any>;
        }>;
      };
      output: string;
    };
  }
>;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: 'azure/gpt-4o',
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can help with weather information and knowledge outlines.' +
      'When users ask about weather, use the showWeatherInformation tool.' +
      'When users ask about a knowledge topic or need an outline of knowledge points, use the showKnowledgeOutline tool to create a structured knowledge outline with key points, events, figures, and concepts.' +
      'Always use the appropriate tool to display information to the user instead of just talking about it.',
    tools: {
      // server-side tool with execute function:
      getWeatherInformation: {
        description: 'show the weather in a given city to the user',
        inputSchema: z.object({ city: z.string() }),
        execute: async ({ }: { city: string }) => {
          const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
          return {
            weather:
              weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
            temperature: Math.floor(Math.random() * 50 - 10),
          };
        },
      },
      // client-side tool that displays whether information to the user:
      showWeatherInformation: {
        description:
          'Show the weather information to the user. Always use this tool to tell weather information to the user.',
        inputSchema: z.object({
          city: z.string(),
          weather: z.string(),
          temperature: z.number(),
          typicalWeather: z
            .string()
            .describe(
              '2-3 sentences about the typical weather in the city during spring.',
            ),
        }),
      },
      // server-side tool for generating knowledge outlines:
      generateKnowledgeOutline: {
        description: 'Generate a structured knowledge outline for a given topic',
        inputSchema: z.object({
          topic: z.string().describe('The knowledge topic to create an outline for'),
          category: z.string().optional().describe('The category of knowledge (e.g., history, science, literature)'),
        }),
        execute: async ({ topic, category = 'general' }) => {
          // This would typically call an AI service to generate the outline
          // For now, we'll create a knowledge-focused structure
          const outlineId = Date.now().toString();

          // Example for Chinese Modern History
          if (topic.includes('中国近代史') || topic.includes('近代史')) {
            return {
              topic,
              description: `${topic}知识点大纲`,
              category: '历史',
              structure: [
                {
                  id: `${outlineId}-1`,
                  title: '洋务运动',
                  description: '19世纪60-90年代的自强求富运动',
                  timeRange: '1860年代-1890年代',
                  keyPoints: [
                    '师夷长技以制夷',
                    '中体西用',
                    '兴办军事工业',
                    '兴办民用工业'
                  ],
                  importantFigures: ['李鸿章', '张之洞', '左宗棠', '曾国藩'],
                  keyEvents: ['江南制造总局成立', '汉阳铁厂建立', '京师同文馆设立'],
                  concepts: ['洋务派', '顽固派', '自强', '求富']
                },
                {
                  id: `${outlineId}-2`,
                  title: '戊戌变法',
                  description: '1898年的政治改革运动',
                  timeRange: '1898年',
                  keyPoints: [
                    '百日维新',
                    '政治体制改革',
                    '教育改革',
                    '政变失败'
                  ],
                  importantFigures: ['康有为', '梁启超', '谭嗣同', '光绪皇帝', '慈禧太后'],
                  keyEvents: ['公车上书', '戊戌政变', '戊戌六君子'],
                  concepts: ['维新派', '保守派', '君主立宪制']
                },
                {
                  id: `${outlineId}-3`,
                  title: '辛亥革命',
                  description: '推翻清朝统治的资产阶级民主革命',
                  timeRange: '1911年',
                  keyPoints: [
                    '武昌起义',
                    '各省响应',
                    '中华民国成立',
                    '清帝退位'
                  ],
                  importantFigures: ['孙中山', '黄兴', '宋教仁', '袁世凯'],
                  keyEvents: ['武昌起义', '中华民国临时政府成立', '《临时约法》颁布'],
                  concepts: ['三民主义', '资产阶级革命', '共和制', '临时约法']
                }
              ]
            };
          }

          // Generic structure for other topics
          return {
            topic,
            description: `${topic}知识点大纲`,
            category,
            structure: [
              {
                id: `${outlineId}-1`,
                title: `${topic}概述`,
                description: `${topic}的基本概念和定义`,
                keyPoints: [`${topic}的定义`, `${topic}的特点`, `${topic}的分类`],
              },
              {
                id: `${outlineId}-2`,
                title: `${topic}的发展历程`,
                description: `${topic}的历史发展和演变过程`,
                keyPoints: [`起源`, `发展阶段`, `现状`],
              },
              {
                id: `${outlineId}-3`,
                title: `${topic}的应用`,
                description: `${topic}在实际中的应用和意义`,
                keyPoints: [`实际应用`, `影响意义`, `未来发展`],
              }
            ]
          };
        },
      },
      // client-side tool that displays knowledge outline to the user:
      showKnowledgeOutline: {
        description:
          'Show a structured knowledge outline to the user. Always use this tool to display knowledge points, key concepts, and topic structures.',
        inputSchema: KnowledgeOutlineSchema,
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
