import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger'
import { SellingCreateOneResponse, SellingFindManyData, SellingFindManyResponse, SellingFindOneData, SellingFindOneResponse, SellingModifyResponse } from '../interfaces'
import { GlobalModifyResponseDto, GlobalResponseDto, PaginationResponseDto } from '@common'
import { SellingRequiredDto } from './fields.dtos'

export class SellingFindOneDataDto extends PickType(SellingRequiredDto, ['id', 'status', 'createdAt']) implements SellingFindOneData {}

export class SellingFindManyDataDto extends PaginationResponseDto implements SellingFindManyData {
	@ApiProperty({ type: SellingFindOneDataDto, isArray: true })
	data: SellingFindOneData[]
}

export class SellingFindManyResponseDto extends GlobalResponseDto implements SellingFindManyResponse {
	@ApiProperty({ type: SellingFindManyDataDto })
	data: SellingFindManyData
}

export class SellingFindOneResponseDto extends GlobalResponseDto implements SellingFindOneResponse {
	@ApiProperty({ type: SellingFindOneDataDto })
	data: SellingFindOneData
}

export class SellingCreateOneResponseDto extends GlobalResponseDto implements SellingCreateOneResponse {
	@ApiProperty({ type: SellingFindOneDataDto })
	data: SellingFindOneData
}

export class SellingModifyResponseDto extends IntersectionType(GlobalResponseDto, GlobalModifyResponseDto) implements SellingModifyResponse {}
