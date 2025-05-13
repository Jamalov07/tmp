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
			},
			select: {
				id: true,
				date: true,
				clientId: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
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
				date: true,
				clientId: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
			},
		})

		return returning
	}

	async countFindMany(query: ReturningFindManyRequest) {
		const returningsCount = await this.prisma.returningModel.count({
			where: {
				clientId: query.clientId,
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
				date: body.date,
				staffId: body.staffId,
			},
		})
		return returning
	}

	async updateOne(query: ReturningGetOneRequest, body: ReturningUpdateOneRequest) {
		const returning = await this.prisma.returningModel.update({
			where: { id: query.id },
			data: {
				clientId: body.clientId,
				date: body.date,
				deletedAt: body.deletedAt,
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

	async onModuleInit() {
		await this.prisma.createActionMethods(ReturningController)
	}
}
