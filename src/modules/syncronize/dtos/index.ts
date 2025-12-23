import { ApiProperty } from '@nestjs/swagger'

export class SyncronizeDto {
	@ApiProperty({ type: Boolean, default: true })
	client: boolean

	@ApiProperty({ type: Boolean, default: true })
	staff: boolean

	@ApiProperty({ type: Boolean, default: true })
	supplier: boolean

	@ApiProperty({ type: Boolean, default: true })
	product: boolean
}
