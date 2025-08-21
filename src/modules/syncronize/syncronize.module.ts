import { SyncronizeService } from './syncronize.service'
import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SyncronizeController } from './syncronize.controller'
import { SyncronizeRepository } from './syncronize.repository'
import { Syncronize2Service } from './syncron.service'

@Module({
	imports: [PrismaModule],
	controllers: [SyncronizeController],
	providers: [SyncronizeService, SyncronizeRepository, Syncronize2Service],
	exports: [SyncronizeService, SyncronizeRepository, Syncronize2Service],
})
export class SyncronizeModule {}
