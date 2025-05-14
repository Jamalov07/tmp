import { Body, Controller, Delete, Get, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
	SellingFindManyRequestDto,
	SellingFindOneRequestDto,
	SellingFindManyResponseDto,
	SellingFindOneResponseDto,
	SellingModifyResponseDto,
	SellingUpdateOneRequestDto,
	SellingDeleteOneRequestDto,
	SellingCreateOneRequestDto,
	SellingCreateOneResponseDto,
	SellingGetTotalStatsResponseDto,
	SellingGetTotalStatsRequestDto,
	SellingGetPeriodStatsResponseDto,
	SellingGetPeriodStatsRequestDto,
} from './dtos'
import { SellingService } from './selling.service'
import { AuthOptions, CRequest } from '../../common'

@ApiTags('Selling')
@Controller('selling')
export class SellingController {
	private readonly sellingService: SellingService

	constructor(sellingService: SellingService) {
		this.sellingService = sellingService
	}

	@Get('many')
	@ApiOkResponse({ type: SellingFindManyResponseDto })
	@ApiOperation({ summary: 'get all sellings' })
	async findMany(@Query() query: SellingFindManyRequestDto): Promise<SellingFindManyResponseDto> {
		return this.sellingService.findMany(query)
	}

	@Get('total-stats')
	@ApiOkResponse({ type: SellingGetTotalStatsResponseDto })
	@ApiOperation({ summary: 'get total stats' })
	@AuthOptions(false, false)
	async getTotalStats(@Query() query: SellingGetTotalStatsRequestDto): Promise<SellingGetTotalStatsResponseDto> {
		return this.sellingService.getTotalStats(query)
	}

	@Get('period-stats')
	@ApiOkResponse({ type: SellingGetPeriodStatsResponseDto })
	@ApiOperation({ summary: 'get period stats' })
	@AuthOptions(false, false)
	async getPeriodStats(@Query() query: SellingGetPeriodStatsRequestDto): Promise<SellingGetPeriodStatsResponseDto> {
		return this.sellingService.getPeriodStats(query)
	}

	@Get('one')
	@ApiOperation({ summary: 'find one selling' })
	@ApiOkResponse({ type: SellingFindOneResponseDto })
	async findOne(@Query() query: SellingFindOneRequestDto): Promise<SellingFindOneResponseDto> {
		return this.sellingService.findOne(query)
	}

	@Post('one')
	@AuthOptions(true, true)
	@ApiOperation({ summary: 'create one selling' })
	@ApiOkResponse({ type: SellingCreateOneResponseDto })
	async createOne(@Req() request: CRequest, @Body() body: SellingCreateOneRequestDto): Promise<SellingCreateOneResponseDto> {
		return this.sellingService.createOne(request, body)
	}

	@Patch('one')
	@AuthOptions(true, true)
	@ApiOperation({ summary: 'update one selling' })
	@ApiOkResponse({ type: SellingModifyResponseDto })
	async updateOne(@Query() query: SellingFindOneRequestDto, @Body() body: SellingUpdateOneRequestDto): Promise<SellingModifyResponseDto> {
		return this.sellingService.updateOne(query, body)
	}

	@Delete('one')
	@ApiOperation({ summary: 'delete one selling' })
	@ApiOkResponse({ type: SellingModifyResponseDto })
	async deleteOne(@Query() query: SellingDeleteOneRequestDto): Promise<SellingModifyResponseDto> {
		return this.sellingService.deleteOne(query)
	}
}
