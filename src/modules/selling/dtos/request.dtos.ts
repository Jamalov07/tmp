import { PickType, IntersectionType } from '@nestjs/swagger'
import { SellingCreateOneRequest, SellingDeleteOneRequest, SellingFindManyRequest, SellingFindOneRequest, SellingUpdateOneRequest } from '../interfaces'
import { PaginationRequestDto, RequestOtherFieldsDto } from '@common'
import { SellingOptionalDto, SellingRequiredDto } from './fields.dtos'

export class SellingFindManyRequestDto
	extends IntersectionType(PickType(SellingOptionalDto, ['clientId', 'staffId', 'status']), PaginationRequestDto, PickType(RequestOtherFieldsDto, ['search']))
	implements SellingFindManyRequest {}

export class SellingFindOneRequestDto extends IntersectionType(PickType(SellingRequiredDto, ['id'])) implements SellingFindOneRequest {}

export class SellingCreateOneRequestDto
	extends IntersectionType(PickType(SellingRequiredDto, ['clientId', 'date', 'send', 'status']), PickType(SellingOptionalDto, ['staffId']))
	implements SellingCreateOneRequest {}

export class SellingUpdateOneRequestDto extends IntersectionType(PickType(SellingOptionalDto, ['deletedAt', 'clientId', 'date', 'status'])) implements SellingUpdateOneRequest {}

export class SellingDeleteOneRequestDto
	extends IntersectionType(PickType(SellingRequiredDto, ['id']), PickType(RequestOtherFieldsDto, ['method']))
	implements SellingDeleteOneRequest {}
