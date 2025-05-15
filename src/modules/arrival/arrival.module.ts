import { forwardRef, Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { ArrivalController } from './arrival.controller'
import { ArrivalService } from './arrival.service'
import { ArrivalRepository } from './arrival.repository'
import { SupplierModule } from '../supplier'
import { ProductModule } from '../product'

@Module({
	imports: [PrismaModule, forwardRef(() => SupplierModule), forwardRef(() => ProductModule)],
	controllers: [ArrivalController],
	providers: [ArrivalService, ArrivalRepository],
	exports: [ArrivalService, ArrivalRepository],
})
export class ArrivalModule {}
