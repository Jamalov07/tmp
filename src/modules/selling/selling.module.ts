import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SellingController } from './selling.controller'
import { SellingService } from './selling.service'
import { SellingRepository } from './selling.repository'
import { ArrivalModule } from '../arrival'

@Module({
	imports: [PrismaModule, ArrivalModule],
	controllers: [SellingController],
	providers: [SellingService, SellingRepository],
	exports: [SellingService, SellingRepository],
})
export class SellingModule {}
