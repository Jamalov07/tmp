import { BadRequestException, Injectable } from '@nestjs/common'
import { ClientRepository } from './client.repository'
import { createResponse, DeleteMethodEnum } from '@common'
import {
	ClientGetOneRequest,
	ClientCreateOneRequest,
	ClientUpdateOneRequest,
	ClientGetManyRequest,
	ClientFindManyRequest,
	ClientFindOneRequest,
	ClientDeleteOneRequest,
} from './interfaces'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class ClientService {
	private readonly clientRepository: ClientRepository

	constructor(clientRepository: ClientRepository) {
		this.clientRepository = clientRepository
	}

	async findMany(query: ClientFindManyRequest) {
		const clients = await this.clientRepository.findMany(query)
		const clientsCount = await this.clientRepository.countFindMany(query)

		const mappedClients = clients.map((c) => {
			const payment = c.payments.reduce((acc, curr) => acc.plus(curr.card).plus(curr.cash).plus(curr.other).plus(curr.transfer), new Decimal(0))

			const sellingPayment = c.sellings.reduce((acc, sel) => {
				const productsSum = sel.products.reduce((a, p) => {
					return a.plus(p.cost.mul(p.count))
				}, new Decimal(0))

				const totalPayment = sel.payment.card.plus(sel.payment.cash).plus(sel.payment.other).plus(sel.payment.transfer)

				return acc.plus(productsSum).minus(totalPayment)
			}, new Decimal(0))
			return {
				...c,
				debt: payment.plus(sellingPayment),
				lastSellingDate: c.sellings?.length ? c.sellings[0].date : null,
			}
		})

		const result = query.pagination
			? {
					totalCount: clientsCount,
					pagesCount: Math.ceil(clientsCount / query.pageSize),
					pageSize: clients.length,
					data: mappedClients,
				}
			: { data: mappedClients }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: ClientFindOneRequest) {
		const client = await this.clientRepository.findOne(query)

		if (!client) {
			throw new BadRequestException('client not found')
		}

		const payment = client.payments.reduce((acc, curr) => acc.plus(curr.card).plus(curr.cash).plus(curr.other).plus(curr.transfer), new Decimal(0))

		const sellingPayment = client.sellings.reduce((acc, sel) => {
			const productsSum = sel.products.reduce((a, p) => {
				return a.plus(p.cost.mul(p.count))
			}, new Decimal(0))

			const totalPayment = sel.payment.card.plus(sel.payment.cash).plus(sel.payment.other).plus(sel.payment.transfer)

			return acc.plus(productsSum).minus(totalPayment)
		}, new Decimal(0))

		return createResponse({
			data: {
				...client,
				actionIds: client.actions.map((a) => a.id),
				debt: payment.plus(sellingPayment),
				lastArrivalDate: client.sellings?.length ? client.sellings[0].date : null,
			},
			success: { messages: ['find one success'] },
		})
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
