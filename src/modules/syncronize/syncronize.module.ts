import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SyncronizeController } from './syncronize.controller'
import { SyncronizeRepository } from './syncronize.repository'
import { SyncronizeService } from './syncronize.service'
import { SyncronizeService2 } from './syncronize2.service'

@Module({
	imports: [PrismaModule],
	controllers: [SyncronizeController],
	providers: [SyncronizeService, SyncronizeRepository, SyncronizeService, SyncronizeService2],
	exports: [SyncronizeService, SyncronizeRepository, SyncronizeService, SyncronizeService2],
})
export class SyncronizeModule {}
