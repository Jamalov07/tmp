import { Decimal } from '@prisma/client/runtime/library'
import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger'
import { ClientCreateOneResponse, ClientFindManyData, ClientFindManyResponse, ClientFindOneData, ClientFindOneResponse, ClientModifyResponse } from '../interfaces'
import { GlobalModifyResponseDto, GlobalResponseDto, PaginationResponseDto } from '@common'
import { ClientRequiredDto } from './fields.dtos'

export class ClientFindOneDataDto extends PickType(ClientRequiredDto, ['id', 'fullname', 'createdAt', 'phone']) implements ClientFindOneData {
	@ApiProperty({ type: Number })
	debt?: Decimal

	@ApiProperty({ type: Date })
	lastArrivalDate?: Date
}

export class ClientFindManyDataDto extends PaginationResponseDto implements ClientFindManyData {
	@ApiProperty({ type: ClientFindOneDataDto, isArray: true })
	data: ClientFindOneData[]
}

export class ClientFindManyResponseDto extends GlobalResponseDto implements ClientFindManyResponse {
	@ApiProperty({ type: ClientFindManyDataDto })
	data: ClientFindManyData
}

export class ClientFindOneResponseDto extends GlobalResponseDto implements ClientFindOneResponse {
	@ApiProperty({ type: ClientFindOneDataDto })
	data: ClientFindOneData
}

export class ClientCreateOneResponseDto extends GlobalResponseDto implements ClientCreateOneResponse {
	@ApiProperty({ type: ClientFindOneDataDto })
	data: ClientFindOneData
}

export class ClientModifyResponseDto extends IntersectionType(GlobalResponseDto, GlobalModifyResponseDto) implements ClientModifyResponse {}
