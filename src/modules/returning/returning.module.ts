import { Module } from '@nestjs/common'
import { ExcelModule, PrismaModule } from '../shared'
import { ReturningController } from './returning.controller'
import { ReturningService } from './returning.service'
import { ReturningRepository } from './returning.repository'
import { ClientModule } from '../client'
import { ProductModule } from '../product'

@Module({
	imports: [PrismaModule, ClientModule, ProductModule, ExcelModule],
	controllers: [ReturningController],
	providers: [ReturningService, ReturningRepository],
	exports: [ReturningService, ReturningRepository],
})
export class ReturningModule {}
