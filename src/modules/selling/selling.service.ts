import { BadRequestException, Injectable } from '@nestjs/common'
import { SellingRepository } from './selling.repository'
import { createResponse, CRequest, DeleteMethodEnum } from '@common'
import { SellingStatusEnum } from '@prisma/client'
import {
	SellingGetOneRequest,
	SellingCreateOneRequest,
	SellingUpdateOneRequest,
	SellingGetManyRequest,
	SellingFindManyRequest,
	SellingFindOneRequest,
	SellingDeleteOneRequest,
} from './interfaces'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class SellingService {
	private readonly sellingRepository: SellingRepository

	constructor(sellingRepository: SellingRepository) {
		this.sellingRepository = sellingRepository
	}

	async findMany(query: SellingFindManyRequest) {
		const sellings = await this.sellingRepository.findMany(query)
		const sellingsCount = await this.sellingRepository.countFindMany(query)

		let calc: {
			totalPrice: Decimal
			totalPayment: Decimal
			totalCardPayment: Decimal
			totalCashPayment: Decimal
			totalOtherPayment: Decimal
			totalTransferPayment: Decimal
			totalDebt: Decimal
		}

		const mappedSellings = sellings.map((selling) => {
			const totalPayment = selling.payment.card.plus(selling.payment.cash).plus(selling.payment.other).plus(selling.payment.transfer)

			const totalPrice = selling.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.price))
			}, new Decimal(0))

			calc.totalPrice = calc.totalPrice.plus(totalPrice)
			calc.totalPayment = calc.totalPayment.plus(totalPayment)
			calc.totalDebt = calc.totalDebt.plus(totalPrice.minus(totalPayment))
			calc.totalCardPayment = calc.totalCardPayment.plus(selling.payment.card)
			calc.totalCashPayment = calc.totalCashPayment.plus(selling.payment.cash)
			calc.totalOtherPayment = calc.totalOtherPayment.plus(selling.payment.other)
			calc.totalTransferPayment = calc.totalTransferPayment.plus(selling.payment.transfer)

			return {
				...selling,
				debt: totalPrice.minus(totalPayment),
				totalPayment: totalPayment,
				totalPrice: totalPrice,
			}
		})

		const result = query.pagination
			? {
					totalCount: sellingsCount,
					pagesCount: Math.ceil(sellingsCount / query.pageSize),
					pageSize: sellings.length,
					data: mappedSellings,
					calc: calc,
				}
			: { data: mappedSellings, calc: calc }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: SellingFindOneRequest) {
		const selling = await this.sellingRepository.findOne(query)

		if (!selling) {
			throw new BadRequestException('selling not found')
		}

		const totalPayment = selling.payment.card.plus(selling.payment.cash).plus(selling.payment.other).plus(selling.payment.transfer)

		const totalPrice = selling.products.reduce((acc, product) => {
			return acc.plus(new Decimal(product.count).mul(product.price))
		}, new Decimal(0))

		return createResponse({
			data: { ...selling, debt: totalPrice.minus(totalPayment), totalPayment: totalPayment, totalPrice: totalPrice },
			success: { messages: ['find one success'] },
		})
	}

	async getMany(query: SellingGetManyRequest) {
		const sellings = await this.sellingRepository.getMany(query)
		const sellingsCount = await this.sellingRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(sellingsCount / query.pageSize),
					pageSize: sellings.length,
					data: sellings,
				}
			: { data: sellings }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: SellingGetOneRequest) {
		const selling = await this.sellingRepository.getOne(query)

		if (!selling) {
			throw new BadRequestException('selling not found')
		}

		return createResponse({ data: selling, success: { messages: ['get one success'] } })
	}

	async createOne(request: CRequest, body: SellingCreateOneRequest) {
		let sended = false
		if (body.send) {
			sended = true
		}
		let status: SellingStatusEnum = SellingStatusEnum.notaccepted

		if (Object.values(body.payment).some((value) => value !== 0)) {
			status = SellingStatusEnum.accepted
		}

		const selling = await this.sellingRepository.createOne({ ...body, staffId: request.user.id, sended: sended, status: status })

		return createResponse({ data: selling, success: { messages: ['create one success'] } })
	}

	async updateOne(query: SellingGetOneRequest, body: SellingUpdateOneRequest) {
		const selling = await this.getOne(query)

		let status: SellingStatusEnum = selling.data.status

		if (status !== SellingStatusEnum.accepted) {
			if (Object.values(body.payment).some((value) => value !== 0)) {
				status = SellingStatusEnum.accepted
			}
		}

		await this.sellingRepository.updateOne(query, { ...body, status: status, staffId: selling.data.staffId })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: SellingDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.sellingRepository.deleteOne(query)
		} else {
			await this.sellingRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
