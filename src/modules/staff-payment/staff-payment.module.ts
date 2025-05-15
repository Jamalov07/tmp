import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { StaffPaymentController } from './staff-payment.controller'
import { StaffPaymentService } from './staff-payment.service'
import { StaffPaymentRepository } from './staff-payment.repository'
import { StaffModule } from '../staff'

@Module({
	imports: [PrismaModule, StaffModule],
	controllers: [StaffPaymentController],
	providers: [StaffPaymentService, StaffPaymentRepository],
	exports: [StaffPaymentService, StaffPaymentRepository],
})
export class StaffPaymentModule {}
