import { Body, Controller, Delete, Get, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
	ReturningFindManyRequestDto,
	ReturningFindOneRequestDto,
	ReturningFindManyResponseDto,
	ReturningFindOneResponseDto,
	ReturningModifyResponseDto,
	ReturningUpdateOneRequestDto,
	ReturningDeleteOneRequestDto,
	ReturningCreateOneRequestDto,
	ReturningCreateOneResponseDto,
} from './dtos'
import { ReturningService } from './returning.service'
import { CRequest } from '../../common'

@ApiTags('Returning')
@Controller('returning')
export class ReturningController {
	private readonly returningService: ReturningService

	constructor(returningService: ReturningService) {
		this.returningService = returningService
	}

	@Get('many')
	@ApiOkResponse({ type: ReturningFindManyResponseDto })
	@ApiOperation({ summary: 'get all returnings' })
	async findMany(@Query() query: ReturningFindManyRequestDto): Promise<ReturningFindManyResponseDto> {
		return this.returningService.findMany(query)
	}

	@Get('one')
	@ApiOperation({ summary: 'find one returning' })
	@ApiOkResponse({ type: ReturningFindOneResponseDto })
	async findOne(@Query() query: ReturningFindOneRequestDto): Promise<ReturningFindOneResponseDto> {
		return this.returningService.findOne(query)
	}

	@Post('one')
	@ApiOperation({ summary: 'create one returning' })
	@ApiOkResponse({ type: ReturningCreateOneResponseDto })
	async createOne(@Req() request: CRequest, @Body() body: ReturningCreateOneRequestDto): Promise<ReturningCreateOneResponseDto> {
		return this.returningService.createOne(request, body)
	}

	@Patch('one')
	@ApiOperation({ summary: 'update one returning' })
	@ApiOkResponse({ type: ReturningModifyResponseDto })
	async updateOne(@Query() query: ReturningFindOneRequestDto, @Body() body: ReturningUpdateOneRequestDto): Promise<ReturningModifyResponseDto> {
		return this.returningService.updateOne(query, body)
	}

	@Delete('one')
	@ApiOperation({ summary: 'delete one returning' })
	@ApiOkResponse({ type: ReturningModifyResponseDto })
	async deleteOne(@Query() query: ReturningDeleteOneRequestDto): Promise<ReturningModifyResponseDto> {
		return this.returningService.deleteOne(query)
	}
}
