import { PickType, IntersectionType } from '@nestjs/swagger'
import { ArrivalCreateOneRequest, ArrivalDeleteOneRequest, ArrivalFindManyRequest, ArrivalFindOneRequest, ArrivalUpdateOneRequest } from '../interfaces'
import { PaginationRequestDto, RequestOtherFieldsDto } from '@common'
import { ArrivalOptionalDto, ArrivalRequiredDto } from './fields.dtos'

export class ArrivalFindManyRequestDto
	extends IntersectionType(PickType(ArrivalOptionalDto, ['supplierId', 'staffId']), PaginationRequestDto, PickType(RequestOtherFieldsDto, ['search']))
	implements ArrivalFindManyRequest {}

export class ArrivalFindOneRequestDto extends IntersectionType(PickType(ArrivalRequiredDto, ['id'])) implements ArrivalFindOneRequest {}

export class ArrivalCreateOneRequestDto extends IntersectionType(PickType(ArrivalRequiredDto, ['supplierId', 'date'])) implements ArrivalCreateOneRequest {}

export class ArrivalUpdateOneRequestDto extends IntersectionType(PickType(ArrivalOptionalDto, ['deletedAt', 'supplierId', 'date'])) implements ArrivalUpdateOneRequest {}

export class ArrivalDeleteOneRequestDto
	extends IntersectionType(PickType(ArrivalRequiredDto, ['id']), PickType(RequestOtherFieldsDto, ['method']))
	implements ArrivalDeleteOneRequest {}
