import axios from "axios";
import dotenv from 'dotenv';
import { logger } from "./logger";

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'http://api.weatherapi.com/v1/forecast.json';

// Экранируем спецсимволы для MarkdownV2
export function escapeMarkdown(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

function getWeatherEmoji(condition: string): string {
    const text = condition.toLowerCase();
    if (text.includes('sun') || text.includes('солнечно')) return '☀️';
    if (text.includes('partly') || text.includes('переменная')) return '⛅';
    if (text.includes('cloud') || text.includes('облачно')) return '☁️';
    if (text.includes('rain') || text.includes('дожд')) return '🌧️';
    if (text.includes('snow') || text.includes('снег')) return '❄️';
    if (text.includes('thunder')) return '⛈️';
    if (text.includes('fog') || text.includes('туман')) return '🌫️';
    return '🌡️';
}

export async function getWeatherForecast(city: string): Promise<string> {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                key: API_KEY,
                q: city,
                days: 4,
                lang: 'ru',
                aqi: 'no',
                alerts: 'no'
            }
        });

        const data = response.data;
        const location = data.location.name;
        const forecastDays = data.forecast.forecastday;

        let result = `📍 *${location}* — прогноз на 4 дня:\n\n`;

        for (const day of forecastDays) {
            const date = escapeMarkdown(new Date(day.date).toLocaleDateString('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            }));

            const conditionText = escapeMarkdown(day.day.condition.text);
            const icon = getWeatherEmoji(conditionText);
            const avgTemp = day.day.avgtemp_c;
            const maxTemp = day.day.maxtemp_c;
            const minTemp = day.day.mintemp_c;

            result += `📅 *${date}*\n${icon} ${escapeMarkdown(conditionText)}\n🌡️ Средняя: ${avgTemp}°C (🔺 ${maxTemp}° / 🔻 ${minTemp}°)\n\n`;
        }

        return result.trim();
    } catch (error: any) {
        const errMsg = error.response?.data?.error?.message || error.message;
        logger.error(`WeatherAPI error: ${errMsg}`);
        return `🚫 Город не найден. Убедитесь, что название введено корректно.`;
    }
}