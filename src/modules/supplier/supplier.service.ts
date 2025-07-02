import { BadRequestException, Injectable } from '@nestjs/common'
import { SupplierRepository } from './supplier.repository'
import { createResponse, DebtTypeEnum, DeleteMethodEnum } from '@common'
import {
	SupplierGetOneRequest,
	SupplierCreateOneRequest,
	SupplierUpdateOneRequest,
	SupplierGetManyRequest,
	SupplierFindManyRequest,
	SupplierFindOneRequest,
	SupplierDeleteOneRequest,
	SupplierDeed,
} from './interfaces'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class SupplierService {
	private readonly supplierRepository: SupplierRepository

	constructor(supplierRepository: SupplierRepository) {
		this.supplierRepository = supplierRepository
	}

	async findMany(query: SupplierFindManyRequest) {
		const suppliers = await this.supplierRepository.findMany({ ...query, pagination: false })
		// const suppliersCount = await this.supplierRepository.countFindMany(query)

		const mappedSuppliers = suppliers.map((s) => {
			const payment = s.payments.reduce((acc, curr) => acc.plus(curr.card).plus(curr.cash).plus(curr.other).plus(curr.transfer), new Decimal(0))

			const arrivalPayment = s.arrivals.reduce((acc, arr) => {
				const productsSum = arr.products.reduce((a, p) => {
					return a.plus(p.cost.mul(p.count))
				}, new Decimal(0))

				const totalPayment = arr.payment.card.plus(arr.payment.cash).plus(arr.payment.other).plus(arr.payment.transfer)

				return acc.plus(productsSum).minus(totalPayment)
			}, new Decimal(0))
			return {
				...s,
				debt: payment.plus(arrivalPayment),
				lastArrivalDate: s.arrivals?.length ? s.arrivals[0].date : null,
			}
		})

		const filteredSuppliers = mappedSuppliers.filter((s) => {
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

		const paginatedSuppliers = query.pagination ? filteredSuppliers.slice((query.pageNumber - 1) * query.pageSize, query.pageNumber * query.pageSize) : filteredSuppliers

		const result = query.pagination
			? {
					totalCount: filteredSuppliers.length,
					pagesCount: Math.ceil(filteredSuppliers.length / query.pageSize),
					pageSize: paginatedSuppliers.length,
					data: paginatedSuppliers,
				}
			: { data: filteredSuppliers }

		return createResponse({ data: result, success: { messages: ['find many success'] } })
	}

	async findOne(query: SupplierFindOneRequest) {
		const supplier = await this.supplierRepository.findOne(query)

		if (!supplier) {
			throw new BadRequestException('supplier not found')
		}

		const deeds: SupplierDeed[] = []
		let totalDebit: Decimal = new Decimal(0)
		let totalCredit: Decimal = new Decimal(0)

		const payment = supplier.payments.reduce((acc, curr) => {
			const totalPayment = curr.card.plus(curr.cash).plus(curr.other).plus(curr.transfer)
			deeds.push({ type: 'credit', action: 'payment', value: totalPayment, date: curr.createdAt, description: curr.description })
			totalDebit = totalDebit.plus(totalPayment)

			return acc.plus(totalPayment)
		}, new Decimal(0))

		const arrivalPayment = supplier.arrivals.reduce((acc, arr) => {
			const productsSum = arr.products.reduce((a, p) => {
				return a.plus(p.cost.mul(p.count))
			}, new Decimal(0))

			deeds.push({ type: 'debit', action: 'arrival', value: productsSum, date: arr.date, description: '' })
			totalCredit = totalCredit.plus(productsSum)

			const totalPayment = arr.payment.card.plus(arr.payment.cash).plus(arr.payment.other).plus(arr.payment.transfer)

			deeds.push({ type: 'credit', action: 'payment', value: totalPayment, date: arr.payment.createdAt, description: arr.payment.description })
			totalDebit = totalDebit.plus(totalPayment)

			return acc.plus(productsSum).minus(totalPayment)
		}, new Decimal(0))

		const filteredDeeds = deeds.filter((d) => !d.value.equals(0)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

		return createResponse({
			data: {
				id: supplier.id,
				fullname: supplier.fullname,
				phone: supplier.phone,
				createdAt: supplier.createdAt,
				updatedAt: supplier.updatedAt,
				deletedAt: supplier.deletedAt,
				actionIds: supplier.actions.map((a) => a.id),
				debt: payment.plus(arrivalPayment),
				deedInfo: {
					totalDebit: totalDebit,
					totalCredit: totalCredit,
					debt: totalDebit.minus(totalCredit),
					deeds: filteredDeeds,
				},
				lastArrivalDate: supplier.arrivals?.length ? supplier.arrivals[0].date : null,
			},
			success: { messages: ['find one success'] },
		})
	}

	async getMany(query: SupplierGetManyRequest) {
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

	async getOne(query: SupplierGetOneRequest) {
		const supplier = await this.supplierRepository.getOne(query)

		if (!supplier) {
			throw new BadRequestException('supplier not found')
		}

		return createResponse({ data: supplier, success: { messages: ['get one success'] } })
	}

	async createOne(body: SupplierCreateOneRequest) {
		const candidate = await this.supplierRepository.getOne({ phone: body.phone })
		if (candidate) {
			throw new BadRequestException('phone already exists')
		}

		const supplier = await this.supplierRepository.createOne({ ...body })

		return createResponse({ data: supplier, success: { messages: ['create one success'] } })
	}

	async updateOne(query: SupplierGetOneRequest, body: SupplierUpdateOneRequest) {
		await this.getOne(query)

		if (body.phone) {
			const candidate = await this.supplierRepository.getOne({ phone: body.phone })
			if (candidate && candidate.id !== query.id) {
				throw new BadRequestException('phone already exists')
			}
		}

		await this.supplierRepository.updateOne(query, { ...body })

		return createResponse({ data: null, success: { messages: ['update one success'] } })
	}

	async deleteOne(query: SupplierDeleteOneRequest) {
		await this.getOne(query)
		if (query.method === DeleteMethodEnum.hard) {
			await this.supplierRepository.deleteOne(query)
		} else {
			await this.supplierRepository.updateOne(query, { deletedAt: new Date() })
		}
		return createResponse({ data: null, success: { messages: ['delete one success'] } })
	}
}
