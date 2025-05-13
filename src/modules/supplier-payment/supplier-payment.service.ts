import { BadRequestException, Injectable } from '@nestjs/common'
import { SupplierPaymentRepository } from './supplier-payment.repository'
import { createResponse, CRequest, DeleteMethodEnum } from '@common'
import {
	SupplierPaymentGetOneRequest,
	SupplierPaymentCreateOneRequest,
	SupplierPaymentUpdateOneRequest,
	SupplierPaymentGetManyRequest,
	SupplierPaymentFindManyRequest,
	SupplierPaymentFindOneRequest,
	SupplierPaymentDeleteOneRequest,
} from './interfaces'

@Injectable()
export class SupplierPaymentService {
	private readonly supplierPaymentRepository: SupplierPaymentRepository

	constructor(supplierPaymentRepository: SupplierPaymentRepository) {
		this.supplierPaymentRepository = supplierPaymentRepository
	}

	async findMany(query: SupplierPaymentFindManyRequest) {
		const supplierPayments = await this.supplierPaymentRepository.findMany(query)
		const supplierPaymentsCount = await this.supplierPaymentRepository.countFindMany(query)

		const result = query.pagination
			? {
					totalCount: supplierPaymentsCount,
					pagesCount: Math.ceil(supplierPaymentsCount / query.pageSize),
					pageSize: supplierPayments.length,
					data: supplierPayments,
				}
			: { data: supplierPayments }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: SupplierPaymentFindOneRequest) {
		const supplierPayment = await this.supplierPaymentRepository.findOne(query)

		if (!supplierPayment) {
			throw new BadRequestException('supplierPayment not found')
		}

		return createResponse({ data: { ...supplierPayment }, success: { messages: ['find one success'] } })
	}

	async getMany(query: SupplierPaymentGetManyRequest) {
		const supplierPayments = await this.supplierPaymentRepository.getMany(query)
		const supplierPaymentsCount = await this.supplierPaymentRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(supplierPaymentsCount / query.pageSize),
					pageSize: supplierPayments.length,
					data: supplierPayments,
				}
			: { data: supplierPayments }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: SupplierPaymentGetOneRequest) {
		const supplierPayment = await this.supplierPaymentRepository.getOne(query)

		if (!supplierPayment) {
			throw new BadRequestException('supplierPayment not found')
		}

		return createResponse({ data: supplierPayment, success: { messages: ['get one success'] } })
	}

	async createOne(request: CRequest, body: SupplierPaymentCreateOneRequest) {
		const supplierPayment = await this.supplierPaymentRepository.createOne({ ...body, userId: request.user.id })

		return createResponse({ data: supplierPayment, success: { messages: ['create one success'] } })
	}

	async updateOne(query: SupplierPaymentGetOneRequest, body: SupplierPaymentUpdateOneRequest) {
		await this.getOne(query)

		await this.supplierPaymentRepository.updateOne(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: SupplierPaymentDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.supplierPaymentRepository.deleteOne(query)
		} else {
			await this.supplierPaymentRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
