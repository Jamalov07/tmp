import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../shared/prisma'
import {
	ClientCreateOneRequest,
	ClientDeleteOneRequest,
	ClientFindManyRequest,
	ClientFindOneRequest,
	ClientGetManyRequest,
	ClientGetOneRequest,
	ClientUpdateOneRequest,
} from './interfaces'
import { SellingStatusEnum, ServiceTypeEnum, UserTypeEnum } from '@prisma/client'
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
					where: { type: ServiceTypeEnum.client, deletedAt: null, id: query.id },
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

	async onModuleInit() {
		await this.prisma.createActionMethods(ClientController)
	}
}
