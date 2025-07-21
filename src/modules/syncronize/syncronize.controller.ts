import { Controller, Get } from '@nestjs/common'
import { SyncronizeService } from './syncronize.service'
import { AuthOptions } from '../../common'

@Controller('syncronize')
export class SyncronizeController {
	private readonly syncronizeService: SyncronizeService
	constructor(syncronizeService: SyncronizeService) {
		this.syncronizeService = syncronizeService
	}

	@Get()
	@AuthOptions(true, true)
	async syncronize() {
		return this.syncronizeService.syncronize()
	}
}
