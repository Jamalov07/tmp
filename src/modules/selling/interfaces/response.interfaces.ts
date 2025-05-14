import { GlobalResponse, PaginationResponse } from '@common'
import { SellingRequired } from './fields.interfaces'
import { ClientFindOneData } from '../../client'
import { StaffFindOneData } from '../../staff'
import { Decimal } from '@prisma/client/runtime/library'

export declare interface SellingCalc {
	totalPrice: Decimal
	totalPayment: Decimal
	totalCardPayment: Decimal
	totalCashPayment: Decimal
	totalOtherPayment: Decimal
	totalTransferPayment: Decimal
	totalDebt: Decimal
}
export declare interface SellingFindManyData extends PaginationResponse<SellingFindOneData> {
	calc: SellingCalc
}

export declare interface SellingFindOneData extends Pick<SellingRequired, 'id' | 'status' | 'createdAt' | 'date' | 'send' | 'sended'> {
	client?: ClientFindOneData
	staff?: StaffFindOneData
	debt?: Decimal
	totalPayment?: Decimal
	totalPrice?: Decimal
}

export declare interface SellingFindManyResponse extends GlobalResponse {
	data: SellingFindManyData
}

export declare interface SellingFindOneResponse extends GlobalResponse {
	data: SellingFindOneData
}

export declare interface SellingCreateOneResponse extends GlobalResponse {
	data: SellingFindOneData
}

export declare interface SellingModifyResponse extends GlobalResponse {
	data: null
}
