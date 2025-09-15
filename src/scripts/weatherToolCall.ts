import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { z } from 'zod';

const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
const prompt = `当前时间是 ${currentTime}，请查询新加坡未来 1 小时的天气`;

const weatherTool = tool({
    description: '查询指定城市未来3个小时的天气情况',
    inputSchema: z.object({
        city: z.string().describe('要查询天气的城市名称'),
        hours: z.number().describe('未来多少小时的天气').default(1),
    }),
    execute: async ({ city, hours }) => {
        try {
            console.log(`🌤️ 正在查询 ${city} 未来 ${hours} 小时的天气...`);

            // 1. 使用Open-Meteo地理编码API获取城市坐标
            const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`;

            const geocodingResponse = await fetch(geocodingUrl);
            const geocodingData = await geocodingResponse.json();

            if (!geocodingResponse.ok || !geocodingData.results || geocodingData.results.length === 0) {
                throw new Error(`找不到城市 "${city}" 的地理信息`);
            }

            const location = geocodingData.results[0];
            const { latitude, longitude, timezone } = location;

            console.log(`📍 找到城市: ${location.name}, 坐标: ${latitude}, ${longitude}`);

            // 2. 使用坐标获取天气数据
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=${timezone || 'auto'}&forecast_days=1`;

            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();

            if (!weatherResponse.ok) {
                throw new Error(`天气API请求失败: ${weatherResponse.status}`);
            }

            // 获取未来指定小时的天气数据
            const hourlyData = weatherData.hourly;
            const currentHour = new Date().getHours();
            const targetHourIndex = Math.min(currentHour + hours, hourlyData.time.length - 1);

            const weather = {
                city,
                hours,
                temperature: Math.round(hourlyData.temperature_2m[targetHourIndex]),
                humidity: hourlyData.relative_humidity_2m[targetHourIndex],
                windSpeed: Math.round(hourlyData.wind_speed_10m[targetHourIndex]),
                weatherCode: hourlyData.weather_code[targetHourIndex],
                timestamp: hourlyData.time[targetHourIndex],
            };

            // 天气代码转换为中文描述
            const weatherConditions: Record<number, string> = {
                0: '晴朗',
                1: '大部分晴朗',
                2: '部分多云',
                3: '阴天',
                45: '雾',
                48: '霜雾',
                51: '小毛毛雨',
                53: '中毛毛雨',
                55: '大毛毛雨',
                61: '小雨',
                63: '中雨',
                65: '大雨',
                80: '小阵雨',
                81: '中阵雨',
                82: '大阵雨',
            };

            const condition = weatherConditions[weather.weatherCode] || '未知天气';

            const targetTime = new Date(weather.timestamp).toLocaleString('zh-CN');

            return {
                success: true,
                data: { ...weather, condition },
                message: `${city}在${targetTime}的天气: ${condition}, 温度${weather.temperature}°C, 湿度${weather.humidity}%, 风速${weather.windSpeed}km/h`
            };

        } catch (error) {
            console.error('天气查询失败:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '未知错误',
                message: `抱歉，无法获取${city}的天气信息，请稍后重试`
            };
        }
    },
});

const { text, toolCalls, toolResults } = await generateText({
    model: openai('gpt-4o'),
    tools: {
        weather: weatherTool,
    },
    toolChoice: 'required',
    prompt,
});

console.log('🤖 AI 响应:', text);
console.log('\n📞 工具调用:', JSON.stringify(toolCalls, null, 2));
console.log('\n📊 工具结果:', JSON.stringify(toolResults, null, 2));