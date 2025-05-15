import { Body, Controller, Delete, Get, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
	ArrivalFindManyRequestDto,
	ArrivalFindOneRequestDto,
	ArrivalFindManyResponseDto,
	ArrivalFindOneResponseDto,
	ArrivalModifyResponseDto,
	ArrivalUpdateOneRequestDto,
	ArrivalDeleteOneRequestDto,
	ArrivalCreateOneRequestDto,
	ArrivalCreateOneResponseDto,
} from './dtos'
import { ArrivalService } from './arrival.service'
import { AuthOptions, CRequest } from '../../common'

@ApiTags('Arrival')
@Controller('arrival')
export class ArrivalController {
	private readonly arrivalService: ArrivalService

	constructor(arrivalService: ArrivalService) {
		this.arrivalService = arrivalService
	}

	@Get('many')
	@ApiOkResponse({ type: ArrivalFindManyResponseDto })
	@ApiOperation({ summary: 'get all arrivals' })
	async findMany(@Query() query: ArrivalFindManyRequestDto): Promise<ArrivalFindManyResponseDto> {
		return this.arrivalService.findMany(query)
	}

	@Get('one')
	@ApiOperation({ summary: 'find one arrival' })
	@ApiOkResponse({ type: ArrivalFindOneResponseDto })
	async findOne(@Query() query: ArrivalFindOneRequestDto): Promise<ArrivalFindOneResponseDto> {
		return this.arrivalService.findOne(query)
	}

	@Post('one')
	@AuthOptions(true, true)
	@ApiOperation({ summary: 'create one arrival' })
	@ApiOkResponse({ type: ArrivalCreateOneResponseDto })
	async createOne(@Req() request: CRequest, @Body() body: ArrivalCreateOneRequestDto): Promise<ArrivalCreateOneResponseDto> {
		return this.arrivalService.createOne(request, body)
	}

	@Patch('one')
	@AuthOptions(true, true)
	@ApiOperation({ summary: 'update one arrival' })
	@ApiOkResponse({ type: ArrivalModifyResponseDto })
	async updateOne(@Query() query: ArrivalFindOneRequestDto, @Body() body: ArrivalUpdateOneRequestDto): Promise<ArrivalModifyResponseDto> {
		return this.arrivalService.updateOne(query, body)
	}

	@Delete('one')
	@ApiOperation({ summary: 'delete one arrival' })
	@ApiOkResponse({ type: ArrivalModifyResponseDto })
	async deleteOne(@Query() query: ArrivalDeleteOneRequestDto): Promise<ArrivalModifyResponseDto> {
		return this.arrivalService.deleteOne(query)
	}
}
