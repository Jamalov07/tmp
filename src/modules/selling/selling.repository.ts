import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../shared/prisma'
import {
	SellingCreateOneRequest,
	SellingDeleteOneRequest,
	SellingFindManyRequest,
	SellingFindOneRequest,
	SellingGetManyRequest,
	SellingGetOneRequest,
	SellingGetPeriodStatsRequest,
	SellingUpdateOneRequest,
} from './interfaces'
import { SellingController } from './selling.controller'
import { SellingStatusEnum, ServiceTypeEnum } from '@prisma/client'
import { StatsTypeEnum } from './enums'
import { convertUTCtoLocal, extractDateParts } from '../../common'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class SellingRepository implements OnModuleInit {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async findMany(query: SellingFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const sellings = await this.prisma.sellingModel.findMany({
			where: {
				status: query.status,
				staffId: query.staffId,
				OR: [{ client: { fullname: { contains: query.search, mode: 'insensitive' } } }, { client: { phone: { contains: query.search, mode: 'insensitive' } } }],
				date: {
					gte: query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined,
					lte: query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined,
				},
			},
			select: {
				id: true,
				status: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				send: true,
				sended: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { id: true, card: true, cash: true, other: true, transfer: true, description: true } },
				products: {
					orderBy: [{ createdAt: 'desc' }],
					select: { createdAt: true, id: true, price: true, count: true, product: { select: { name: true, id: true, createdAt: true } } },
				},
			},
			...paginationOptions,
		})

		return sellings
	}

	async findOne(query: SellingFindOneRequest) {
		const selling = await this.prisma.sellingModel.findFirst({
			where: { id: query.id },
			select: {
				id: true,
				status: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				send: true,
				sended: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { id: true, card: true, cash: true, other: true, transfer: true, description: true } },
				products: {
					orderBy: [{ createdAt: 'desc' }],
					select: { createdAt: true, id: true, price: true, count: true, product: { select: { id: true, createdAt: true, name: true } } },
				},
			},
		})

		return selling
	}

	async countFindMany(query: SellingFindManyRequest) {
		const sellingsCount = await this.prisma.sellingModel.count({
			where: {
				status: query.status,
				staffId: query.staffId,
				OR: [{ client: { fullname: { contains: query.search, mode: 'insensitive' } } }, { client: { phone: { contains: query.search, mode: 'insensitive' } } }],
				date: {
					gte: query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined,
					lte: query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined,
				},
			},
		})

		return sellingsCount
	}

	async getMany(query: SellingGetManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const sellings = await this.prisma.sellingModel.findMany({
			where: {
				id: { in: query.ids },
				status: query.status,
			},
			select: {
				id: true,
				status: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				send: true,
				sended: true,
				client: {
					select: {
						id: true,
						fullname: true,
						phone: true,
						payments: {
							where: { type: ServiceTypeEnum.client },
							select: { card: true, cash: true, other: true, transfer: true },
						},
					},
				},
				staff: true,
				payment: true,
				products: { select: { createdAt: true, id: true, price: true, count: true, product: { select: { name: true, id: true, createdAt: true } } } },
			},
			...paginationOptions,
		})

		return sellings
	}

	async getOne(query: SellingGetOneRequest) {
		const selling = await this.prisma.sellingModel.findFirst({
			where: { id: query.id, status: query.status, staffId: query.staffId },
		})

		return selling
	}

	async countGetMany(query: SellingGetManyRequest) {
		const sellingsCount = await this.prisma.sellingModel.count({
			where: {
				id: { in: query.ids },
				status: query.status,
			},
		})

		return sellingsCount
	}

	async createOne(body: SellingCreateOneRequest) {
		const selling = await this.prisma.sellingModel.create({
			data: {
				status: body.status,
				clientId: body.clientId,
				date: new Date(body.date),
				staffId: body.staffId,
				send: body.send,
				sended: body.sended,
				payment: {
					create: {
						card: body.payment?.card,
						cash: body.payment?.cash,
						other: body.payment?.other,
						transfer: body.payment?.transfer,
						description: body.payment?.description,
						userId: body.clientId,
						staffId: body.staffId,
						type: ServiceTypeEnum.selling,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: body.products.map((p) => ({ productId: p.productId, type: ServiceTypeEnum.selling, count: p.count, price: p.price, staffId: body.staffId })),
					},
				},
			},
			select: {
				id: true,
				status: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				send: true,
				sended: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { id: true, card: true, cash: true, other: true, transfer: true, description: true } },
				products: { select: { createdAt: true, id: true, price: true, count: true, product: { select: { name: true, id: true, createdAt: true } } } },
			},
		})

		if (body.status === SellingStatusEnum.accepted) {
			for (const product of selling.products) {
				await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { decrement: product.count } } })
			}
		}

		return selling
	}

	async updateOne(query: SellingGetOneRequest, body: SellingUpdateOneRequest) {
		const existSelling = await this.findOne(query)

		const selling = await this.prisma.sellingModel.update({
			where: { id: query.id },
			data: {
				date: body.date ? new Date(body.date) : undefined,
				status: body.status,
				clientId: body.clientId,
				deletedAt: body.deletedAt,
				sended: body.sended,
				payment: {
					update: {
						card: body.payment?.card,
						cash: body.payment?.cash,
						other: body.payment?.other,
						transfer: body.payment?.transfer,
						description: body.payment?.description,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: body.products
							? body.products?.map((p) => ({ productId: p.productId, type: ServiceTypeEnum.selling, count: p.count, price: p.price, staffId: body.staffId }))
							: [],
					},
					deleteMany: body.productIdsToRemove?.map((id) => ({ id: id })),
				},
			},
			select: {
				id: true,
				status: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				send: true,
				sended: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { id: true, card: true, cash: true, other: true, transfer: true, description: true } },
				products: { select: { id: true, price: true, count: true, product: { select: { name: true, id: true } } } },
			},
		})

		if (body.status === SellingStatusEnum.accepted && existSelling.status !== SellingStatusEnum.accepted) {
			for (const product of selling.products) {
				await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { decrement: product.count } } })
			}
		}

		return selling
	}

	async deleteOne(query: SellingDeleteOneRequest) {
		const selling = await this.prisma.sellingModel.delete({
			where: { id: query.id },
		})

		return selling
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(SellingController)
	}

	async getPeriodStats(query: SellingGetPeriodStatsRequest) {
		if (query.type === StatsTypeEnum.day) {
			return this.getDayStats()
		} else if (query.type === StatsTypeEnum.week) {
			return this.getWeekStats()
		} else if (query.type === StatsTypeEnum.month) {
			return this.getMonthStats()
		} else if (query.type === StatsTypeEnum.year) {
			return this.getYearStats()
		}
	}

	private async getDayStats() {
		const now = convertUTCtoLocal(new Date())
		const extractedNow = extractDateParts(now)

		const startDay = convertUTCtoLocal(new Date(extractedNow.year, extractedNow.month, extractedNow.day, 0, 0, 0, 0))
		const endDay = convertUTCtoLocal(new Date(extractedNow.year, extractedNow.month, extractedNow.day, 23, 59, 59, 999))

		const salesByHour = []
		for (let hour = 0; hour <= now.getHours(); hour++) {
			const hourStart = convertUTCtoLocal(new Date(extractedNow.year, extractedNow.month, extractedNow.day, hour, 0, 0, 0))
			const hourEnd = convertUTCtoLocal(new Date(extractedNow.year, extractedNow.month, extractedNow.day, hour, 59, 59, 999))
			const sales = await this.prisma.sellingModel.findMany({
				where: { createdAt: { gte: hourStart, lte: hourEnd } },
				select: { products: true },
			})

			const totalSum = sales.reduce((sum, selling) => {
				const totalPrice = selling.products.reduce((acc, product) => {
					return acc.plus(new Decimal(product.count).mul(product.price))
				}, new Decimal(0))

				return sum.plus(totalPrice)
			}, new Decimal(0))

			const start = extractDateParts(hourStart)
			salesByHour.push({
				date: `${String(start.hour).padStart(2, '0')}:${String(start.minute).padStart(2, '0')}`,
				sum: totalSum.toString(),
			})
		}
		return salesByHour
	}

	async getWeekStats() {
		const now = convertUTCtoLocal(new Date())
		const extractedNow = extractDateParts(now)

		const startDay = convertUTCtoLocal(new Date(extractedNow.year, extractedNow.month, extractedNow.day - 6, 0, 0, 0, 0))
		const endDay = convertUTCtoLocal(new Date(extractedNow.year, extractedNow.month, extractedNow.day, 23, 59, 59, 999))

		const salesByDay = []
		for (let day = startDay.getDate(); day <= endDay.getDate(); day++) {
			const dayStart = convertUTCtoLocal(new Date(extractedNow.year, extractedNow.month, day, 0, 0, 0, 0))

			const dayEnd = convertUTCtoLocal(new Date(extractedNow.year, extractedNow.month, day, 23, 59, 59, 999))

			const sales = await this.prisma.sellingModel.findMany({
				where: { createdAt: { gte: dayStart, lte: dayEnd } },
				select: { products: true },
			})

			const totalSum = sales.reduce((sum, selling) => {
				const totalPrice = selling.products.reduce((acc, product) => {
					return acc.plus(new Decimal(product.count).mul(product.price))
				}, new Decimal(0))

				return sum.plus(totalPrice)
			}, new Decimal(0))

			salesByDay.push({
				date: `${dayStart.getFullYear()}-${String(dayStart.getMonth() + 1).padStart(2, '0')}-${String(dayStart.getDate()).padStart(2, '0')}`,
				sum: totalSum.toString(),
			})
		}
		return salesByDay
	}

	async getMonthStats() {
		const now = new Date(new Date().setHours(new Date().getHours() + 5))
		const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0 + 5, 0, 0, 0)
		const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
		const dateFormat = (date) => date.toISOString().split('T')[0]

		const salesByDay = []
		for (let day = 1; day <= endDate.getDate(); day++) {
			const dayStart = new Date(startDate)
			dayStart.setDate(day)
			const dayEnd = new Date(dayStart)
			dayEnd.setHours(23, 59, 59, 999)

			const sales = await this.prisma.sellingModel.findMany({
				where: { createdAt: { gte: dayStart, lte: dayEnd } },
				select: { products: true },
			})

			const totalSum = sales.reduce((sum, selling) => {
				const totalPrice = selling.products.reduce((acc, product) => {
					return acc.plus(new Decimal(product.count).mul(product.price))
				}, new Decimal(0))

				return sum.plus(totalPrice)
			}, new Decimal(0))

			salesByDay.push({
				date: dateFormat(dayStart),
				sum: totalSum.toString(),
			})
		}
		return salesByDay
	}

	async getYearStats() {
		const now = new Date(new Date().setHours(new Date().getHours() + 5))
		const startDate = new Date(now.getFullYear(), 0, 1, 0 + 5, 0, 0, 0)
		const endDate = new Date(now.getFullYear(), 11, 31, 23 + 5, 59, 59, 999)
		const dateFormat = (date) => date.toISOString().split('T')[0].slice(0, 7)

		const salesByMonth = []
		for (let month = 0; month < 12; month++) {
			const monthStart = new Date(startDate.getFullYear(), month, 1, 0 + 5, 0, 0, 0)
			const monthEnd = new Date(startDate.getFullYear(), month + 1, 0, 23 + 5, 59, 59, 999)

			const sales = await this.prisma.sellingModel.findMany({
				where: { createdAt: { gte: monthStart, lte: monthEnd } },
				select: { products: true },
			})

			const totalSum = sales.reduce((sum, selling) => {
				const totalPrice = selling.products.reduce((acc, product) => {
					return acc.plus(new Decimal(product.count).mul(product.price))
				}, new Decimal(0))

				return sum.plus(totalPrice)
			}, new Decimal(0))
			salesByMonth.push({
				date: dateFormat(monthStart),
				sum: totalSum.toString(),
			})
		}
		return salesByMonth
	}
}
