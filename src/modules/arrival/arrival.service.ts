import { BadRequestException, Injectable } from '@nestjs/common'
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

@Injectable()
export class ArrivalService {
	private readonly arrivalRepository: ArrivalRepository

	constructor(arrivalRepository: ArrivalRepository) {
		this.arrivalRepository = arrivalRepository
	}

	async findMany(query: ArrivalFindManyRequest) {
		const arrivals = await this.arrivalRepository.findMany(query)
		const arrivalsCount = await this.arrivalRepository.countFindMany(query)

		const result = query.pagination
			? {
					totalCount: arrivalsCount,
					pagesCount: Math.ceil(arrivalsCount / query.pageSize),
					pageSize: arrivals.length,
					data: arrivals,
				}
			: { data: arrivals }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
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
		const arrival = await this.arrivalRepository.createOne({ ...body, staffId: request.user.id })

		return createResponse({ data: arrival, success: { messages: ['create one success'] } })
	}

	async updateOne(query: ArrivalGetOneRequest, body: ArrivalUpdateOneRequest) {
		const arrival = await this.getOne(query)

		await this.arrivalRepository.updateOne(query, { ...body, staffId: arrival.data.staffId })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: ArrivalDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.arrivalRepository.deleteOne(query)
		} else {
			await this.arrivalRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
