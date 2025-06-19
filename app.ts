import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { getWeatherForecast } from './src/weather';
import { logger } from './src/logger';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  logger.info(`User ${ctx.from?.username} started the bot`);
  ctx.reply('Hello! Enter the name of a city to get the weather forecast.');
});

bot.hears(/.*/, async (ctx) => {
  const city = ctx.message.text.trim();
  logger.info(`Request received for the ${city} from ${ctx.from?.username}, name and surname - ${ctx.from?.first_name} ${ctx.from?.last_name}, id: ${ctx.from?.id}`);
  const forecast = await getWeatherForecast(city);
  await ctx.reply(forecast, { parse_mode: 'Markdown' });
});

bot.launch().then(() => logger.info('Bot started'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
