import { CRequest } from '@common'
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
import { BotService } from '../bot'
import { SellingStatusEnum } from '@prisma/client'
import { ClientService } from '../client'
import { BotSellingProductTitleEnum, BotSellingTitleEnum } from '../selling/enums'
import { Decimal } from '@prisma/client/runtime/library'
import { SellingService } from '../selling'

@Injectable()
export class ProductMVService {
	private readonly productMVRepository: ProductMVRepository
	private readonly botService: BotService
	private readonly clientService: ClientService
	constructor(productMVRepository: ProductMVRepository, botService: BotService, clientService: ClientService) {
		this.productMVRepository = productMVRepository
		this.clientService = clientService
		this.botService = botService
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

	async createOneSelling(request: CRequest, body: SellingProductMVCreateOneRequest) {
		const sellingProduct = await this.productMVRepository.createOneSelling({ ...body, staffId: request.user.id })

		if (sellingProduct.selling.status === SellingStatusEnum.accepted) {
			const client = await this.clientService.findOne({ id: sellingProduct.selling.client.id })
			const sellingProducts = sellingProduct.selling.products.map((pro) => {
				let status: BotSellingProductTitleEnum = undefined
				if (pro.id === sellingProduct.id) {
					status = BotSellingProductTitleEnum.new
				}
				return { ...pro, status: status }
			})

			const totalPayment = sellingProduct.selling.payment.card
				.plus(sellingProduct.selling.payment.cash)
				.plus(sellingProduct.selling.payment.other)
				.plus(sellingProduct.selling.payment.transfer)

			const totalPrice = sellingProduct.selling.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.price))
			}, new Decimal(0))

			const sellingInfo = {
				...sellingProduct.selling,
				client: client.data,
				title: BotSellingTitleEnum.added,
				totalPayment: totalPayment,
				totalPrice: totalPrice,
				debt: totalPrice.minus(totalPayment),
				products: sellingProducts,
			}

			if (client.data.telegram?.id) {
				await this.botService.sendSellingToClient(sellingInfo, true).catch(async (e) => {
					console.log('user', e)
					await this.updateSellingSendStatus(sellingProduct.selling.id, false)
				})
			} else {
				await this.updateSellingSendStatus(sellingProduct.selling.id, false)
			}

			await this.botService.sendSellingToChannel(sellingInfo).catch((e) => {
				console.log('channel', e)
			})
		}

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async createOneArrival(request: CRequest, body: ArrivalProductMVCreateOneRequest) {
		await this.productMVRepository.createOneArrival({ ...body, staffId: request.user.id })

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async createOneReturning(request: CRequest, body: ReturningProductMVCreateOneRequest) {
		await this.productMVRepository.createOneReturning({ ...body, staffId: request.user.id })

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async updateOneSelling(query: ProductMVGetOneRequest, body: SellingProductMVUpdateOneRequest) {
		await this.getOne(query)

		const sellingProduct = await this.productMVRepository.updateOneSelling(query, { ...body })

		if (sellingProduct.selling.status === SellingStatusEnum.accepted) {
			const client = await this.clientService.findOne({ id: sellingProduct.selling.client.id })
			const sellingProducts = sellingProduct.selling.products.map((pro) => {
				let status: BotSellingProductTitleEnum = undefined
				if (pro.id === sellingProduct.id) {
					status = BotSellingProductTitleEnum.updated
				}
				return { ...pro, status: status }
			})

			const totalPayment = sellingProduct.selling.payment.card
				.plus(sellingProduct.selling.payment.cash)
				.plus(sellingProduct.selling.payment.other)
				.plus(sellingProduct.selling.payment.transfer)

			const totalPrice = sellingProduct.selling.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.price))
			}, new Decimal(0))

			const sellingInfo = {
				...sellingProduct.selling,
				client: client.data,
				title: BotSellingTitleEnum.updated,
				totalPayment: totalPayment,
				totalPrice: totalPrice,
				debt: totalPrice.minus(totalPayment),
				products: sellingProducts,
			}

			if (client.data.telegram?.id) {
				await this.botService.sendSellingToClient(sellingInfo, true).catch(async (e) => {
					console.log('user', e)
					await this.updateSellingSendStatus(sellingProduct.selling.id, false)
				})
			} else {
				await this.updateSellingSendStatus(sellingProduct.selling.id, false)
			}

			await this.botService.sendSellingToChannel(sellingInfo).catch((e) => {
				console.log('channel', e)
			})
		}

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

	async updateSellingSendStatus(id: string, sended: boolean) {
		await this.productMVRepository.updateSellingSendStatus(id, sended)
	}
}
