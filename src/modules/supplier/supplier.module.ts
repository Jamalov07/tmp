import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SupplierController } from './supplier.controller'
import { SupplierService } from './supplier.service'
import { SupplierRepository } from './supplier.repository'
import { ArrivalModule } from '../arrival'

@Module({
	imports: [PrismaModule, ArrivalModule],
	controllers: [SupplierController],
	providers: [SupplierService, SupplierRepository],
	exports: [SupplierService, SupplierRepository],
})
export class SupplierModule {}
