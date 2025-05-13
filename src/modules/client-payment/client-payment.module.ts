import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { ClientPaymentController } from './client-payment.controller'
import { ClientPaymentService } from './client-payment.service'
import { ClientPaymentRepository } from './client-payment.repository'

@Module({
	imports: [PrismaModule],
	controllers: [ClientPaymentController],
	providers: [ClientPaymentService, ClientPaymentRepository],
	exports: [ClientPaymentService, ClientPaymentRepository],
})
export class ClientPaymentModule {}
