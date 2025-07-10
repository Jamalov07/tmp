import { forwardRef, Module } from '@nestjs/common'
import { ExcelModule, PrismaModule } from '../shared'
import { SellingController } from './selling.controller'
import { SellingService } from './selling.service'
import { SellingRepository } from './selling.repository'
import { ArrivalModule } from '../arrival'
import { ClientModule } from '../client'
import { BotModule } from '../bot'

@Module({
	imports: [PrismaModule, ExcelModule, forwardRef(() => ArrivalModule), ClientModule, BotModule],
	controllers: [SellingController],
	providers: [SellingService, SellingRepository],
	exports: [SellingService, SellingRepository],
})
export class SellingModule {}
