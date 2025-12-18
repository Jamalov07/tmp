import { Controller, Get } from '@nestjs/common'
import { AuthOptions } from '../../common'
import { SyncronizeService } from './syncronize.service'

@Controller('syncronize')
export class SyncronizeController {
	constructor(private readonly syncronizeService: SyncronizeService) {}

	@Get()
	// @AuthOptions(true, true)
	async syncronize() {
		return this.syncronizeService.sync()
	}
}
