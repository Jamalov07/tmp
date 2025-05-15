import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../shared/prisma'
import {
	ReturningCreateOneRequest,
	ReturningDeleteOneRequest,
	ReturningFindManyRequest,
	ReturningFindOneRequest,
	ReturningGetManyRequest,
	ReturningGetOneRequest,
	ReturningUpdateOneRequest,
} from './interfaces'
import { ReturningController } from './returning.controller'
import { ServiceTypeEnum } from '@prisma/client'

@Injectable()
export class ReturningRepository implements OnModuleInit {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async findMany(query: ReturningFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const returnings = await this.prisma.returningModel.findMany({
			where: {
				clientId: query.clientId,
				OR: [{ client: { fullname: { contains: query.search, mode: 'insensitive' } } }, { client: { phone: { contains: query.search, mode: 'insensitive' } } }],
				date: {
					gte: query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined,
					lte: query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined,
				},
			},
			select: {
				id: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { id: true, cash: true, fromBalance: true } },
				products: { select: { id: true, price: true, count: true, product: { select: { name: true } } } },
			},
			...paginationOptions,
		})

		return returnings
	}

	async findOne(query: ReturningFindOneRequest) {
		const returning = await this.prisma.returningModel.findFirst({
			where: { id: query.id },
			select: {
				id: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { id: true, cash: true, fromBalance: true } },
				products: { select: { id: true, price: true, count: true, product: { select: { name: true } } } },
			},
		})

		return returning
	}

	async countFindMany(query: ReturningFindManyRequest) {
		const returningsCount = await this.prisma.returningModel.count({
			where: {
				clientId: query.clientId,
				OR: [{ client: { fullname: { contains: query.search, mode: 'insensitive' } } }, { client: { phone: { contains: query.search, mode: 'insensitive' } } }],
				date: {
					gte: query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined,
					lte: query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined,
				},
			},
		})

		return returningsCount
	}

	async getMany(query: ReturningGetManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const returnings = await this.prisma.returningModel.findMany({
			where: {
				id: { in: query.ids },
				clientId: query.clientId,
			},
			...paginationOptions,
		})

		return returnings
	}

	async getOne(query: ReturningGetOneRequest) {
		const returning = await this.prisma.returningModel.findFirst({
			where: { id: query.id, clientId: query.clientId, staffId: query.staffId },
		})

		return returning
	}

	async countGetMany(query: ReturningGetManyRequest) {
		const returningsCount = await this.prisma.returningModel.count({
			where: {
				id: { in: query.ids },
				clientId: query.clientId,
			},
		})

		return returningsCount
	}

	async createOne(body: ReturningCreateOneRequest) {
		const returning = await this.prisma.returningModel.create({
			data: {
				clientId: body.clientId,
				date: new Date(body.date),
				staffId: body.staffId,
				payment: {
					create: {
						cash: body.payment?.cash,
						fromBalance: body.payment?.fromBalance,
						userId: body.clientId,
						staffId: body.staffId,
						type: ServiceTypeEnum.returning,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: body.products
							? body.products?.map((p) => ({ productId: p.productId, type: ServiceTypeEnum.returning, count: p.count, price: p.price, staffId: body.staffId }))
							: [],
					},
				},
			},
			select: {
				id: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				date: true,
				client: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
				payment: { select: { id: true, cash: true, fromBalance: true } },
				products: { select: { id: true, price: true, count: true, product: { select: { name: true } } } },
			},
		})
		return returning
	}

	async updateOne(query: ReturningGetOneRequest, body: ReturningUpdateOneRequest) {
		const returning = await this.prisma.returningModel.update({
			where: { id: query.id },
			data: {
				clientId: body.clientId,
				date: body.date ? new Date(body.date) : undefined,
				deletedAt: body.deletedAt,
				payment: {
					update: {
						cash: body.payment?.cash,
						fromBalance: body.payment?.fromBalance,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: body.products
							? body.products?.map((p) => ({ productId: p.productId, type: ServiceTypeEnum.returning, count: p.count, price: p.price, staffId: body.staffId }))
							: [],
					},
					deleteMany: body.productIdsToRemove?.map((id) => ({ id: id })),
				},
			},
		})

		return returning
	}

	async deleteOne(query: ReturningDeleteOneRequest) {
		const returning = await this.prisma.returningModel.delete({
			where: { id: query.id },
		})

		return returning
	}

	async findManyReturningProductMv(ids: string[]) {
		const productmvs = await this.prisma.productMVModel.findMany({
			where: { id: { in: ids }, type: ServiceTypeEnum.returning },
			select: {
				id: true,
				price: true,
				cost: true,
				count: true,
				product: true,
			},
		})

		return productmvs
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(ReturningController)
	}
}
