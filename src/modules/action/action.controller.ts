import { Body, Controller, Get, Patch, Query } from '@nestjs/common'
import { ActionService } from './action.service'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { ActionFindManyRequestDto, ActionFindManyResponseDto, ActionFindOneRequestDto, ActionFindOneResponseDto, ActionModifyResponseDto, ActionUpdateOneRequestDto } from './dtos'

@Controller('action')
export class ActionController {
	private readonly actionService: ActionService
	constructor(actionService: ActionService) {
		this.actionService = actionService
	}

	@Get('many')
	@ApiOkResponse({ type: ActionFindManyResponseDto })
	@ApiOperation({ summary: 'get all staffs' })
	async findMany(@Query() query: ActionFindManyRequestDto): Promise<ActionFindManyResponseDto> {
		return this.actionService.findMany(query)
	}

	@Get('one')
	@ApiOperation({ summary: 'find one action' })
	@ApiOkResponse({ type: ActionFindOneResponseDto })
	async findOne(@Query() query: ActionFindOneRequestDto): Promise<ActionFindOneResponseDto> {
		return this.actionService.findOne(query)
	}

	@Patch('one')
	@ApiOperation({ summary: 'update one action' })
	@ApiOkResponse({ type: ActionModifyResponseDto })
	async updateOne(@Query() query: ActionFindOneRequestDto, @Body() body: ActionUpdateOneRequestDto): Promise<ActionModifyResponseDto> {
		return this.actionService.updateOne(query, body)
	}
}
