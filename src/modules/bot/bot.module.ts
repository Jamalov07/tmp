import { forwardRef, Module } from '@nestjs/common'
import { MyBotName } from './constants'
import { TelegrafModule } from 'nestjs-telegraf'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BotService } from './bot.service'
import { BotUpdate } from './bot.update'
import { PdfModule, PrismaModule } from '../shared'
import { ChatModule } from '../chat/chat.module'

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TelegrafModule.forRootAsync({
			botName: MyBotName,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const token = configService.get<string>('bot.token')
				return {
					token,
					middlewares: [],
					include: [],
					launchOptions: process.env.BOT_LAUNCH === 'false' ? false : undefined,
				}
			},
		}),
		PrismaModule,
		PdfModule,
		forwardRef(() => ChatModule),
	],
	providers: [BotUpdate, BotService],
	exports: [BotService],
})
export class BotModule {}
