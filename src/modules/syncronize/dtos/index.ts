import { ApiProperty } from '@nestjs/swagger'
import { SyncronizeRequest } from '../interfaces'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

export class SyncronizeDto implements SyncronizeRequest {
	@ApiProperty({ type: Boolean })
	@Transform(({ value }) => ([false, 'false'].includes(value) ? false : [true, 'true'].includes(value) ? true : undefined))
	@IsBoolean()
	@IsOptional()
	client: boolean

	@ApiProperty({ type: Boolean })
	@Transform(({ value }) => ([false, 'false'].includes(value) ? false : [true, 'true'].includes(value) ? true : undefined))
	@IsBoolean()
	@IsOptional()
	staff: boolean

	@ApiProperty({ type: Boolean })
	@Transform(({ value }) => ([false, 'false'].includes(value) ? false : [true, 'true'].includes(value) ? true : undefined))
	@IsBoolean()
	@IsOptional()
	supplier: boolean

	@ApiProperty({ type: Boolean })
	@Transform(({ value }) => ([false, 'false'].includes(value) ? false : [true, 'true'].includes(value) ? true : undefined))
	@IsBoolean()
	@IsOptional()
	product: boolean
}
