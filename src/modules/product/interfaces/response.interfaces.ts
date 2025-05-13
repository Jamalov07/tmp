import { GlobalResponse, PaginationResponse } from '@common'
import { ProductRequired } from './fields.interfaces'
import { Decimal } from '@prisma/client/runtime/library'

export declare interface ProductFindManyData extends PaginationResponse<ProductFindOneData> {}

export declare interface ProductFindOneData extends Pick<ProductRequired, 'id' | 'name' | 'createdAt'> {
	lastSellingDate?: Date
	totalCost?: Decimal
}

export declare interface ProductFindManyResponse extends GlobalResponse {
	data: ProductFindManyData
}

export declare interface ProductFindOneResponse extends GlobalResponse {
	data: ProductFindOneData
}

export declare interface ProductModifyResponse extends GlobalResponse {
	data: null
}
