import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger'
import { SupplierCreateOneResponse, SupplierFindManyData, SupplierFindManyResponse, SupplierFindOneData, SupplierFindOneResponse, SupplierModifyResponse } from '../interfaces'
import { GlobalModifyResponseDto, GlobalResponseDto, PaginationResponseDto } from '@common'
import { SupplierRequiredDto } from './fields.dtos'
import { Decimal } from '@prisma/client/runtime/library'

export class SupplierFindOneDataDto extends PickType(SupplierRequiredDto, ['id', 'fullname', 'createdAt', 'phone']) implements SupplierFindOneData {
	@ApiProperty({ type: Number })
	debt?: Decimal

	@ApiProperty({ type: Date })
	lastArrivalDate?: Date
}

export class SupplierFindManyDataDto extends PaginationResponseDto implements SupplierFindManyData {
	@ApiProperty({ type: SupplierFindOneDataDto, isArray: true })
	data: SupplierFindOneData[]
}

export class SupplierFindManyResponseDto extends GlobalResponseDto implements SupplierFindManyResponse {
	@ApiProperty({ type: SupplierFindManyDataDto })
	data: SupplierFindManyData
}

export class SupplierFindOneResponseDto extends GlobalResponseDto implements SupplierFindOneResponse {
	@ApiProperty({ type: SupplierFindOneDataDto })
	data: SupplierFindOneData
}

export class SupplierCreateOneResponseDto extends GlobalResponseDto implements SupplierCreateOneResponse {
	@ApiProperty({ type: SupplierFindOneDataDto })
	data: SupplierFindOneData
}

export class SupplierModifyResponseDto extends IntersectionType(GlobalResponseDto, GlobalModifyResponseDto) implements SupplierModifyResponse {}
