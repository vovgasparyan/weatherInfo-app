import axios from 'axios';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'http://api.weatherapi.com/v1/forecast.json';

export function escapeMarkdown(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

function getWeather(condition: string): string {
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

const texts: Record<string, any> = {
    en: {
        invalidCity: '🚫 Invalid city name. Please enter only letters and spaces.',
        notFound: '🚫 City not found. Please make sure the name is entered correctly.',
        forecast: (city: string, days: number) => `📍 *${city}* — ${days}-day forecast:\n\n`,
        avg: 'Average',
        high: '🔺',
        low: '🔻',
    },
    ru: {
        invalidCity: '🚫 Недопустимое название города. Введите только буквы и пробелы.',
        notFound: '🚫 Город не найден. Проверьте правильность названия.',
        forecast: (city: string, days: number) => `📍 *${city}* — прогноз на ${days} дня:\n\n`,
        avg: 'Средняя',
        high: '🔺',
        low: '🔻',
    },
    uk: {
        invalidCity: '🚫 Недопустима назва міста. Вводьте лише літери та пробіли.',
        notFound: '🚫 Місто не знайдено. Перевірте правильність назви.',
        forecast: (city: string, days: number) => `📍 *${city}* — прогноз на ${days} дні:\n\n`,
        avg: 'Середня',
        high: '🔺',
        low: '🔻',
    },
    es: {
        invalidCity: '🚫 Nombre de ciudad no válido. Solo letras y espacios.',
        notFound: '🚫 Ciudad no encontrada. Verifica el nombre.',
        forecast: (city: string, days: number) => `📍 *${city}* — previsión de ${days} días:\n\n`,
        avg: 'Promedio',
        high: '🔺',
        low: '🔻',
    },
    de: {
        invalidCity: '🚫 Ungültiger Stadtname. Bitte nur Buchstaben und Leerzeichen.',
        notFound: '🚫 Stadt nicht gefunden. Bitte überprüfe den Namen.',
        forecast: (city: string, days: number) => `📍 *${city}* — ${days}-Tage Vorhersage:\n\n`,
        avg: 'Durchschnitt',
        high: '🔺',
        low: '🔻',
    },
    it: {
        invalidCity: '🚫 Nome città non valido. Inserisci solo lettere e spazi.',
        notFound: '🚫 Città non trovata. Controlla il nome.',
        forecast: (city: string, days: number) => `📍 *${city}* — previsioni per ${days} giorni:\n\n`,
        avg: 'Media',
        high: '🔺',
        low: '🔻',
    },
    fr: {
        invalidCity: '🚫 Nom de ville invalide. Utilisez uniquement des lettres et des espaces.',
        notFound: '🚫 Ville introuvable. Vérifiez le nom.',
        forecast: (city: string, days: number) => `📍 *${city}* — prévisions pour ${days} jours:\n\n`,
        avg: 'Moyenne',
        high: '🔺',
        low: '🔻',
    },
    pt: {
        invalidCity: '🚫 Nome de cidade inválido. Apenas letras e espaços.',
        notFound: '🚫 Cidade não encontrada. Verifique o nome.',
        forecast: (city: string, days: number) => `📍 *${city}* — previsão para ${days} dias:\n\n`,
        avg: 'Média',
        high: '🔺',
        low: '🔻',
    },
};

export async function getWeatherForecast(city: string, lang: string = 'en'): Promise<string> {
    const validCityRegex = /^[\p{L}\s\-']+$/u;

    const t = texts[lang] || texts['en'];

    if (!validCityRegex.test(city)) {
        logger.error(`Invalid characters in city name: ${city}`);
        return t.invalidCity;
    }

    try {
        const response = await axios.get(BASE_URL, {
            params: {
                key: API_KEY,
                q: city,
                days: 4,
                lang: 'en',
                aqi: 'no',
                alerts: 'no'
            }
        });

        const data = response.data;
        const location = data.location.name;
        const forecastDays = data.forecast.forecastday;
        let result = t.forecast(location, forecastDays.length);

        for (const day of forecastDays) {
            const date = escapeMarkdown(new Date(day.date).toLocaleDateString(
                lang === 'ru' || lang === 'uk' ? 'ru-RU' : 'en-US',
                { weekday: 'long', day: 'numeric', month: 'long' }
            ));

            const conditionText = escapeMarkdown(day.day.condition.text);
            const icon = getWeather(conditionText);
            const avgTemp = day.day.avgtemp_c;
            const maxTemp = day.day.maxtemp_c;
            const minTemp = day.day.mintemp_c;

            result += `📅 *${date}*\n${icon} ${conditionText}\n🌡️ ${t.avg}: ${avgTemp}°C (${t.high} ${maxTemp}° / ${t.low} ${minTemp}°)\n\n`;
        }

        return result.trim();
    } catch (error: any) {
        const errMsg = error.response?.data?.error?.message || error.message;
        logger.error(`Error from WeatherAPI: ${errMsg}`);
        return t.notFound;
    }
}