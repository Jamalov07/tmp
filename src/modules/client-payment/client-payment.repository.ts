import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../shared/prisma'
import {
	ClientPaymentCreateOneRequest,
	ClientPaymentDeleteOneRequest,
	ClientPaymentFindManyRequest,
	ClientPaymentFindOneRequest,
	ClientPaymentGetManyRequest,
	ClientPaymentGetOneRequest,
	ClientPaymentUpdateOneRequest,
} from './interfaces'
import { ClientPaymentController } from './client-payment.controller'
import { ServiceTypeEnum } from '@prisma/client'

@Injectable()
export class ClientPaymentRepository implements OnModuleInit {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async findMany(query: ClientPaymentFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const clientPayments = await this.prisma.paymentModel.findMany({
			where: {
				staffId: query.staffId,
				type: ServiceTypeEnum.client,
				OR: [{ user: { fullname: { contains: query.search, mode: 'insensitive' } } }, { user: { phone: { contains: query.search, mode: 'insensitive' } } }],
				createdAt: {
					gte: query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined,
					lte: query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined,
				},
			},
			select: {
				id: true,
				staffId: true,
				card: true,
				cash: true,
				description: true,
				other: true,
				transfer: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
			},
			...paginationOptions,
		})

		return clientPayments
	}

	async findOne(query: ClientPaymentFindOneRequest) {
		const clientPayment = await this.prisma.paymentModel.findFirst({
			where: { id: query.id },
			select: {
				id: true,
				staffId: true,
				card: true,
				cash: true,
				description: true,
				other: true,
				transfer: true,
				updatedAt: true,
				createdAt: true,
				deletedAt: true,
			},
		})

		return clientPayment
	}

	async countFindMany(query: ClientPaymentFindManyRequest) {
		const clientPaymentsCount = await this.prisma.paymentModel.count({
			where: {
				staffId: query.staffId,
				type: ServiceTypeEnum.client,
				OR: [{ user: { fullname: { contains: query.search, mode: 'insensitive' } } }, { user: { phone: { contains: query.search, mode: 'insensitive' } } }],
				createdAt: {
					gte: query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined,
					lte: query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined,
				},
			},
		})

		return clientPaymentsCount
	}

	async getMany(query: ClientPaymentGetManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const clientPayments = await this.prisma.paymentModel.findMany({
			where: {
				id: { in: query.ids },
				type: ServiceTypeEnum.client,
				staffId: query.staffId,
			},
			...paginationOptions,
		})

		return clientPayments
	}

	async getOne(query: ClientPaymentGetOneRequest) {
		const clientPayment = await this.prisma.paymentModel.findFirst({
			where: { id: query.id, staffId: query.staffId },
		})

		return clientPayment
	}

	async countGetMany(query: ClientPaymentGetManyRequest) {
		const clientPaymentsCount = await this.prisma.paymentModel.count({
			where: {
				id: { in: query.ids },
				staffId: query.staffId,
				type: ServiceTypeEnum.client,
			},
		})

		return clientPaymentsCount
	}

	async createOne(body: ClientPaymentCreateOneRequest) {
		const clientPayment = await this.prisma.paymentModel.create({
			data: {
				card: body.card,
				cash: body.cash,
				other: body.other,
				transfer: body.transfer,
				userId: body.userId,
				staffId: body.staffId,
				description: body.description,
				type: ServiceTypeEnum.client,
			},
		})
		return clientPayment
	}

	async updateOne(query: ClientPaymentGetOneRequest, body: ClientPaymentUpdateOneRequest) {
		const clientPayment = await this.prisma.paymentModel.update({
			where: { id: query.id },
			data: {
				card: body.card,
				cash: body.cash,
				other: body.other,
				transfer: body.transfer,
				userId: body.userId,
				description: body.description,
			},
		})

		return clientPayment
	}

	async deleteOne(query: ClientPaymentDeleteOneRequest) {
		const clientPayment = await this.prisma.paymentModel.delete({
			where: { id: query.id },
		})

		return clientPayment
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(ClientPaymentController)
	}
}
