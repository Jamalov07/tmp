export const MyBotName = 'botname'
import 'dotenv/config'

import { Context, Telegraf } from 'telegraf'
export const bot: Telegraf<Context> = new Telegraf<Context>(process.env.BOT_TOKEN)
