import { CRequest } from '@common'
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { ProductMVRepository } from './product-mv.repository'
import {
	ArrivalProductMVCreateOneRequest,
	ArrivalProductMVUpdateOneRequest,
	ProductMVFindManyRequest,
	ProductMVFindOneData,
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
import { ArrivalService } from '../arrival'
import { SellingService } from '../selling'
import { ReturningService } from '../returning'
import { ProductRepository } from '../product'

@Injectable()
export class ProductMVService {
	constructor(
		private readonly productMVRepository: ProductMVRepository,
		private readonly botService: BotService,
		private readonly clientService: ClientService,
		private readonly arrivalService: ArrivalService,
		private readonly returningService: ReturningService,
		// private readonly productRepository: ProductRepository,
		@Inject(forwardRef(() => SellingService)) private readonly sellingService: SellingService,
	) {}

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
		const productmv = await this.productMVRepository.createOneSelling({
			...body,
			staffId: request.user.id,
			totalPrice: new Decimal(body.price ?? 0).mul(body.count),
		})

		await this.sellingService.updateOne({ id: productmv.selling.id }, { totalPrice: productmv.selling.totalPrice.plus(productmv.totalPrice) })

		if (productmv.selling.status === SellingStatusEnum.accepted) {
			await this.sendSellingNotifications(productmv)
		}

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async createOneArrival(request: CRequest, body: ArrivalProductMVCreateOneRequest) {
		const productmv = await this.productMVRepository.createOneArrival({
			...body,
			totalCost: body.cost.mul(body.count),
			totalPrice: body.price.mul(body.count),
			staffId: request.user.id,
		})

		await this.arrivalService.updateOne(
			{ id: productmv.arrival.id },
			{
				totalCost: productmv.arrival.totalCost.plus(productmv.totalCost),
				totalPrice: productmv.arrival.totalPrice.plus(productmv.totalPrice),
			},
		)

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async createOneReturning(request: CRequest, body: ReturningProductMVCreateOneRequest) {
		const productmv = await this.productMVRepository.createOneReturning({
			...body,
			staffId: request.user.id,
			totalPrice: body.price.mul(body.count),
		})

		await this.returningService.updateOne(
			{ id: productmv.returning.id },
			{
				totalPrice: productmv.returning.totalPrice.plus(productmv.totalPrice),
			},
		)

		return createResponse({ data: null, success: { messages: ['create one success'] } })
	}

	async updateOneSelling(query: ProductMVGetOneRequest, body: SellingProductMVUpdateOneRequest) {
		const original = await this.getOne(query)

		const sellingProduct = await this.productMVRepository.updateOneSelling(query, {
			...body,
			totalPrice: (body.price ?? original.data.price).mul(body.count ?? original.data.count),
		})

		if (sellingProduct.selling.status === SellingStatusEnum.accepted) {
			const client = await this.clientService.findOne({ id: sellingProduct.selling.client.id })

			const oldTotal = new Decimal(original.data.count).mul(original.data.price)
			const newTotal = new Decimal(sellingProduct.count).mul(sellingProduct.price)

			const newSellingTotalPrice = sellingProduct.selling.totalPrice.minus(oldTotal).plus(newTotal)

			await this.sellingService.updateOne({ id: sellingProduct.selling.id }, { totalPrice: newSellingTotalPrice })

			const sellingProducts = sellingProduct.selling.products.map((pro) => {
				const status = pro.id === sellingProduct.id ? BotSellingProductTitleEnum.updated : undefined
				const price = pro.id === sellingProduct.id ? sellingProduct.price : pro.price
				const count = pro.id === sellingProduct.id ? sellingProduct.count : pro.count
				return { ...pro, price, count, status }
			})

			const sellingInfo = {
				...sellingProduct.selling,
				client: client.data,
				title: BotSellingTitleEnum.updated,
				totalPayment: sellingProduct.selling.payment.total,
				totalPrice: newSellingTotalPrice,
				debt: newSellingTotalPrice.minus(sellingProduct.selling.payment.total),
				products: sellingProducts,
			}

			if (client.data.telegram?.id) {
				await this.botService.sendSellingToClient(sellingInfo).catch((e) => {
					console.log('user', e)
				})
			}

			await this.botService.sendSellingToChannel(sellingInfo).catch((e) => {
				console.log('channel', e)
			})
		}

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async updateOneArrival(query: ProductMVGetOneRequest, body: ArrivalProductMVUpdateOneRequest) {
		const productmv = await this.getOne(query)

		body = {
			...body,
			totalCost: new Decimal(body.cost ?? productmv.data.cost).mul(body.count ?? productmv.data.count),
			totalPrice: new Decimal(body.price ?? productmv.data.price).mul(body.count ?? productmv.data.count),
		}

		await this.productMVRepository.updateOneArrival(query, body)

		await this.arrivalService.updateOne(
			{ id: productmv.data.arrival.id },
			{
				totalPrice: productmv.data.arrival.totalPrice.minus(productmv.data.totalPrice).plus(body.totalPrice),
				totalCost: productmv.data.arrival.totalCost.minus(productmv.data.totalCost).plus(body.totalCost),
			},
		)

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async updateOneReturning(query: ProductMVGetOneRequest, body: ReturningProductMVUpdateOneRequest) {
		const productmv = await this.getOne(query)

		body = {
			...body,
			totalPrice: new Decimal(body.price ?? productmv.data.price).mul(body.count ?? productmv.data.count),
		}

		await this.productMVRepository.updateOneReturning(query, { ...body })

		await this.returningService.updateOne(
			{ id: productmv.data.returning.id },
			{
				totalPrice: productmv.data.returning.totalPrice.minus(productmv.data.totalPrice).plus(body.totalPrice),
			},
		)

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: ProductMVGetOneRequest) {
		const productmv = await this.getOne(query)

		const sellingProduct = await this.productMVRepository.deleteOne(query)

		if (sellingProduct.selling.status === SellingStatusEnum.accepted) {
			const sellingProducts = sellingProduct.selling.products.map((pro) => {
				let status: BotSellingProductTitleEnum = undefined
				if (pro.id === sellingProduct.id) {
					status = BotSellingProductTitleEnum.deleted
				}
				return { ...pro, status: status }
			})

			const totalPrice = sellingProduct.selling.totalPrice.minus(productmv.data.price.mul(productmv.data.count))

			await this.sellingService.updateOne({ id: sellingProduct.selling.id }, { totalPrice: totalPrice })

			const client = await this.clientService.findOne({ id: sellingProduct.selling.client.id })
			const sellingInfo = {
				...sellingProduct.selling,
				client: client.data,
				title: BotSellingTitleEnum.deleted,
				totalPayment: sellingProduct.selling.payment.total,
				totalPrice: totalPrice,
				debt: totalPrice.minus(sellingProduct.selling.payment.total),
				products: sellingProducts,
			}

			if (client.data.telegram?.id) {
				await this.botService.sendSellingToClient({ ...sellingInfo, products: sellingInfo.products.filter((p) => p.id !== sellingProduct.id) }).catch((e) => {
					console.log('user', e)
				})
			}

			await this.botService.sendSellingToChannel(sellingInfo).catch((e) => {
				console.log('channel', e)
			})
		}

		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}

	private async sendSellingNotifications(productmv: ProductMVFindOneData) {
		const client = await this.clientService.findOne({ id: productmv.selling.client.id })

		const sellingProducts = productmv.selling.products.map((pro) => ({
			...pro,
			status: pro.id === productmv.id ? BotSellingProductTitleEnum.new : undefined,
		}))

		const sellingInfo = {
			...productmv.selling,
			client: client.data,
			title: BotSellingTitleEnum.added,
			totalPayment: productmv.selling.payment.total,
			totalPrice: productmv.selling.totalPrice.plus(productmv.price.mul(productmv.count)),
			debt: productmv.selling.totalPrice.plus(productmv.price.mul(productmv.count)).minus(productmv.selling.payment.total),
			products: sellingProducts,
		}

		if (client.data.telegram?.id) {
			try {
				await this.botService.sendSellingToClient(sellingInfo)
			} catch (e) {
				console.log('user', e)
			}
		}

		try {
			await this.botService.sendSellingToChannel(sellingInfo)
		} catch (e) {
			console.log('channel', e)
		}
	}
}
