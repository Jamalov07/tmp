import { PaginationRequest, RequestOtherFields } from '@common'
import { ReturningOptional, ReturningRequired } from './fields.interfaces'

export declare interface ReturningFindManyRequest extends Pick<ReturningOptional, 'clientId' | 'staffId'>, PaginationRequest, Pick<RequestOtherFields, 'isDeleted' | 'search'> {}

export declare interface ReturningFindOneRequest extends Pick<ReturningOptional, 'id'> {}

export declare interface ReturningGetManyRequest extends ReturningOptional, PaginationRequest, Pick<RequestOtherFields, 'ids' | 'isDeleted'> {}

export declare interface ReturningGetOneRequest extends ReturningOptional, Pick<RequestOtherFields, 'isDeleted'> {}

export declare interface ReturningCreateOneRequest extends Pick<ReturningRequired, 'clientId' | 'date'>, Pick<ReturningOptional, 'staffId'> {}

export declare interface ReturningUpdateOneRequest extends Pick<ReturningOptional, 'deletedAt' | 'clientId' | 'date'> {}

export declare interface ReturningDeleteOneRequest extends Pick<ReturningOptional, 'id'>, Pick<RequestOtherFields, 'method'> {}
