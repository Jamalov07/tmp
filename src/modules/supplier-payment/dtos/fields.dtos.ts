import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DefaultOptionalFieldsDto, DefaultRequiredFieldsDto } from '../../../common'
import { SupplierPaymentOptional, SupplierPaymentRequired } from '../interfaces'
import { IsDecimal, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { Decimal } from '@prisma/client/runtime/library'

export class SupplierPaymentRequiredDto extends DefaultRequiredFieldsDto implements SupplierPaymentRequired {
	@ApiProperty({ type: BigInt })
	@IsNotEmpty()
	@IsDecimal()
	card: Decimal

	@ApiProperty({ type: BigInt })
	@IsNotEmpty()
	@IsDecimal()
	cash: Decimal

	@ApiProperty({ type: BigInt })
	@IsNotEmpty()
	@IsDecimal()
	other: Decimal

	@ApiProperty({ type: BigInt })
	@IsNotEmpty()
	@IsDecimal()
	transfer: Decimal

	@ApiProperty({ type: String })
	@IsNotEmpty()
	@IsUUID('4')
	staffId: string

	@ApiProperty({ type: String })
	@IsNotEmpty()
	@IsUUID('4')
	userId: string

	@ApiProperty({ type: String })
	@IsNotEmpty()
	@IsString()
	description: string
}

export class SupplierPaymentOptionalDto extends DefaultOptionalFieldsDto implements SupplierPaymentOptional {
	@ApiPropertyOptional({ type: BigInt })
	@IsOptional()
	@IsDecimal()
	card?: Decimal

	@ApiPropertyOptional({ type: BigInt })
	@IsOptional()
	@IsDecimal()
	cash?: Decimal

	@ApiPropertyOptional({ type: BigInt })
	@IsOptional()
	@IsDecimal()
	other?: Decimal

	@ApiPropertyOptional({ type: BigInt })
	@IsOptional()
	@IsDecimal()
	transfer?: Decimal

	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@IsUUID('4')
	staffId?: string

	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@IsUUID('4')
	userId?: string

	@ApiPropertyOptional({ type: String })
	@IsOptional()
	@IsString()
	description?: string
}
