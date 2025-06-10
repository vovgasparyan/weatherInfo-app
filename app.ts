import { Telegraf } from "telegraf";
import dotenv from 'dotenv';
import { getWeatherForecast } from "./src/weather";
import { logger } from "./src/logger";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  logger.info(`User ${ctx.from?.username} started the bot`);
  ctx.reply('Hello! Enter the name of a city to get the weather forecast.');
});

bot.hears(/.*/, async (ctx) => {
  const city = ctx.message.text.trim();
  logger.info(`Weather request received for the city: ${city} from user ${ctx.from?.username}`);
  const forecast = await getWeatherForecast(city);
  await ctx.reply(forecast, { parse_mode: 'Markdown' });
});

bot.launch().then(() => logger.info('Bot started'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
