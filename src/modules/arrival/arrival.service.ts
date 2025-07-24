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
import { Decimal } from '@prisma/client/runtime/library'
import { ExcelService } from '../shared'
import { Response } from 'express'

@Injectable()
export class ArrivalService {
	private readonly arrivalRepository: ArrivalRepository
	private readonly supplierService: SupplierService
	private readonly excelService: ExcelService

	constructor(arrivalRepository: ArrivalRepository, @Inject(forwardRef(() => SupplierService)) supplierService: SupplierService, excelService: ExcelService) {
		this.arrivalRepository = arrivalRepository
		this.supplierService = supplierService
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
			calc.totalPrice = calc.totalPrice.plus(arrival.totalPrice)
			calc.totalCost = calc.totalCost.plus(arrival.totalCost)
			calc.totalPayment = calc.totalPayment.plus(arrival.payment.total)
			calc.totalDebt = calc.totalDebt.plus(arrival.totalCost.minus(arrival.payment.total))
			calc.totalCardPayment = calc.totalCardPayment.plus(arrival.payment.card)
			calc.totalCashPayment = calc.totalCashPayment.plus(arrival.payment.cash)
			calc.totalOtherPayment = calc.totalOtherPayment.plus(arrival.payment.other)
			calc.totalTransferPayment = calc.totalTransferPayment.plus(arrival.payment.transfer)

			return {
				...arrival,
				payment: arrival.payment.total.toNumber() ? arrival.payment : null,
				debt: arrival.totalCost.minus(arrival.payment.total),
				totalPayment: arrival.payment.total,
				totalCost: arrival.totalCost,
				totalPrice: arrival.totalPrice,
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

		const decimalZero = new Decimal(0)

		const total = (body.payment?.card ?? decimalZero)
			.plus(body.payment?.cash ?? decimalZero)
			.plus(body.payment?.other ?? decimalZero)
			.plus(body.payment?.transfer ?? decimalZero)

		body = {
			...body,
			staffId: request.user.id,
			payment: { ...body.payment, total: total },
			products: body.products.map((product) => {
				const totalCost = product.cost.mul(product.count)
				const totalPrice = product.price.mul(product.count)

				body.totalPrice = (body.totalCost ?? new Decimal(0)).plus(totalPrice)
				body.totalCost = (body.totalCost ?? new Decimal(0)).plus(totalCost)

				return { ...product, totalCost: totalCost, totalPrice: totalPrice }
			}),
		}

		const arrival = await this.arrivalRepository.createOne(body)

		return createResponse({ data: arrival, success: { messages: ['create one success'] } })
	}

	async updateOne(query: ArrivalGetOneRequest, body: ArrivalUpdateOneRequest) {
		const arrival = await this.getOne(query)

		const decimalZero = new Decimal(0)

		const newTotal = (body.payment?.card ?? decimalZero)
			.plus(body.payment?.cash ?? decimalZero)
			.plus(body.payment?.other ?? decimalZero)
			.plus(body.payment?.transfer ?? decimalZero)

		body = {
			...body,
			payment: { ...body.payment, total: !newTotal.equals(arrival.data.payment.total) ? newTotal : undefined },
		}

		await this.arrivalRepository.updateOne(query, body)

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
