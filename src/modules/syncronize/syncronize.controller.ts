import { Controller, Get, Query } from '@nestjs/common'
import { AuthOptions } from '../../common'
import { SyncronizeService } from './syncronize.service'
import { SyncronizeService2 } from './syncronize2.service'
import { SyncronizeDto } from './dtos'

@Controller('syncronize')
export class SyncronizeController {
	constructor(private readonly syncronizeService: SyncronizeService2) {}

	@Get()
	// @AuthOptions(true, true)
	async syncronize(@Query() query: SyncronizeDto) {
		return this.syncronizeService.syncronize(query)
	}
}
