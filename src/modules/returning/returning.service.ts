import { BadRequestException, Injectable } from '@nestjs/common'
import { ReturningRepository } from './returning.repository'
import { createResponse, CRequest, DeleteMethodEnum } from '@common'
import {
	ReturningGetOneRequest,
	ReturningCreateOneRequest,
	ReturningUpdateOneRequest,
	ReturningGetManyRequest,
	ReturningFindManyRequest,
	ReturningFindOneRequest,
	ReturningDeleteOneRequest,
} from './interfaces'

@Injectable()
export class ReturningService {
	private readonly returningRepository: ReturningRepository

	constructor(returningRepository: ReturningRepository) {
		this.returningRepository = returningRepository
	}

	async findMany(query: ReturningFindManyRequest) {
		const returnings = await this.returningRepository.findMany(query)
		const returningsCount = await this.returningRepository.countFindMany(query)

		const result = query.pagination
			? {
					totalCount: returningsCount,
					pagesCount: Math.ceil(returningsCount / query.pageSize),
					pageSize: returnings.length,
					data: returnings,
				}
			: { data: returnings }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: ReturningFindOneRequest) {
		const returning = await this.returningRepository.findOne(query)

		if (!returning) {
			throw new BadRequestException('returning not found')
		}

		return createResponse({ data: { ...returning }, success: { messages: ['find one success'] } })
	}

	async getMany(query: ReturningGetManyRequest) {
		const returnings = await this.returningRepository.getMany(query)
		const returningsCount = await this.returningRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(returningsCount / query.pageSize),
					pageSize: returnings.length,
					data: returnings,
				}
			: { data: returnings }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: ReturningGetOneRequest) {
		const returning = await this.returningRepository.getOne(query)

		if (!returning) {
			throw new BadRequestException('returning not found')
		}

		return createResponse({ data: returning, success: { messages: ['get one success'] } })
	}

	async createOne(request: CRequest, body: ReturningCreateOneRequest) {
		const returning = await this.returningRepository.createOne({ ...body, staffId: request.user.id })

		return createResponse({ data: returning, success: { messages: ['create one success'] } })
	}

	async updateOne(query: ReturningGetOneRequest, body: ReturningUpdateOneRequest) {
		await this.getOne(query)

		await this.returningRepository.updateOne(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: ReturningDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.returningRepository.deleteOne(query)
		} else {
			await this.returningRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
