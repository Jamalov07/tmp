import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
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
	SellingGetTotalStatsRequest,
	SellingGetPeriodStatsRequest,
} from './interfaces'
import { Decimal } from '@prisma/client/runtime/library'
import { ArrivalService } from '../arrival'
import { ClientService } from '../client'

@Injectable()
export class SellingService {
	private readonly sellingRepository: SellingRepository
	private readonly arrivalService: ArrivalService
	private readonly clientService: ClientService

	constructor(sellingRepository: SellingRepository, @Inject(forwardRef(() => ArrivalService)) arrivalService: ArrivalService, clientService: ClientService) {
		this.sellingRepository = sellingRepository
		this.arrivalService = arrivalService
		this.clientService = clientService
	}

	async findMany(query: SellingFindManyRequest) {
		const sellings = await this.sellingRepository.findMany(query)
		const sellingsCount = await this.sellingRepository.countFindMany(query)

		const calc = {
			totalPrice: new Decimal(0),
			totalPayment: new Decimal(0),
			totalCardPayment: new Decimal(0),
			totalCashPayment: new Decimal(0),
			totalOtherPayment: new Decimal(0),
			totalTransferPayment: new Decimal(0),
			totalDebt: new Decimal(0),
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

			const p = selling.payment

			const hasMeaningfulPayment =
				(p.card && !p.card.equals(0)) ||
				(p.cash && !p.cash.equals(0)) ||
				(p.other && !p.other.equals(0)) ||
				(p.transfer && !p.transfer.equals(0)) ||
				(p.description && p.description.trim() !== '')

			return {
				...selling,
				payment: hasMeaningfulPayment ? p : null,
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
		await this.clientService.findOne({ id: body.clientId })
		let sended = false
		if (body.send) {
			sended = true
		}

		if (body.payment) {
			if (Object.values(body.payment).some((value) => value !== 0)) {
				body.status = SellingStatusEnum.accepted
			}
		}

		const selling = await this.sellingRepository.createOne({ ...body, staffId: request.user.id, sended: sended })

		return createResponse({ data: selling, success: { messages: ['create one success'] } })
	}

	async updateOne(query: SellingGetOneRequest, body: SellingUpdateOneRequest) {
		const selling = await this.getOne(query)

		if (body.status !== SellingStatusEnum.accepted) {
			if (body.payment) {
				if (Object.values(body.payment).some((value) => value !== 0)) {
					body.status = SellingStatusEnum.accepted
				}
			}
		}

		await this.sellingRepository.updateOne(query, { ...body, status: body.status, staffId: selling.data.staffId })

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

	async getTotalStats(query: SellingGetTotalStatsRequest) {
		const now = new Date()

		const getDateRange = (type: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
			const start = new Date(now)
			const end = new Date(now)

			if (type === 'weekly') {
				start.setDate(now.getDate() - now.getDay())
				end.setDate(start.getDate() + 6)
			} else if (type === 'monthly') {
				start.setDate(1)
				end.setMonth(start.getMonth() + 1, 0)
			} else if (type === 'yearly') {
				start.setMonth(0, 1)
				end.setMonth(11, 31)
			}

			return { startDate: start, endDate: end }
		}

		const [daily, weekly, monthly, yearly] = await Promise.all(
			(['daily', 'weekly', 'monthly', 'yearly'] as const).map(async (type) => {
				const { startDate, endDate } = getDateRange(type)
				const sellings = await this.sellingRepository.getMany({ pagination: false, startDate, endDate })

				return sellings.reduce((acc, selling) => {
					const totalPrice = selling.products.reduce((acc, product) => {
						return acc.plus(new Decimal(product.count).mul(product.price))
					}, new Decimal(0))

					return acc.plus(totalPrice)
				}, new Decimal(0))
			}),
		)

		const allSellings = await this.sellingRepository.getMany({ pagination: false })

		const ourDebt = allSellings.reduce((acc, selling) => {
			const payment = selling.payment.card.plus(selling.payment.cash).plus(selling.payment.other).plus(selling.payment.transfer)

			const totalPrice = selling.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.price))
			}, new Decimal(0))
			const debt = payment.minus(totalPrice)
			return acc.plus(debt)
		}, new Decimal(0))

		const theirDebt = allSellings.reduce((acc, selling) => {
			const payment = selling.payment.card.plus(selling.payment.cash).plus(selling.payment.other).plus(selling.payment.transfer)

			const totalPrice = selling.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.price))
			}, new Decimal(0))

			const debt = totalPrice.minus(payment)
			return acc.plus(debt)
		}, new Decimal(0))

		const totalBalance = allSellings.reduce((acc, selling) => {
			const totalPayment = selling.client.payments.reduce((ac, payment) => {
				return ac.plus(payment.card.plus(payment.cash).plus(payment.other).plus(payment.transfer))
			}, new Decimal(0))
			return acc.plus(totalPayment)
		}, new Decimal(0))

		const supplierDebt = await this.getSupplierStatsInArrival()

		return createResponse({
			data: {
				daily,
				weekly,
				monthly,
				yearly,
				client: {
					ourDebt: ourDebt.minus(totalBalance) < new Decimal(0) ? new Decimal(0) : ourDebt,
					theirDebt: theirDebt.plus(totalBalance) < new Decimal(0) ? new Decimal(0) : theirDebt,
				},
				supplier: supplierDebt,
			},
			success: { messages: ['get total stats success'] },
		})
	}

	async getSupplierStatsInArrival() {
		const arrivals = await this.arrivalService.getMany({ pagination: false })

		const ourDebt = arrivals.data.data.reduce((acc, arrival) => {
			const payment = arrival.payment.card.plus(arrival.payment.cash).plus(arrival.payment.other).plus(arrival.payment.transfer)

			const totalCost = arrival.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.cost))
			}, new Decimal(0))
			const debt = payment.minus(totalCost)
			return acc.plus(debt)
		}, new Decimal(0))

		const theirDebt = arrivals.data.data.reduce((acc, arrival) => {
			const payment = arrival.payment.card.plus(arrival.payment.cash).plus(arrival.payment.other).plus(arrival.payment.transfer)

			const totalCost = arrival.products.reduce((acc, product) => {
				return acc.plus(new Decimal(product.count).mul(product.cost))
			}, new Decimal(0))

			const debt = totalCost.minus(payment)
			return acc.plus(debt)
		}, new Decimal(0))

		const totalBalance = arrivals.data.data.reduce((acc, arrival) => {
			const totalPayment = arrival.supplier.payments.reduce((ac, payment) => {
				return ac.plus(payment.card.plus(payment.cash).plus(payment.other).plus(payment.transfer))
			}, new Decimal(0))
			return acc.plus(totalPayment)
		}, new Decimal(0))

		return {
			ourDebt: ourDebt.minus(totalBalance) < new Decimal(0) ? new Decimal(0) : ourDebt,
			theirDebt: theirDebt.plus(totalBalance) < new Decimal(0) ? new Decimal(0) : theirDebt,
		}
	}

	async getPeriodStats(query: SellingGetPeriodStatsRequest) {
		const result = await this.sellingRepository.getPeriodStats(query)

		return createResponse({ data: result, success: { messages: ['get period stats success'] } })
	}
}
