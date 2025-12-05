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
	constructor(private readonly prisma: PrismaService) {}

	async findMany(query: ProductMVFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const productMVs = await this.prisma.productMVModel.findMany({
			select: {
				id: true,
				price: true,
				cost: true,
				count: true,
				product: { select: { id: true, name: true, createdAt: true } },
				totalCost: true,
				totalPrice: true,
				type: true,
				selling: {
					select: { publicId: true, id: true, createdAt: true, date: true, status: true, client: { select: { id: true, fullname: true, phone: true, createdAt: true } } },
				},
				arrival: { select: { id: true, date: true, supplier: { select: { id: true, fullname: true, phone: true, createdAt: true } } } },
				returning: { select: { id: true, date: true, client: { select: { id: true, fullname: true, phone: true, createdAt: true } } } },
				createdAt: true,
				staff: { select: { id: true, fullname: true } },
			},
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
			select: {
				totalCost: true,
				totalPrice: true,
				selling: true,
				arrival: true,
				returning: true,
				type: true,
				product: true,
				price: true,
				count: true,
				cost: true,
				id: true,
			},
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
				totalPrice: body.totalPrice,
				count: body.count,
				price: body.price,
				sellingId: body.sellingId,
				type: ServiceTypeEnum.selling,
				productId: body.productId,
				staffId: body.staffId,
			},
			select: {
				id: true,
				totalPrice: true,
				createdAt: true,
				selling: {
					select: {
						id: true,
						totalPrice: true,
						status: true,
						publicId: true,
						createdAt: true,
						date: true,
						client: { select: { fullname: true, phone: true, id: true, createdAt: true, telegram: true } },
						staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
						payment: { select: { id: true, card: true, cash: true, other: true, transfer: true, description: true, total: true } },
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
				totalCost: body.totalCost,
				totalPrice: body.totalPrice,
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
				arrival: true,
				totalCost: true,
				totalPrice: true,
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
				totalPrice: body.totalPrice,
			},
			select: { returning: true, product: true, count: true, totalPrice: true },
		})

		if (product.returning.status === SellingStatusEnum.accepted) {
			await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { increment: product.count } } })
		}

		return product
	}

	async updateOneSelling(query: ProductMVGetOneRequest, body: SellingProductMVUpdateOneRequest) {
		const pr = await this.getOne({ id: query.id })

		const product = await this.prisma.productMVModel.update({
			where: { id: query.id },
			data: {
				count: body.count,
				price: body.price,
				totalPrice: body.totalPrice,
				productId: body.productId,
				sellingId: body.sellingId,
			},
			select: {
				id: true,
				totalPrice: true,
				selling: {
					select: {
						id: true,
						totalPrice: true,
						status: true,
						publicId: true,
						updatedAt: true,
						createdAt: true,
						deletedAt: true,
						date: true,
						client: { select: { fullname: true, phone: true, id: true, createdAt: true, telegram: true } },
						staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
						payment: { select: { total: true, id: true, card: true, cash: true, other: true, transfer: true, description: true } },
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
			await this.prisma.productModel.update({
				where: { id: product.product.id },
				data: { count: { increment: pr.count - product.count } },
			})
		}

		return product
	}

	async updateOneArrival(query: ProductMVGetOneRequest, body: ArrivalProductMVUpdateOneRequest) {
		const pr = await this.getOne({ id: query.id })

		const product = await this.prisma.productMVModel.update({
			where: { id: query.id },
			data: {
				count: body.count,
				price: body.price,
				cost: body.cost,
				totalCost: body.totalCost,
				totalPrice: body.totalPrice,
				productId: body.productId,
				arrivalId: body.arrivalId,
			},
			select: { arrival: true, product: true, cost: true, count: true, price: true },
		})

		await this.prisma.productModel.update({
			where: { id: product.product.id },
			data: {
				cost: product.cost,
				price: product.price,
				count: { increment: product.count - pr.count },
			},
		})

		return product
	}

	async updateOneReturning(query: ProductMVGetOneRequest, body: ReturningProductMVUpdateOneRequest) {
		const pr = await this.getOne({ id: query.id })

		const product = await this.prisma.productMVModel.update({
			where: { id: query.id },
			data: {
				count: body.count,
				price: body.price,
				totalPrice: body.totalPrice,
				productId: body.productId,
				returningId: body.returningId,
			},
			select: { returning: true, product: true, count: true },
		})

		if (product.returning.status === SellingStatusEnum.accepted) {
			await this.prisma.productModel.update({
				where: { id: product.product.id },
				data: { count: { increment: product.count - pr.count } },
			})
		}

		return product
	}

	async deleteOne(query: ProductMVDeleteOneRequest) {
		const product = await this.prisma.productMVModel.delete({
			where: { id: query.id },
			select: {
				id: true,
				type: true,
				returning: true,
				selling: {
					select: {
						id: true,
						totalPrice: true,
						status: true,
						publicId: true,
						updatedAt: true,
						createdAt: true,
						deletedAt: true,
						date: true,
						client: { select: { fullname: true, phone: true, id: true, createdAt: true, telegram: true } },
						staff: { select: { fullname: true, phone: true, id: true, createdAt: true } },
						payment: { select: { total: true, id: true, card: true, cash: true, other: true, transfer: true, description: true } },
						products: { select: { createdAt: true, id: true, price: true, count: true, product: { select: { name: true, id: true, createdAt: true } } } },
					},
				},
				cost: true,
				count: true,
				price: true,
				product: true,
			},
		})

		if (product.type === ServiceTypeEnum.selling) {
			if (product.selling && product.selling.status === SellingStatusEnum.accepted) {
				await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { increment: product.count } } })
			}
		} else if (product.type === ServiceTypeEnum.arrival) {
			await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { decrement: product.count } } })
		} else if (product.type === ServiceTypeEnum.returning) {
			if (product.returning && product.returning.status === SellingStatusEnum.accepted) {
				await this.prisma.productModel.update({ where: { id: product.product.id }, data: { count: { increment: product.count } } })
			}
		}

		return product
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(ProductMVController)
	}
}
