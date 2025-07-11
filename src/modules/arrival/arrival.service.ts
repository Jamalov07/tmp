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
import { Decimal } from '@prisma/client/runtime/library'
import { ExcelService } from '../shared'
import { Response } from 'express'

@Injectable()
export class ArrivalService {
	private readonly arrivalRepository: ArrivalRepository
	private readonly supplierService: SupplierService
	private readonly productService: ProductService
	private readonly excelService: ExcelService

	constructor(
		arrivalRepository: ArrivalRepository,
		@Inject(forwardRef(() => SupplierService)) supplierService: SupplierService,
		@Inject(forwardRef(() => ProductService)) productService: ProductService,
		excelService: ExcelService,
	) {
		this.arrivalRepository = arrivalRepository
		this.supplierService = supplierService
		this.productService = productService
		this.excelService = excelService
	}

	async findMany(query: ArrivalFindManyRequest) {
		const arrivals = await this.arrivalRepository.findMany(query)
		const arrivalsCount = await this.arrivalRepository.countFindMany(query)

		const calc = {
			totalPrice: new Decimal(0),
			totalCost: new Decimal(0),
			totalPayment: new Decimal(0),
			totalCardPayment: new Decimal(0),
			totalCashPayment: new Decimal(0),
			totalOtherPayment: new Decimal(0),
			totalTransferPayment: new Decimal(0),
			totalDebt: new Decimal(0),
		}

		const mappedArrivals = arrivals.map((arrival) => {
			const totalPayment = arrival.payment.card.plus(arrival.payment.cash).plus(arrival.payment.other).plus(arrival.payment.transfer)

			const totalPrice = arrival.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.price))
			}, new Decimal(0))

			const totalCost = arrival.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.cost))
			}, new Decimal(0))

			calc.totalPrice = calc.totalPrice.plus(totalPrice)
			calc.totalCost = calc.totalCost.plus(totalCost)
			calc.totalPayment = calc.totalPayment.plus(totalPayment)
			calc.totalDebt = calc.totalDebt.plus(totalCost.minus(totalPayment))
			calc.totalCardPayment = calc.totalCardPayment.plus(arrival.payment.card)
			calc.totalCashPayment = calc.totalCashPayment.plus(arrival.payment.cash)
			calc.totalOtherPayment = calc.totalOtherPayment.plus(arrival.payment.other)
			calc.totalTransferPayment = calc.totalTransferPayment.plus(arrival.payment.transfer)

			const p = arrival.payment

			const hasMeaningfulPayment =
				(p.card && !p.card.equals(0)) ||
				(p.cash && !p.cash.equals(0)) ||
				(p.other && !p.other.equals(0)) ||
				(p.transfer && !p.transfer.equals(0)) ||
				(p.description && p.description.trim() !== '')
			return {
				...arrival,
				payment: hasMeaningfulPayment ? p : null,
				debt: totalCost.minus(totalPayment),
				totalPayment: totalPayment,
				totalCost: totalCost,
				totalPrice: totalPrice,
			}
		})

		const result = query.pagination
			? {
					totalCount: arrivalsCount,
					pagesCount: Math.ceil(arrivalsCount / query.pageSize),
					pageSize: mappedArrivals.length,
					data: mappedArrivals,
					calc: calc,
				}
			: { data: mappedArrivals, calc: calc }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async excelDownloadMany(res: Response, query: ArrivalFindManyRequest) {
		return this.excelService.arrivalDownloadMany(res, query)
	}

	async excelDownloadOne(res: Response, query: ArrivalFindOneRequest) {
		return this.excelService.arrivalDownloadOne(res, query)
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

		await this.arrivalRepository.updateOne(query, { ...body, staffId: arrival.data.staffId })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: ArrivalDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.arrivalRepository.deleteOne(query)
		} else {
			// await this.arrivalRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
