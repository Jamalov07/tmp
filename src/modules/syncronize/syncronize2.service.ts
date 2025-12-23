import { Injectable, OnModuleInit } from '@nestjs/common'
import axios from 'axios'
import { PrismaService } from '../shared/prisma'
import { ServiceTypeEnum, UserTypeEnum } from '@prisma/client'
import { createResponse } from '../../common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { Client, IClient, IProduct, IStaff, ISupplier, Product, Staff, Supplier } from './interfaces'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class SyncronizeService2 implements OnModuleInit {
	private baseUrl: string
	private phone: string
	private password: string
	private accessToken = ''
	private mainStaff: Partial<Staff>

	constructor(
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

		await this.clearDatabase()
		await this.signIn()

		await this.syncStaffs()
		await this.syncSuppliers()
		await this.syncClients()
		await this.syncProducts()

		console.log('synchronization finished')

		return createResponse({
			data: {},
			success: { messages: ['synchronize success'] },
		})
	}

	private async clearDatabase() {
		await this.prisma.arrivalModel.deleteMany({})
		await this.prisma.botUserModel.deleteMany({})
		await this.prisma.paymentModel.deleteMany({})
		await this.prisma.productMVModel.deleteMany({})
		await this.prisma.productModel.deleteMany({})
		await this.prisma.returningModel.deleteMany({})
		await this.prisma.sellingModel.deleteMany({})
		await this.prisma.userModel.deleteMany({})
	}

	private async syncStaffs() {
		console.log('syncStaffs started')

		const staffsRemote = await this.fetchAllPages<IStaff>('/admin')

		const staffs = staffsRemote.map((staff) => ({
			id: staff.id,
			phone: staff.phone.trim(),
			fullname: staff.name.trim(),
			password: bcrypt.hashSync(staff.phone.trim(), 7),
			type: UserTypeEnum.staff,
			createdAt: staff.createdAt,
			balance: new Decimal(0),
			debt: new Decimal(0),
			payment: [],
		}))

		await this.prisma.userModel.createMany({
			skipDuplicates: false,
			data: staffs,
		})

		this.mainStaff = staffs.find((staff) => staff.phone === this.phone)
		if (!this.mainStaff) {
			this.mainStaff = staffs[0]
		}
		console.log(`staffs syncronization completed: ${staffs.length}`)
	}

	private async syncSuppliers() {
		console.log('syncSuppliers started')

		const suppliersRemote = await this.fetchAllPages<ISupplier>('/user/supplier')
		const defaultDate = new Date()

		const suppliers = suppliersRemote.map((supplier) => ({
			id: supplier.id,
			phone: supplier.phone.trim(),
			fullname: supplier.name.trim(),
			password: bcrypt.hashSync(supplier.phone.trim(), 7),
			type: UserTypeEnum.supplier,
			createdAt: supplier.createdAt,
			balance: new Decimal(supplier.debt),
			debt: new Decimal(0),
		}))

		await this.prisma.userModel.createMany({ data: suppliers })

		const payments = suppliersRemote.map((supplier) => ({
			id: uuidv4(),
			type: ServiceTypeEnum.supplier,
			userId: supplier.id,
			staffId: this.mainStaff?.id,
			other: new Decimal(supplier.debt),
			total: new Decimal(supplier.debt),
			description: `import qilingan boshlang'ich qiymat ${new Decimal(supplier.debt).toFixed(2)}`,
			createdAt: defaultDate,
		}))

		await this.prisma.paymentModel.createMany({ data: payments })

		console.log(`suppliers and their payments syncronization completed: ${suppliers.length}`)
	}

	private async syncClients() {
		console.log('syncClients started')

		const clientsRemote = await this.fetchAllPages<IClient>('/user/client')
		const defaultDate = new Date()

		const clients = clientsRemote.map((client) => ({
			id: client.id,
			phone: client.phone.trim(),
			fullname: client.name.trim(),
			password: bcrypt.hashSync(client.phone.trim(), 7),
			type: UserTypeEnum.client,
			createdAt: client.createdAt,
			balance: new Decimal(client.debt),
			debt: new Decimal(client.debt),
		}))

		await this.prisma.userModel.createMany({ data: clients })

		const payments = clientsRemote.map((client) => ({
			id: uuidv4(),
			type: ServiceTypeEnum.client,
			userId: client.id,
			staffId: this.mainStaff?.id,
			other: new Decimal(client.debt),
			total: new Decimal(client.debt),
			description: `import qilingan boshlang'ich qiymat ${new Decimal(client.debt).toFixed(2)}`,
			createdAt: defaultDate,
		}))

		await this.prisma.paymentModel.createMany({ data: payments })

		console.log(`clients and their payments syncronization completed: ${clients.length}`)
	}

	private async syncProducts() {
		console.log('syncProducts started')

		const productsRemote = await this.fetchAllPages<IProduct>('/product')
		const defaultDate = new Date()

		const products = productsRemote.map((product) => ({
			id: product.id,
			name: product.name.trim(),
			cost: new Decimal(product.cost),
			price: new Decimal(product.selling_price),
			count: product.count,
			minAmount: product.min_amount,
			createdAt: product.createdAt,
		}))

		await this.prisma.productModel.createMany({ data: products })

		const arrivals = productsRemote.map((product) => ({
			id: uuidv4(),
			productId: product.id,
			staffId: this.mainStaff?.id,
			type: ServiceTypeEnum.arrival,
			count: product.count,
			cost: new Decimal(product.cost),
			price: new Decimal(product.selling_price),
			totalCost: new Decimal(product.cost).mul(product.count),
			totalPrice: new Decimal(product.selling_price).mul(product.count),
			createdAt: defaultDate,
		}))

		// batch insert (server yiqilmasligi uchun)
		const chunkSize = 200
		for (let i = 0; i < arrivals.length; i += chunkSize) {
			await this.prisma.productMVModel.createMany({
				data: arrivals.slice(i, i + chunkSize),
			})
		}

		console.log(`products syncronization completed: ${products.length}`)
	}
}
