import { PaginationRequest, RequestOtherFields } from '@common'
import { SellingOptional, SellingRequired } from './fields.interfaces'
import { ClientPaymentRequired } from '../../client-payment'

export declare interface SellingFindManyRequest
	extends Pick<SellingOptional, 'clientId' | 'staffId' | 'status'>,
		PaginationRequest,
		Pick<RequestOtherFields, 'isDeleted' | 'search' | 'startDate' | 'endDate'> {}

export declare interface SellingFindOneRequest extends Pick<SellingOptional, 'id'> {}

export declare interface SellingGetManyRequest extends SellingOptional, PaginationRequest, Pick<RequestOtherFields, 'ids' | 'isDeleted'> {}

export declare interface SellingGetOneRequest extends SellingOptional, Pick<RequestOtherFields, 'isDeleted'> {}

export declare interface SellingPayment extends Pick<ClientPaymentRequired, 'card' | 'cash' | 'other' | 'transfer' | 'description'> {}

export declare interface SellingCreateOneRequest extends Pick<SellingRequired, 'clientId' | 'date' | 'send' | 'status'>, Pick<SellingOptional, 'staffId' | 'sended'> {
	payment?: SellingPayment
	products?: []
}

export declare interface SellingUpdateOneRequest extends Pick<SellingOptional, 'deletedAt' | 'clientId' | 'date' | 'status'> {}

export declare interface SellingDeleteOneRequest extends Pick<SellingOptional, 'id'>, Pick<RequestOtherFields, 'method'> {}
