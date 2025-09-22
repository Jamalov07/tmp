import { SyncronizeService } from './syncronize.service'
import { Module } from '@nestjs/common'
import { PrismaModule } from '../shared'
import { SyncronizeController } from './syncronize.controller'
import { SyncronizeRepository } from './syncronize.repository'
import { Syncronize2Service } from './syncron.service'
import { Syncronize3Service } from './syncron2.service'

@Module({
	imports: [PrismaModule],
	controllers: [SyncronizeController],
	providers: [SyncronizeService, SyncronizeRepository, Syncronize2Service, Syncronize3Service],
	exports: [SyncronizeService, SyncronizeRepository, Syncronize2Service, Syncronize3Service],
})
export class SyncronizeModule {}
