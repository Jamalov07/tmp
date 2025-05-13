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
			},
			select: {
				id: true,
				date: true,
				supplierId: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
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
				supplierId: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
			},
		})

		return arrival
	}

	async countFindMany(query: ArrivalFindManyRequest) {
		const arrivalsCount = await this.prisma.arrivalModel.count({
			where: {
				supplierId: query.supplierId,
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
