import { Request } from 'express'
import { DebtTypeEnum, DeleteMethodEnum } from '../enums'

export declare interface RequestOtherFields {
	ids?: string[]
	search?: string
	method?: DeleteMethodEnum
	isDeleted?: boolean
	rolesToConnect?: string[]
	rolesToDisconnect?: string[]
	actionsToConnect?: string[]
	actionsToDisconnect?: string[]
	startDate?: Date
	endDate?: Date
	debtValue?: number
	debtType?: DebtTypeEnum
}

export declare interface CRequest extends Request {
	user?: { id: string; token?: string }
}
