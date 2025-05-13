import { PickType, IntersectionType } from '@nestjs/swagger'
import { SupplierCreateOneRequest, SupplierDeleteOneRequest, SupplierFindManyRequest, SupplierFindOneRequest, SupplierUpdateOneRequest } from '../interfaces'
import { PaginationRequestDto, RequestOtherFieldsDto } from '@common'
import { SupplierOptionalDto, SupplierRequiredDto } from './fields.dtos'

export class SupplierFindManyRequestDto
	extends IntersectionType(PickType(SupplierOptionalDto, ['fullname', 'phone']), PaginationRequestDto, PickType(RequestOtherFieldsDto, ['search', 'debtType', 'debtValue']))
	implements SupplierFindManyRequest {}

export class SupplierFindOneRequestDto extends IntersectionType(PickType(SupplierRequiredDto, ['id'])) implements SupplierFindOneRequest {}

export class SupplierCreateOneRequestDto extends IntersectionType(PickType(SupplierRequiredDto, ['fullname', 'phone'])) implements SupplierCreateOneRequest {}

export class SupplierUpdateOneRequestDto extends IntersectionType(PickType(SupplierOptionalDto, ['deletedAt', 'fullname', 'phone'])) implements SupplierUpdateOneRequest {}

export class SupplierDeleteOneRequestDto
	extends IntersectionType(PickType(SupplierRequiredDto, ['id']), PickType(RequestOtherFieldsDto, ['method']))
	implements SupplierDeleteOneRequest {}
