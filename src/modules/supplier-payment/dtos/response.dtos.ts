import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger'
import {
	SupplierPaymentCreateOneResponse,
	SupplierPaymentFindManyData,
	SupplierPaymentFindManyResponse,
	SupplierPaymentFindOneData,
	SupplierPaymentFindOneResponse,
	SupplierPaymentModifyResponse,
} from '../interfaces'
import { GlobalModifyResponseDto, GlobalResponseDto, PaginationResponseDto } from '@common'
import { SupplierPaymentRequiredDto } from './fields.dtos'

export class SupplierPaymentFindOneDataDto extends PickType(SupplierPaymentRequiredDto, ['id', 'description', 'createdAt']) implements SupplierPaymentFindOneData {}

export class SupplierPaymentFindManyDataDto extends PaginationResponseDto implements SupplierPaymentFindManyData {
	@ApiProperty({ type: SupplierPaymentFindOneDataDto, isArray: true })
	data: SupplierPaymentFindOneData[]
}

export class SupplierPaymentFindManyResponseDto extends GlobalResponseDto implements SupplierPaymentFindManyResponse {
	@ApiProperty({ type: SupplierPaymentFindManyDataDto })
	data: SupplierPaymentFindManyData
}

export class SupplierPaymentFindOneResponseDto extends GlobalResponseDto implements SupplierPaymentFindOneResponse {
	@ApiProperty({ type: SupplierPaymentFindOneDataDto })
	data: SupplierPaymentFindOneData
}

export class SupplierPaymentCreateOneResponseDto extends GlobalResponseDto implements SupplierPaymentCreateOneResponse {
	@ApiProperty({ type: SupplierPaymentFindOneDataDto })
	data: SupplierPaymentFindOneData
}

export class SupplierPaymentModifyResponseDto extends IntersectionType(GlobalResponseDto, GlobalModifyResponseDto) implements SupplierPaymentModifyResponse {}
