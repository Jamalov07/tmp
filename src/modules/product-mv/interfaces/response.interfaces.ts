import { GlobalResponse, PaginationResponse } from '@common'
import { ProductMVRequired } from './fields.interfaces'
import { ProductFindOneData } from '../../product/interfaces'

export declare interface ProductMVFindManyData extends PaginationResponse<ProductMVFindOneData> {}

export declare interface ProductMVFindOneData extends Pick<ProductMVRequired, 'id' | 'createdAt' | 'count' | 'price'> {
	product?: ProductFindOneData
}

export declare interface ProductMVFindManyResponse extends GlobalResponse {
	data: ProductMVFindManyData
}

export declare interface ProductMVFindOneResponse extends GlobalResponse {
	data: ProductMVFindOneData
}

export declare interface ProductMVModifyResponse extends GlobalResponse {
	data: null
}
