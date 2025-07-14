import { Injectable } from '@nestjs/common'
import { PrismaService } from '../shared/prisma'
import {
	ArrivalProductMVCreateOneRequest,
	ArrivalProductMVUpdateOneRequest,
	ProductMVDeleteOneRequest,
	ProductMVFindManyRequest,
	ProductMVFindOneRequest,
	ProductMVGetManyRequest,
	ProductMVGetOneRequest,
	ReturningProductMVCreateOneRequest,
	ReturningProductMVUpdateOneRequest,
	SellingProductMVCreateOneRequest,
	SellingProductMVUpdateOneRequest,
} from './interfaces'
import { ProductMVController } from './product-mv.controller'
import { SellingStatusEnum, ServiceTypeEnum } from '@prisma/client'

@Injectable()
export class ProductMVRepository {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async findMany(query: ProductMVFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const productMVs = await this.prisma.productMVModel.findMany({
			where: {
				sellingId: query.sellingId,
				arrivalId: query.arrivalId,
				productId: query.productId,
				returningId: query.returningId,
				staffId: query.staffId,
				type: query.type,
			},
			...paginationOptions,
		})

		return productMVs
	}

	async findOne(query: ProductMVFindOneRequest) {
		const product = await this.prisma.productMVModel.findFirst({
			where: { id: query.id },
		})

		return product
	}

	async countFindMany(query: ProductMVFindManyRequest) {
		const productMVsCount = await this.prisma.productMVModel.count({
			where: {
				sellingId: query.sellingId,
				arrivalId: query.arrivalId,
				productId: query.productId,
				returningId: query.returningId,
				staffId: query.staffId,
				type: query.type,
			},
		})

		return productMVsCount
	}

	async getMany(query: ProductMVGetManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const productMVs = await this.prisma.productMVModel.findMany({
			where: {
				sellingId: query.sellingId,
				arrivalId: query.arrivalId,
				productId: query.productId,
				returningId: query.returningId,
				staffId: query.staffId,
				type: query.type,
			},
			...paginationOptions,
		})

		return productMVs
	}

	async getOne(query: ProductMVGetOneRequest) {
		const product = await this.prisma.productMVModel.findFirst({
			where: {
				sellingId: query.sellingId,
				arrivalId: query.arrivalId,
				productId: query.productId,
				returningId: query.returningId,
				staffId: query.staffId,
				type: query.type,
			},
			select: { selling: true, arrival: true, returning: true, type: true, product: true, price: true, count: true, cost: true, id: true },
		})

		return product
	}

	async countGetMany(query: ProductMVGetManyRequest) {
		const productMVsCount = await this.prisma.productMVModel.count({
			where: {
				sellingId: query.sellingId,
				arrivalId: query.arrivalId,
				productId: query.productId,
				returningId: query.returningId,
				staffId: query.staffId,
				type: query.type,
			},
		})

		return productMVsCount
	}

	async createOneSelling(body: SellingProductMVCreateOneRequest) {
		const product = await this.prisma.productMVModel.create({
			data: {
				count: body.count,
				price: body.price,
				sellingId: body.sellingId,
				type: ServiceTypeEnum.selling,
				productId: body.productId,
				staffId: body.staffId,
			},
			select: {
				id: true,
				selling: {
					select: {
						id: true,
						status: true,
						updatedAt: true,
						createdAt: true,
						deletedAt: true,
						date: true,
						send: true,
						sended: true,
						client: { select: { fullname: true, phone: true, id: true, createdAt: true, telegram: true } },
						staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
						payment: { select: { id: true, card: true, cash: true, other: true, transfer: true, description: true } },
						products: { select: { createdAt: true, id: true, price: true, count: true, product: { select: { name: true, id: true, createdAt: true } } } },
					},
				},
				cost: true,
				count: true,
				price: true,
				product: true,
			},
		})

		if (product.selling.status === SellingStatusEnum.accepted) {
			await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { decrement: product.count } } })
		}

		return product
	}

	async createOneArrival(body: ArrivalProductMVCreateOneRequest) {
		const product = await this.prisma.productMVModel.create({
			data: {
				count: body.count,
				price: body.price,
				arrivalId: body.arrivalId,
				type: ServiceTypeEnum.arrival,
				productId: body.productId,
				staffId: body.staffId,
			},
			select: {
				product: true,
				cost: true,
				count: true,
				price: true,
			},
		})

		await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { increment: product.count }, price: product.price, cost: product.cost } })

		return product
	}

	async createOneReturning(body: ReturningProductMVCreateOneRequest) {
		const product = await this.prisma.productMVModel.create({
			data: {
				count: body.count,
				price: body.price,
				returningId: body.returningId,
				type: ServiceTypeEnum.returning,
				productId: body.productId,
				staffId: body.staffId,
			},
			select: { returning: true, product: true, count: true },
		})

		if (product.returning.status === SellingStatusEnum.accepted) {
			await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { increment: product.count } } })
		}

		return product
	}

	async updateOneSelling(query: ProductMVGetOneRequest, body: SellingProductMVUpdateOneRequest) {
		const pr = await this.getOne({ id: query.id })

		const oldCount = pr.count
		const newCount = body.count

		let difference = 0
		if (pr.selling.status === SellingStatusEnum.accepted) {
			difference = oldCount - newCount
		}

		const product = await this.prisma.productMVModel.update({
			where: { id: query.id },
			data: {
				count: newCount,
				price: body.price,
				productId: body.productId,
				sellingId: body.sellingId,
			},
			select: {
				selling: true,
				product: true,
				price: true,
				count: true,
			},
		})

		if (product.selling.status === SellingStatusEnum.accepted) {
			await this.prisma.productModel.update({
				where: { id: product.product.id },
				data: { count: { increment: difference } },
			})
		}

		return product
	}

	async updateOneArrival(query: ProductMVGetOneRequest, body: ArrivalProductMVUpdateOneRequest) {
		const pr = await this.getOne({ id: query.id })

		const oldCount = pr.count
		const newCount = body.count

		let difference = 0
		if (pr.selling.status === SellingStatusEnum.accepted) {
			difference = oldCount - newCount
		}

		const product = await this.prisma.productMVModel.update({
			where: { id: query.id },
			data: {
				count: body.count,
				price: body.price,
				cost: body.cost,
				productId: body.productId,
				arrivalId: body.arrivalId,
			},
			select: { arrival: true, product: true, cost: true, count: true, price: true },
		})

		await this.prisma.productModel.update({
			where: { id: product.product.id },
			data: { count: { increment: difference }, cost: product.cost, price: product.price },
		})

		return product
	}

	async updateOneReturning(query: ProductMVGetOneRequest, body: ReturningProductMVUpdateOneRequest) {
		const pr = await this.getOne({ id: query.id })

		const oldCount = pr.count
		const newCount = body.count

		let difference = 0
		if (pr.returning.status === SellingStatusEnum.accepted) {
			difference = oldCount - newCount
		}

		const product = await this.prisma.productMVModel.update({
			where: { id: query.id },
			data: {
				count: newCount,
				price: body.price,
				productId: body.productId,
				returningId: body.returningId,
			},
			select: { returning: true, product: true },
		})

		if (product.returning.status === SellingStatusEnum.accepted) {
			await this.prisma.productModel.update({
				where: { id: product.product.id },
				data: { count: { increment: difference } },
			})
		}

		return product
	}

	async deleteOne(query: ProductMVDeleteOneRequest) {
		const product = await this.prisma.productMVModel.delete({
			where: { id: query.id },
			select: { type: true, product: true, count: true, selling: true, arrival: true, returning: true },
		})

		if (product.type === ServiceTypeEnum.selling) {
			if (product.selling && product.selling.status === SellingStatusEnum.accepted) {
				await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { increment: product.count } } })
			}
		} else if (product.type === ServiceTypeEnum.arrival) {
			await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { decrement: product.count } } })
		} else if (product.type === ServiceTypeEnum.returning) {
			if (product.returning && product.returning.status === SellingStatusEnum.accepted) {
				await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { decrement: product.count } } })
			}
		}

		return product
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(ProductMVController)
	}
}
