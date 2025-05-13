import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger'
import {
	ClientPaymentCreateOneResponse,
	ClientPaymentFindManyData,
	ClientPaymentFindManyResponse,
	ClientPaymentFindOneData,
	ClientPaymentFindOneResponse,
	ClientPaymentModifyResponse,
} from '../interfaces'
import { GlobalModifyResponseDto, GlobalResponseDto, PaginationResponseDto } from '@common'
import { ClientPaymentRequiredDto } from './fields.dtos'

export class ClientPaymentFindOneDataDto extends PickType(ClientPaymentRequiredDto, ['id', 'description', 'createdAt']) implements ClientPaymentFindOneData {}

export class ClientPaymentFindManyDataDto extends PaginationResponseDto implements ClientPaymentFindManyData {
	@ApiProperty({ type: ClientPaymentFindOneDataDto, isArray: true })
	data: ClientPaymentFindOneData[]
}

export class ClientPaymentFindManyResponseDto extends GlobalResponseDto implements ClientPaymentFindManyResponse {
	@ApiProperty({ type: ClientPaymentFindManyDataDto })
	data: ClientPaymentFindManyData
}

export class ClientPaymentFindOneResponseDto extends GlobalResponseDto implements ClientPaymentFindOneResponse {
	@ApiProperty({ type: ClientPaymentFindOneDataDto })
	data: ClientPaymentFindOneData
}

export class ClientPaymentCreateOneResponseDto extends GlobalResponseDto implements ClientPaymentCreateOneResponse {
	@ApiProperty({ type: ClientPaymentFindOneDataDto })
	data: ClientPaymentFindOneData
}

export class ClientPaymentModifyResponseDto extends IntersectionType(GlobalResponseDto, GlobalModifyResponseDto) implements ClientPaymentModifyResponse {}
