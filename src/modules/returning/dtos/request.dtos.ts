import { PickType, IntersectionType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	ReturningCreateOneRequest,
	ReturningDeleteOneRequest,
	ReturningFindManyRequest,
	ReturningFindOneRequest,
	ReturningPayment,
	ReturningProduct,
	ReturningUpdateOneRequest,
} from '../interfaces'
import { PaginationRequestDto, RequestOtherFieldsDto } from '@common'
import { ReturningOptionalDto, ReturningRequiredDto } from './fields.dtos'
import { ProductMVRequiredDto } from '../../product-mv'
import { Decimal } from '@prisma/client/runtime/library'
import { IsArray, IsDecimal, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class ReturningFindManyRequestDto
	extends IntersectionType(PickType(ReturningOptionalDto, ['clientId', 'staffId']), PaginationRequestDto, PickType(RequestOtherFieldsDto, ['search', 'startDate', 'endDate']))
	implements ReturningFindManyRequest {}

export class ReturningFindOneRequestDto extends IntersectionType(PickType(ReturningRequiredDto, ['id'])) implements ReturningFindOneRequest {}

export class ReturningPaymentDto implements ReturningPayment {
	@ApiProperty({ type: BigInt })
	@IsNotEmpty()
	@IsDecimal()
	cash: Decimal

	@ApiProperty({ type: BigInt })
	@IsNotEmpty()
	@IsDecimal()
	fromBalance: Decimal
}

export class ReturningProductDto extends PickType(ProductMVRequiredDto, ['count', 'price', 'productId']) implements ReturningProduct {}

export class ReturningCreateOneRequestDto extends IntersectionType(PickType(ReturningRequiredDto, ['clientId', 'date'])) implements ReturningCreateOneRequest {
	@ApiPropertyOptional({ type: ReturningPaymentDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => ReturningPaymentDto)
	payment?: ReturningPayment

	@ApiPropertyOptional({ type: ReturningProductDto, isArray: true })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ReturningProductDto)
	products?: ReturningProduct[]
}

export class ReturningUpdateOneRequestDto extends IntersectionType(PickType(ReturningOptionalDto, ['deletedAt', 'clientId', 'date'])) implements ReturningUpdateOneRequest {
	@ApiPropertyOptional({ type: ReturningPaymentDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => ReturningPaymentDto)
	payment?: ReturningPayment

	@ApiPropertyOptional({ type: ReturningProductDto, isArray: true })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ReturningProductDto)
	products?: ReturningProduct[]

	@ApiPropertyOptional({ type: String, isArray: true })
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true })
	productIdsToRemove?: string[]
}

export class ReturningDeleteOneRequestDto
	extends IntersectionType(PickType(ReturningRequiredDto, ['id']), PickType(RequestOtherFieldsDto, ['method']))
	implements ReturningDeleteOneRequest {}
