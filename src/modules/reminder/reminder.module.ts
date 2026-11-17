import { Module } from '@nestjs/common'
import { BotModule } from '../bot/bot.module'
import { ChatModule } from '../chat/chat.module'
import { PrismaModule } from '../shared/prisma'
import { ReminderController } from './reminder.controller'
import { ReminderRepository } from './reminder.repository'
import { ReminderService } from './reminder.service'

@Module({
	imports: [PrismaModule, ChatModule, BotModule],
	controllers: [ReminderController],
	providers: [ReminderService, ReminderRepository],
	exports: [ReminderService],
})
export class ReminderModule {}
