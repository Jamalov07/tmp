import { BadRequestException, Injectable } from '@nestjs/common'
import { StaffPaymentRepository } from './staff-payment.repository'
import { createResponse, CRequest, DeleteMethodEnum } from '@common'
import {
	StaffPaymentGetOneRequest,
	StaffPaymentCreateOneRequest,
	StaffPaymentUpdateOneRequest,
	StaffPaymentGetManyRequest,
	StaffPaymentFindManyRequest,
	StaffPaymentFindOneRequest,
	StaffPaymentDeleteOneRequest,
} from './interfaces'
import { StaffService } from '../staff'
import { Decimal } from '@prisma/client/runtime/library'
import { ExcelService } from '../shared'
import { Response } from 'express'

@Injectable()
export class StaffPaymentService {
	private readonly staffPaymentRepository: StaffPaymentRepository
	private readonly staffService: StaffService
	private readonly excelService: ExcelService

	constructor(staffPaymentRepository: StaffPaymentRepository, staffService: StaffService, excelService: ExcelService) {
		this.staffPaymentRepository = staffPaymentRepository
		this.staffService = staffService
		this.excelService = excelService
	}

	async findMany(query: StaffPaymentFindManyRequest) {
		const staffPayments = await this.staffPaymentRepository.findMany(query)
		const staffPaymentsCount = await this.staffPaymentRepository.countFindMany(query)

		const calc = {
			sum: new Decimal(0),
		}

		for (const payment of staffPayments) {
			calc.sum = calc.sum.plus(payment.sum)
		}

		const result = query.pagination
			? {
					totalCount: staffPaymentsCount,
					pagesCount: Math.ceil(staffPaymentsCount / query.pageSize),
					pageSize: staffPayments.length,
					data: staffPayments,
					calc: calc,
				}
			: { data: staffPayments, calc: calc }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async excelDownloadMany(res: Response, query: StaffPaymentFindManyRequest) {
		return this.excelService.staffPaymentDownloadMany(res, query)
	}

	async findOne(query: StaffPaymentFindOneRequest) {
		const staffPayment = await this.staffPaymentRepository.findOne(query)

		if (!staffPayment) {
			throw new BadRequestException('staff payment not found')
		}

		return createResponse({ data: { ...staffPayment }, success: { messages: ['find one success'] } })
	}

	async getMany(query: StaffPaymentGetManyRequest) {
		const staffPayments = await this.staffPaymentRepository.getMany(query)
		const staffPaymentsCount = await this.staffPaymentRepository.countGetMany(query)

		const result = query.pagination
			? {
					pagesCount: Math.ceil(staffPaymentsCount / query.pageSize),
					pageSize: staffPayments.length,
					data: staffPayments,
				}
			: { data: staffPayments }

		return createResponse({ data: result, success: { messages: ['get many success'] } })
	}

	async getOne(query: StaffPaymentGetOneRequest) {
		const staffPayment = await this.staffPaymentRepository.getOne(query)

		if (!staffPayment) {
			throw new BadRequestException('staff payment not found')
		}

		return createResponse({ data: staffPayment, success: { messages: ['get one success'] } })
	}

	async createOne(request: CRequest, body: StaffPaymentCreateOneRequest) {
		await this.staffService.findOne({ id: body.userId })

		const staffPayment = await this.staffPaymentRepository.createOne({ ...body, staffId: request.user.id })

		return createResponse({ data: staffPayment, success: { messages: ['create one success'] } })
	}

	async updateOne(query: StaffPaymentGetOneRequest, body: StaffPaymentUpdateOneRequest) {
		await this.getOne(query)

		await this.staffPaymentRepository.updateOne(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: StaffPaymentDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.staffPaymentRepository.deleteOne(query)
		} else {
			await this.staffPaymentRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
