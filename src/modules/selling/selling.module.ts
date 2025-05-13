import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SellingController } from './selling.controller'
import { SellingService } from './selling.service'
import { SellingRepository } from './selling.repository'

@Module({
	imports: [PrismaModule],
	controllers: [SellingController],
	providers: [SellingService, SellingRepository],
	exports: [SellingService, SellingRepository],
})
export class SellingModule {}
