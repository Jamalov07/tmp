import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { ArrivalRepository } from './arrival.repository'
import { createResponse, CRequest, DeleteMethodEnum } from '@common'
import {
	ArrivalGetOneRequest,
	ArrivalCreateOneRequest,
	ArrivalUpdateOneRequest,
	ArrivalGetManyRequest,
	ArrivalFindManyRequest,
	ArrivalFindOneRequest,
	ArrivalDeleteOneRequest,
} from './interfaces'
import { SupplierService } from '../supplier'
import { ProductService } from '../product'

@Injectable()
export class ArrivalService {
	private readonly arrivalRepository: ArrivalRepository
	private readonly supplierService: SupplierService
	private readonly productService: ProductService

	constructor(
		arrivalRepository: ArrivalRepository,
		@Inject(forwardRef(() => SupplierService)) supplierService: SupplierService,
		@Inject(forwardRef(() => ProductService)) productService: ProductService,
	) {
		this.arrivalRepository = arrivalRepository
		this.supplierService = supplierService
		this.productService = productService
	}

	async findMany(query: ArrivalFindManyRequest) {
		const arrivals = await this.arrivalRepository.findMany(query)
		const arrivalsCount = await this.arrivalRepository.countFindMany(query)

		const result = query.pagination
			? {
					totalCount: arrivalsCount,
					pagesCount: Math.ceil(arrivalsCount / query.pageSize),
					pageSize: arrivals.length,
					data: arrivals,
				}
			: { data: arrivals }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: ArrivalFindOneRequest) {
		const arrival = await this.arrivalRepository.findOne(query)

		if (!arrival) {
			throw new BadRequestException('arrival not found')
		}

		return createResponse({ data: { ...arrival }, success: { messages: ['find one success'] } })
	}

	async getMany(query: ArrivalGetManyRequest) {
		const arrivals = await this.arrivalRepository.getMany(query)
		const arrivalsCount = await this.arrivalRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(arrivalsCount / query.pageSize),
					pageSize: arrivals.length,
					data: arrivals,
				}
			: { data: arrivals }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: ArrivalGetOneRequest) {
		const arrival = await this.arrivalRepository.getOne(query)

		if (!arrival) {
			throw new BadRequestException('arrival not found')
		}

		return createResponse({ data: arrival, success: { messages: ['get one success'] } })
	}

	async createOne(request: CRequest, body: ArrivalCreateOneRequest) {
		await this.supplierService.findOne({ id: body.supplierId })

		//update product: incr
		if (body.products && body.products.length) {
			body.products.map(async (pr) => {
				const product = await this.productService.findOne({ id: pr.productId }).catch((e) => {
					throw new BadRequestException(`product not found with this id: ${pr.productId}`)
				})
				await this.productService.updateOne({ id: product.data.id }, { cost: pr.cost, price: pr.price, count: product.data.count + pr.count })
			})
		}

		const arrival = await this.arrivalRepository.createOne({ ...body, staffId: request.user.id })

		return createResponse({ data: arrival, success: { messages: ['create one success'] } })
	}

	async updateOne(query: ArrivalGetOneRequest, body: ArrivalUpdateOneRequest) {
		const arrival = await this.getOne(query)

		//update product: decr
		if (body.productIdsToRemove && body.productIdsToRemove.length) {
			const productMVs = await this.arrivalRepository.findManyArrivalProductMv(body.productIdsToRemove ?? [])

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
				await this.productService.updateOne({ id: product.data.id }, { cost: pr.cost, price: pr.price, count: product.data.count + pr.count })
			})
		}

		await this.arrivalRepository.updateOne(query, { ...body, staffId: arrival.data.staffId })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: ArrivalDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.arrivalRepository.deleteOne(query)
		} else {
			await this.arrivalRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
