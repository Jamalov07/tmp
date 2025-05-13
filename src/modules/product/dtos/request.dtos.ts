import { PickType, IntersectionType } from '@nestjs/swagger'
import { ProductCreateOneRequest, ProductDeleteOneRequest, ProductFindManyRequest, ProductFindOneRequest, ProductUpdateOneRequest } from '../interfaces'
import { PaginationRequestDto, RequestOtherFieldsDto } from '@common'
import { ProductOptionalDto, ProductRequiredDto } from './fields.dtos'

export class ProductFindManyRequestDto extends IntersectionType(PickType(ProductOptionalDto, ['name']), PaginationRequestDto) implements ProductFindManyRequest {}

export class ProductFindOneRequestDto extends IntersectionType(PickType(ProductRequiredDto, ['id'])) implements ProductFindOneRequest {}

export class ProductCreateOneRequestDto
	extends IntersectionType(PickType(ProductRequiredDto, ['name', 'cost', 'count', 'minAmount', 'price']))
	implements ProductCreateOneRequest {}

export class ProductUpdateOneRequestDto
	extends IntersectionType(PickType(ProductOptionalDto, ['name', 'deletedAt', 'cost', 'count', 'minAmount', 'price']))
	implements ProductUpdateOneRequest {}

export class ProductDeleteOneRequestDto
	extends IntersectionType(PickType(ProductRequiredDto, ['id']), PickType(RequestOtherFieldsDto, ['method']))
	implements ProductDeleteOneRequest {}
