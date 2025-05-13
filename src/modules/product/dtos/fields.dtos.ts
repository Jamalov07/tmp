import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DefaultOptionalFieldsDto, DefaultRequiredFieldsDto } from '../../../common'
import { ProductOptional, ProductRequired } from '../interfaces'
import { IsDecimal, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { Decimal } from '@prisma/client/runtime/library'

export class ProductRequiredDto extends DefaultRequiredFieldsDto implements ProductRequired {
	@ApiProperty({ type: String })
	@IsNotEmpty()
	@IsString()
	name: string

	@ApiProperty({ type: BigInt })
	@IsNotEmpty()
	@IsDecimal()
	cost: Decimal

	@ApiProperty({ type: BigInt })
	@IsNotEmpty()
	@IsDecimal()
	price: Decimal

	@ApiProperty({ type: Number })
	@IsNotEmpty()
	@IsNumber()
	count: number

	@ApiProperty({ type: Number })
	@IsNotEmpty()
	@IsNumber()
	minAmount: number
}

export class ProductOptionalDto extends DefaultOptionalFieldsDto implements ProductOptional {
	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@IsString()
	name?: string

	@ApiPropertyOptional({ type: BigInt })
	@IsOptional()
	@IsDecimal()
	cost?: Decimal

	@ApiPropertyOptional({ type: BigInt })
	@IsOptional()
	@IsDecimal()
	price?: Decimal

	@ApiPropertyOptional({ type: Number })
	@IsOptional()
	@IsNumber()
	count?: number

	@ApiPropertyOptional({ type: Number })
	@IsOptional()
	@IsNumber()
	minAmount?: number
}
