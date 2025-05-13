import { GlobalResponse, PaginationResponse } from '@common'
import { SupplierPaymentRequired } from './fields.interfaces'

export declare interface SupplierPaymentFindManyData extends PaginationResponse<SupplierPaymentFindOneData> {}

export declare interface SupplierPaymentFindOneData extends Pick<SupplierPaymentRequired, 'id' | 'description' | 'createdAt'> {}

export declare interface SupplierPaymentFindManyResponse extends GlobalResponse {
	data: SupplierPaymentFindManyData
}

export declare interface SupplierPaymentFindOneResponse extends GlobalResponse {
	data: SupplierPaymentFindOneData
}

export declare interface SupplierPaymentCreateOneResponse extends GlobalResponse {
	data: SupplierPaymentFindOneData
}

export declare interface SupplierPaymentModifyResponse extends GlobalResponse {
	data: null
}
