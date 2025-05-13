import { PaginationRequest, RequestOtherFields } from '@common'
import { ArrivalOptional, ArrivalRequired } from './fields.interfaces'

export declare interface ArrivalFindManyRequest extends Pick<ArrivalOptional, 'supplierId' | 'staffId'>, PaginationRequest, Pick<RequestOtherFields, 'isDeleted' | 'search'> {}

export declare interface ArrivalFindOneRequest extends Pick<ArrivalOptional, 'id'> {}

export declare interface ArrivalGetManyRequest extends ArrivalOptional, PaginationRequest, Pick<RequestOtherFields, 'ids' | 'isDeleted'> {}

export declare interface ArrivalGetOneRequest extends ArrivalOptional, Pick<RequestOtherFields, 'isDeleted'> {}

export declare interface ArrivalCreateOneRequest extends Pick<ArrivalRequired, 'supplierId' | 'date'>, Pick<ArrivalOptional, 'staffId'> {}

export declare interface ArrivalUpdateOneRequest extends Pick<ArrivalOptional, 'deletedAt' | 'supplierId' | 'date'> {}

export declare interface ArrivalDeleteOneRequest extends Pick<ArrivalOptional, 'id'>, Pick<RequestOtherFields, 'method'> {}
