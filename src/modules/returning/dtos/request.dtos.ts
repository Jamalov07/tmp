import { PickType, IntersectionType } from '@nestjs/swagger'
import { ReturningCreateOneRequest, ReturningDeleteOneRequest, ReturningFindManyRequest, ReturningFindOneRequest, ReturningUpdateOneRequest } from '../interfaces'
import { PaginationRequestDto, RequestOtherFieldsDto } from '@common'
import { ReturningOptionalDto, ReturningRequiredDto } from './fields.dtos'

export class ReturningFindManyRequestDto
	extends IntersectionType(PickType(ReturningOptionalDto, ['clientId', 'staffId']), PaginationRequestDto, PickType(RequestOtherFieldsDto, ['search']))
	implements ReturningFindManyRequest {}

export class ReturningFindOneRequestDto extends IntersectionType(PickType(ReturningRequiredDto, ['id'])) implements ReturningFindOneRequest {}

export class ReturningCreateOneRequestDto extends IntersectionType(PickType(ReturningRequiredDto, ['clientId', 'date'])) implements ReturningCreateOneRequest {}

export class ReturningUpdateOneRequestDto extends IntersectionType(PickType(ReturningOptionalDto, ['deletedAt', 'clientId', 'date'])) implements ReturningUpdateOneRequest {}

export class ReturningDeleteOneRequestDto
	extends IntersectionType(PickType(ReturningRequiredDto, ['id']), PickType(RequestOtherFieldsDto, ['method']))
	implements ReturningDeleteOneRequest {}
