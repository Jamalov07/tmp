import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SyncronizeController } from './syncronize.controller'
import { SyncronizeRepository } from './syncronize.repository'
import { SyncronizeService } from './syncronize.service'

@Module({
	imports: [PrismaModule],
	controllers: [SyncronizeController],
	providers: [SyncronizeService, SyncronizeRepository, SyncronizeService],
	exports: [SyncronizeService, SyncronizeRepository, SyncronizeService],
})
export class SyncronizeModule {}
