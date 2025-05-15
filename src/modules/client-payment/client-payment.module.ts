import { forwardRef, Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { ClientPaymentController } from './client-payment.controller'
import { ClientPaymentService } from './client-payment.service'
import { ClientPaymentRepository } from './client-payment.repository'
import { ClientModule } from '../client'

@Module({
	imports: [PrismaModule, forwardRef(() => ClientModule)],
	controllers: [ClientPaymentController],
	providers: [ClientPaymentService, ClientPaymentRepository],
	exports: [ClientPaymentService, ClientPaymentRepository],
})
export class ClientPaymentModule {}
