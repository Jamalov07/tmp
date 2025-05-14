import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../shared/prisma'
import {
	SellingCreateOneRequest,
	SellingDeleteOneRequest,
	SellingFindManyRequest,
	SellingFindOneRequest,
	SellingGetManyRequest,
	SellingGetOneRequest,
	SellingUpdateOneRequest,
} from './interfaces'
import { SellingController } from './selling.controller'
import { ServiceTypeEnum } from '@prisma/client'

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
				client: true,
				staff: true,
				payment: true,
				products: { select: { price: true, count: true, product: { select: { name: true } } } },
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
				client: true,
				staff: true,
				payment: true,
				products: { select: { price: true, count: true, product: { select: { name: true } } } },
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
				date: body.date,
				staffId: body.staffId,
				send: body.send,
				sended: body.sended,
				payment: {
					create: {
						card: body.payment.card,
						cash: body.payment.cash,
						other: body.payment.other,
						transfer: body.payment.transfer,
						description: body.payment.description,
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
		})
		return selling
	}

	async updateOne(query: SellingGetOneRequest, body: SellingUpdateOneRequest) {
		const selling = await this.prisma.sellingModel.update({
			where: { id: query.id },
			data: {
				date: body.date,
				status: body.status,
				clientId: body.clientId,
				deletedAt: body.deletedAt,
				payment: {
					update: {
						card: body.payment.card,
						cash: body.payment.cash,
						other: body.payment.other,
						transfer: body.payment.transfer,
						description: body.payment.description,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: body.products.map((p) => ({ productId: p.productId, type: ServiceTypeEnum.selling, count: p.count, price: p.price, staffId: body.staffId })),
					},
					deleteMany: body.productIdsToRemove.map((id) => ({ id: id })),
				},
			},
		})

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
}
