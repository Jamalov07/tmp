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
	SellingGetProductRankRequest,
	SellingUpdateOneRequest,
} from './interfaces'
import { SellingController } from './selling.controller'
import { Prisma, SellingStatusEnum, ServiceTypeEnum } from '@prisma/client'
import { ProductRankMetricEnum, StatsTypeEnum } from './enums'
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
				clientId: query.clientId,
				OR: [{ client: { fullname: { contains: query.search, mode: 'insensitive' } } }, { client: { phone: { contains: query.search, mode: 'insensitive' } } }],
				date: { gte: query.startDate, lte: query.endDate },
			},
			orderBy: [{ date: 'desc' }],
			select: {
				id: true,
				status: true,
				totalPrice: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: {
					select: {
						staff: { select: { phone: true, fullname: true } },
						id: true,
						total: true,
						card: true,
						cash: true,
						other: true,
						transfer: true,
						description: true,
						createdAt: true,
					},
				},
				products: {
					orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
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
				publicId: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { total: true, type: true, id: true, card: true, cash: true, other: true, transfer: true, description: true, createdAt: true } },
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
				clientId: query.clientId,
				OR: [{ client: { fullname: { contains: query.search, mode: 'insensitive' } } }, { client: { phone: { contains: query.search, mode: 'insensitive' } } }],
				date: { gte: query.startDate, lte: query.endDate },
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
				date: { gte: query.startDate, lte: query.endDate },
			},
			select: {
				id: true,
				status: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				totalPrice: true,
				date: true,
				client: {
					select: {
						id: true,
						balance: true,
						fullname: true,
						phone: true,
						payments: {
							where: { type: ServiceTypeEnum.client },
							select: { total: true, card: true, cash: true, other: true, transfer: true },
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
			select: {
				id: true,
				status: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { total: true, id: true, card: true, cash: true, other: true, transfer: true, description: true, createdAt: true } },
				products: {
					orderBy: [{ createdAt: 'desc' }],
					select: { createdAt: true, id: true, price: true, count: true, product: { select: { id: true, createdAt: true, name: true } } },
				},
			},
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
		const today = new Date()
		const dayClose = await this.prisma.dayCloseLog.findFirst({ where: { closedDate: today } })

		if (dayClose) {
			const tomorrow = new Date(today)
			tomorrow.setDate(today.getDate() + 1)
			tomorrow.setHours(0, 0, 0, 0)

			body.date = tomorrow
		}

		const selling = await this.prisma.sellingModel.create({
			data: {
				status: body.status,
				clientId: body.clientId,
				date: dayClose ? body.date : undefined,
				staffId: body.staffId,
				totalPrice: body.totalPrice,
				createdAt: dayClose ? body.date : undefined,
				payment: {
					create: {
						total: body.payment.total,
						card: body.payment?.card,
						cash: body.payment?.cash,
						other: body.payment?.other,
						transfer: body.payment?.transfer,
						description: body.payment?.description,
						userId: body.clientId,
						staffId: body.staffId,
						type: ServiceTypeEnum.selling,
						createdAt: dayClose ? body.date : undefined,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: body.products.map((p) => ({
							productId: p.productId,
							type: ServiceTypeEnum.selling,
							totalPrice: p.totalPrice,
							count: p.count,
							price: p.price,
							staffId: body.staffId,
							createdAt: dayClose ? body.date : undefined,
						})),
					},
				},
			},
			select: {
				id: true,
				status: true,
				publicId: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true, telegram: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { total: true, id: true, card: true, cash: true, other: true, type: true, transfer: true, description: true, createdAt: true } },
				products: {
					orderBy: { createdAt: 'desc' },
					select: { createdAt: true, id: true, price: true, count: true, product: { select: { name: true, id: true, createdAt: true } } },
				},
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
				date: existSelling.status !== SellingStatusEnum.accepted ? (body.date ? new Date(body.date) : undefined) : undefined,
				status: body.status,
				clientId: body.clientId,
				deletedAt: body.deletedAt,
				totalPrice: body.totalPrice,
				payment: {
					update: {
						total: body.payment.total,
						card: body.payment?.card,
						cash: body.payment?.cash,
						other: body.payment?.other,
						transfer: body.payment?.transfer,
						description: body.payment?.description,
						staffId: body.payment.total ? body.staffId : undefined,
						createdAt: !existSelling.payment.total.isZero() ? undefined : new Date(),
					},
				},
			},
			select: {
				id: true,
				status: true,
				publicId: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				totalPrice: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true, telegram: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { total: true, id: true, card: true, cash: true, other: true, type: true, transfer: true, description: true, createdAt: true } },
				products: {
					orderBy: { createdAt: 'desc' },
					select: { createdAt: true, id: true, price: true, count: true, product: { select: { name: true, id: true, createdAt: true } } },
				},
			},
		})

		await this.prisma.sellingModel.update({
			where: { id: selling.id },
			data: { payment: { update: { total: selling.payment.card.plus(selling.payment.cash).plus(selling.payment.other).plus(selling.payment.transfer) } } },
		})

		if (body.status === SellingStatusEnum.accepted && existSelling.status !== SellingStatusEnum.accepted) {
			const sellingDate = body.date ? new Date(body.date) : new Date()

			const sortedProducts = [...selling.products].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

			for (let i = 0; i < sortedProducts.length; i++) {
				const product = sortedProducts[sortedProducts.length - 1 - i]

				const newDate = new Date(sellingDate.getTime() - i * 1000)

				await this.prisma.productMVModel.update({
					where: { id: product.id },
					data: { createdAt: newDate },
				})
			}
			// await this.prisma.productMVModel.updateMany({
			// 	where: { id: { in: selling.products.map((prr) => prr.id) } },
			// 	data: { createdAt: body.date ? new Date(body.date) : undefined },
			// })
			for (const product of selling.products) {
				await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { decrement: product.count } } })
			}
		}

		return selling
	}

	async deleteOne(query: SellingDeleteOneRequest) {
		const selling = await this.prisma.sellingModel.delete({
			where: { id: query.id },
			select: { products: { select: { product: true, count: true } }, status: true },
		})

		if (selling.status === SellingStatusEnum.accepted) {
			for (const product of selling.products) {
				await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { increment: product.count } } })
			}
		}

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
				select: { totalPrice: true },
			})

			const totalSum = sales.reduce((sum, selling) => {
				return sum.plus(selling.totalPrice)
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

		for (let current = new Date(startDay); current <= endDay; current.setDate(current.getDate() + 1)) {
			const dayStart = convertUTCtoLocal(new Date(current.getFullYear(), current.getMonth(), current.getDate(), 0, 0, 0, 0))

			const dayEnd = convertUTCtoLocal(new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999))

			const sales = await this.prisma.sellingModel.findMany({
				where: { createdAt: { gte: dayStart, lte: dayEnd } },
				select: { totalPrice: true },
			})

			const totalSum = sales.reduce((sum, selling) => sum.plus(selling.totalPrice), new Decimal(0))

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
				select: { totalPrice: true },
			})

			const totalSum = sales.reduce((sum, selling) => {
				return sum.plus(selling.totalPrice)
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
				select: { totalPrice: true },
			})

			const totalSum = sales.reduce((sum, selling) => {
				return sum.plus(selling.totalPrice)
			}, new Decimal(0))
			salesByMonth.push({
				date: dateFormat(monthStart),
				sum: totalSum.toString(),
			})
		}
		return salesByMonth
	}

	async getProductRank(query: SellingGetProductRankRequest) {
		const metric = query.metric ?? ProductRankMetricEnum.count
		const pageNumber = query.pageNumber || 1
		const pageSize = query.pageSize || 20
		const now = new Date()
		const startDate = query.startDate ? new Date(query.startDate) : new Date(now.getFullYear(), now.getMonth(), 1)
		const endDate = query.endDate ? new Date(query.endDate) : new Date(new Date().setHours(23, 59, 59, 999))
		const [summary] = await this.prisma.$queryRaw<ProductRankSummaryRow[]>`
			${this.productRankCte(startDate, endDate)}
			SELECT
				COUNT(*) FILTER (WHERE ${metric} = 'profit' OR sale_count > 0)::int AS total_count,
				COUNT(*) FILTER (WHERE sale_count > 0)::int AS product_count,
				COALESCE(SUM(quantity) FILTER (WHERE sale_count > 0), 0)::int AS quantity,
				COALESCE(SUM(revenue) FILTER (WHERE sale_count > 0), 0)::float8 AS revenue,
				COALESCE(SUM(profit), 0)::float8 AS profit
			FROM ranked
		`

		const rows = await this.prisma.$queryRaw<ProductRankRow[]>`
			${this.productRankCte(startDate, endDate)}
			SELECT id, name, sale_count, quantity, revenue, cost, profit
			FROM ranked
			WHERE ${metric} = 'profit' OR sale_count > 0
			ORDER BY
				CASE WHEN ${metric} = 'profit' THEN profit END DESC NULLS LAST,
				CASE WHEN ${metric} = 'count' THEN sale_count END DESC NULLS LAST,
				quantity DESC,
				name ASC
			OFFSET ${(pageNumber - 1) * pageSize}
			LIMIT ${pageSize}
		`

		const totalCount = this.toNumber(summary?.total_count)

		return {
			totalCount,
			pagesCount: pageSize ? Math.ceil(totalCount / pageSize) : 0,
			pageSize,
			summary: {
				productCount: this.toNumber(summary?.product_count),
				quantity: this.toNumber(summary?.quantity),
				revenue: this.toNumber(summary?.revenue),
				profit: this.toNumber(summary?.profit),
			},
			data: rows.map((row) => ({
				id: row.id,
				name: row.name,
				saleCount: this.toNumber(row.sale_count),
				quantity: this.toNumber(row.quantity),
				revenue: this.toNumber(row.revenue),
				cost: this.toNumber(row.cost),
				profit: this.toNumber(row.profit),
			})),
		}
	}

	private productRankCte(startDate: Date, endDate: Date) {
		return Prisma.sql`
			WITH sales AS (
				SELECT
					pm.product_id,
					COUNT(DISTINCT s.id)::int AS sale_count,
					COALESCE(SUM(pm.count), 0)::int AS quantity,
					COALESCE(SUM(pm.total_price), 0)::float8 AS revenue,
					COALESCE(SUM(pm.total_cost), 0)::float8 AS cost,
					COALESCE(SUM(pm.total_price - pm.total_cost), 0)::float8 AS profit
				FROM product_mv pm
				INNER JOIN selling s ON s.id = pm.selling_id
				WHERE pm.deleted_at IS NULL
					AND s.deleted_at IS NULL
					AND pm.type = ${ServiceTypeEnum.selling}::service_type
					AND s.status = ${SellingStatusEnum.accepted}::selling_status
					AND s.date >= ${startDate}
					AND s.date <= ${endDate}
				GROUP BY pm.product_id
			),
			returns AS (
				SELECT
					pm.product_id,
					COALESCE(SUM(pm.total_price - pm.total_cost), 0)::float8 AS profit
				FROM product_mv pm
				INNER JOIN "returning" r ON r.id = pm.returning_id
				WHERE pm.deleted_at IS NULL
					AND r.deleted_at IS NULL
					AND pm.type = ${ServiceTypeEnum.returning}::service_type
					AND r.status = ${SellingStatusEnum.accepted}::selling_status
					AND r.date >= ${startDate}
					AND r.date <= ${endDate}
				GROUP BY pm.product_id
			),
			ranked AS (
				SELECT
					p.id::text AS id,
					p.name AS name,
					COALESCE(s.sale_count, 0)::int AS sale_count,
					COALESCE(s.quantity, 0)::int AS quantity,
					COALESCE(s.revenue, 0)::float8 AS revenue,
					COALESCE(s.cost, 0)::float8 AS cost,
					(COALESCE(s.profit, 0) - COALESCE(rt.profit, 0))::float8 AS profit
				FROM product p
				LEFT JOIN sales s ON s.product_id = p.id
				LEFT JOIN returns rt ON rt.product_id = p.id
				WHERE p.deleted_at IS NULL
					AND (s.product_id IS NOT NULL OR rt.product_id IS NOT NULL)
			)
		`
	}

	private toNumber(value: unknown) {
		const numberValue = Number(value ?? 0)

		return Number.isFinite(numberValue) ? numberValue : 0
	}
}

type ProductRankRow = {
	id: string
	name: string
	sale_count: number
	quantity: number
	revenue: number
	cost: number
	profit: number
}

type ProductRankSummaryRow = {
	total_count: number
	product_count: number
	quantity: number
	revenue: number
	profit: number
}
