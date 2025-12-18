import { Injectable, OnModuleInit } from '@nestjs/common'
import { SyncronizeRepository } from './syncronize.repository'
import axios from 'axios'
import { PrismaService } from '../shared'
import { ServiceTypeEnum, UserTypeEnum } from '@prisma/client'
import { createResponse } from '../../common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { Arrival, Client, IClient, IProduct, IStaff, ISupplier, Product, Staff, Supplier } from './interfaces'
import { Decimal } from '@prisma/client/runtime/library'
import https from 'https'
import pLimit from 'p-limit'
const limit = pLimit(1)

@Injectable()
export class Syncronize3Service implements OnModuleInit {
	private baseUrl: string
	private phone: string
	private password: string
	private accessToken = ''

	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
	) {}

	onModuleInit() {
		this.baseUrl = this.configService.getOrThrow('old-service.baseUrl')
		this.phone = this.configService.getOrThrow('old-service.user')
		this.password = this.configService.getOrThrow('old-service.password')
	}

	sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

	round = (num: number, digits = 2) => Math.round((num + Number.EPSILON) * Math.pow(10, digits)) / Math.pow(10, digits)

	private async signIn() {
		const url = `${this.baseUrl}/admin/sign-in`
		const response = await axios.post(
			url,
			{ phone: this.phone, password: this.password },
			{
				headers: { 'Content-Type': 'application/json' },
				timeout: 30000,
				maxRedirects: 1,
				proxy: false,
				httpsAgent: new https.Agent({
					keepAlive: true,
					maxSockets: 5,
				}),
			},
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
			timeout: 30000,
			maxRedirects: 1,
			proxy: false,
			httpsAgent: new https.Agent({
				keepAlive: true,
				maxSockets: 5,
			}),
		})

		for (let i = 1; i <= firstPage.data.pageCount; i++) {
			await this.sleep(100) // 🔥 100–200 ms ideal
			const url = `${this.baseUrl}${endpoint}?pageSize=100&pageNumber=${i}`
			const res = await axios.get(url, {
				headers: this.getHeaders(),
				timeout: 30000,
				maxRedirects: 1,
				proxy: false,
				httpsAgent: new https.Agent({
					keepAlive: true,
					maxSockets: 5,
				}),
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

		// const [staffsRemote, suppliersRemote, clientsRemote, productsRemote] = await Promise.all([
		// 	this.fetchAllPages<IStaff>('/admin'),
		// 	this.fetchAllPages<ISupplier>('/user/supplier'),
		// 	this.fetchAllPages<IClient>('/user/client'),
		// 	this.fetchAllPages<IProduct>('/product'),
		// ])

		// const [staffsRemote, suppliersRemote, clientsRemote, productsRemote] = await Promise.all([
		// 	limit(() => this.fetchAllPages('/admin')),
		// 	limit(() => this.fetchAllPages('/user/supplier')),
		// 	limit(() => this.fetchAllPages('/user/client')),
		// 	limit(() => this.fetchAllPages('/product')),
		// ])

		const staffsRemote = await this.fetchAllPages<IStaff>('/admin')
		console.log(staffsRemote.length)
		const suppliersRemote = await this.fetchAllPages<ISupplier>('/user/supplier')
		console.log(suppliersRemote.length)
		const clientsRemote = await this.fetchAllPages<IClient>('/user/client')
		console.log(clientsRemote.length)
		const productsRemote = await this.fetchAllPages<IProduct>('/product')
		console.log(productsRemote.length)

		const defaultDate = new Date()

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

		let mainStaff = Object.values(staffs).find((staff) => staff.phone === this.phone)
		if (!mainStaff) {
			mainStaff = Object.values(staffs)[0]
		}

		const suppliers: Record<string, Supplier> = {}
		suppliersRemote.forEach((supplier) => {
			suppliers[supplier.id] = {
				id: supplier.id,
				phone: supplier.phone.trim(),
				fullname: supplier.name.trim(),
				password: bcrypt.hashSync(supplier.phone.trim(), 7),
				type: UserTypeEnum.supplier,
				createdAt: supplier.createdAt,
				balance: new Decimal(supplier.debt),
				debt: new Decimal(0),
				payments: [
					{
						id: uuidv4(),
						total: new Decimal(supplier.debt),
						other: new Decimal(supplier.debt),
						type: ServiceTypeEnum.supplier,
						userId: supplier.id,
						staffId: mainStaff.id,
						cash: new Decimal(0),
						card: new Decimal(0),
						transfer: new Decimal(0),
						description: `import qilingan boshlang'ich qiymat ${new Decimal(supplier.debt).toFixed(2)}`,
						createdAt: defaultDate,
					},
				],
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
				balance: new Decimal(client.debt),
				debt: new Decimal(0),
				payments: [
					{
						id: uuidv4(),
						total: new Decimal(client.debt),
						other: new Decimal(client.debt),
						type: ServiceTypeEnum.client,
						userId: client.id,
						staffId: mainStaff.id,
						cash: new Decimal(0),
						card: new Decimal(0),
						transfer: new Decimal(0),
						description: `import qilingan boshlang'ich qiymat ${new Decimal(client.debt).toFixed(2)}`,
						createdAt: defaultDate,
					},
				],
			}
		})

		const arrivalProducts: {
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
		}[] = []

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

			arrivalProducts.push({
				id: uuidv4(),
				cost: new Decimal(product.cost),
				count: product.count,
				price: new Decimal(product.selling_price),
				createdAt: defaultDate,
				productId: product.id,
				staffId: mainStaff.id,
				totalCost: new Decimal(product.cost).mul(product.count),
				totalPrice: new Decimal(product.selling_price).mul(product.count),
				type: ServiceTypeEnum.arrival,
			})
		})

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
					deletedAt: staff.deletedAt,
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
					deletedAt: supplier.deletedAt,
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
					deletedAt: client.deletedAt,
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

		const newProductMVs = await this.prisma.productMVModel.createMany({
			skipDuplicates: false,
			data: arrivalProducts.map((mv) => ({
				id: mv.id,
				cost: mv.cost,
				price: mv.price,
				totalPrice: mv.totalPrice,
				totalCost: mv.totalCost,
				type: mv.type,
				staffId: mv.staffId,
				count: mv.count,
				createdAt: mv.createdAt,
				productId: mv.productId,
			})),
		})

		console.log(newStaffs.count, newSuppliers.count, newClients.count, newProducts.count, newProductMVs.count)
		console.log(newStaffPayments.count, newSupplierPayments.count, newClientPayments.count)

		return createResponse({ data: {}, success: { messages: ['syncronize success'] } })
	}
}
