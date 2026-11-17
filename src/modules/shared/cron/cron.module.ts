import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { ScheduleModule } from '@nestjs/schedule'
import { ReminderModule } from '../../reminder/reminder.module'

@Module({
	imports: [ScheduleModule.forRoot(), ReminderModule],
	providers: [CronService],
	exports: [CronService],
})
export class CronModule {}
