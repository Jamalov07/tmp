import { Module } from '@nestjs/common'
import { MyBotName } from './constants'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigService } from '@nestjs/config'
import { BotService } from './bot.service'
import { BotUpdate } from './bot.update'
import { PrismaModule } from '../shared'

@Module({
	imports: [
		PrismaModule,
		TelegrafModule.forRootAsync({
			botName: MyBotName,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				token: configService.getOrThrow<string>('bot.token'),
				middlewares: [],
				include: [],
			}),
		}),
	],
	providers: [BotUpdate, BotService],
	exports: [],
})
export class BotModule {}
