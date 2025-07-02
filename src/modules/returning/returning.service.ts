import { Decimal } from '@prisma/client/runtime/library'
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
import { SellingStatusEnum } from '@prisma/client'

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

		const mappedReturnings = returnings.map((returning) => {
			const totalPayment = returning.payment.fromBalance.plus(returning.payment.cash)

			const totalPrice = returning.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.price))
			}, new Decimal(0))

			const p = returning.payment

			const hasMeaningfulPayment = (p.fromBalance && !p.fromBalance.equals(0)) || (p.cash && !p.cash.equals(0))
			return {
				...returning,
				payment: hasMeaningfulPayment ? p : null,
				debt: totalPrice.minus(totalPayment),
				totalPayment: totalPayment,
				totalPrice: totalPrice,
			}
		})

		const result = query.pagination
			? {
					totalCount: returningsCount,
					pagesCount: Math.ceil(returningsCount / query.pageSize),
					pageSize: mappedReturnings.length,
					data: mappedReturnings,
				}
			: { data: mappedReturnings }

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

		if (body.payment) {
			if (Object.values(body.payment).some((value) => value !== 0)) {
				body.status = SellingStatusEnum.accepted
				if (body.date) {
					const inputDate = new Date(body.date)
					const now = new Date()

					const isToday = inputDate.getFullYear() === now.getFullYear() && inputDate.getMonth() === now.getMonth() && inputDate.getDate() === now.getDate()

					if (isToday) {
						body.date = now
					} else {
						body.date = new Date(inputDate.setHours(0, 0, 0, 0))
					}
				} else {
					body.date = new Date()
				}
			}
		}

		if (body.status === SellingStatusEnum.accepted) {
			body.date = new Date()
		}

		const returning = await this.returningRepository.createOne({ ...body, staffId: request.user.id })

		return createResponse({ data: returning, success: { messages: ['create one success'] } })
	}

	async updateOne(query: ReturningGetOneRequest, body: ReturningUpdateOneRequest) {
		const returning = await this.getOne(query)

		if (returning.data.status === SellingStatusEnum.accepted) {
			body.productIdsToRemove = []
			body.products = []
		}

		if (body.status !== SellingStatusEnum.accepted) {
			if (body.payment) {
				if (Object.values(body.payment).some((value) => value !== 0)) {
					body.status = SellingStatusEnum.accepted
					body.date = new Date()
				}
			}
		}
		if (body.status === SellingStatusEnum.accepted) {
			body.date = new Date()
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
