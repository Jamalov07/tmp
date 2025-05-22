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
import { ServiceTypeEnum } from '@prisma/client'

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
		})
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
		})
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
		})
		return product
	}

	async updateOneSelling(query: ProductMVGetOneRequest, body: SellingProductMVUpdateOneRequest) {
		const product = await this.prisma.productMVModel.update({
			where: { id: query.id },
			data: {
				count: body.count,
				price: body.price,
				productId: body.productId,
				sellingId: body.sellingId,
			},
		})

		return product
	}

	async updateOneArrival(query: ProductMVGetOneRequest, body: ArrivalProductMVUpdateOneRequest) {
		const product = await this.prisma.productMVModel.update({
			where: { id: query.id },
			data: {
				count: body.count,
				price: body.price,
				cost: body.cost,
				productId: body.productId,
				arrivalId: body.arrivalId,
			},
		})

		return product
	}

	async updateOneReturning(query: ProductMVGetOneRequest, body: ReturningProductMVUpdateOneRequest) {
		const product = await this.prisma.productMVModel.update({
			where: { id: query.id },
			data: {
				count: body.count,
				price: body.price,
				productId: body.productId,
				returningId: body.returningId,
			},
		})

		return product
	}

	async deleteOne(query: ProductMVDeleteOneRequest) {
		const product = await this.prisma.productMVModel.delete({
			where: { id: query.id },
		})

		return product
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(ProductMVController)
	}
}
