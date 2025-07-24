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
import { ExcelService } from '../shared/excel'
import { Response } from 'express'
import { BotService } from '../bot'
import { BotSellingProductTitleEnum, BotSellingTitleEnum } from './enums'

@Injectable()
export class SellingService {
	constructor(
		private readonly sellingRepository: SellingRepository,
		@Inject(forwardRef(() => ArrivalService)) private readonly arrivalService: ArrivalService,
		private readonly clientService: ClientService,
		private readonly excelService: ExcelService,
		private readonly botService: BotService,
	) {}

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
			calc.totalPrice = calc.totalPrice.plus(selling.totalPrice)
			calc.totalPayment = calc.totalPayment.plus(selling.payment.total)
			calc.totalDebt = calc.totalDebt.plus(selling.totalPrice.minus(selling.payment.total))
			calc.totalCardPayment = calc.totalCardPayment.plus(selling.payment.card)
			calc.totalCashPayment = calc.totalCashPayment.plus(selling.payment.cash)
			calc.totalOtherPayment = calc.totalOtherPayment.plus(selling.payment.other)
			calc.totalTransferPayment = calc.totalTransferPayment.plus(selling.payment.transfer)

			return {
				...selling,
				payment: selling.payment.total.toNumber() ? selling.payment : null,
				debt: selling.totalPrice.minus(selling.payment.total),
				totalPayment: selling.payment.total,
				totalPrice: selling.totalPrice,
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

	async excelDownloadMany(res: Response, query: SellingFindManyRequest) {
		return this.excelService.sellingDownloadMany(res, query)
	}

	async findOne(query: SellingFindOneRequest) {
		const selling = await this.sellingRepository.findOne(query)

		if (!selling) {
			throw new BadRequestException('selling not found')
		}

		const totalPrice = selling.products.reduce((acc, product) => {
			return acc.plus(new Decimal(product.count).mul(product.price))
		}, new Decimal(0))

		return createResponse({
			data: { ...selling, debt: totalPrice.minus(selling.payment.total), totalPayment: selling.payment.total, totalPrice: totalPrice },
			success: { messages: ['find one success'] },
		})
	}

	async excelDownloadOne(res: Response, query: SellingFindOneRequest) {
		return this.excelService.sellingDownloadOne(res, query)
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
		let client = await this.clientService.findOne({ id: body.clientId })

		let total = new Decimal(0)
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
			const decimalZero = new Decimal(0)

			total = (body.payment.card ?? decimalZero)
				.plus(body.payment.cash ?? decimalZero)
				.plus(body.payment.other ?? decimalZero)
				.plus(body.payment.transfer ?? decimalZero)
		}

		if (body.status === SellingStatusEnum.accepted) {
			body.date = new Date()
		}

		body = {
			...body,
			staffId: request.user.id,
			payment: { ...body.payment, total: total },
			products: body.products.map((product) => {
				const totalPrice = product.price.mul(product.count)
				body.totalPrice = body.totalPrice.plus(totalPrice)

				return {
					...product,
					totalPrice: totalPrice,
				}
			}),
		}

		const selling = await this.sellingRepository.createOne(body)

		if (body.send) {
			if (selling.status === SellingStatusEnum.accepted) {
				client = await this.clientService.findOne({ id: body.clientId })
				const sellingInfo = {
					...selling,
					client: client.data,
					title: BotSellingTitleEnum.new,
					totalPayment: total,
					totalPrice: body.totalPrice,
					debt: body.totalPrice.minus(total),
					products: selling.products.map((p) => ({ ...p, status: BotSellingProductTitleEnum.new })),
				}

				if (client.data.telegram?.id) {
					await this.botService.sendSellingToClient(sellingInfo).catch((e) => {
						console.log('user', e)
					})
				}
				await this.botService.sendSellingToChannel(sellingInfo).catch((e) => {
					console.log('channel', e)
				})

				if (!total.isZero()) {
					await this.botService.sendPaymentToChannel(sellingInfo.payment, false, client.data)
				}
			}
		}

		return createResponse({ data: selling, success: { messages: ['create one success'] } })
	}

	async updateOne(query: SellingGetOneRequest, body: SellingUpdateOneRequest) {
		const selling = await this.getOne(query)

		// accepted bo‘lsa, date o‘zgartirilmaydi
		if (selling.data.status === SellingStatusEnum.accepted) {
			body.date = undefined
		}

		let total = new Decimal(0)
		let shouldSend = false
		let isFirstSend = false

		// Faqat status accepted bo‘lmagan bo‘lsa va paymentda haqiqiy qiymatlar bo‘lsa
		const hasValidPayment = body.payment && ['card', 'cash', 'other', 'transfer'].some((key) => !!body.payment?.[key] && +body.payment[key] !== 0)

		if (body.status !== SellingStatusEnum.accepted) {
			if (hasValidPayment) {
				body.status = SellingStatusEnum.accepted
				body.date = new Date()
				// total hisoblash
				total = new Decimal(body.payment?.card ?? 0)
					.plus(body.payment?.cash ?? 0)
					.plus(body.payment?.other ?? 0)
					.plus(body.payment?.transfer ?? 0)
			}
		} else {
			// status accepted deb kelyapti
			if (selling.data.status !== SellingStatusEnum.accepted) {
				isFirstSend = true
			}
			body.date = new Date()
			shouldSend = true

			// total hisoblash (agar bor bo‘lsa)
			total = new Decimal(body.payment?.card ?? 0)
				.plus(body.payment?.cash ?? 0)
				.plus(body.payment?.other ?? 0)
				.plus(body.payment?.transfer ?? 0)
		}

		// body ni tozalab, safe qilib joylashtiramiz
		body = {
			...body,
			status: body.status,
			staffId: selling.data.staff.id,
			payment: hasValidPayment
				? {
						...body.payment,
						total: total,
					}
				: selling.data.payment, // agar payment yo‘q bo‘lsa, eskisini saqlaymiz
		}

		const updatedSelling = await this.sellingRepository.updateOne(query, body)

		// Clientni yangilaymiz
		const client = await this.clientService.findOne({ id: body.clientId })

		const sellingInfo = {
			...updatedSelling,
			client: client.data,
			title: isFirstSend ? BotSellingTitleEnum.new : undefined,
			totalPayment: total,
			totalPrice: updatedSelling.totalPrice,
			debt: updatedSelling.totalPrice.minus(total),
			products: updatedSelling.products.map((p) => ({
				...p,
				status: BotSellingProductTitleEnum.new,
			})),
		}

		// clientga yuborish
		if (body.send) {
			if (updatedSelling.client?.telegram?.id) {
				await this.botService.sendSellingToClient(sellingInfo).catch(console.log)
			}
		}

		// channelga yuborish
		if (shouldSend) {
			await this.botService.sendSellingToChannel(sellingInfo).catch(console.log)

			if (!total.isZero()) {
				await this.botService.sendPaymentToChannel(sellingInfo.payment, !isFirstSend, client.data)
			}
		}

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: SellingDeleteOneRequest) {
		const selling = await this.findOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.sellingRepository.deleteOne(query)
			const client = await this.clientService.findOne({ id: selling.data.client.id })
			const sellingInfo = {
				...selling.data,
				client: client.data,
			}
			await this.botService.sendDeletedSellingToChannel(sellingInfo)
			const totalPayment = selling.data.payment.card.plus(selling.data.payment.cash).plus(selling.data.payment.other).plus(selling.data.payment.transfer)
			if (totalPayment.toNumber()) {
				await this.botService.sendDeletedPaymentToChannel(selling.data.payment, client.data)
			}
		} else {
			// await this.sellingRepository.updateOne(query, { deletedAt: new Date() })
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

		// Parallel hisoblash uchun barcha stats so'rovlarni yig'amiz
		const statTypes = ['daily', 'weekly', 'monthly', 'yearly'] as const

		const statsPromises = statTypes.map(async (type) => {
			const { startDate, endDate } = getDateRange(type)
			const sellings = await this.sellingRepository.getMany({
				pagination: false,
				startDate,
				endDate,
				status: SellingStatusEnum.accepted,
			})

			return sellings.reduce((sum, selling) => {
				return sum.plus(selling.totalPrice)
			}, new Decimal(0))
		})

		const allSellingsPromise = this.sellingRepository.getMany({
			pagination: false,
			status: SellingStatusEnum.accepted,
		})

		const supplierDebtPromise = this.getSupplierStatsInArrival()

		const [daily, weekly, monthly, yearly, allSellings, supplierDebt] = await Promise.all([
			statsPromises[0],
			statsPromises[1],
			statsPromises[2],
			statsPromises[3],
			allSellingsPromise,
			supplierDebtPromise,
		])

		// Client Stats
		let ourDebt = new Decimal(0)
		let theirDebt = new Decimal(0)
		let totalBalance = new Decimal(0)

		for (const selling of allSellings) {
			const diff = selling.payment.total.minus(selling.totalPrice)
			const clientBalance = selling.client?.payments?.reduce((sum, p) => sum.plus(p.total), new Decimal(0)) ?? new Decimal(0)

			totalBalance = totalBalance.plus(clientBalance)
			ourDebt = ourDebt.plus(diff)
			theirDebt = theirDebt.plus(selling.totalPrice.minus(selling.payment.total))
		}

		// Hisoblashni yakunlash
		const finalOurDebt = ourDebt.minus(totalBalance).lt(0) ? new Decimal(0) : ourDebt
		const finalTheirDebt = theirDebt.plus(totalBalance).lt(0) ? new Decimal(0) : theirDebt

		return createResponse({
			data: {
				daily,
				weekly,
				monthly,
				yearly,
				client: {
					ourDebt: finalOurDebt,
					theirDebt: finalTheirDebt,
				},
				supplier: supplierDebt,
			},
			success: { messages: ['get total stats success'] },
		})
	}

	async getSupplierStatsInArrival() {
		const arrivals = await this.arrivalService.getMany({ pagination: false })
		const list = arrivals.data.data

		let ourDebt = new Decimal(0)
		let theirDebt = new Decimal(0)
		let totalBalance = new Decimal(0)

		for (const arrival of list) {
			const diff = arrival.payment.total.minus(arrival.totalCost)
			ourDebt = ourDebt.plus(diff)
			theirDebt = theirDebt.plus(arrival.totalCost.minus(arrival.payment.total))

			totalBalance = totalBalance.plus(arrival.supplier.balance)
		}

		return {
			ourDebt: ourDebt.minus(totalBalance).lt(0) ? new Decimal(0) : ourDebt,
			theirDebt: theirDebt.plus(totalBalance).lt(0) ? new Decimal(0) : theirDebt,
		}
	}

	async getPeriodStats(query: SellingGetPeriodStatsRequest) {
		const result = await this.sellingRepository.getPeriodStats(query)

		return createResponse({ data: result, success: { messages: ['get period stats success'] } })
	}
}
