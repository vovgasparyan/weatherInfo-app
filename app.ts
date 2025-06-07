import { Telegraf } from "telegraf";
import dotenv from 'dotenv';
import { getWeatherForecast } from "./src/weather";
import { logger } from "./src/logger";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
    logger.info(`Пользователь ${ctx.from?.username} запустил бота`);
    ctx.reply('Привет! Введи название города, чтобы узнать прогноз погоды.');
});

bot.hears(/.*/, async (ctx) => {
  const city = ctx.message.text.trim();
  logger.info(`Получен запрос погоды для города: ${city}`);
  const forecast = await getWeatherForecast(city);
  await ctx.reply(forecast, { parse_mode: 'HTML' });
});

bot.launch().then(() => logger.info('Бот запущен'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
