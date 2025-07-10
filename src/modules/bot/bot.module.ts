import { Module } from '@nestjs/common'
import { bot, MyBotName } from './constants'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigService } from '@nestjs/config'
import { BotService } from './bot.service'
import { BotUpdate } from './bot.update'
import { PdfModule, PrismaModule } from '../shared'

@Module({
	imports: [
		PrismaModule,
		PdfModule,
		// TelegrafModule.forRootAsync({
		// 	botName: MyBotName,
		// 	inject: [ConfigService],
		// 	useFactory: (configService: ConfigService) => ({
		// 		token: configService.getOrThrow<string>('bot.token'),
		// 		middlewares: [],
		// 		include: [],
		// 	}),
		// }),
	],
	providers: [BotUpdate, BotService, { provide: 'TELEGRAM_BOT', useValue: bot }],
	exports: [BotService],
})
export class BotModule {}
