import { Injectable } from '@nestjs/common'
import { SyncronizeRepository } from './syncronize.repository'
import axios from 'axios'
import { PrismaService } from '../shared'
import { SellingStatusEnum, ServiceTypeEnum, UserTypeEnum } from '@prisma/client'
import { createResponse } from '../../common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class SyncronizeService {
	private readonly baseUrl = this.configService.getOrThrow('old-service.baseUrl')
	private readonly phone = this.configService.getOrThrow('old-service.user')
	private readonly password = this.configService.getOrThrow('old-service.password')
	private accessToken = ''

	constructor(
		private readonly syncronizeRepository: SyncronizeRepository,
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
	) {}

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

	async staff() {
		await this.prisma.userModel.deleteMany({ where: { type: UserTypeEnum.staff } })
		const staffData = await this.fetchAllPages<{ name: string; phone: string; createdAt: Date }>('/admin')
		const staffs = await this.prisma.userModel.createManyAndReturn({
			skipDuplicates: false,
			data: staffData.map((s) => ({
				fullname: s.name.trim(),
				createdAt: s.createdAt,
				phone: s.phone.trim(),
				type: UserTypeEnum.staff,
				password: bcrypt.hashSync(s.phone.trim(), 7),
			})),
		})
		console.log('staffs', staffData.length, staffs.length)
		return staffs
	}

	async supplier() {
		await this.prisma.userModel.deleteMany({ where: { type: UserTypeEnum.supplier } })
		const data = await this.fetchAllPages<{ name: string; phone: string; createdAt: Date }>('/user/supplier')
		const suppliers = await this.prisma.userModel.createManyAndReturn({
			skipDuplicates: false,
			data: data.map((s) => ({
				fullname: s.name.trim(),
				createdAt: s.createdAt,
				phone: s.phone.trim(),
				type: UserTypeEnum.supplier,
				password: bcrypt.hashSync(s.phone.trim(), 7),
			})),
		})
		console.log('suppliers', data.length, suppliers.length)
		return suppliers
	}

	async client() {
		await this.prisma.userModel.deleteMany({ where: { type: UserTypeEnum.client } })
		const data = await this.fetchAllPages<{ name: string; phone: string; createdAt: Date }>('/user/client')

		const clients = await this.prisma.userModel.createManyAndReturn({
			skipDuplicates: false,
			data: data.map((c) => ({
				fullname: c.name.trim(),
				createdAt: c.createdAt,
				phone: c.phone.trim(),
				type: UserTypeEnum.client,
				password: bcrypt.hashSync(c.phone.trim(), 7),
			})),
		})
		console.log('clients', data.length, clients.length)
		return clients
	}

	async product() {
		await this.prisma.productModel.deleteMany({})
		const data = await this.fetchAllPages<{ name: string; cost: number; count: number; createdAt: Date; min_amount: number; selling_price: number }>('/product')
		const products = await this.prisma.productModel.createManyAndReturn({
			skipDuplicates: false,
			data: data.map((p) => ({
				name: p.name.trim(),
				createdAt: p.createdAt,
				count: p.count,
				price: p.selling_price,
				cost: p.cost,
				minAmount: p.min_amount,
			})),
		})
		console.log('products', data.length, products.length)
		return products
	}

	async staffPayment() {
		await this.prisma.paymentModel.deleteMany({ where: { type: ServiceTypeEnum.staff } })

		const staffs = await this.findAllStaffs()
		const staffObject: { [key: string]: { id: string } } = {}
		for (const st of staffs) {
			staffObject[`${st.fullname}-${st.phone}`] = st
		}

		const data = await this.fetchAllPages<{ sum: number; createdAt: Date; description: string; employee: { name: string; phone: string } }>('/employeePayment')

		const pays = []
		for (const pay of data) {
			const key = `${pay.employee?.name.trim()}-${pay.employee?.phone.trim()}`
			const staff = staffObject[key] ? staffObject[key] : { id: null }
			if (!staff) {
				continue
			} else {
				pays.push({ type: ServiceTypeEnum.staff, userId: staff.id, staffId: staff.id, sum: pay.sum, description: pay.description, createdAt: pay.createdAt })
			}
		}

		const payments = await this.prisma.paymentModel.createManyAndReturn({
			skipDuplicates: false,
			data: pays,
		})

		console.log('staff payments', data.length, payments.length)
		return payments
	}

	async supplierPayment() {
		await this.prisma.paymentModel.deleteMany({ where: { type: ServiceTypeEnum.supplier } })

		const staffs = await this.findAllStaffs()
		const staffObject: { [key: string]: { id: string } } = {}
		for (const st of staffs) {
			staffObject[`${st.fullname}-${st.phone}`] = st
		}

		const suppliers = await this.findAllSuppliers()
		const supplierObject: { [key: string]: { id: string } } = {}
		for (const sp of suppliers) {
			supplierObject[`${sp.fullname}-${sp.phone}`] = sp
		}

		const data = await this.fetchAllPages<{
			cash: number
			card: number
			transfer: number
			other: number
			createdAt: Date
			description: string
			order?: { id: string }
			supplier: { name: string; phone: string }
		}>('/incomingOrderPayment')

		const pays = []
		const orpays = []
		for (const pay of data) {
			const staff = { id: staffs[0].id }
			const key = `${pay.supplier.name.trim()}-${pay.supplier.phone.trim()}`
			let supplier = supplierObject[key] ? supplierObject[key] : { id: null }
			if (!supplier.id) {
				supplier = await this.prisma.userModel.findFirst({ where: { type: 'supplier', phone: pay.supplier.phone.trim(), fullname: pay.supplier.name.trim() } })
				if (!supplier) {
					supplier = await this.prisma.userModel.create({
						data: { type: 'supplier', phone: pay.supplier.phone.trim(), fullname: pay.supplier.name.trim(), password: pay.supplier.phone.trim() },
					})
				}
			}
			if (!pay.order) {
				pays.push({
					type: ServiceTypeEnum.supplier,
					userId: supplier.id,
					staffId: staff.id,
					cash: pay.cash,
					card: pay.card,
					other: pay.other,
					transfer: pay.transfer,
					description: pay.description,
					createdAt: pay.createdAt,
				})
			} else {
				orpays.push(pay)
			}
		}

		const payments = await this.prisma.paymentModel.createManyAndReturn({
			skipDuplicates: false,
			data: pays,
		})

		console.log(orpays.length)
		console.log('supplier payment', data.length, payments.length)

		return payments
	}

	async clientPayment() {
		await this.prisma.paymentModel.deleteMany({ where: { type: ServiceTypeEnum.client } })

		const staffs = await this.findAllStaffs()
		const staffObject: { [key: string]: { id: string } } = {}
		for (const st of staffs) {
			staffObject[`${st.fullname}-${st.phone}`] = st
		}

		const clients = await this.findAllClients()
		const clientObject: { [key: string]: { id: string } } = {}
		for (const sp of clients) {
			clientObject[`${sp.fullname}-${sp.phone}`] = sp
		}

		const data = await this.fetchAllPages<{
			cash: number
			card: number
			transfer: number
			other: number
			createdAt: Date
			description: string
			order?: { id: string }
			client: { name: string; phone: string }
			seller: { name: string; phone: string }
		}>('/payment')

		const pays = []
		const orpays = []
		for (const pay of data) {
			const stkey = `${pay.seller?.name.trim()}-${pay.seller?.phone.trim()}`
			const staff = staffObject[stkey] ? staffObject[stkey] : { id: staffs[0].id }

			const clkey = `${pay.client.name.trim()}-${pay.client.phone.trim()}`
			let client = clientObject[clkey] ? clientObject[clkey] : { id: null }
			if (!client.id) {
				client = await this.prisma.userModel.findFirst({ where: { fullname: pay.client.name.trim(), phone: pay.client.phone.trim(), type: 'client' } })
				if (!client) {
					client = await this.prisma.userModel.create({
						data: { fullname: pay.client.name.trim(), phone: pay.client.phone.trim(), type: 'client', password: pay.client.phone.trim() },
					})
				}
			}
			if (!pay.order) {
				pays.push({
					type: ServiceTypeEnum.client,
					userId: client.id,
					staffId: staff.id,
					cash: pay.cash,
					card: pay.card,
					other: pay.other,
					transfer: pay.transfer,
					description: pay.description,
					createdAt: pay.createdAt,
				})
			} else {
				orpays.push(pay)
			}
		}

		const payments = await this.prisma.paymentModel.createManyAndReturn({
			skipDuplicates: false,
			data: pays,
		})

		console.log(orpays.length)
		console.log('client payments', data.length, payments.length)
	}

	async selling() {
		await this.prisma.sellingModel.deleteMany({})

		const staffs = await this.findAllStaffs()

		const staffObject: { [key: string]: { id: string } } = {}
		for (const st of staffs) {
			staffObject[`${st.fullname}-${st.phone}`] = st
		}

		const clients = await this.findAllClients()

		const clientObject: { [key: string]: { id: string } } = {}
		for (const sp of clients) {
			clientObject[`${sp.fullname}-${sp.phone}`] = sp
		}

		const products = await this.findAllProducts()

		const productObject: { [key: string]: { id: string } } = {}
		for (const pr of products) {
			productObject[pr.name] = pr
		}

		const data = await this.fetchAllPages<{
			articl: number
			client: { phone: string; name: string }
			seller: { phone: string; name: string }
			payment: { card: number; cash: number; other: number; transfer: number; description: string; createdAt: Date }
			accepted: boolean
			createdAt: Date
			sellingDate: Date
			products: { cost: number; count: number; price: number; createdAt: Date; product: { name: string } }[]
		}>('/Order')

		const sels = []
		for (const selling of data) {
			const stkey = `${selling.seller?.name.trim()}-${selling.seller?.phone.trim()}`
			const staff = staffObject[stkey] ? staffObject[stkey] : { id: staffs[0].id }
			const clkey = `${selling.client.name.trim()}-${selling.client.phone.trim()}`
			let client = clientObject[clkey] ? clientObject[clkey] : { id: null }
			if (!client.id) {
				client = await this.prisma.userModel.findFirst({ where: { fullname: selling.client.name.trim(), phone: selling.client.phone.trim(), type: 'client' } })
				if (!client) {
					client = await this.prisma.userModel.create({
						data: { fullname: selling.client.name.trim(), phone: selling.client.phone.trim(), type: 'client', password: selling.client.phone.trim() },
					})
				}
			}
			const products: { cost: number; price: number; count: number; createdAt: Date; productId: string }[] = []
			for (const pro of selling.products) {
				const pkey = pro.product.name.trim()
				let product = productObject[pkey] ? productObject[pkey] : { id: null }
				if (!product.id) {
					product = await this.prisma.productModel.findFirst({ where: { name: pkey } })
					if (!product) {
						product = await this.prisma.productModel.create({ data: { name: pkey } })
					}
				}
				products.push({ cost: pro.cost, count: pro.count, price: pro.price, createdAt: pro.createdAt, productId: product.id })
			}
			sels.push({
				status: selling.accepted ? SellingStatusEnum.accepted : SellingStatusEnum.notaccepted,
				clientId: client.id,
				date: selling.sellingDate,
				staffId: staff.id,
				send: false,
				sended: false,
				payment: {
					create: {
						card: selling.payment?.card,
						cash: selling.payment?.cash,
						other: selling.payment?.other,
						transfer: selling.payment?.transfer,
						description: selling.payment?.description,
						createdAt: selling.payment?.createdAt,
						type: ServiceTypeEnum.selling,
						staffId: staff.id,
						userId: client.id,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: products.map((p) => {
							return { productId: p.productId, type: ServiceTypeEnum.selling, count: p.count, price: p.price, staffId: staff.id, createdAt: p.createdAt }
						}),
					},
				},
			})
		}
		const chunkSize = 100
		const addedsellings = []
		for (let i = 0; i < sels.length; i += chunkSize) {
			const chunk = sels.slice(i, i + chunkSize)
			await Promise.all(chunk.map((sel) => this.prisma.sellingModel.create({ data: sel }).then((data) => addedsellings.push(data))))
		}

		console.log('sellings', data.length, addedsellings.length)
	}

	async arrival() {
		await this.prisma.arrivalModel.deleteMany({})

		const staffs = await this.findAllStaffs()

		const staffObject: { [key: string]: { id: string } } = {}
		for (const st of staffs) {
			staffObject[`${st.fullname}-${st.phone}`] = st
		}

		const suppliers = await this.findAllSuppliers()

		const supplierObject: { [key: string]: { id: string } } = {}
		for (const sp of suppliers) {
			supplierObject[`${sp.fullname}-${sp.phone}`] = sp
		}

		const products = await this.findAllProducts()

		const productObject: { [key: string]: { id: string } } = {}
		for (const pr of products) {
			productObject[pr.name] = pr
		}

		const data = await this.fetchAllPages<{
			supplier: { phone: string; name: string }
			admin: { phone: string; name: string }
			payment: { card: number; cash: number; other: number; transfer: number; description: string; createdAt: Date }
			createdAt: Date
			sellingDate: Date
			incomingProducts: { cost: number; count: number; price: number; createdAt: Date; product: { name: string } }[]
		}>('/incomingOrder')

		const arrivals = []
		for (const arrival of data) {
			const stkey = `${arrival.admin?.name.trim()}-${arrival.admin?.phone.trim()}`
			const staff = staffObject[stkey] ? staffObject[stkey] : { id: staffs[0].id }
			const clkey = `${arrival.supplier.name.trim()}-${arrival.supplier.phone.trim()}`
			let supplier = supplierObject[clkey] ? supplierObject[clkey] : { id: null }
			if (!supplier.id) {
				supplier = await this.prisma.userModel.findFirst({ where: { fullname: arrival.supplier.name.trim(), phone: arrival.supplier.phone.trim(), type: 'supplier' } })
				if (!supplier) {
					supplier = await this.prisma.userModel.create({
						data: { fullname: arrival.supplier.name.trim(), phone: arrival.supplier.phone.trim(), type: 'supplier', password: arrival.supplier.phone.trim() },
					})
				}
			}
			const products: { cost: number; price: number; count: number; createdAt: Date; productId: string }[] = []
			for (const pro of arrival.incomingProducts) {
				const pkey = pro.product.name.trim()
				let product = productObject[pkey] ? productObject[pkey] : { id: null }
				if (!product.id) {
					product = await this.prisma.productModel.findFirst({ where: { name: pkey } })
					if (!product) {
						product = await this.prisma.productModel.create({ data: { name: pkey } })
					}
				}
				products.push({ cost: pro.cost, count: pro.count, price: pro.price, createdAt: pro.createdAt, productId: product.id })
			}
			arrivals.push({
				supplierId: supplier.id,
				date: arrival.sellingDate,
				staffId: staff.id,
				payment: {
					create: {
						card: arrival.payment?.card,
						cash: arrival.payment?.cash,
						other: arrival.payment?.other,
						transfer: arrival.payment?.transfer,
						description: arrival.payment?.description,
						createdAt: arrival.payment?.createdAt,
						type: ServiceTypeEnum.arrival,
						staffId: staff.id,
						userId: supplier.id,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: products.map((p) => {
							return { productId: p.productId, type: ServiceTypeEnum.arrival, count: p.count, price: p.price, staffId: staff.id, createdAt: p.createdAt }
						}),
					},
				},
			})
		}
		const chunkSize = 100
		const addedArrivals = []
		for (let i = 0; i < arrivals.length; i += chunkSize) {
			const chunk = arrivals.slice(i, i + chunkSize)
			await Promise.all(chunk.map((arr) => this.prisma.arrivalModel.create({ data: arr }).then((data) => addedArrivals.push(data))))
		}

		console.log('arrivals', data.length, addedArrivals.length)
	}

	async returning() {
		await this.prisma.returningModel.deleteMany({})

		const staffs = await this.findAllStaffs()

		const staffObject: { [key: string]: { id: string } } = {}
		for (const st of staffs) {
			staffObject[`${st.fullname}-${st.phone}`] = st
		}

		const clients = await this.findAllClients()

		const clientObject: { [key: string]: { id: string } } = {}
		for (const cl of clients) {
			clientObject[`${cl.fullname}-${cl.phone}`] = cl
		}

		const products = await this.findAllProducts()

		const productObject: { [key: string]: { id: string } } = {}
		for (const pr of products) {
			productObject[pr.name] = pr
		}

		const data = await this.fetchAllPages<{
			cashPayment: number
			description: string
			fromClient: number
			// payment tepada
			accepted: boolean
			createdAt: Date
			returnedDate: Date
			client: { phone: string; name: string }
			seller: { phone: string; name: string }
			payment: { card: number; cash: number; other: number; transfer: number; description: string; createdAt: Date }
			products: { count: number; price: number; createdAt: Date; product: { name: string } }[]
		}>('/returned-order')

		const returnings = []
		for (const returning of data) {
			const stkey = `${returning.seller?.name.trim()}-${returning.seller?.phone.trim()}`
			const staff = staffObject[stkey] ? staffObject[stkey] : { id: staffs[0].id }
			const clkey = `${returning.client.name.trim()}-${returning.client.phone.trim()}`
			let client = clientObject[clkey] ? clientObject[clkey] : { id: null }
			if (!client.id) {
				client = await this.prisma.userModel.findFirst({ where: { fullname: returning.client.name.trim(), phone: returning.client.phone.trim(), type: 'client' } })
				if (!client) {
					client = await this.prisma.userModel.create({
						data: { fullname: returning.client.name.trim(), phone: returning.client.phone.trim(), type: 'client', password: returning.client.phone.trim() },
					})
				}
			}
			const products: { price: number; count: number; createdAt: Date; productId: string }[] = []
			for (const pro of returning.products) {
				const pkey = pro.product.name.trim()
				let product = productObject[pkey] ? productObject[pkey] : { id: null }
				if (!product.id) {
					product = await this.prisma.productModel.findFirst({ where: { name: pkey } })
					if (!product) {
						product = await this.prisma.productModel.create({ data: { name: pkey } })
					}
				}
				products.push({ count: pro.count, price: pro.price, createdAt: pro.createdAt, productId: product.id })
			}
			returnings.push({
				clientId: client.id,
				date: returning.returnedDate,
				staffId: staff.id,
				payment: {
					create: {
						card: returning.payment?.card,
						cash: returning.payment?.cash,
						other: returning.payment?.other,
						transfer: returning.payment?.transfer,
						description: returning.payment?.description,
						createdAt: returning.payment?.createdAt,
						type: ServiceTypeEnum.returning,
						staffId: staff.id,
						userId: client.id,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: products.map((p) => {
							return { productId: p.productId, type: ServiceTypeEnum.returning, count: p.count, price: p.price, staffId: staff.id, createdAt: p.createdAt }
						}),
					},
				},
			})
		}
		const chunkSize = 100
		const addedReturnings = []
		for (let i = 0; i < returnings.length; i += chunkSize) {
			const chunk = returnings.slice(i, i + chunkSize)
			await Promise.all(chunk.map((arr) => this.prisma.returningModel.create({ data: arr }).then((data) => addedReturnings.push(data))))
		}

		console.log('retunrings', data.length, addedReturnings.length)
	}

	async syncronizeAll() {
		console.log('synchronization started')
		await this.prisma.productMVModel.deleteMany({})
		await this.prisma.paymentModel.deleteMany({})
		await this.prisma.productModel.deleteMany({})
		await this.staff()
		await this.supplier()
		await this.client()
		await this.product()
		await this.staffPayment()
		await this.supplierPayment()
		await this.clientPayment()
		await this.selling()
		await this.arrival()
		await this.returning()
		console.log('syncronization finished')

		return createResponse({ data: {}, success: { messages: ['syncronize success'] } })
	}

	async syncronize() {
		await this.signIn()
		await this.syncronizeAll()
	}

	async findAllStaffs() {
		return this.prisma.userModel.findMany({ where: { type: UserTypeEnum.staff } })
	}

	async findAllSuppliers() {
		return this.prisma.userModel.findMany({ where: { type: UserTypeEnum.supplier } })
	}

	async findAllClients() {
		return this.prisma.userModel.findMany({ where: { type: UserTypeEnum.client } })
	}

	async findAllProducts() {
		return this.prisma.productModel.findMany({ where: {} })
	}
}
