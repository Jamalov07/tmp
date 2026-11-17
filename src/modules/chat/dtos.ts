import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger'
import { ChatMessageDirectionEnum } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'
import { GlobalResponseDto, PaginationRequestDto, PaginationResponseDto } from '@common'

export class ChatFindManyRequestDto extends IntersectionType(PaginationRequestDto) {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	clientId: string
}

export class ChatCreateTextRequestDto {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	clientId: string

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	@MaxLength(4096)
	text: string
}

export class ChatDeleteOneRequestDto {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	id: string
}

export class ChatMessageStaffDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	fullname: string
}

export class ChatMessageDataDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	clientId: string

	@ApiProperty({ enum: ['in', 'out', 'system'] })
	direction: ChatMessageDirectionEnum

	@ApiProperty({ nullable: true })
	text: string | null

	@ApiProperty({ nullable: true })
	telegramMessageId: number | null

	@ApiProperty({ nullable: true })
	staffId: string | null

	@ApiProperty({ nullable: true, type: ChatMessageStaffDto })
	@Type(() => ChatMessageStaffDto)
	staff: ChatMessageStaffDto | null

	@ApiProperty()
	createdAt: Date
}

export class ChatFindManyDataDto extends PaginationResponseDto {
	@ApiProperty({ type: ChatMessageDataDto, isArray: true })
	data: ChatMessageDataDto[]
}

export class ChatFindManyResponseDto extends GlobalResponseDto {
	@ApiProperty({ type: ChatFindManyDataDto })
	data: ChatFindManyDataDto
}

export class ChatCreateResponseDto extends GlobalResponseDto {
	@ApiProperty({ type: ChatMessageDataDto })
	data: ChatMessageDataDto
}

export class ChatDeleteDataDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	telegramDeleted: boolean
}

export class ChatDeleteResponseDto extends GlobalResponseDto {
	@ApiProperty({ type: ChatDeleteDataDto })
	data: ChatDeleteDataDto
}

export class ChatMarkReadRequestDto {
	@ApiProperty({ type: String })
	@IsUUID('4')
	@IsNotEmpty()
	clientId: string
}
