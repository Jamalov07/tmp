import { PaginationRequest, RequestOtherFields } from '@common'
import { ProductOptional, ProductRequired } from './fields.interfaces'

export declare interface ProductFindManyRequest extends Pick<ProductOptional, 'name'>, PaginationRequest {}

export declare interface ProductFindOneRequest extends Pick<ProductRequired, 'id'> {}

export declare interface ProductGetManyRequest extends ProductOptional, PaginationRequest, Pick<RequestOtherFields, 'ids'> {}

export declare interface ProductGetOneRequest extends ProductOptional {}

export declare interface ProductCreateOneRequest extends Pick<ProductRequired, 'name' | 'cost' | 'count' | 'minAmount' | 'price'> {}

export declare interface ProductUpdateOneRequest extends Pick<ProductOptional, 'name' | 'deletedAt' | 'cost' | 'count' | 'minAmount' | 'price'> {}

export declare interface ProductDeleteOneRequest extends Pick<ProductOptional, 'id'> {}
