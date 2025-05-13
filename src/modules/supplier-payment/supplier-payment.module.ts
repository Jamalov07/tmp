import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SupplierPaymentController } from './supplier-payment.controller'
import { SupplierPaymentService } from './supplier-payment.service'
import { SupplierPaymentRepository } from './supplier-payment.repository'

@Module({
	imports: [PrismaModule],
	controllers: [SupplierPaymentController],
	providers: [SupplierPaymentService, SupplierPaymentRepository],
	exports: [SupplierPaymentService, SupplierPaymentRepository],
})
export class SupplierPaymentModule {}
