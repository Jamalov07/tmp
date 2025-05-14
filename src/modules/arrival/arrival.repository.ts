import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../shared/prisma'
import {
	ArrivalCreateOneRequest,
	ArrivalDeleteOneRequest,
	ArrivalFindManyRequest,
	ArrivalFindOneRequest,
	ArrivalGetManyRequest,
	ArrivalGetOneRequest,
	ArrivalUpdateOneRequest,
} from './interfaces'
import { ArrivalController } from './arrival.controller'
import { ServiceTypeEnum } from '@prisma/client'

@Injectable()
export class ArrivalRepository implements OnModuleInit {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async findMany(query: ArrivalFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const arrivals = await this.prisma.arrivalModel.findMany({
			where: {
				supplierId: query.supplierId,
				OR: [{ supplier: { fullname: { contains: query.search, mode: 'insensitive' } } }, { supplier: { phone: { contains: query.search, mode: 'insensitive' } } }],
				date: {
					gte: query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined,
					lte: query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined,
				},
			},
			select: {
				id: true,
				date: true,
				supplier: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				staff: true,
				payment: true,
				products: { select: { price: true, count: true, cost: true, product: { select: { name: true } } } },
			},
			...paginationOptions,
		})

		return arrivals
	}

	async findOne(query: ArrivalFindOneRequest) {
		const arrival = await this.prisma.arrivalModel.findFirst({
			where: { id: query.id },
			select: {
				id: true,
				date: true,
				supplier: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				staff: true,
				payment: true,
				products: { select: { price: true, count: true, cost: true, product: { select: { name: true } } } },
			},
		})

		return arrival
	}

	async countFindMany(query: ArrivalFindManyRequest) {
		const arrivalsCount = await this.prisma.arrivalModel.count({
			where: {
				supplierId: query.supplierId,
				OR: [{ supplier: { fullname: { contains: query.search, mode: 'insensitive' } } }, { supplier: { phone: { contains: query.search, mode: 'insensitive' } } }],
				date: {
					gte: query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined,
					lte: query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined,
				},
			},
		})

		return arrivalsCount
	}

	async getMany(query: ArrivalGetManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const arrivals = await this.prisma.arrivalModel.findMany({
			where: {
				id: { in: query.ids },
				supplierId: query.supplierId,
			},
			select: {
				id: true,
				date: true,
				supplier: {
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
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
				staff: true,
				payment: true,
				products: { select: { price: true, count: true, cost: true, product: { select: { name: true } } } },
			},
			...paginationOptions,
		})

		return arrivals
	}

	async getOne(query: ArrivalGetOneRequest) {
		const arrival = await this.prisma.arrivalModel.findFirst({
			where: { id: query.id, supplierId: query.supplierId, staffId: query.staffId },
		})

		return arrival
	}

	async countGetMany(query: ArrivalGetManyRequest) {
		const arrivalsCount = await this.prisma.arrivalModel.count({
			where: {
				id: { in: query.ids },
				supplierId: query.supplierId,
			},
		})

		return arrivalsCount
	}

	async createOne(body: ArrivalCreateOneRequest) {
		const arrival = await this.prisma.arrivalModel.create({
			data: {
				supplierId: body.supplierId,
				date: body.date,
				staffId: body.staffId,
				payment: {
					create: {
						card: body.payment.card,
						cash: body.payment.cash,
						other: body.payment.other,
						transfer: body.payment.transfer,
						description: body.payment.description,
						userId: body.supplierId,
						staffId: body.staffId,
						type: ServiceTypeEnum.arrival,
					},
				},
				products: {
					createMany: {
						skipDuplicates: false,
						data: body.products.map((p) => ({ productId: p.productId, type: ServiceTypeEnum.arrival, cost: p.cost, count: p.count, price: p.price, staffId: body.staffId })),
					},
				},
			},
		})
		return arrival
	}

	async updateOne(query: ArrivalGetOneRequest, body: ArrivalUpdateOneRequest) {
		const arrival = await this.prisma.arrivalModel.update({
			where: { id: query.id },
			data: {
				supplierId: body.supplierId,
				date: body.date,
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
						data: body.products.map((p) => ({ productId: p.productId, cost: p.cost, type: ServiceTypeEnum.selling, count: p.count, price: p.price, staffId: body.staffId })),
					},
					deleteMany: body.productIdsToRemove.map((id) => ({ id: id })),
				},
			},
		})

		return arrival
	}

	async deleteOne(query: ArrivalDeleteOneRequest) {
		const arrival = await this.prisma.arrivalModel.delete({
			where: { id: query.id },
		})

		return arrival
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(ArrivalController)
	}
}
