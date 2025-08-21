import { Injectable, OnModuleInit } from '@nestjs/common'
import { SyncronizeRepository } from './syncronize.repository'
import axios from 'axios'
import { PrismaService } from '../shared'
import { SellingStatusEnum, ServiceTypeEnum, UserTypeEnum } from '@prisma/client'
import { createResponse } from '../../common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import {
	Arrival,
	Client,
	IArrival,
	IClient,
	IClientPayment,
	IProduct,
	IReturning,
	ISelling,
	IStaff,
	IStaffPayment,
	ISupplier,
	ISupplierPayment,
	Product,
	Returning,
	Selling,
	Staff,
	Supplier,
} from './interfaces'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class Syncronize2Service implements OnModuleInit {
	private baseUrl: string
	private phone: string
	private password: string
	private accessToken = ''

	constructor(
		private readonly syncronizeRepository: SyncronizeRepository,
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
	) {}

	onModuleInit() {
		this.baseUrl = this.configService.getOrThrow('old-service.baseUrl')
		this.phone = this.configService.getOrThrow('old-service.user')
		this.password = this.configService.getOrThrow('old-service.password')
	}

	round = (num: number, digits = 2) => Math.round((num + Number.EPSILON) * Math.pow(10, digits)) / Math.pow(10, digits)

	private async signIn() {
		const url = `${this.baseUrl}/admin/sign-in`
		const response = await axios.post(
			url,
			{ phone: this.phone, password: this.password },
			{ headers: { 'Content-Type': 'application/json' }, timeout: 5000, maxRedirects: 1, proxy: false },
		)
		this.accessToken = response.data.accessToken
	}

	private getHeaders() {
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.accessToken}`,
		}
	}

	private async fetchAllPages<T>(endpoint: string): Promise<T[]> {
		const allData: T[] = []
		const firstPageUrl = `${this.baseUrl}${endpoint}?pageSize=100&pageNumber=1`
		const firstPage = await axios.get(firstPageUrl, {
			headers: this.getHeaders(),
			timeout: 5000,
			maxRedirects: 1,
			proxy: false,
		})

		for (let i = 1; i <= firstPage.data.pageCount; i++) {
			const url = `${this.baseUrl}${endpoint}?pageSize=100&pageNumber=${i}`
			const res = await axios.get(url, {
				headers: this.getHeaders(),
				timeout: 5000,
				maxRedirects: 1,
				proxy: false,
			})
			allData.push(...res.data.data)
		}

		return allData
	}

	async sync() {
		console.log('synchronization started')
		await this.prisma.arrivalModel.deleteMany({})
		await this.prisma.botUserModel.deleteMany({})
		await this.prisma.paymentModel.deleteMany({})
		await this.prisma.productModel.deleteMany({})
		await this.prisma.productMVModel.deleteMany({})
		await this.prisma.returningModel.deleteMany({})
		await this.prisma.sellingModel.deleteMany({})
		await this.prisma.userModel.deleteMany({})

		await this.signIn()

		console.log('started')

		const [
			staffsRemote,
			suppliersRemote,
			clientsRemote,
			productsRemote,
			staffPaymentsRemote,
			supplierPaymentRemote,
			clientPaymentRemote,
			sellingsRemote,
			arrivalsRemote,
			returningsRemote,
		] = await Promise.all([
			this.fetchAllPages<IStaff>('/admin'),
			this.fetchAllPages<ISupplier>('/user/supplier'),
			this.fetchAllPages<IClient>('/user/client'),
			this.fetchAllPages<IProduct>('/product'),
			this.fetchAllPages<IStaffPayment>('/employeePayment'),
			this.fetchAllPages<ISupplierPayment>('/incomingOrderPayment'),
			this.fetchAllPages<IClientPayment>('/payment'),
			this.fetchAllPages<ISelling>('/Order'),
			this.fetchAllPages<IArrival>('/incomingOrder'),
			this.fetchAllPages<IReturning>('/returned-order'),
		])

		console.log('get all success')

		const staffs: Record<string, Staff> = {}
		staffsRemote.forEach((staff) => {
			staffs[staff.id] = {
				id: staff.id,
				phone: staff.phone.trim(),
				fullname: staff.name.trim(),
				password: bcrypt.hashSync(staff.phone.trim(), 7),
				type: UserTypeEnum.staff,
				createdAt: staff.createdAt,
				balance: new Decimal(0),
				debt: new Decimal(0),
				payments: [],
			}
		})

		const suppliers: Record<string, Supplier> = {}
		suppliersRemote.forEach((supplier) => {
			suppliers[supplier.id] = {
				id: supplier.id,
				phone: supplier.phone.trim(),
				fullname: supplier.name.trim(),
				password: bcrypt.hashSync(supplier.phone.trim(), 7),
				type: UserTypeEnum.supplier,
				createdAt: supplier.createdAt,
				payments: [],
				balance: new Decimal(0),
				debt: new Decimal(supplier.debt),
			}
		})

		const clients: Record<string, Client> = {}
		clientsRemote.forEach((client) => {
			clients[client.id] = {
				id: client.id,
				phone: client.phone.trim(),
				fullname: client.name.trim(),
				password: bcrypt.hashSync(client.phone.trim(), 7),
				type: UserTypeEnum.client,
				createdAt: client.createdAt,
				balance: new Decimal(0),
				debt: new Decimal(client.debt),
				payments: [],
			}
		})

		const products: Record<string, Product> = {}
		productsRemote.forEach((product) => {
			products[product.id] = {
				id: product.id,
				name: product.name.trim(),
				cost: new Decimal(product.cost),
				count: product.count,
				price: new Decimal(product.selling_price),
				minAmount: product.min_amount,
				createdAt: product.createdAt,
			}
		})

		staffPaymentsRemote.forEach((staffPayment) => {
			if (!staffs[staffPayment.employee.id]) {
				staffs[staffPayment.employee.id] = {
					id: staffPayment.employee.id,
					createdAt: new Date(),
					fullname: staffPayment.employee.name.trim(),
					phone: staffPayment.employee.phone.trim(),
					password: bcrypt.hashSync(staffPayment.employee.phone.trim(), 7),
					type: UserTypeEnum.staff,
					payments: [],
					balance: new Decimal(0),
					debt: new Decimal(0),
				}
			}

			staffs[staffPayment.employee.id].balance = staffs[staffPayment.employee.id].balance.plus(staffPayment.sum)
			staffs[staffPayment.employee.id].payments.push({
				id: staffPayment.id,
				type: ServiceTypeEnum.staff,
				userId: staffPayment.employee.id,
				staffId: staffPayment.employee.id,
				total: new Decimal(staffPayment.sum),
				sum: new Decimal(staffPayment.sum),
				description: staffPayment.description,
				createdAt: staffPayment.createdAt,
			})
		})

		let mainStaff = Object.values(staffs).find((staff) => staff.phone === this.phone)
		if (!mainStaff) {
			mainStaff = Object.values(staffs)[0]
		}

		const partialArrivals: Partial<Arrival>[] = []

		supplierPaymentRemote.forEach((supplierPayment) => {
			if (!suppliers[supplierPayment.supplier.id]) {
				suppliers[supplierPayment.supplier.id] = {
					id: supplierPayment.supplier.id,
					createdAt: new Date(),
					fullname: supplierPayment.supplier.name.trim(),
					phone: supplierPayment.supplier.phone.trim(),
					password: bcrypt.hashSync(supplierPayment.supplier.phone.trim(), 7),
					type: UserTypeEnum.supplier,
					payments: [],
					balance: new Decimal(0),
					debt: new Decimal(0),
				}
			}

			if (!supplierPayment.order) {
				suppliers[supplierPayment.supplier.id].balance = suppliers[supplierPayment.supplier.id].balance.plus(supplierPayment.totalPay)
				suppliers[supplierPayment.supplier.id].payments.push({
					id: supplierPayment.id,
					type: ServiceTypeEnum.supplier,
					userId: supplierPayment.supplier.id,
					staffId: mainStaff.id,
					total: new Decimal(supplierPayment.totalPay),
					card: new Decimal(supplierPayment.card),
					cash: new Decimal(supplierPayment.cash),
					other: new Decimal(supplierPayment.other),
					transfer: new Decimal(supplierPayment.transfer),
					description: supplierPayment.description,
					createdAt: supplierPayment.createdAt,
				})
			} else {
				partialArrivals.push({
					id: supplierPayment.order.id,
					totalPrice: new Decimal(supplierPayment.order.sum),
					payment: {
						id: supplierPayment.id,
						type: ServiceTypeEnum.arrival,
						userId: supplierPayment.supplier.id,
						staffId: mainStaff.id,
						total: new Decimal(supplierPayment.totalPay),
						card: new Decimal(supplierPayment.card),
						cash: new Decimal(supplierPayment.cash),
						other: new Decimal(supplierPayment.other),
						transfer: new Decimal(supplierPayment.transfer),
						description: supplierPayment.description,
						createdAt: supplierPayment.createdAt,
					},
				})
			}
		})

		const partialSellings: Partial<Selling>[] = []

		clientPaymentRemote.forEach((clientPayment) => {
			if (!clients[clientPayment.client.id]) {
				clients[clientPayment.client.id] = {
					id: clientPayment.client.id,
					createdAt: new Date(),
					fullname: clientPayment.client.name.trim(),
					phone: clientPayment.client.phone.trim(),
					password: bcrypt.hashSync(clientPayment.client.phone.trim(), 7),
					type: UserTypeEnum.client,
					payments: [],
					balance: new Decimal(0),
					debt: new Decimal(0),
				}
			}

			if (!clientPayment.order) {
				clients[clientPayment.client.id].balance = clients[clientPayment.client.id].balance.plus(clientPayment.totalPay)
				clients[clientPayment.client.id].payments.push({
					id: clientPayment.id,
					type: ServiceTypeEnum.client,
					userId: clientPayment.client.id,
					staffId: mainStaff.id,
					total: new Decimal(clientPayment.totalPay),
					card: new Decimal(clientPayment.card),
					cash: new Decimal(clientPayment.cash),
					other: new Decimal(clientPayment.other),
					transfer: new Decimal(clientPayment.transfer),
					description: clientPayment.description,
					createdAt: clientPayment.createdAt,
				})
			} else {
				partialSellings.push({
					id: clientPayment.order.id,
					totalPrice: new Decimal(clientPayment.order.sum),
					payment: {
						id: clientPayment.id,
						type: ServiceTypeEnum.selling,
						userId: clientPayment.client.id,
						staffId: mainStaff.id,
						total: new Decimal(clientPayment.totalPay),
						card: new Decimal(clientPayment.card),
						cash: new Decimal(clientPayment.cash),
						other: new Decimal(clientPayment.other),
						transfer: new Decimal(clientPayment.transfer),
						description: clientPayment.description,
						createdAt: clientPayment.createdAt,
					},
				})
			}
		})

		const sellingsObject: Record<string, Selling> = {}
		sellingsRemote.forEach((selling) => {
			if (!clients[selling.client.id]) {
				clients[selling.client.id] = {
					id: selling.client.id,
					createdAt: new Date(),
					fullname: selling.client.name.trim(),
					phone: selling.client.phone.trim(),
					password: bcrypt.hashSync(selling.client.phone.trim(), 7),
					type: UserTypeEnum.client,
					payments: [],
					balance: new Decimal(0),
					debt: new Decimal(selling.client.debt),
				}
			}

			if (!staffs[selling.seller.id]) {
				staffs[selling.seller.id] = {
					id: selling.seller.id,
					createdAt: new Date(),
					fullname: selling.seller.name.trim(),
					phone: selling.seller.phone.trim(),
					password: bcrypt.hashSync(selling.seller.phone.trim(), 7),
					type: UserTypeEnum.staff,
					payments: [],
					balance: new Decimal(0),
					debt: new Decimal(0),
				}
			}

			const sellingProducts: {
				id: string
				productId: string
				type: ServiceTypeEnum
				totalPrice: Decimal
				count: number
				price: Decimal
				staffId: string
				createdAt: Date
				sellingId: string
			}[] = []

			let totalPrice = new Decimal(0)
			selling.products.forEach((product) => {
				if (!products[product.product.id]) {
					products[product.product.id] = {
						id: product.product.id,
						count: product.product.count,
						name: product.product.name,
						cost: new Decimal(product.cost),
						price: new Decimal(product.price),
						minAmount: 1,
						createdAt: new Date(),
					}
				}
				totalPrice = totalPrice.plus(new Decimal(product.price).mul(product.count))
				sellingProducts.push({
					id: product.id,
					sellingId: selling.id,
					count: product.count,
					price: new Decimal(product.price),
					createdAt: product.createdAt,
					type: ServiceTypeEnum.selling,
					staffId: staffs[selling.seller.id].id,
					totalPrice: new Decimal(product.price).mul(product.count),
					productId: products[product.product.id].id,
				})
			})

			sellingsObject[selling.id] = {
				id: selling.id,
				clientId: clients[selling.client.id].id,
				staffId: staffs[selling.seller.id].id,
				date: selling.sellingDate,
				status: selling.accepted ? SellingStatusEnum.accepted : SellingStatusEnum.notaccepted,
				totalPrice: totalPrice,
				createdAt: selling.createdAt,
				products: sellingProducts,
				payment: selling.payment
					? {
							id: selling.payment.id,
							card: new Decimal(selling.payment.card),
							cash: new Decimal(selling.payment.cash),
							other: new Decimal(selling.payment.other),
							transfer: new Decimal(selling.payment.transfer),
							total: new Decimal(selling.payment.totalPay),
							description: selling.payment.description,
							type: ServiceTypeEnum.selling,
							staffId: staffs[selling.seller.id].id,
							userId: clients[selling.client.id].id,
							createdAt: selling.payment.createdAt,
						}
					: undefined,
			}
		})

		const arrivalsObject: Record<string, Arrival> = {}
		arrivalsRemote.forEach((arrival) => {
			if (!suppliers[arrival.supplier.id]) {
				suppliers[arrival.supplier.id] = {
					id: arrival.supplier.id,
					createdAt: arrival.supplier.createdAt,
					fullname: arrival.supplier.name.trim(),
					phone: arrival.supplier.phone.trim(),
					password: bcrypt.hashSync(arrival.supplier.phone.trim(), 7),
					type: UserTypeEnum.supplier,
					payments: [],
					balance: new Decimal(0),
					debt: new Decimal(arrival.supplier.debt),
				}
			}

			if (!staffs[arrival.admin.id]) {
				staffs[arrival.admin.id] = {
					id: arrival.admin.id,
					createdAt: new Date(),
					fullname: arrival.admin.name.trim(),
					phone: arrival.admin.phone.trim(),
					password: bcrypt.hashSync(arrival.admin.phone.trim(), 7),
					type: UserTypeEnum.staff,
					payments: [],
					balance: new Decimal(0),
					debt: new Decimal(0),
				}
			}

			const arrivalProducts: {
				id: string
				cost: Decimal
				price: Decimal
				count: number
				totalPrice: Decimal
				totalCost: Decimal
				productId: string
				createdAt: Date
				type: ServiceTypeEnum
				staffId: string
				arrivalId: string
			}[] = []

			let totalPrice = new Decimal(0)
			let totalCost = new Decimal(0)
			arrival.incomingProducts.forEach((product) => {
				if (!products[product.product.id]) {
					products[product.product.id] = {
						id: product.product.id,
						count: product.product.count,
						name: product.product.name,
						cost: new Decimal(product.cost),
						price: new Decimal(product.selling_price),
						minAmount: 1,
						createdAt: new Date(),
					}
				}
				totalPrice = totalPrice.plus(new Decimal(product.selling_price).mul(product.count))
				totalCost = totalCost.plus(new Decimal(product.cost).mul(product.count))

				arrivalProducts.push({
					id: product.id,
					arrivalId: arrival.id,
					count: product.count,
					price: new Decimal(product.selling_price),
					cost: new Decimal(product.cost),
					createdAt: product.createdAt,
					type: ServiceTypeEnum.arrival,
					staffId: staffs[arrival.admin.id].id,
					totalCost: new Decimal(new Decimal(product.cost).mul(product.count)),
					totalPrice: new Decimal(new Decimal(product.selling_price).mul(product.count)),
					productId: products[product.product.id].id,
				})
			})

			arrivalsObject[arrival.id] = {
				id: arrival.id,
				supplierId: suppliers[arrival.supplier.id].id,
				staffId: staffs[arrival.admin.id].id,
				date: arrival.sellingDate,
				totalPrice: totalPrice,
				totalCost: totalCost,
				createdAt: arrival.createdAt,
				products: arrivalProducts,
				payment: arrival.payment
					? {
							id: arrival.payment.id,
							card: new Decimal(arrival.payment.card),
							cash: new Decimal(arrival.payment.cash),
							other: new Decimal(arrival.payment.other),
							transfer: new Decimal(arrival.payment.transfer),
							total: new Decimal(arrival.payment.totalPay),
							description: arrival.payment.description,
							type: ServiceTypeEnum.arrival,
							staffId: staffs[arrival.admin.id].id,
							userId: suppliers[arrival.supplier.id].id,
							createdAt: arrival.payment.createdAt,
						}
					: undefined,
			}
		})

		const returningsObject: Record<string, Returning> = {}
		returningsRemote.forEach((returning) => {
			if (!clients[returning.client.id]) {
				clients[returning.client.id] = {
					id: returning.client.id,
					createdAt: returning.client.createdAt,
					fullname: returning.client.name.trim(),
					phone: returning.client.phone.trim(),
					password: bcrypt.hashSync(returning.client.phone.trim(), 7),
					type: UserTypeEnum.client,
					payments: [],
					balance: new Decimal(0),
					debt: new Decimal(0),
				}
			}

			if (!staffs[returning.seller.id]) {
				staffs[returning.seller.id] = {
					id: returning.seller.id,
					createdAt: new Date(),
					fullname: returning.seller.name.trim(),
					phone: returning.seller.phone.trim(),
					password: bcrypt.hashSync(returning.seller.phone.trim(), 7),
					type: UserTypeEnum.staff,
					payments: [],
					balance: new Decimal(0),
					debt: new Decimal(0),
				}
			}

			const returningProducts: {
				id: string
				price: Decimal
				count: number
				totalPrice: Decimal
				productId: string
				createdAt: Date
				type: ServiceTypeEnum
				staffId: string
				returningId: string
			}[] = []

			let totalPrice = new Decimal(0)
			returning.products.forEach((product) => {
				if (!products[product.product.id]) {
					products[product.product.id] = {
						id: product.product.id,
						count: product.product.count,
						name: product.product.name,
						cost: new Decimal(product.price),
						price: new Decimal(product.price),
						minAmount: 1,
						createdAt: new Date(),
					}
				}
				totalPrice = totalPrice.plus(new Decimal(product.price).mul(product.count))

				returningProducts.push({
					id: product.id,
					returningId: returning.id,
					count: product.count,
					price: new Decimal(product.price),
					createdAt: product.createdAt,
					type: ServiceTypeEnum.returning,
					staffId: staffs[returning.seller.id].id,
					totalPrice: new Decimal(product.price).mul(product.count),
					productId: products[product.product.id].id,
				})
			})

			returningsObject[returning.id] = {
				id: returning.id,
				clientId: clients[returning.client.id].id,
				staffId: staffs[returning.seller.id].id,
				date: returning.returnedDate,
				totalPrice: totalPrice,
				createdAt: returning.createdAt,
				products: returningProducts,
				payment: {
					id: returning.id,
					fromBalance: new Decimal(returning.fromClient || 0),
					cash: new Decimal(returning.cashPayment || 0),
					total: new Decimal(returning.sum || 0),
					description: returning.description,
					type: ServiceTypeEnum.returning,
					staffId: staffs[returning.seller.id].id,
					userId: clients[returning.client.id].id,
					createdAt: returning.createdAt,
				},
			}
		})

		const arrivals = Object.values(arrivalsObject)
		for (const supplier of Object.values(suppliers)) {
			let totalArrivalCost = new Decimal(0)
			let totalArrivalPayment = new Decimal(0)
			for (const arrival of arrivals) {
				if (arrival.supplierId === supplier.id) {
					totalArrivalCost = totalArrivalCost.plus(arrival.totalCost)
					totalArrivalPayment = totalArrivalPayment.plus(arrival.payment?.total || new Decimal(0))
				}
			}

			const newDebt = supplier.balance.minus(totalArrivalCost.minus(totalArrivalPayment))
			const diff = supplier.debt.minus(newDebt)

			if (!diff.isZero()) {
				suppliers[supplier.id] = {
					...supplier,
					payments: [
						{
							id: uuidv4(),
							total: diff,
							other: diff,
							type: ServiceTypeEnum.supplier,
							userId: supplier.id,
							staffId: mainStaff.id,
							cash: new Decimal(0),
							card: new Decimal(0),
							transfer: new Decimal(0),
							description: `import qilingan boshlang'ich qiymat ${diff.toFixed(2)}`,
							createdAt: new Date('01-01-2025'),
						},
						...supplier.payments,
					],
					balance: supplier.balance.plus(diff),
				}
			}
		}

		const sellings = Object.values(sellingsObject)
		for (const client of Object.values(clients)) {
			let totalSellingPrice = new Decimal(0)
			let totalSellingPayment = new Decimal(0)
			for (const selling of sellings) {
				if (selling.clientId === client.id) {
					totalSellingPrice = totalSellingPrice.plus(selling.totalPrice)
					totalSellingPayment = totalSellingPayment.plus(selling.payment?.total || 0)
				}
			}

			const sellingDebt = totalSellingPrice.minus(totalSellingPayment)
			const newDebt = sellingDebt.minus(client.balance)

			const diff = client.debt.minus(newDebt)

			if (!diff.isZero()) {
				clients[client.id] = {
					...client,
					payments: [
						{
							id: uuidv4(),
							total: diff,
							other: diff,
							type: ServiceTypeEnum.client,
							userId: client.id,
							staffId: mainStaff.id,
							cash: new Decimal(0),
							card: new Decimal(0),
							transfer: new Decimal(0),
							description: `import qilingan boshlang'ich qiymat ${diff.toFixed(2)}`,
							createdAt: new Date('01-01-2025'),
						},
						...client.payments,
					],
					balance: client.balance.plus(diff),
				}
			}
		}

		const newStaffs = await this.prisma.userModel.createMany({
			skipDuplicates: false,
			data: Object.values(staffs)
				.filter((u) => u.phone && u.fullname)
				.map((staff) => ({
					id: staff.id,
					balance: staff.balance,
					phone: staff.phone,
					password: staff.password,
					fullname: staff.fullname,
					type: UserTypeEnum.staff,
					createdAt: staff.createdAt,
				})),
		})

		const newStaffPayments = await this.prisma.paymentModel.createMany({
			skipDuplicates: false,
			data: Object.values(staffs)
				.filter((u) => u.phone && u.fullname)
				.flatMap((staff) =>
					staff.payments.map((payment) => ({
						id: payment.id,
						type: ServiceTypeEnum.staff,
						userId: payment.userId,
						staffId: payment.staffId,
						sum: payment.sum,
						total: payment.total,
						createdAt: payment.createdAt,
						description: payment.description,
					})),
				),
		})

		const newSuppliers = await this.prisma.userModel.createMany({
			skipDuplicates: false,
			data: Object.values(suppliers)
				.filter((u) => u.phone && u.fullname)
				.map((supplier) => ({
					id: supplier.id,
					balance: supplier.balance,
					phone: supplier.phone,
					password: supplier.password,
					fullname: supplier.fullname,
					type: UserTypeEnum.supplier,
					createdAt: supplier.createdAt,
				})),
		})

		const newSupplierPayments = await this.prisma.paymentModel.createMany({
			skipDuplicates: false,
			data: Object.values(suppliers)
				.filter((u) => u.phone && u.fullname)
				.flatMap((supplier) =>
					supplier.payments.map((payment) => ({
						id: payment.id,
						type: ServiceTypeEnum.supplier,
						userId: payment.userId,
						staffId: payment.staffId,
						cash: payment.cash,
						card: payment.card,
						other: payment.other,
						transfer: payment.transfer,
						total: payment.total,
						createdAt: payment.createdAt,
						description: payment.description,
					})),
				),
		})

		const newClients = await this.prisma.userModel.createMany({
			skipDuplicates: false,
			data: Object.values(clients)
				.filter((u) => u.phone && u.fullname)
				.map((client) => ({
					id: client.id,
					balance: client.balance,
					phone: client.phone,
					password: client.password,
					fullname: client.fullname,
					type: UserTypeEnum.client,
					createdAt: client.createdAt,
				})),
		})

		const newClientPayments = await this.prisma.paymentModel.createMany({
			skipDuplicates: false,
			data: Object.values(clients)
				.filter((u) => u.phone && u.fullname)
				.flatMap((client) =>
					client.payments.map((payment) => ({
						id: payment.id,
						type: ServiceTypeEnum.client,
						userId: payment.userId,
						staffId: payment.staffId,
						cash: payment.cash,
						card: payment.card,
						other: payment.other,
						transfer: payment.transfer,
						total: payment.total,
						createdAt: payment.createdAt,
						description: payment.description,
					})),
				),
		})

		const newProducts = await this.prisma.productModel.createMany({
			skipDuplicates: false,
			data: Object.values(products).map((product) => ({
				id: product.id,
				name: product.name,
				cost: product.cost,
				price: product.price,
				count: product.count,
				minAmount: product.minAmount,
				createdAt: product.createdAt,
			})),
		})

		// Arrivals
		const newArrivals = await this.prisma.arrivalModel.createMany({
			skipDuplicates: false,
			data: Object.values(arrivalsObject).map((arrival) => ({
				id: arrival.id,
				supplierId: arrival.supplierId,
				staffId: arrival.staffId,
				date: arrival.date,
				totalPrice: arrival.totalPrice,
				totalCost: arrival.totalCost,
				createdAt: arrival.createdAt,
			})),
		})

		// Arrival Products
		await this.prisma.productMVModel.createMany({
			skipDuplicates: false,
			data: Object.values(arrivalsObject).flatMap((arrival) =>
				arrival.products.map((product) => ({
					id: product.id,
					productId: product.productId,
					arrivalId: arrival.id,
					type: product.type,
					staffId: product.staffId,
					count: product.count,
					cost: product.cost,
					price: product.price,
					totalPrice: product.totalPrice,
					totalCost: product.totalCost,
					createdAt: product.createdAt,
				})),
			),
		})

		// Arrival Payments
		await this.prisma.paymentModel.createMany({
			skipDuplicates: false,
			data: Object.values(arrivalsObject)
				.filter((a) => a.payment)
				.map((arrival) => ({
					id: arrival.payment.id,
					type: ServiceTypeEnum.arrival,
					arrivalId: arrival.id,
					userId: arrival.payment.userId,
					staffId: arrival.payment.staffId,
					cash: arrival.payment.cash,
					card: arrival.payment.card,
					other: arrival.payment.other,
					transfer: arrival.payment.transfer,
					total: arrival.payment.total,
					createdAt: arrival.payment.createdAt,
					description: arrival.payment.description,
				})),
		})

		// Sellings
		const newSellings = await this.prisma.sellingModel.createMany({
			skipDuplicates: false,
			data: Object.values(sellingsObject)
				.filter((s) => s.clientId)
				.map((selling) => ({
					id: selling.id,
					clientId: selling.clientId,
					staffId: selling.staffId,
					date: selling.date,
					totalPrice: selling.totalPrice,
					status: selling.status,
					createdAt: selling.createdAt,
				})),
		})

		// Selling Products
		await this.prisma.productMVModel.createMany({
			skipDuplicates: false,
			data: Object.values(sellingsObject).flatMap((selling) =>
				selling.products.map((product) => ({
					id: product.id,
					productId: product.productId,
					sellingId: selling.id,
					type: product.type,
					staffId: product.staffId,
					count: product.count,
					price: product.price,
					totalPrice: product.totalPrice,
					createdAt: product.createdAt,
				})),
			),
		})

		// Selling Payments
		await this.prisma.paymentModel.createMany({
			skipDuplicates: false,
			data: Object.values(sellingsObject)
				.filter((s) => s.payment)
				.map((selling) => ({
					id: selling.payment.id,
					type: ServiceTypeEnum.selling,
					userId: selling.payment.userId,
					staffId: selling.payment.staffId,
					sellingId: selling.id,
					cash: selling.payment.cash,
					card: selling.payment.card,
					other: selling.payment.other,
					transfer: selling.payment.transfer,
					total: selling.payment.total,
					createdAt: selling.payment.createdAt,
					description: selling.payment.description,
				})),
		})

		// Returnings
		const newReturnings = await this.prisma.returningModel.createMany({
			skipDuplicates: false,
			data: Object.values(returningsObject).map((returning) => ({
				id: returning.id,
				clientId: returning.clientId,
				staffId: returning.staffId,
				date: returning.date,
				totalPrice: returning.totalPrice,
				createdAt: returning.createdAt,
			})),
		})

		// Returning Products
		await this.prisma.productMVModel.createMany({
			skipDuplicates: false,
			data: Object.values(returningsObject).flatMap((returning) =>
				returning.products.map((product) => ({
					id: product.id,
					productId: product.productId,
					returningId: returning.id,
					type: product.type,
					staffId: product.staffId,
					count: product.count,
					price: product.price,
					totalPrice: product.totalPrice,
					createdAt: product.createdAt,
				})),
			),
		})

		// Returning Payments
		await this.prisma.paymentModel.createMany({
			skipDuplicates: false,
			data: Object.values(returningsObject).map((returning) => ({
				id: returning.payment.id,
				type: ServiceTypeEnum.returning,
				userId: returning.payment.userId,
				returningId: returning.id,
				staffId: returning.payment.staffId,
				fromBalance: returning.payment.fromBalance,
				cash: returning.payment.cash,
				total: returning.payment.total,
				createdAt: returning.payment.createdAt,
				description: returning.payment.description,
			})),
		})
		console.log(newStaffs.count, newSuppliers.count, newClients.count, newProducts.count)
		console.log(newStaffPayments.count, newSupplierPayments.count, newClientPayments.count)
		console.log(newSellings.count, newArrivals.count, newReturnings.count)

		return createResponse({ data: {}, success: { messages: ['syncronize success'] } })
	}
}
