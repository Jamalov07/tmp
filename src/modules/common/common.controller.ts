import { Controller } from '@nestjs/common'
import { CommonService } from './common.service'

@Controller('common')
export class CommonController {
	private readonly commonService: CommonService
	constructor(commonService: CommonService) {
		this.commonService = commonService
	}
}
