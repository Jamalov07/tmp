import { Controller, Get } from '@nestjs/common'
import { AuthOptions } from '../../common'
import { SyncronizeService } from './syncronize.service'
import { SyncronizeService2 } from './syncronize2.service'

@Controller('syncronize')
export class SyncronizeController {
	constructor(private readonly syncronizeService: SyncronizeService2) {}

	@Get()
	// @AuthOptions(true, true)
	async syncronize() {
		return this.syncronizeService.sync()
	}
}
