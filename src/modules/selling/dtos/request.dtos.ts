import { PickType, IntersectionType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SellingCreateOneRequest, SellingDeleteOneRequest, SellingFindManyRequest, SellingFindOneRequest, SellingPayment, SellingUpdateOneRequest } from '../interfaces'
import { PaginationRequestDto, RequestOtherFieldsDto } from '@common'
import { SellingOptionalDto, SellingRequiredDto } from './fields.dtos'
import { ClientPaymentRequiredDto } from '../../client-payment'

export class SellingFindManyRequestDto
	extends IntersectionType(
		PickType(SellingOptionalDto, ['clientId', 'staffId', 'status']),
		PaginationRequestDto,
		PickType(RequestOtherFieldsDto, ['search', 'startDate', 'endDate']),
	)
	implements SellingFindManyRequest {}

export class SellingFindOneRequestDto extends IntersectionType(PickType(SellingRequiredDto, ['id'])) implements SellingFindOneRequest {}

export class SellingPaymentDto extends IntersectionType(PickType(ClientPaymentRequiredDto, ['card', 'cash', 'other', 'transfer', 'description'])) implements SellingPayment {}

export class SellingCreateOneRequestDto
	extends IntersectionType(PickType(SellingRequiredDto, ['clientId', 'date', 'send', 'status']), PickType(SellingOptionalDto, ['staffId']))
	implements SellingCreateOneRequest
{
	@ApiPropertyOptional({ type: SellingPaymentDto })
	payment?: SellingPayment
}

export class SellingUpdateOneRequestDto extends IntersectionType(PickType(SellingOptionalDto, ['deletedAt', 'clientId', 'date', 'status'])) implements SellingUpdateOneRequest {}

export class SellingDeleteOneRequestDto
	extends IntersectionType(PickType(SellingRequiredDto, ['id']), PickType(RequestOtherFieldsDto, ['method']))
	implements SellingDeleteOneRequest {}
