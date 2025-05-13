import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { StaffPaymentController } from './staff-payment.controller'
import { StaffPaymentService } from './staff-payment.service'
import { StaffPaymentRepository } from './staff-payment.repository'

@Module({
	imports: [PrismaModule],
	controllers: [StaffPaymentController],
	providers: [StaffPaymentService, StaffPaymentRepository],
	exports: [StaffPaymentService, StaffPaymentRepository],
})
export class StaffPaymentModule {}
