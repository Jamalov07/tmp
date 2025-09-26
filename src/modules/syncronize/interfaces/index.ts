import { SellingStatusEnum, ServiceTypeEnum, UserTypeEnum } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export declare interface IStaff {
	id: string
	name: string
	phone: string
	createdAt: Date
}

export declare interface Staff {
	id: string
	fullname: string
	phone: string
	password: string
	createdAt: Date
	debt: Decimal
	type: UserTypeEnum
	balance?: Decimal
	payments?: StaffPayment[]
	deletedAt?: Date
}

export declare interface ISupplier {
	id: string
	name: string
	phone: string
	debt: number
	createdAt: Date
}

export declare interface Supplier {
	id: string
	fullname: string
	phone: string
	password: string
	createdAt: Date
	type: UserTypeEnum
	balance?: Decimal
	debt: Decimal
	payments?: SupplierPayment[]
	deletedAt?: Date
}

export declare interface IClient {
	id: string
	name: string
	phone: string
	debt: number
	createdAt: Date
}

export declare interface Client {
	id: string
	fullname: string
	phone: string
	password: string
	createdAt: Date
	type: UserTypeEnum
	balance?: Decimal
	debt: Decimal
	payments?: ClientPayment[]
	deletedAt?: Date
}

export declare interface IProduct {
	id: string
	name: string
	cost: number
	count: number
	min_amount: number
	selling_price: number
	createdAt: Date
}

export declare interface Product {
	id: string
	name: string
	cost: Decimal
	count: number
	price: Decimal
	minAmount: number
	createdAt: Date
}

export declare interface IStaffPayment {
	id: string
	sum: number
	description: string
	employee: { id: string; name: string; phone: string }
	createdAt: Date
}

export declare interface StaffPayment {
	id: string
	type: ServiceTypeEnum
	userId: string
	staffId: string
	total: Decimal
	sum: Decimal
	description: string
	createdAt: Date
}

export declare interface ISupplierPayment {
	id: string
	card: number
	cash: number
	other: number
	transfer: number
	totalPay: number
	description: string
	order?: { id: string; sum: number; debt: number }
	supplier: { id: string; name: string; phone: string }
	createdAt: Date
}

export declare interface SupplierPayment {
	id: string
	total: Decimal
	type: ServiceTypeEnum
	userId: string
	staffId: string
	cash: Decimal
	card: Decimal
	other: Decimal
	transfer: Decimal
	description: string
	createdAt: Date
}

export declare interface IClientPayment {
	id: string
	card: number
	cash: number
	other: number
	transfer: number
	totalPay: number
	description: string
	order?: { id: string; sum: number }
	client: { id: string; name: string; phone: string }
	seller: { id: string; name: string; phone: string }
	createdAt: Date
}

export declare interface ClientPayment {
	id: string
	total: Decimal
	type: ServiceTypeEnum
	userId: string
	staffId: string
	cash: Decimal
	card: Decimal
	other: Decimal
	transfer: Decimal
	description: string
	createdAt: Date
}

export declare interface ISelling {
	id: string
	articl: number
	sum: number
	client: { id: string; phone: string; name: string; debt: number }
	seller: { id: string; phone: string; name: string }
	payment: { id: string; totalPay: number; card: number; cash: number; other: number; transfer: number; description: string; createdAt: Date }
	accepted: boolean
	createdAt: Date
	sellingDate: Date
	products: { id: string; cost: number; count: number; price: number; createdAt: Date; product: { id: string; name: string; count: number } }[]
}

export declare interface Selling {
	id: string
	status: SellingStatusEnum
	clientId: string
	date: Date
	staffId: string
	totalPrice: Decimal
	createdAt: Date
	payment?: {
		id: string
		total: Decimal
		card: Decimal
		cash: Decimal
		other: Decimal
		transfer: Decimal
		description: string
		createdAt: Date
		type: ServiceTypeEnum
		staffId: string
		userId: string
	}
	products: {
		id: string
		productId: string
		type: ServiceTypeEnum
		totalPrice: Decimal
		count: number
		price: Decimal
		staffId: string
		createdAt: Date
	}[]
}

export declare interface IArrival {
	id: string
	createdAt: Date
	sellingDate: Date
	supplier: { id: string; phone: string; name: string; debt: number; createdAt: Date }
	admin: { id: string; phone: string; name: string }
	payment: {
		id: string
		totalPay: number
		card: number
		cash: number
		other: number
		transfer: number
		description: string
		createdAt: Date
	}
	incomingProducts: {
		id: string
		cost: number
		count: number
		selling_price: number
		createdAt: Date
		product: { id: string; name: string; count: number }
	}[]
}

export declare interface Arrival {
	id?: string
	supplierId: string
	date: Date
	staffId: string
	totalCost: Decimal
	totalPrice: Decimal
	createdAt: Date
	payment?: {
		id: string
		total: Decimal
		card: Decimal
		cash: Decimal
		other: Decimal
		transfer: Decimal
		description: string
		createdAt: Date
		type: ServiceTypeEnum
		staffId: string
		userId: string
	}
	products?: {
		id?: string
		cost: Decimal
		price: Decimal
		totalPrice: Decimal
		totalCost: Decimal
		type: ServiceTypeEnum
		staffId: string
		count: number
		createdAt: Date
		productId: string
	}[]
}

export declare interface IReturning {
	id: string
	sum: number
	cashPayment: number
	fromClient: number
	description: string
	accepted: boolean
	createdAt: Date
	returnedDate: Date
	client: { id: string; phone: string; name: string; createdAt: Date }
	seller: { id: string; phone: string; name: string }
	products: { id: string; count: number; price: number; createdAt: Date; product: { id: string; name: string; count: number } }[]
}

export declare interface Returning {
	id: string
	clientId: string
	date: Date
	staffId: string
	totalPrice: Decimal
	createdAt: Date
	payment: {
		id: string
		total: Decimal
		fromBalance: Decimal
		cash: Decimal
		description: string
		createdAt: Date
		type: ServiceTypeEnum
		staffId: string
		userId: string
	}
	products: {
		id: string
		productId: string
		type: ServiceTypeEnum
		count: number
		totalPrice: Decimal
		price: Decimal
		staffId: string
		createdAt: Date
	}[]
}
