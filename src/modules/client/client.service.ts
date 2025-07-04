import { BadRequestException, Injectable } from '@nestjs/common'
import { ClientRepository } from './client.repository'
import { createResponse, DebtTypeEnum, DeleteMethodEnum } from '@common'
import {
	ClientGetOneRequest,
	ClientCreateOneRequest,
	ClientUpdateOneRequest,
	ClientGetManyRequest,
	ClientFindManyRequest,
	ClientFindOneRequest,
	ClientDeleteOneRequest,
	ClientDeed,
} from './interfaces'
import { Decimal } from '@prisma/client/runtime/library'
import { ExcelService } from '../shared'
import { Response } from 'express'

@Injectable()
export class ClientService {
	private readonly clientRepository: ClientRepository
	private readonly excelService: ExcelService

	constructor(clientRepository: ClientRepository, excelService: ExcelService) {
		this.clientRepository = clientRepository
		this.excelService = excelService
	}

	async findMany(query: ClientFindManyRequest) {
		const clients = await this.clientRepository.findMany({ ...query, pagination: false })
		// const clientsCount = await this.clientRepository.countFindMany(query)

		const mappedClients = clients.map((c) => {
			const payment = c.payments.reduce((acc, curr) => acc.plus(curr.card).plus(curr.cash).plus(curr.other).plus(curr.transfer), new Decimal(0))

			const sellingPayment = c.sellings.reduce((acc, sel) => {
				const productsSum = sel.products.reduce((a, p) => {
					return a.plus(p.price.mul(p.count))
				}, new Decimal(0))

				const totalPayment = sel.payment.card.plus(sel.payment.cash).plus(sel.payment.other).plus(sel.payment.transfer)
				return acc.plus(productsSum).minus(totalPayment)
			}, new Decimal(0))
			return {
				...c,
				debt: sellingPayment.minus(payment),
				lastSellingDate: c.sellings?.length ? c.sellings[0].date : null,
			}
		})

		const filteredClients = mappedClients.filter((s) => {
			if (query.debtType && query.debtValue !== undefined) {
				const value = new Decimal(query.debtValue)
				switch (query.debtType) {
					case DebtTypeEnum.gt:
						return s.debt.gt(value)
					case DebtTypeEnum.lt:
						return s.debt.lt(value)
					case DebtTypeEnum.eq:
						return s.debt.eq(value)
					default:
						return true
				}
			}
			return true
		})

		const paginatedClients = query.pagination ? filteredClients.slice((query.pageNumber - 1) * query.pageSize, query.pageNumber * query.pageSize) : filteredClients

		const result = query.pagination
			? {
					totalCount: filteredClients.length,
					pagesCount: Math.ceil(filteredClients.length / query.pageSize),
					pageSize: paginatedClients.length,
					data: paginatedClients,
				}
			: { data: mappedClients }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: ClientFindOneRequest) {
		const client = await this.clientRepository.findOne(query)

		if (!client) {
			throw new BadRequestException('client not found')
		}
		const deeds: ClientDeed[] = []
		let totalDebit: Decimal = new Decimal(0)
		let totalCredit: Decimal = new Decimal(0)

		const payment = client.payments.reduce((acc, curr) => {
			const totalPayment = curr.card.plus(curr.cash).plus(curr.other).plus(curr.transfer)
			deeds.push({ type: 'credit', action: 'payment', value: totalPayment, date: curr.createdAt, description: curr.description })

			totalDebit = totalDebit.plus(totalPayment)

			return acc.plus(totalPayment)
		}, new Decimal(0))

		const sellingPayment = client.sellings.reduce((acc, sel) => {
			const productsSum = sel.products.reduce((a, p) => {
				return a.plus(p.price.mul(p.count))
			}, new Decimal(0))

			deeds.push({ type: 'debit', action: 'selling', value: productsSum, date: sel.date, description: '' })
			totalCredit = totalCredit.plus(productsSum)

			const totalPayment = sel.payment.card.plus(sel.payment.cash).plus(sel.payment.other).plus(sel.payment.transfer)

			deeds.push({ type: 'credit', action: 'payment', value: totalPayment, date: sel.payment.createdAt, description: sel.payment.description })
			totalDebit = totalDebit.plus(totalPayment)

			return acc.plus(productsSum).minus(totalPayment)
		}, new Decimal(0))

		client.returnings.map((returning) => {
			deeds.push({ type: 'credit', action: 'returning', value: returning.payment.fromBalance, date: returning.payment.createdAt, description: returning.payment.description })
		})

		const filteredDeeds = deeds.filter((d) => !d.value.equals(0)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

		return createResponse({
			data: {
				id: client.id,
				fullname: client.fullname,
				phone: client.phone,
				createdAt: client.createdAt,
				updatedAt: client.updatedAt,
				deletedAt: client.deletedAt,
				actionIds: client.actions.map((a) => a.id),
				debt: sellingPayment.minus(payment),
				deedInfo: {
					totalDebit: totalDebit,
					totalCredit: totalCredit,
					debt: totalDebit.minus(totalCredit),
					deeds: filteredDeeds,
				},
				lastArrivalDate: client.sellings?.length ? client.sellings[0].date : null,
			},
			success: { messages: ['find one success'] },
		})
	}

	async excelDownloadOne(res: Response, query: ClientFindOneRequest) {
		return this.excelService.clientDeedDownloadOne(res, query)
	}

	async excelWithProductDownloadOne(res: Response, query: ClientFindOneRequest) {
		return this.excelService.clientDeedWithProductDownloadOne(res, query)
	}

	async getMany(query: ClientGetManyRequest) {
		const clients = await this.clientRepository.getMany(query)
		const clientsCount = await this.clientRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(clientsCount / query.pageSize),
					pageSize: clients.length,
					data: clients,
				}
			: { data: clients }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: ClientGetOneRequest) {
		const client = await this.clientRepository.getOne(query)

		if (!client) {
			throw new BadRequestException('client not found')
		}

		return createResponse({ data: client, success: { messages: ['get one success'] } })
	}

	async createOne(body: ClientCreateOneRequest) {
		const candidate = await this.clientRepository.getOne({ phone: body.phone })
		if (candidate) {
			throw new BadRequestException('phone already exists')
		}

		const client = await this.clientRepository.createOne({ ...body })

		return createResponse({ data: client, success: { messages: ['create one success'] } })
	}

	async updateOne(query: ClientGetOneRequest, body: ClientUpdateOneRequest) {
		await this.getOne(query)

		if (body.phone) {
			const candidate = await this.clientRepository.getOne({ phone: body.phone })
			if (candidate && candidate.id !== query.id) {
				throw new BadRequestException('phone already exists')
			}
		}

		await this.clientRepository.updateOne(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: ClientDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.clientRepository.deleteOne(query)
		} else {
			await this.clientRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
