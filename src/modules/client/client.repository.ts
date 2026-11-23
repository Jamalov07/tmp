import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../shared/prisma'
import {
	ClientCalc,
	ClientCreateOneRequest,
	ClientDeleteOneRequest,
	ClientFindManyRequest,
	ClientFindOneRequest,
	ClientGetActivityRequest,
	ClientGetManyRequest,
	ClientGetOneRequest,
	ClientGetProfitRankRequest,
	ClientUpdateOneRequest,
} from './interfaces'
import { ClientActivityBucketEnum } from './enums'
import { Prisma, SellingStatusEnum, ServiceTypeEnum, UserTypeEnum } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { ClientController } from './client.controller'

@Injectable()
export class ClientRepository implements OnModuleInit {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async findMany(query: ClientFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const clients = await this.prisma.userModel.findMany({
			where: {
				fullname: query.fullname,
				type: UserTypeEnum.client,
				OR: [{ fullname: { contains: query.search, mode: 'insensitive' } }, { phone: { contains: query.search, mode: 'insensitive' } }],
			},
			select: {
				id: true,
				fullname: true,
				phone: true,
				balance: true,
				actions: true,
				createdAt: true,
				telegram: true,
				payments: {
					where: { type: ServiceTypeEnum.client, deletedAt: null },
					select: { card: true, cash: true, other: true, transfer: true, total: true },
				},
				sellings: {
					where: { status: SellingStatusEnum.accepted },
					select: {
						date: true,
						totalPrice: true,
						payment: { select: { card: true, cash: true, other: true, transfer: true, total: true } },
						products: { select: { count: true, price: true } },
					},
					orderBy: { date: 'desc' },
				},
				returnings: {
					where: { status: SellingStatusEnum.accepted },
					select: {
						payment: { select: { fromBalance: true } },
					},
					orderBy: { date: 'desc' },
				},
			},
			...paginationOptions,
		})

		return clients
	}

	async findManyNew(query: ClientFindManyRequest) {
		// debtType filter JS-da hisoblashni talab qilgani uchun pagination faqat u yo'q bo'lsa DB darajasida qo'llanadi
		const useDbPagination = query.pagination && !query.debtType

		const where = {
			fullname: query.fullname,
			type: UserTypeEnum.client,
			OR: [{ fullname: { contains: query.search, mode: 'insensitive' as const } }, { phone: { contains: query.search, mode: 'insensitive' as const } }],
		}

		const baseArgs = {
			where,
			select: {
				id: true,
				fullname: true,
				phone: true,
				balance: true,
				actions: true,
				createdAt: true,
				telegram: true,
				sellings: {
					where: { status: SellingStatusEnum.accepted },
					select: {
						date: true,
						totalPrice: true,
						payment: { select: { total: true } },
					},
					orderBy: { date: 'desc' as const },
				},
				returnings: {
					where: { status: SellingStatusEnum.accepted },
					select: {
						payment: { select: { fromBalance: true } },
					},
				},
			},
		}

		if (!useDbPagination) {
			const clients = await this.prisma.userModel.findMany(baseArgs)
			return { clients, useDbPagination, totalCount: clients.length }
		}

		const [clients, totalCount] = await Promise.all([
			this.prisma.userModel.findMany({ ...baseArgs, take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }),
			this.prisma.userModel.count({ where }),
		])

		return { clients, useDbPagination, totalCount }
	}

	async findManyClientForReport(query: ClientFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const clients = await this.prisma.userModel.findMany({
			where: {
				fullname: query.fullname,
				type: UserTypeEnum.client,
				OR: [{ fullname: { contains: query.search, mode: 'insensitive' } }, { phone: { contains: query.search, mode: 'insensitive' } }],
			},
			select: {
				id: true,
				fullname: true,
				phone: true,
				actions: true,
				createdAt: true,
			},
			...paginationOptions,
		})

		return clients
	}

	async findManyStatsForReport2(query: ClientFindManyRequest) {
		const clientMap = new Map<string, ClientCalc>()

		const createEmptyCalc = (): ClientCalc => ({
			selling: {
				count: 0,
				totalPrice: 0,
				payment: {
					count: 0,
					total: 0,
					totalCard: 0,
					totalCash: 0,
					totalTransfer: 0,
					totalOther: 0,
				},
			},
			returning: {
				count: 0,
				totalPrice: 0,
				payment: {
					totalFromBalance: 0,
					totalCash: 0,
				},
			},
		})

		const getClient = (clientId: string) => {
			if (!clientMap.has(clientId)) clientMap.set(clientId, createEmptyCalc())
			return clientMap.get(clientId)
		}

		// --- SELLING STATS ---
		const sellingStats = await this.prisma.sellingModel.groupBy({
			by: ['clientId'],
			where: {
				status: 'accepted',
				...(query.startDate && { date: { gte: query.startDate } }),
				...(query.endDate && { date: { lte: query.endDate } }),
			},
			_count: { clientId: true },
			_sum: { totalPrice: true },
		})

		for (const s of sellingStats) {
			const c = getClient(s.clientId)
			c.selling.count = Number(s._count.clientId)
			c.selling.totalPrice = Number(s._sum.totalPrice ?? 0)
		}

		// --- PAYMENT STATS ---
		const paymentStats = await this.prisma.paymentModel.groupBy({
			by: ['userId'],
			where: {
				type: { in: ['client', 'selling'] },
				deletedAt: null,
				total: { gt: 0 },
				...(query.startDate && { createdAt: { gte: query.startDate } }),
				...(query.endDate && { createdAt: { lte: query.endDate } }),
			},
			_count: { userId: true },
			_sum: { total: true, cash: true, card: true, transfer: true, other: true },
		})

		for (const p of paymentStats) {
			const c = getClient(p.userId)
			c.selling.payment.count = Number(p._count.userId)
			c.selling.payment.total = Number(p._sum.total ?? 0)
			c.selling.payment.totalCash = Number(p._sum.cash ?? 0)
			c.selling.payment.totalCard = Number(p._sum.card ?? 0)
			c.selling.payment.totalTransfer = Number(p._sum.transfer ?? 0)
			c.selling.payment.totalOther = Number(p._sum.other ?? 0)
		}

		// --- RETURNING STATS ---
		const returningStats = await this.prisma.returningModel.findMany({
			where: {
				status: 'accepted',
				...(query.startDate && { date: { gte: query.startDate } }),
				...(query.endDate && { date: { lte: query.endDate } }),
			},
			include: { payment: { select: { fromBalance: true, cash: true } } },
		})

		for (const r of returningStats) {
			const c = getClient(r.clientId)
			c.returning.count += 1
			c.returning.totalPrice += Number(r.totalPrice ?? 0)
			c.returning.payment.totalFromBalance += Number(r.payment?.fromBalance ?? 0)
			c.returning.payment.totalCash += Number(r.payment?.cash ?? 0)
		}

		return Object.fromEntries(clientMap)
	}

	async findOne(query: ClientFindOneRequest) {
		const client = await this.prisma.userModel.findFirst({
			where: { id: query.id, type: UserTypeEnum.client },
			select: {
				id: true,
				fullname: true,
				balance: true,
				phone: true,
				actions: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				payments: {
					where: { type: ServiceTypeEnum.client, deletedAt: null },
					select: { card: true, total: true, cash: true, other: true, transfer: true, createdAt: true, description: true },
				},
				sellings: {
					where: { status: SellingStatusEnum.accepted },
					select: {
						date: true,
						totalPrice: true,
						products: { select: { cost: true, count: true, price: true } },
						payment: {
							select: { total: true, card: true, cash: true, other: true, transfer: true, createdAt: true, description: true },
						},
					},
					orderBy: { date: 'desc' },
				},
				returnings: {
					where: { status: SellingStatusEnum.accepted },
					select: {
						payment: {
							select: { fromBalance: true, createdAt: true, description: true },
						},
					},
				},
				telegram: true,
			},
		})

		return client
	}

	async countFindMany(query: ClientFindManyRequest) {
		const clientsCount = await this.prisma.userModel.count({
			where: {
				fullname: query.fullname,
				type: UserTypeEnum.client,
				OR: [{ fullname: { contains: query.search, mode: 'insensitive' } }, { phone: { contains: query.search, mode: 'insensitive' } }],
			},
		})

		return clientsCount
	}

	async getMany(query: ClientGetManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const clients = await this.prisma.userModel.findMany({
			where: {
				id: { in: query.ids },
				type: UserTypeEnum.client,
				fullname: query.fullname,
			},
			...paginationOptions,
		})

		return clients
	}

	async getOne(query: ClientGetOneRequest) {
		const client = await this.prisma.userModel.findFirst({
			where: { id: query.id, fullname: query.fullname, phone: query.phone },
			select: { id: true, fullname: true, phone: true, createdAt: true, deletedAt: true, password: true, token: true },
		})

		return client
	}

	async countGetMany(query: ClientGetManyRequest) {
		const clientsCount = await this.prisma.userModel.count({
			where: {
				id: { in: query.ids },
				fullname: query.fullname,
				type: UserTypeEnum.client,
			},
		})

		return clientsCount
	}

	async createOne(body: ClientCreateOneRequest) {
		const password = await bcrypt.hash(body.phone, 7)

		const client = await this.prisma.userModel.create({
			data: {
				fullname: body.fullname,
				password: password,
				phone: body.phone,
				type: UserTypeEnum.client,
			},
			select: {
				id: true,
				fullname: true,
				phone: true,
				createdAt: true,
			},
		})
		return client
	}

	async updateOne(query: ClientGetOneRequest, body: ClientUpdateOneRequest) {
		const client = await this.prisma.userModel.update({
			where: { id: query.id },
			data: {
				fullname: body.fullname,
				phone: body.phone,
				balance: body.balance,
				deletedAt: body.deletedAt,
			},
		})

		return client
	}

	async deleteOne(query: ClientDeleteOneRequest) {
		const client = await this.prisma.userModel.delete({
			where: { id: query.id },
		})

		return client
	}

	async getActivity(query: ClientGetActivityRequest) {
		const bucket = query.bucket ?? ClientActivityBucketEnum.month1
		const pageNumber = query.pageNumber || 1
		const pageSize = query.pageSize || 20
		const countFilters = this.activityFilters(bucket)
		const pageFilters = this.activityFilters(bucket)
		const fromClients = bucket === ClientActivityBucketEnum.inactive

		const [summary] = fromClients
			? await this.prisma.$queryRaw<ClientActivityCountRow[]>`
				${this.activityCte()}
				SELECT COUNT(*)::int AS total_count
				FROM "user" u
				LEFT JOIN last_sale ls ON ls.client_id = u.id
				WHERE u.deleted_at IS NULL
					AND u.type = ${UserTypeEnum.client}::user_type
					AND (ls.last_date IS NULL OR ls.last_date < ${countFilters.inactiveBefore})
			`
			: await this.prisma.$queryRaw<ClientActivityCountRow[]>`
				${this.activityCte()}
				SELECT COUNT(*)::int AS total_count
				FROM last_sale ls
				INNER JOIN "user" u ON u.id = ls.client_id
				WHERE u.deleted_at IS NULL
					AND u.type = ${UserTypeEnum.client}::user_type
					${countFilters.fromFilter}
					${countFilters.toFilter}
			`

		const rows = fromClients
			? await this.prisma.$queryRaw<ClientActivityRow[]>`
				${this.activityCte()}
				SELECT u.id::text AS id, u.fullname, u.phone, ls.last_date
				FROM "user" u
				LEFT JOIN last_sale ls ON ls.client_id = u.id
				WHERE u.deleted_at IS NULL
					AND u.type = ${UserTypeEnum.client}::user_type
					AND (ls.last_date IS NULL OR ls.last_date < ${pageFilters.inactiveBefore})
				ORDER BY ls.last_date ASC NULLS FIRST, u.fullname ASC
				OFFSET ${(pageNumber - 1) * pageSize}
				LIMIT ${pageSize}
			`
			: await this.prisma.$queryRaw<ClientActivityRow[]>`
				${this.activityCte()}
				SELECT u.id::text AS id, u.fullname, u.phone, ls.last_date
				FROM last_sale ls
				INNER JOIN "user" u ON u.id = ls.client_id
				WHERE u.deleted_at IS NULL
					AND u.type = ${UserTypeEnum.client}::user_type
					${pageFilters.fromFilter}
					${pageFilters.toFilter}
				${pageFilters.orderBy}
				OFFSET ${(pageNumber - 1) * pageSize}
				LIMIT ${pageSize}
			`

		const totalCount = this.toNumber(summary?.total_count)

		return {
			totalCount,
			pagesCount: pageSize ? Math.ceil(totalCount / pageSize) : 0,
			pageSize,
			data: rows.map((row) => ({
				id: row.id,
				fullname: row.fullname,
				phone: row.phone,
				lastPurchaseDate: row.last_date ? new Date(row.last_date).toISOString() : null,
			})),
		}
	}

	async getProfitRank(query: ClientGetProfitRankRequest) {
		const pageNumber = query.pageNumber || 1
		const pageSize = query.pageSize || 20
		const now = new Date()
		const startDate = query.startDate ? new Date(query.startDate) : new Date(now.getFullYear(), now.getMonth(), 1)
		const endDate = query.endDate ? new Date(query.endDate) : new Date(new Date().setHours(23, 59, 59, 999))

		const [summary] = await this.prisma.$queryRaw<ClientProfitSummaryRow[]>`
			${this.profitRankCte(startDate, endDate)}
			SELECT
				COUNT(*)::int AS total_count,
				COUNT(*) FILTER (WHERE sale_count > 0)::int AS client_count,
				COALESCE(SUM(sale_count) FILTER (WHERE sale_count > 0), 0)::int AS sale_count,
				COALESCE(SUM(revenue) FILTER (WHERE sale_count > 0), 0)::float8 AS revenue,
				COALESCE(SUM(profit), 0)::float8 AS profit
			FROM ranked
		`

		const rows = await this.prisma.$queryRaw<ClientProfitRow[]>`
			${this.profitRankCte(startDate, endDate)}
			SELECT id, fullname, phone, sale_count, revenue, profit
			FROM ranked
			ORDER BY profit DESC NULLS LAST, sale_count DESC, fullname ASC
			OFFSET ${(pageNumber - 1) * pageSize}
			LIMIT ${pageSize}
		`

		const totalCount = this.toNumber(summary?.total_count)

		return {
			totalCount,
			pagesCount: pageSize ? Math.ceil(totalCount / pageSize) : 0,
			pageSize,
			summary: {
				clientCount: this.toNumber(summary?.client_count),
				saleCount: this.toNumber(summary?.sale_count),
				revenue: this.toNumber(summary?.revenue),
				profit: this.toNumber(summary?.profit),
			},
			data: rows.map((row) => ({
				id: row.id,
				fullname: row.fullname,
				phone: row.phone,
				saleCount: this.toNumber(row.sale_count),
				revenue: this.toNumber(row.revenue),
				profit: this.toNumber(row.profit),
			})),
		}
	}

	private activityCte() {
		return Prisma.sql`
			WITH last_sale AS (
				SELECT s.client_id, MAX(s.date) AS last_date
				FROM selling s
				WHERE s.deleted_at IS NULL
					AND s.status = ${SellingStatusEnum.accepted}::selling_status
				GROUP BY s.client_id
			)
		`
	}

	private activityFilters(bucket: ClientActivityBucketEnum) {
		const now = Date.now()
		const day = 24 * 60 * 60 * 1000
		const ago = (days: number) => new Date(now - days * day)
		const range = {
			[ClientActivityBucketEnum.month1]: { from: ago(30), to: null, newestFirst: true },
			[ClientActivityBucketEnum.month2]: { from: ago(60), to: ago(30), newestFirst: true },
			[ClientActivityBucketEnum.month3]: { from: ago(90), to: ago(60), newestFirst: true },
			[ClientActivityBucketEnum.inactive]: { from: null, to: ago(90), newestFirst: false },
		}[bucket]

		return {
			fromFilter: range.from ? Prisma.sql`AND ls.last_date >= ${range.from}` : Prisma.empty,
			toFilter: range.to ? Prisma.sql`AND ls.last_date < ${range.to}` : Prisma.empty,
			inactiveBefore: range.to ?? new Date(0),
			orderBy: range.newestFirst ? Prisma.sql`ORDER BY ls.last_date DESC, u.fullname ASC` : Prisma.sql`ORDER BY ls.last_date ASC NULLS FIRST, u.fullname ASC`,
		}
	}

	private profitRankCte(startDate: Date, endDate: Date) {
		return Prisma.sql`
			WITH sales AS (
				SELECT
					s.client_id,
					COUNT(DISTINCT s.id)::int AS sale_count,
					COALESCE(SUM(pm.total_price), 0)::float8 AS revenue,
					COALESCE(SUM(pm.total_price - (pr.cost * pm.count)), 0)::float8 AS profit
				FROM product_mv pm
				INNER JOIN selling s ON s.id = pm.selling_id
				INNER JOIN product pr ON pr.id = pm.product_id
				WHERE pm.deleted_at IS NULL
					AND s.deleted_at IS NULL
					AND pm.type = ${ServiceTypeEnum.selling}::service_type
					AND s.status = ${SellingStatusEnum.accepted}::selling_status
					AND s.date >= ${startDate}
					AND s.date <= ${endDate}
				GROUP BY s.client_id
			),
			returns AS (
				SELECT
					r.client_id,
					COALESCE(SUM(pm.total_price - (pr.cost * pm.count)), 0)::float8 AS profit
				FROM product_mv pm
				INNER JOIN "returning" r ON r.id = pm.returning_id
				INNER JOIN product pr ON pr.id = pm.product_id
				WHERE pm.deleted_at IS NULL
					AND r.deleted_at IS NULL
					AND pm.type = ${ServiceTypeEnum.returning}::service_type
					AND r.status = ${SellingStatusEnum.accepted}::selling_status
					AND r.date >= ${startDate}
					AND r.date <= ${endDate}
				GROUP BY r.client_id
			),
			ranked AS (
				SELECT
					u.id::text AS id,
					u.fullname AS fullname,
					u.phone AS phone,
					COALESCE(s.sale_count, 0)::int AS sale_count,
					COALESCE(s.revenue, 0)::float8 AS revenue,
					(COALESCE(s.profit, 0) - COALESCE(rt.profit, 0))::float8 AS profit
				FROM "user" u
				LEFT JOIN sales s ON s.client_id = u.id
				LEFT JOIN returns rt ON rt.client_id = u.id
				WHERE u.deleted_at IS NULL
					AND u.type = ${UserTypeEnum.client}::user_type
					AND (s.client_id IS NOT NULL OR rt.client_id IS NOT NULL)
			)
		`
	}

	private toNumber(value: unknown) {
		const numberValue = Number(value ?? 0)

		return Number.isFinite(numberValue) ? numberValue : 0
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(ClientController)
	}
}

type ClientActivityRow = {
	id: string
	fullname: string
	phone: string
	last_date: Date | null
}

type ClientActivityCountRow = {
	total_count: number
}

type ClientProfitRow = {
	id: string
	fullname: string
	phone: string
	sale_count: number
	revenue: number
	profit: number
}

type ClientProfitSummaryRow = {
	total_count: number
	client_count: number
	sale_count: number
	revenue: number
	profit: number
}
