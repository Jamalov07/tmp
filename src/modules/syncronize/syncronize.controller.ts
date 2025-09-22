import { Controller, Get } from '@nestjs/common'
import { SyncronizeService } from './syncronize.service'
import { AuthOptions } from '../../common'
import { Syncronize2Service } from './syncron.service'
import { Syncronize3Service } from './syncron2.service'

@Controller('syncronize')
export class SyncronizeController {
	constructor(
		private readonly syncronizeService: SyncronizeService,
		private readonly syncronService: Syncronize2Service,
		private readonly syncron3Service: Syncronize3Service,
	) {}

	@Get()
	// @AuthOptions(true, true)
	async syncronize() {
		return this.syncron3Service.sync()
	}
}
