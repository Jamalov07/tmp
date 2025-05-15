import { forwardRef, Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SellingController } from './selling.controller'
import { SellingService } from './selling.service'
import { SellingRepository } from './selling.repository'
import { ArrivalModule } from '../arrival'
import { ClientModule } from '../client'

@Module({
	imports: [PrismaModule, forwardRef(() => ArrivalModule), ClientModule],
	controllers: [SellingController],
	providers: [SellingService, SellingRepository],
	exports: [SellingService, SellingRepository],
})
export class SellingModule {}
