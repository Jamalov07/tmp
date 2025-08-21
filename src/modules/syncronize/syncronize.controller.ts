import { Controller, Get } from '@nestjs/common'
import { SyncronizeService } from './syncronize.service'
import { AuthOptions } from '../../common'
import { Syncronize2Service } from './syncron.service'

@Controller('syncronize')
export class SyncronizeController {
	constructor(
		private readonly syncronizeService: SyncronizeService,
		private readonly syncronService: Syncronize2Service,
	) {}

	@Get()
	// @AuthOptions(true, true)
	async syncronize() {
		return this.syncronService.sync()
	}
}
