import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../shared/prisma'
import {
	StaffCreateOneRequest,
	StaffDeleteOneRequest,
	StaffFindManyRequest,
	StaffFindOneRequest,
	StaffGetManyRequest,
	StaffGetOneRequest,
	StaffUpdateOneRequest,
} from './interfaces'
import { StaffController } from './staff.controller'
import { UserTypeEnum } from '@prisma/client'

@Injectable()
export class StaffRepository implements OnModuleInit {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async findMany(query: StaffFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const users = await this.prisma.userModel.findMany({
			where: {
				fullname: query.fullname,
				type: UserTypeEnum.staff,
				OR: [{ fullname: { contains: query.search, mode: 'insensitive' } }, { phone: { contains: query.search, mode: 'insensitive' } }],
			},
			select: {
				id: true,
				fullname: true,
				phone: true,
				actions: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
			},
			...paginationOptions,
		})

		return users
	}

	async findOne(query: StaffFindOneRequest) {
		const user = await this.prisma.userModel.findFirst({
			where: { id: query.id },
			select: {
				id: true,
				fullname: true,
				phone: true,
				actions: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
			},
		})

		return user
	}

	async countFindMany(query: StaffFindManyRequest) {
		const usersCount = await this.prisma.userModel.count({
			where: {
				fullname: query.fullname,
				type: UserTypeEnum.staff,
				OR: [{ fullname: { contains: query.search, mode: 'insensitive' } }, { phone: { contains: query.search, mode: 'insensitive' } }],
			},
		})

		return usersCount
	}

	async getMany(query: StaffGetManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const users = await this.prisma.userModel.findMany({
			where: {
				id: { in: query.ids },
				type: UserTypeEnum.staff,
				fullname: query.fullname,
			},
			...paginationOptions,
		})

		return users
	}

	async getOne(query: StaffGetOneRequest) {
		const user = await this.prisma.userModel.findFirst({
			where: { id: query.id, fullname: query.fullname, phone: query.phone },
			select: { id: true, fullname: true, phone: true, createdAt: true, deletedAt: true, password: true, token: true },
		})

		return user
	}

	async countGetMany(query: StaffGetManyRequest) {
		const usersCount = await this.prisma.userModel.count({
			where: {
				id: { in: query.ids },
				type: UserTypeEnum.staff,
				fullname: query.fullname,
			},
		})

		return usersCount
	}

	async createOne(body: StaffCreateOneRequest) {
		const user = await this.prisma.userModel.create({
			data: {
				fullname: body.fullname,
				password: body.password,
				phone: body.phone,
				type: UserTypeEnum.staff,
				actions: { connect: body.actionsToConnect.map((r) => ({ id: r })) },
			},
			select: {
				id: true,
				createdAt: true,
				fullname: true,
				phone: true,
				actions: { select: { id: true, description: true, method: true, url: true, name: true, permission: true } },
			},
		})
		return user
	}

	async updateOne(query: StaffGetOneRequest, body: StaffUpdateOneRequest) {
		const user = await this.prisma.userModel.update({
			where: { id: query.id },
			data: {
				fullname: body.fullname,
				password: body.password,
				phone: body.phone,
				token: body.token,
				deletedAt: body.deletedAt,
				actions: {
					connect: (body.actionsToConnect ?? []).map((r) => ({ id: r })),
					disconnect: (body.actionsToDisconnect ?? []).map((r) => ({ id: r })),
				},
			},
		})

		return user
	}

	async deleteOne(query: StaffDeleteOneRequest) {
		const user = await this.prisma.userModel.delete({
			where: { id: query.id },
		})

		return user
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(StaffController)
	}
}
