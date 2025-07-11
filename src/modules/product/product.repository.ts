import { Injectable } from '@nestjs/common'
import { PrismaService } from '../shared'
import {
	ProductCreateOneRequest,
	ProductDeleteOneRequest,
	ProductFindManyRequest,
	ProductFindOneRequest,
	ProductGetManyRequest,
	ProductGetOneRequest,
	ProductUpdateOneRequest,
} from './interfaces'
import { ProductController } from './product.controller'
import { ServiceTypeEnum } from '@prisma/client'

@Injectable()
export class ProductRepository {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async findMany(query: ProductFindManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		let nameFilter: any = {}
		if (query.search) {
			const searchWords = query.search?.split(/\s+/).filter(Boolean) ?? []

			nameFilter = {
				[searchWords.length > 1 ? 'AND' : 'OR']: searchWords.map((word) => ({
					name: {
						contains: word,
						mode: 'insensitive',
					},
				})),
			}
		}

		const products = await this.prisma.productModel.findMany({
			where: {
				...nameFilter,
			},
			select: {
				id: true,
				cost: true,
				price: true,
				count: true,
				createdAt: true,
				name: true,
				minAmount: true,
				productMVs: {
					where: { type: ServiceTypeEnum.selling },
					orderBy: { selling: { date: 'desc' } },
					take: 1,
					select: { selling: { select: { date: true } } },
				},
			},
			...paginationOptions,
		})

		return products
	}

	async findOne(query: ProductFindOneRequest) {
		const product = await this.prisma.productModel.findFirst({
			where: { id: query.id },
			select: {
				id: true,
				cost: true,
				price: true,
				count: true,
				createdAt: true,
				name: true,
				minAmount: true,
				productMVs: {
					where: { type: ServiceTypeEnum.selling },
					orderBy: { selling: { date: 'desc' } },
					take: 1,
					select: { selling: { select: { date: true } } },
				},
			},
		})

		return product
	}

	async countFindMany(query: ProductFindManyRequest) {
		let nameFilter: any = {}
		if (query.search) {
			const searchWords = query.search?.split(/\s+/).filter(Boolean) ?? []

			nameFilter = {
				[searchWords.length > 1 ? 'AND' : 'OR']: searchWords.map((word) => ({
					name: {
						contains: word,
						mode: 'insensitive',
					},
				})),
			}
		}

		const productsCount = await this.prisma.productModel.count({
			where: {
				...nameFilter,
			},
		})

		return productsCount
	}

	async getMany(query: ProductGetManyRequest) {
		let paginationOptions = {}
		if (query.pagination) {
			paginationOptions = { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
		}

		const products = await this.prisma.productModel.findMany({
			where: { id: { in: query.ids }, name: query.name },
			...paginationOptions,
		})

		return products
	}

	async getOne(query: ProductGetOneRequest) {
		const product = await this.prisma.productModel.findFirst({
			where: { id: query.id, name: query.name },
		})

		return product
	}

	async countGetMany(query: ProductGetManyRequest) {
		const productsCount = await this.prisma.productModel.count({
			where: { id: { in: query.ids }, name: query.name },
		})

		return productsCount
	}

	async createOne(body: ProductCreateOneRequest) {
		const product = await this.prisma.productModel.create({
			data: {
				name: body.name,
				cost: body.cost,
				count: body.count,
				minAmount: body.minAmount,
				price: body.price,
			},
		})
		return product
	}

	async updateOne(query: ProductGetOneRequest, body: ProductUpdateOneRequest) {
		const product = await this.prisma.productModel.update({
			where: { id: query.id },
			data: {
				name: body.name,
				cost: body.cost,
				count: body.count,
				minAmount: body.minAmount,
				price: body.price,
			},
		})

		return product
	}

	async deleteOne(query: ProductDeleteOneRequest) {
		const product = await this.prisma.productModel.delete({
			where: { id: query.id },
		})

		return product
	}

	async onModuleInit() {
		await this.prisma.createActionMethods(ProductController)
	}
}
