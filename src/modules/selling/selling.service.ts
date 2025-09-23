import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { SellingRepository } from './selling.repository'
import { createResponse, CRequest, DeleteMethodEnum } from '@common'
import { SellingStatusEnum, ServiceTypeEnum, UserTypeEnum } from '@prisma/client'
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
import { PrismaService } from '../shared'
import pLimit from 'p-limit'

@Injectable()
export class SellingService {
	constructor(
		private readonly sellingRepository: SellingRepository,
		@Inject(forwardRef(() => ArrivalService)) private readonly arrivalService: ArrivalService,
		private readonly clientService: ClientService,
		private readonly excelService: ExcelService,
		private readonly botService: BotService,
		private readonly prisma: PrismaService,
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

			total = new Decimal(body.payment.card ?? 0)
				.plus(body.payment.cash ?? 0)
				.plus(body.payment.other ?? 0)
				.plus(body.payment.transfer ?? 0)
		}

		if (body.status === SellingStatusEnum.accepted) {
			body.date = new Date()
		}

		let totalPrice = new Decimal(0)
		body = {
			...body,
			staffId: request.user.id,
			payment: { ...body.payment, total: total },
			products: body.products.map((product) => {
				const productTotalPrice = new Decimal(product.price ?? 0).mul(product.count)

				totalPrice = totalPrice.plus(productTotalPrice)

				return {
					...product,
					totalPrice: productTotalPrice,
				}
			}),
		}

		const selling = await this.sellingRepository.createOne({ ...body, totalPrice: totalPrice })

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

		const statTypes = ['daily', 'weekly', 'monthly', 'yearly'] as const
		const limit = pLimit(2)

		const statsPromises = statTypes.map((type) =>
			limit(async () => {
				const { startDate, endDate } = getDateRange(type)
				const result = await this.prisma.sellingModel.aggregate({
					where: {
						date: {
							gte: startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)) : undefined,
							lte: endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)) : undefined,
						},
						client: { deletedAt: null },
						status: SellingStatusEnum.accepted,
					},
					_sum: { totalPrice: true },
				})

				return new Decimal(result._sum.totalPrice || 0)
			}),
		)

		// ✅ Promise.all natijalarini to‘g‘ri tartibda ajratib olamiz
		const [daily, weekly, monthly, yearly] = await Promise.all(statsPromises)

		// ✅ Yetkazib beruvchilar uchun qarzdorlik
		const supplierDebt = await this.getSupplierStatsInArrival()

		// ✅ Umumiy sotuv, to‘lov va mijoz balanslari
		const [sellingsAgg, paymentsAgg, clientsAgg, clientReturningBalanceAgg] = await Promise.all([
			this.prisma.sellingModel.aggregate({
				where: { status: SellingStatusEnum.accepted, client: { deletedAt: null } },
				_sum: { totalPrice: true },
			}),
			this.prisma.paymentModel.aggregate({
				where: {
					selling: { status: SellingStatusEnum.accepted },
					type: ServiceTypeEnum.selling,
					user: { deletedAt: null },
				},
				_sum: { total: true },
			}),
			this.prisma.userModel.aggregate({
				where: { type: UserTypeEnum.client, deletedAt: null },
				_sum: { balance: true },
			}),
			this.prisma.paymentModel.aggregate({
				where: { type: ServiceTypeEnum.returning, user: { deletedAt: null } },
				_sum: { fromBalance: true },
			}),
		])

		const totalSellings = new Decimal(sellingsAgg._sum.totalPrice || 0)
		const totalPayments = new Decimal(paymentsAgg._sum.total || 0)
		const totalBalance = new Decimal(clientsAgg._sum.balance || 0).plus(clientReturningBalanceAgg._sum.fromBalance || 0)

		const ourDebt = totalPayments.plus(totalBalance).minus(totalSellings)
		const theirDebt = totalSellings.minus(totalPayments.plus(totalBalance))

		const finalOurDebt = ourDebt.lt(0) ? new Decimal(0) : ourDebt
		const finalTheirDebt = theirDebt.lt(0) ? new Decimal(0) : theirDebt

		return createResponse({
			data: {
				daily,
				weekly,
				monthly,
				yearly,
				client: { ourDebt: finalOurDebt, theirDebt: finalTheirDebt },
				supplier: supplierDebt,
			},
			success: { messages: ['get total stats success'] },
		})
	}

	async getSupplierStatsInArrival2() {
		const [arrivalsAgg, paymentsAgg, suppliersAgg] = await Promise.all([
			this.prisma.arrivalModel.aggregate({
				_sum: { totalCost: true },
				where: { supplier: { deletedAt: null } },
			}),
			this.prisma.paymentModel.aggregate({
				where: { type: ServiceTypeEnum.arrival, user: { deletedAt: null } },
				_sum: { total: true },
			}),
			this.prisma.userModel.aggregate({
				where: { type: UserTypeEnum.supplier, deletedAt: null },
				_sum: { balance: true },
			}),
		])

		const totalCost = new Decimal(arrivalsAgg._sum.totalCost || 0)
		const totalPayment = new Decimal(paymentsAgg._sum.total || 0)
		const totalBalance = new Decimal(suppliersAgg._sum.balance || 0)

		const net = totalPayment.plus(totalBalance).minus(totalCost)

		return {
			ourDebt: net.lt(0) ? net.abs() : new Decimal(0),
			theirDebt: net.gt(0) ? net : new Decimal(0),
		}
	}

	async getSupplierStatsInArrival() {
		const [arrivalsAgg, paymentsAgg, suppliers] = await Promise.all([
			this.prisma.arrivalModel.aggregate({
				_sum: { totalCost: true },
				where: { supplier: { deletedAt: null } },
			}),
			this.prisma.paymentModel.aggregate({
				where: { type: ServiceTypeEnum.arrival, user: { deletedAt: null } },
				_sum: { total: true },
			}),
			this.prisma.userModel.findMany({
				where: { type: UserTypeEnum.supplier, deletedAt: null },
				select: { balance: true },
			}),
		])

		const totalCost = new Decimal(arrivalsAgg._sum.totalCost ?? 0)
		const totalPayment = new Decimal(paymentsAgg._sum.total ?? 0)

		let positiveBalance = new Decimal(0) // biz ularga qarz
		let negativeBalance = new Decimal(0) // ular bizga qarz

		for (const s of suppliers) {
			const bal = new Decimal(s.balance ?? 0)
			if (bal.gt(0)) positiveBalance = positiveBalance.plus(bal)
			else negativeBalance = negativeBalance.plus(bal.abs())
		}

		const ourDebt = totalCost.minus(totalPayment).plus(positiveBalance)
		const theirDebt = totalPayment.minus(totalCost).plus(negativeBalance)

		return {
			theirDebt: ourDebt.gt(0) ? ourDebt : new Decimal(0),
			ourDebt: theirDebt.gt(0) ? theirDebt : new Decimal(0),
		}
	}

	async getPeriodStats(query: SellingGetPeriodStatsRequest) {
		const result = await this.sellingRepository.getPeriodStats(query)

		return createResponse({ data: result, success: { messages: ['get period stats success'] } })
	}
}
