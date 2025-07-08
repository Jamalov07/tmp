import { registerAs } from '@nestjs/config'
import { BotConfigOptions } from '@common'

export const botConfig = registerAs('bot', (): BotConfigOptions => {
	return {
		token: process.env.BOT_TOKEN ?? undefined,
	}
})
