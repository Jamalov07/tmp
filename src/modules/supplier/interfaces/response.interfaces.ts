import { GlobalResponse, PaginationResponse } from '@common'
import { SupplierRequired } from './fields.interfaces'
import { Decimal } from '@prisma/client/runtime/library'

export declare interface SupplierFindManyData extends PaginationResponse<SupplierFindOneData> {}

export declare interface SupplierFindOneData extends Pick<SupplierRequired, 'id' | 'fullname' | 'createdAt' | 'phone'> {
	lastArrivalDate?: Date
	debt?: Decimal
}

export declare interface SupplierFindManyResponse extends GlobalResponse {
	data: SupplierFindManyData
}

export declare interface SupplierFindOneResponse extends GlobalResponse {
	data: SupplierFindOneData
}

export declare interface SupplierCreateOneResponse extends GlobalResponse {
	data: SupplierFindOneData
}

export declare interface SupplierModifyResponse extends GlobalResponse {
	data: null
}
