import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { getWeatherForecast } from './src/weather';
import { logger } from './src/logger';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

const messages: Record<string, { start: string }> = {
  en: { start: 'Hello! Enter the name of a city to get the weather forecast.' },
  ru: { start: 'Здравствуйте! Введите название города для прогноза погоды.' },
  uk: { start: 'Привіт! Введіть назву міста, щоб отримати прогноз погоди.' },
  es: { start: '¡Hola! Ingresa el nombre de una ciudad para obtener el pronóstico del tiempo.' },
  de: { start: 'Hallo! Gib den Namen einer Stadt ein, um die Wettervorhersage zu erhalten.' },
  it: { start: 'Ciao! Inserisci il nome di una città per ottenere le previsioni meteo.' },
  fr: { start: 'Bonjour ! Entrez le nom d\'une ville pour obtenir la météo.' },
  pt: { start: 'Olá! Digite o nome de uma cidade para ver a previsão do tempo.' },
};

function getLang(code?: string) {
  const lang = code?.toLowerCase();
  return ['en', 'ru', 'uk', 'es', 'de', 'it', 'fr', 'pt'].includes(lang || '') ? lang! : 'en';
}

bot.start((ctx) => {
  const lang = getLang(ctx.from?.language_code);
  logger.info(`User ${ctx.from?.username} started the bot`);
  ctx.reply(messages[lang].start);
});

bot.hears(/.*/, async (ctx) => {
  const city = ctx.message.text.trim();
  const lang = getLang(ctx.from?.language_code);
  logger.info(`Request received for the ${city} from ${ctx.from?.username}, name and surname - ${ctx.from?.first_name} ${ctx.from?.last_name}, id: ${ctx.from?.id}`);
  const forecast = await getWeatherForecast(city, lang);
  await ctx.reply(forecast, { parse_mode: 'Markdown' });
});

bot.launch().then(() => logger.info('Bot started'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
