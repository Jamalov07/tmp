import { BadRequestException, Injectable } from '@nestjs/common'
import { SellingRepository } from './selling.repository'
import { createResponse, CRequest, DeleteMethodEnum } from '@common'
import {
	SellingGetOneRequest,
	SellingCreateOneRequest,
	SellingUpdateOneRequest,
	SellingGetManyRequest,
	SellingFindManyRequest,
	SellingFindOneRequest,
	SellingDeleteOneRequest,
} from './interfaces'

@Injectable()
export class SellingService {
	private readonly supplierRepository: SellingRepository

	constructor(supplierRepository: SellingRepository) {
		this.supplierRepository = supplierRepository
	}

	async findMany(query: SellingFindManyRequest) {
		const suppliers = await this.supplierRepository.findMany(query)
		const suppliersCount = await this.supplierRepository.countFindMany(query)

		const result = query.pagination
			? {
					totalCount: suppliersCount,
					pagesCount: Math.ceil(suppliersCount / query.pageSize),
					pageSize: suppliers.length,
					data: suppliers,
				}
			: { data: suppliers }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: SellingFindOneRequest) {
		const supplier = await this.supplierRepository.findOne(query)

		if (!supplier) {
			throw new BadRequestException('supplier not found')
		}

		return createResponse({ data: { ...supplier }, success: { messages: ['find one success'] } })
	}

	async getMany(query: SellingGetManyRequest) {
		const suppliers = await this.supplierRepository.getMany(query)
		const suppliersCount = await this.supplierRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(suppliersCount / query.pageSize),
					pageSize: suppliers.length,
					data: suppliers,
				}
			: { data: suppliers }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: SellingGetOneRequest) {
		const supplier = await this.supplierRepository.getOne(query)

		if (!supplier) {
			throw new BadRequestException('supplier not found')
		}

		return createResponse({ data: supplier, success: { messages: ['get one success'] } })
	}

	async createOne(request: CRequest, body: SellingCreateOneRequest) {
		let sended = false
		if (body.send) {
			sended = true
		}

		const supplier = await this.supplierRepository.createOne({ ...body, staffId: request.user.id, sended: sended })

		return createResponse({ data: supplier, success: { messages: ['create one success'] } })
	}

	async updateOne(query: SellingGetOneRequest, body: SellingUpdateOneRequest) {
		await this.getOne(query)

		await this.supplierRepository.updateOne(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: SellingDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.supplierRepository.deleteOne(query)
		} else {
			await this.supplierRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
