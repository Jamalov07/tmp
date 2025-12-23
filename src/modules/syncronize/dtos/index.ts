import { ApiProperty } from '@nestjs/swagger'
import { SyncronizeRequest } from '../interfaces'
import { Type } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

export class SyncronizeDto implements SyncronizeRequest {
	@ApiProperty({ type: Boolean, default: true })
	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	client: boolean

	@ApiProperty({ type: Boolean, default: true })
	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	staff: boolean

	@ApiProperty({ type: Boolean, default: true })
	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	supplier: boolean

	@ApiProperty({ type: Boolean, default: true })
	@IsOptional()
	@IsBoolean()
	@Type(() => Boolean)
	product: boolean
}
