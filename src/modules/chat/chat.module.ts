import { forwardRef, Module } from '@nestjs/common'
import { BotModule } from '../bot/bot.module'
import { PrismaModule } from '../shared/prisma'
import { ChatController } from './chat.controller'
import { ChatRepository } from './chat.repository'
import { ChatService } from './chat.service'

@Module({
	imports: [PrismaModule, forwardRef(() => BotModule)],
	controllers: [ChatController],
	providers: [ChatService, ChatRepository],
	exports: [ChatService],
})
export class ChatModule {}
