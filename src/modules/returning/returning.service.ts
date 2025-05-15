import { BadRequestException, Injectable } from '@nestjs/common'
import { ReturningRepository } from './returning.repository'
import { createResponse, CRequest, DeleteMethodEnum } from '@common'
import {
	ReturningGetOneRequest,
	ReturningCreateOneRequest,
	ReturningUpdateOneRequest,
	ReturningGetManyRequest,
	ReturningFindManyRequest,
	ReturningFindOneRequest,
	ReturningDeleteOneRequest,
} from './interfaces'
import { ClientService } from '../client'
import { ProductService } from '../product'

@Injectable()
export class ReturningService {
	private readonly returningRepository: ReturningRepository
	private readonly clientService: ClientService
	private readonly productService: ProductService

	constructor(returningRepository: ReturningRepository, clientService: ClientService, productService: ProductService) {
		this.returningRepository = returningRepository
		this.clientService = clientService
		this.productService = productService
	}

	async findMany(query: ReturningFindManyRequest) {
		const returnings = await this.returningRepository.findMany(query)
		const returningsCount = await this.returningRepository.countFindMany(query)

		const result = query.pagination
			? {
					totalCount: returningsCount,
					pagesCount: Math.ceil(returningsCount / query.pageSize),
					pageSize: returnings.length,
					data: returnings,
				}
			: { data: returnings }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: ReturningFindOneRequest) {
		const returning = await this.returningRepository.findOne(query)

		if (!returning) {
			throw new BadRequestException('returning not found')
		}

		return createResponse({ data: { ...returning }, success: { messages: ['find one success'] } })
	}

	async getMany(query: ReturningGetManyRequest) {
		const returnings = await this.returningRepository.getMany(query)
		const returningsCount = await this.returningRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(returningsCount / query.pageSize),
					pageSize: returnings.length,
					data: returnings,
				}
			: { data: returnings }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: ReturningGetOneRequest) {
		const returning = await this.returningRepository.getOne(query)

		if (!returning) {
			throw new BadRequestException('returning not found')
		}

		return createResponse({ data: returning, success: { messages: ['get one success'] } })
	}

	async createOne(request: CRequest, body: ReturningCreateOneRequest) {
		await this.clientService.findOne({ id: body.clientId })

		//update product: incr
		if (body.products && body.products.length) {
			body.products.map(async (pr) => {
				const product = await this.productService.findOne({ id: pr.productId }).catch((e) => {
					throw new BadRequestException(`product not found with this id: ${pr.productId}`)
				})
				await this.productService.updateOne({ id: product.data.id }, { count: product.data.count + pr.count })
			})
		}

		const returning = await this.returningRepository.createOne({ ...body, staffId: request.user.id })

		return createResponse({ data: returning, success: { messages: ['create one success'] } })
	}

	async updateOne(query: ReturningGetOneRequest, body: ReturningUpdateOneRequest) {
		const returning = await this.getOne(query)

		//update product: decr
		if (body.productIdsToRemove && body.productIdsToRemove.length) {
			const productMVs = await this.returningRepository.findManyReturningProductMv(body.productIdsToRemove ?? [])

			productMVs.map(async (pmv) => {
				await this.productService.updateOne({ id: pmv.product.id }, { count: pmv.product.count - pmv.count })
			})
		}
		//update product: incr
		if (body.products && body.products.length) {
			body.products.map(async (pr) => {
				const product = await this.productService.findOne({ id: pr.productId }).catch((e) => {
					throw new BadRequestException(`product not found with this id: ${pr.productId}`)
				})
				await this.productService.updateOne({ id: product.data.id }, { count: product.data.count + pr.count })
			})
		}

		await this.returningRepository.updateOne(query, { ...body, staffId: returning.data.staffId })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: ReturningDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.returningRepository.deleteOne(query)
		} else {
			await this.returningRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
