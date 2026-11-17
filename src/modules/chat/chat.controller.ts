import { Body, Controller, Delete, Get, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthOptions, CheckPermissionGuard, CRequest } from '@common'
import { ChatService } from './chat.service'
import { ChatCreateResponseDto, ChatCreateTextRequestDto, ChatDeleteOneRequestDto, ChatDeleteResponseDto, ChatFindManyRequestDto, ChatFindManyResponseDto, ChatMarkReadRequestDto } from './dtos'

@ApiTags('Chat')
@Controller('chat')
@UseGuards(CheckPermissionGuard)
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Get('inbox')
	@AuthOptions(true, true)
	@ApiOperation({ summary: 'latest client conversations' })
	inbox() {
		return this.chatService.inbox()
	}

	@Post('read')
	@AuthOptions(true, true)
	@ApiOperation({ summary: 'mark a client conversation as read' })
	markRead(@Body() body: ChatMarkReadRequestDto) {
		return this.chatService.markRead(body.clientId)
	}

	@Get('many')
	@AuthOptions(true, true)
	@ApiOkResponse({ type: ChatFindManyResponseDto })
	@ApiOperation({ summary: 'client chat history' })
	findMany(@Query() query: ChatFindManyRequestDto) {
		return this.chatService.findMany(query)
	}

	@Post('one')
	@AuthOptions(true, true)
	@ApiOkResponse({ type: ChatCreateResponseDto })
	@ApiOperation({ summary: 'send a text message to the client' })
	createOne(@Req() request: CRequest, @Body() body: ChatCreateTextRequestDto) {
		if (!request.user?.id) throw new UnauthorizedException()
		return this.chatService.createText(request.user.id, body)
	}

	@Delete('one')
	@AuthOptions(true, true)
	@ApiOkResponse({ type: ChatDeleteResponseDto })
	@ApiOperation({ summary: 'delete a chat message' })
	deleteOne(@Query() query: ChatDeleteOneRequestDto) {
		return this.chatService.deleteOne(query.id)
	}
}
