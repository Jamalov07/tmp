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
			},
			select: {
				id: true,
				status: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
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
			},
		})

		return selling
	}

	async countFindMany(query: SellingFindManyRequest) {
		const sellingsCount = await this.prisma.sellingModel.count({
			where: {
				status: query.status,
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
			},
		})
		return selling
	}

	async updateOne(query: SellingGetOneRequest, body: SellingUpdateOneRequest) {
		const selling = await this.prisma.sellingModel.update({
			where: { id: query.id },
			data: {
				status: body.status,
				clientId: body.clientId,
				date: body.date,
				deletedAt: body.deletedAt,
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
