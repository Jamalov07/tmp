import { Controller, Get, Post, Query } from '@nestjs/common'
import { CommonService } from './common.service'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { AuthOptions } from '../../common'
import { DayCloseGetOneRequestDto, DayCloseGetOneResponseDto, DayCloseModifyResponseDto } from './dtos'

@Controller('common')
export class CommonController {
	private readonly commonService: CommonService
	constructor(commonService: CommonService) {
		this.commonService = commonService
	}

	@Post('day-close')
	@ApiOkResponse({ type: DayCloseModifyResponseDto })
	@ApiOperation({ summary: 'create close day' })
	@AuthOptions(false, false)
	async createDayClose(): Promise<DayCloseModifyResponseDto> {
		return this.commonService.createDayClose()
	}

	@Get('day-close')
	@ApiOkResponse({ type: DayCloseGetOneResponseDto })
	@ApiOperation({ summary: 'get close day' })
	@AuthOptions(false, false)
	async getDayClose(@Query() query: DayCloseGetOneRequestDto): Promise<DayCloseGetOneResponseDto> {
		return this.commonService.getDayClose(query)
	}
}
