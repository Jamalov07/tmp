import { BadRequestException, Injectable } from '@nestjs/common'
import { ProductRepository } from './product.repository'
import { createResponse } from '@common'
import { ProductGetOneRequest, ProductCreateOneRequest, ProductUpdateOneRequest, ProductGetManyRequest, ProductFindManyRequest, ProductFindOneRequest } from './interfaces'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class ProductService {
	private readonly productRepository: ProductRepository

	constructor(productRepository: ProductRepository) {
		this.productRepository = productRepository
	}

	async findMany(query: ProductFindManyRequest) {
		const products = await this.productRepository.findMany(query)
		const productsCount = await this.productRepository.countFindMany(query)

		const calcPage = {
			totalPrice: new Decimal(0),
			totalCost: new Decimal(0),
			totalCount: new Decimal(0),
		}

		const calcTotal = {
			totalPrice: new Decimal(0),
			totalCost: new Decimal(0),
			totalCount: new Decimal(0),
		}

		const mappedProducts = products.map((p) => {
			const lastSellingDate = p.productMVs?.length ? p.productMVs[0].selling.date : null

			delete p.productMVs

			const product = {
				...p,
				totalCost: p.cost.mul(p.count),
				totalPrice: p.price.mul(p.count),
				lastSellingDate: lastSellingDate,
			}

			calcPage.totalCost = calcPage.totalCost.plus(product.totalCost)
			calcPage.totalPrice = calcPage.totalPrice.plus(product.totalPrice)
			calcPage.totalCount = calcPage.totalCount.plus(product.count)

			return product
		})

		const allProducts = await this.productRepository.findMany({ pagination: false })

		allProducts.map((pro) => {
			calcTotal.totalCost = calcTotal.totalCost.plus(pro.cost.mul(pro.count))
			calcTotal.totalPrice = calcTotal.totalPrice.plus(pro.price.mul(pro.count))
			calcTotal.totalCount = calcTotal.totalCount.plus(pro.count)
		})

		const result = query.pagination
			? {
					totalCount: productsCount,
					pagesCount: Math.ceil(productsCount / query.pageSize),
					pageSize: products.length,
					data: mappedProducts,
					calc: { calcPage, calcTotal },
				}
			: { data: mappedProducts, calc: { calcPage, calcTotal } }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: ProductFindOneRequest) {
		const product = await this.productRepository.findOne(query)

		if (!product) {
			throw new BadRequestException('product not found')
		}

		const pro = {
			...product,
			totalCost: product.cost.mul(product.count),
			lastSellingDate: product.productMVs?.length ? product.productMVs[0].selling.date : null,
		}

		delete pro.productMVs

		return createResponse({
			data: pro,
			success: { messages: ['find one success'] },
		})
	}

	async getMany(query: ProductGetManyRequest) {
		const products = await this.productRepository.getMany(query)
		const productsCount = await this.productRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(productsCount / query.pageSize),
					pageSize: products.length,
					data: products,
				}
			: { data: products }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: ProductGetOneRequest) {
		const product = await this.productRepository.getOne(query)

		if (!product) {
			throw new BadRequestException('product not found')
		}

		return createResponse({ data: product, success: { messages: ['get one success'] } })
	}

	async createOne(body: ProductCreateOneRequest) {
		const candidate = await this.productRepository.getOne({ name: body.name })
		if (candidate) {
			throw new BadRequestException('name already exists')
		}

		await this.productRepository.createOne({ ...body })

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async updateOne(query: ProductGetOneRequest, body: ProductUpdateOneRequest) {
		await this.getOne(query)

		const candidate = await this.productRepository.getOne({ name: body.name })
		if (candidate && candidate.id !== query.id) {
			throw new BadRequestException('name already exists')
		}

		await this.productRepository.updateOne(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: ProductGetOneRequest) {
		await this.getOne(query)

		await this.productRepository.deleteOne(query)

		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
