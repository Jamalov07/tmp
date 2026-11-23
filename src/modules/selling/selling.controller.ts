import { Body, Controller, Delete, Get, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
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
	SellingGetProductRankRequestDto,
	SellingGetProductIdleRequestDto,
} from './dtos'
import { SellingService } from './selling.service'
import { AuthOptions, CheckPermissionGuard, CRequest } from '../../common'
import { Response } from 'express'

@ApiTags('Selling')
@Controller('selling')
@UseGuards(CheckPermissionGuard)
export class SellingController {
	constructor(private readonly sellingService: SellingService) {}

	@Get('many')
	@ApiOkResponse({ type: SellingFindManyResponseDto })
	@ApiOperation({ summary: 'get all sellings' })
	async findMany(@Query() query: SellingFindManyRequestDto): Promise<SellingFindManyResponseDto> {
		return this.sellingService.findMany({ ...query, isDeleted: false })
	}

	@Get('excel-download/many')
	@ApiOperation({ summary: 'download many sellings' })
	async excelDownloadMany(@Res() res: Response, @Query() query: SellingFindManyRequestDto) {
		return this.sellingService.excelDownloadMany(res, query)
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

	@Get('product-rank')
	@ApiOperation({ summary: 'rank products by sale count or profit' })
	@AuthOptions(false, false)
	async getProductRank(@Query() query: SellingGetProductRankRequestDto) {
		return this.sellingService.getProductRank(query)
	}

	@Get('product-idle')
	@ApiOperation({ summary: 'products ordered by oldest last sale' })
	@AuthOptions(false, false)
	async getProductIdle(@Query() query: SellingGetProductIdleRequestDto) {
		return this.sellingService.getProductIdle(query)
	}

	@Get('one')
	@ApiOperation({ summary: 'find one selling' })
	@ApiOkResponse({ type: SellingFindOneResponseDto })
	async findOne(@Query() query: SellingFindOneRequestDto): Promise<SellingFindOneResponseDto> {
		return this.sellingService.findOne(query)
	}

	@Get('excel-download/one')
	@ApiOperation({ summary: 'download many sellings' })
	async excelDownloadOne(@Res() res: Response, @Query() query: SellingFindOneRequestDto) {
		return this.sellingService.excelDownloadOne(res, query)
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
	async updateOne(@Req() request: CRequest, @Query() query: SellingFindOneRequestDto, @Body() body: SellingUpdateOneRequestDto): Promise<SellingModifyResponseDto> {
		return this.sellingService.updateOne(request, query, body)
	}

	@Delete('one')
	@ApiOperation({ summary: 'delete one selling' })
	@ApiOkResponse({ type: SellingModifyResponseDto })
	async deleteOne(@Query() query: SellingDeleteOneRequestDto): Promise<SellingModifyResponseDto> {
		return this.sellingService.deleteOne(query)
	}
}
