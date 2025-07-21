import { SyncronizeService } from './syncronize.service'
import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SyncronizeController } from './syncronize.controller'
import { SyncronizeRepository } from './syncronize.repository'

@Module({
	imports: [PrismaModule],
	controllers: [SyncronizeController],
	providers: [SyncronizeService, SyncronizeRepository],
	exports: [SyncronizeService, SyncronizeRepository],
})
export class SyncronizeModule {}
