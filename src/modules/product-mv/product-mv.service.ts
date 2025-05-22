import { BadRequestException, Injectable } from '@nestjs/common'
import { ProductMVRepository } from './product-mv.repository'
import {
	ArrivalProductMVCreateOneRequest,
	ArrivalProductMVUpdateOneRequest,
	ProductMVFindManyRequest,
	ProductMVFindOneRequest,
	ProductMVGetManyRequest,
	ProductMVGetOneRequest,
	ReturningProductMVCreateOneRequest,
	ReturningProductMVUpdateOneRequest,
	SellingProductMVCreateOneRequest,
	SellingProductMVUpdateOneRequest,
} from './interfaces'
import { createResponse } from '../../common'

@Injectable()
export class ProductMVService {
	private readonly productMVRepository: ProductMVRepository
	constructor(productMVRepository: ProductMVRepository) {
		this.productMVRepository = productMVRepository
	}

	async findMany(query: ProductMVFindManyRequest) {
		const products = await this.productMVRepository.findMany(query)
		const productsCount = await this.productMVRepository.countFindMany(query)

		const result = query.pagination
			? {
					totalCount: productsCount,
					pagesCount: Math.ceil(productsCount / query.pageSize),
					pageSize: products.length,
					data: products,
				}
			: { data: products }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: ProductMVFindOneRequest) {
		const product = await this.productMVRepository.findOne(query)

		if (!product) {
			throw new BadRequestException('product mv not found')
		}

		return createResponse({
			data: product,
			success: { messages: ['find one success'] },
		})
	}

	async getMany(query: ProductMVGetManyRequest) {
		const products = await this.productMVRepository.getMany(query)
		const productsCount = await this.productMVRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(productsCount / query.pageSize),
					pageSize: products.length,
					data: products,
				}
			: { data: products }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: ProductMVGetOneRequest) {
		const product = await this.productMVRepository.getOne(query)

		if (!product) {
			throw new BadRequestException('product mv not found')
		}

		return createResponse({ data: product, success: { messages: ['get one success'] } })
	}

	async createOneSelling(body: SellingProductMVCreateOneRequest) {
		await this.productMVRepository.createOneSelling({ ...body })

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async createOneArrival(body: ArrivalProductMVCreateOneRequest) {
		await this.productMVRepository.createOneArrival({ ...body })

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async createOneReturning(body: ReturningProductMVCreateOneRequest) {
		await this.productMVRepository.createOneReturning({ ...body })

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async updateOneSelling(query: ProductMVGetOneRequest, body: SellingProductMVUpdateOneRequest) {
		await this.getOne(query)

		await this.productMVRepository.updateOneSelling(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async updateOneArrival(query: ProductMVGetOneRequest, body: ArrivalProductMVUpdateOneRequest) {
		await this.getOne(query)

		await this.productMVRepository.updateOneArrival(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async updateOneReturning(query: ProductMVGetOneRequest, body: ReturningProductMVUpdateOneRequest) {
		await this.getOne(query)

		await this.productMVRepository.updateOneReturning(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: ProductMVGetOneRequest) {
		await this.getOne(query)

		await this.productMVRepository.deleteOne(query)

		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
