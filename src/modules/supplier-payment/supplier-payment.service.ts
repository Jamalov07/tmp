import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
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
import { SupplierService } from '../supplier/'
import { Decimal } from '@prisma/client/runtime/library'
import { ExcelService } from '../shared'
import { Response } from 'express'

@Injectable()
export class SupplierPaymentService {
	private readonly supplierPaymentRepository: SupplierPaymentRepository
	private readonly supplierService: SupplierService
	private readonly excelService: ExcelService

	constructor(
		supplierPaymentRepository: SupplierPaymentRepository,
		@Inject(forwardRef(() => SupplierService))
		supplierService: SupplierService,
		excelService: ExcelService,
	) {
		this.supplierPaymentRepository = supplierPaymentRepository
		this.supplierService = supplierService
		this.excelService = excelService
	}

	async findMany(query: SupplierPaymentFindManyRequest) {
		const supplierPayments = await this.supplierPaymentRepository.findMany(query)
		const supplierPaymentsCount = await this.supplierPaymentRepository.countFindMany(query)

		const calc = {
			totalCard: new Decimal(0),
			totalCash: new Decimal(0),
			totalOther: new Decimal(0),
			totalTransfer: new Decimal(0),
		}

		for (const payment of supplierPayments) {
			calc.totalCard = calc.totalCard.plus(payment.card)
			calc.totalCash = calc.totalCash.plus(payment.cash)
			calc.totalOther = calc.totalOther.plus(payment.other)
			calc.totalTransfer = calc.totalTransfer.plus(payment.transfer)
		}

		const result = query.pagination
			? {
					totalCount: supplierPaymentsCount,
					pagesCount: Math.ceil(supplierPaymentsCount / query.pageSize),
					pageSize: supplierPayments.length,
					data: supplierPayments,
					calc: calc,
				}
			: { data: supplierPayments, calc: calc }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async excelDownloadMany(res: Response, query: SupplierPaymentFindManyRequest) {
		return this.excelService.supplierPaymentDownloadMany(res, query)
	}

	async findOne(query: SupplierPaymentFindOneRequest) {
		const supplierPayment = await this.supplierPaymentRepository.findOne(query)

		if (!supplierPayment) {
			throw new BadRequestException('supplier payment not found')
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
			throw new BadRequestException('supplier payment not found')
		}

		return createResponse({ data: supplierPayment, success: { messages: ['get one success'] } })
	}

	async createOne(request: CRequest, body: SupplierPaymentCreateOneRequest) {
		await this.supplierService.findOne({ id: body.userId })

		const supplierPayment = await this.supplierPaymentRepository.createOne({ ...body, staffId: request.user.id })

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
