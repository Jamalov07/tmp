import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma'
import * as ExcelJS from 'exceljs'
import { Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { SellingFindManyRequest, SellingFindOneRequest } from '../../selling'
import { ArrivalFindManyRequest, ArrivalFindOneRequest } from '../../arrival'
import { ReturningFindManyRequest, ReturningFindOneRequest } from '../../returning'
import { Decimal } from '@prisma/client/runtime/library'
import { ClientPaymentFindManyRequest } from '../../client-payment'
import { ServiceTypeEnum } from '@prisma/client'
@Injectable()
export class ExcelService {
	private readonly prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async sellingDownloadMany(res: Response, query: SellingFindManyRequest) {
		const startDate = query.startDate ? new Date(query.startDate) : undefined
		const endDate = query.endDate ? new Date(query.endDate) : undefined

		const sellingList = await this.prisma.sellingModel.findMany({
			where: {
				deletedAt: null,
				date: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) },
			},
			include: {
				client: true,
				staff: true,
				products: { include: { product: true } },
				payment: true,
			},
			orderBy: { date: 'desc' },
		})

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Sotuvlar')

		worksheet.columns = [
			{ header: '№', key: 'no', width: 5 },
			{ header: 'Клиент', key: 'client', width: 25 },
			{ header: 'Тел', key: 'phone', width: 15 },
			{ header: 'Сумма', key: 'summa', width: 12 },
			{ header: 'Продавец', key: 'staff', width: 20 },
			{ header: 'Информация', key: 'info', width: 25 },
			{ header: 'Долг', key: 'debt', width: 12 },
			{ header: 'Дата продажи', key: 'date', width: 20 },
		]

		let total = 0
		sellingList.forEach((item, index) => {
			const totalSum = item.products.reduce((sum, p) => sum + p.price.toNumber() * p.count, 0)

			const paidSum =
				(item.payment?.cash?.toNumber() ?? 0) + (item.payment?.card?.toNumber() ?? 0) + (item.payment?.transfer?.toNumber() ?? 0) + (item.payment?.other?.toNumber() ?? 0)

			const debt = totalSum - paidSum
			total += totalSum

			worksheet.addRow({
				no: index + 1,
				client: item.client.fullname,
				phone: item.client.phone,
				summa: totalSum,
				staff: item.staff.fullname,
				info: item.payment?.description || '',
				debt: debt,
				date: item.date.toLocaleString('ru-RU'),
			})
		})

		worksheet.insertRow(1, [])
		worksheet.insertRow(1, [`Общая сумма: ${total}`])
		worksheet.mergeCells('A1:H1')
		worksheet.getCell('A1').font = { bold: true }

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename="selling-report.xlsx"')

		await workbook.xlsx.write(res)
		res.end()
	}

	async sellingDownloadOne(res: Response, query: SellingFindOneRequest) {
		const selling = await this.prisma.sellingModel.findUnique({
			where: { id: query.id },
			include: {
				client: true,
				products: { include: { product: true } },
				payment: true,
			},
		})

		if (!selling) {
			res.status(404).send('Sotuv topilmadi')
			return
		}

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Chek')

		// 1-qator: Xaridor va Telefon
		worksheet.mergeCells('A1:B1')
		worksheet.getCell('A1').value = `Xaridor: ${selling.client.fullname}`
		worksheet.getCell('A1').font = { bold: true }

		worksheet.mergeCells('D1:E1')
		worksheet.getCell('D1').value = `Telefon: ${selling.client.phone}`
		worksheet.getCell('D1').font = { bold: true }

		// 2-qator: Sarlavhalar
		worksheet.addRow(['№', 'Махсулот номи', '✓', 'Сони', 'Нархи', 'Суммаси']).font = { bold: true }

		// Mahsulotlar
		let totalSum = 0
		selling.products.forEach((item, index) => {
			const count = item.count
			const price = item.price.toNumber()
			const sum = count * price
			totalSum += sum

			worksheet.addRow([index + 1, item.product.name, '✓', count, price, sum])
		})

		// Bo'sh qator
		worksheet.addRow([])

		// Umumiy summa va to‘lov
		const paidSum =
			(selling.payment?.cash?.toNumber() ?? 0) +
			(selling.payment?.card?.toNumber() ?? 0) +
			(selling.payment?.transfer?.toNumber() ?? 0) +
			(selling.payment?.other?.toNumber() ?? 0) +
			(selling.payment?.fromBalance?.toNumber() ?? 0)

		worksheet.addRow(['', '', '', '', 'Жами сумма:', totalSum])
		worksheet.addRow(['', '', '', '', 'Тўлов қилинди:', paidSum])

		// Ustunlar eni (yaxshi ko‘rinishi uchun)
		worksheet.columns = [
			{ key: 'no', width: 5 },
			{ key: 'name', width: 30 },
			{ key: 'check', width: 5 },
			{ key: 'count', width: 8 },
			{ key: 'price', width: 10 },
			{ key: 'total', width: 12 },
		]

		// Javobga yozish
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', `attachment; filename="selling-${selling.id}.xlsx"`)

		await workbook.xlsx.write(res)
		res.end()
	}

	async arrivalDownloadMany(res: Response, query: ArrivalFindManyRequest) {
		const startDate = query.startDate ? new Date(query.startDate) : undefined
		const endDate = query.endDate ? new Date(query.endDate) : undefined

		const arrivalList = await this.prisma.arrivalModel.findMany({
			where: {
				deletedAt: null,
				createdAt: {
					...(startDate && { gte: startDate }),
					...(endDate && { lte: endDate }),
				},
			},
			include: {
				supplier: true,
				staff: true,
				products: {
					select: {
						price: true,
						count: true,
						cost: true,
					},
				},
				payment: true,
			},
			orderBy: { createdAt: 'desc' },
		})

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Приходы')

		worksheet.columns = [
			{ header: '№', key: 'no', width: 5 },
			{ header: 'Поставщик', key: 'supplier', width: 25 },
			{ header: 'Сумма', key: 'summa', width: 12 },
			{ header: 'Кем оприходован', key: 'staff', width: 20 },
			{ header: 'Информация', key: 'info', width: 25 },
			{ header: 'Дата прихода', key: 'date', width: 20 },
		]

		let total = 0

		arrivalList.forEach((item, index) => {
			const totalSum = item.products.reduce((sum, p) => sum + p.cost.toNumber() * p.count, 0)
			total += totalSum

			worksheet.addRow({
				no: index + 1,
				supplier: item.supplier.fullname,
				summa: totalSum,
				staff: item.staff.phone,
				info: item.payment?.description || '',
				date: item.createdAt.toLocaleString('ru-RU'),
			})
		})

		// Общая сумма qatori + bo‘sh qator
		worksheet.insertRow(1, [])
		worksheet.insertRow(1, [`Общая сумма: ${total}`])
		worksheet.mergeCells('A1:F1')
		worksheet.getCell('A1').font = { bold: true }

		// Excel response
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename="arrival-report.xlsx"')

		await workbook.xlsx.write(res)
		res.end()
	}

	async arrivalDownloadOne(res: Response, query: ArrivalFindOneRequest) {
		const arrival = await this.prisma.arrivalModel.findUnique({
			where: { id: query.id, deletedAt: null },
			include: {
				supplier: true,
				staff: true,
				products: {
					select: {
						price: true,
						count: true,
						cost: true,
						product: { select: { name: true } },
					},
				},
				payment: true,
			},
		})

		if (!arrival) {
			return res.status(404).json({ message: 'Arrival not found' })
		}

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Приходы')

		// Define columns
		const columns = [
			{ header: '№', key: 'no', width: 5 },
			{ header: 'Товар', key: 'product', width: 25 },
			{ header: 'Количество', key: 'quantity', width: 12 },
			{ header: 'Цена', key: 'price', width: 12 },
			{ header: 'Стоимость', key: 'cost', width: 12 },
		]

		// Calculate total cost
		const totalCost = arrival.products.reduce((sum, p) => sum + p.cost.toNumber() * p.count, 0)

		// Add "Приход от:" row
		const arrivalDateRow = worksheet.addRow([`Приход от: ${arrival.createdAt.toLocaleString('ru-RU')}`])
		// Merge cells from A1 to the last column (e.g., E1 if there are 5 columns)
		worksheet.mergeCells(`A${arrivalDateRow.number}:${String.fromCharCode(64 + worksheet.columns.length)}${arrivalDateRow.number}`)
		arrivalDateRow.getCell(1).font = { bold: true }

		// Add "Поставщик:" row
		const supplierRow = worksheet.addRow([`Поставщик: ${arrival.supplier.fullname}`])
		// Merge cells from A2 to the last column (e.g., E2)
		worksheet.mergeCells(`A${supplierRow.number}:${String.fromCharCode(64 + worksheet.columns.length)}${supplierRow.number}`)
		supplierRow.getCell(1).font = { bold: true }

		// Add an empty row for spacing as in the image
		worksheet.addRow([])

		// Add the column headers (as defined in worksheet.columns)
		const headerRow = worksheet.addRow(columns.map((col) => col.header))
		headerRow.font = { bold: true }

		// Add data rows for products
		arrival.products.forEach((product, index) => {
			worksheet.addRow([index + 1, product.product.name, product.count, product.price, product.cost.toNumber() * product.count])
		})

		// Add total row
		// Find the row number for the 'Итого' row. It should be after all products.
		const totalRow1 = worksheet.addRow([]) // 'Итого' in the 'Товар' column
		const totalRow = worksheet.addRow(['', 'Итого', '', '', totalCost]) // 'Итого' in the 'Товар' column
		totalRow.font = { bold: true }
		totalRow.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFFF00' }, // Yellow background
		}

		// Excel response
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename="arrival-report-one.xlsx"')

		await workbook.xlsx.write(res)
		res.end()
	}

	async returningDownloadMany(res: Response, query: ReturningFindManyRequest) {
		const startDate = query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined
		const endDate = query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined

		const returningList = await this.prisma.returningModel.findMany({
			where: {
				status: query.status,
				clientId: query.clientId,
				OR: [{ client: { fullname: { contains: query.search, mode: 'insensitive' } } }, { client: { phone: { contains: query.search, mode: 'insensitive' } } }],
				date: {
					...(startDate && { gte: startDate }),
					...(endDate && { lte: endDate }),
				},
			},
			select: {
				date: true,
				client: { select: { fullname: true } },
				staff: { select: { phone: true } },
				payment: { select: { cash: true, fromBalance: true, description: true } },
			},
			orderBy: { date: 'desc' },
		})

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Возвраты')

		worksheet.columns = [
			{ header: '№', key: 'no', width: 5 },
			{ header: 'Клиент', key: 'client', width: 30 },
			{ header: 'Сумма', key: 'summa', width: 12 },
			{ header: 'Кем отправован', key: 'staff', width: 20 },
			{ header: 'Информация', key: 'info', width: 25 },
			{ header: 'Дата прихода', key: 'date', width: 20 },
		]

		let total = new Decimal(0)

		returningList.forEach((item, index) => {
			const sum = item.payment?.cash.plus(item.payment?.fromBalance)
			total = total.plus(sum)

			worksheet.addRow({
				no: index + 1,
				client: item.client.fullname,
				summa: sum,
				staff: item.staff?.phone || '',
				info: item.payment?.description || '',
				date: this.formatDate(item.date),
			})
		})

		// Общая сумма qatori + bo‘sh qator
		worksheet.insertRow(1, [])
		worksheet.insertRow(1, [`Общая сумма: ${total.toString()}`])
		worksheet.mergeCells('A1:F1')
		worksheet.getCell('A1').font = { bold: true }

		// Excel response
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename="returnings-report.xlsx"')

		await workbook.xlsx.write(res)
		res.end()
	}

	async returningDownloadOne(res: Response, query: ReturningFindOneRequest) {
		const returning = await this.prisma.returningModel.findUnique({
			where: { id: query.id },
			select: {
				date: true,
				client: { select: { fullname: true } },
				products: {
					select: {
						count: true,
						price: true,
						product: { select: { name: true } },
					},
					orderBy: { createdAt: 'asc' },
				},
			},
		})

		if (!returning) {
			res.status(404).send('Returning not found')
			return
		}

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Возврат')

		// Format: Приход от: 01.07.2025 21:56
		const formattedDate = formatDate(returning.date)

		worksheet.mergeCells('A1:E1')
		worksheet.getCell('A1').value = `Приход от:  ${formattedDate}`
		worksheet.getCell('A1').font = { bold: true }

		worksheet.mergeCells('A2:E2')
		worksheet.getCell('A2').value = `Клиент:  ${returning.client.fullname}`
		worksheet.getCell('A2').font = { bold: true }

		// Table headers
		worksheet.addRow([])
		worksheet.addRow(['№', 'Товар', 'Количество', 'Цена', 'Стоимость'])
		const headerRow = worksheet.getRow(4)
		headerRow.eachCell((cell) => (cell.font = { bold: true }))

		let total = 0

		returning.products.forEach((item, index) => {
			const count = item.count
			const price = item.price
			const cost = count * price.toNumber()
			total += cost

			worksheet.addRow([index + 1, item.product.name, count, price, cost])
		})

		// Итого row
		const lastRow = worksheet.addRow(['', '', '', 'Итого', total])
		lastRow.getCell(4).font = { bold: true }
		lastRow.getCell(5).font = { bold: true }

		worksheet.columns = [
			{ width: 5 }, // №
			{ width: 40 }, // Товар
			{ width: 15 }, // Количество
			{ width: 12 }, // Цена
			{ width: 15 }, // Стоимость
		]

		// Response headers
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename="returning.xlsx"')

		await workbook.xlsx.write(res)
		res.end()

		function formatDate(date: Date): string {
			const dd = String(date.getDate()).padStart(2, '0')
			const mm = String(date.getMonth() + 1).padStart(2, '0')
			const yyyy = date.getFullYear()
			const hh = String(date.getHours()).padStart(2, '0')
			const min = String(date.getMinutes()).padStart(2, '0')
			return `${dd}.${mm}.${yyyy} ${hh}:${min}`
		}
	}

	async clientPaymentDownloadMany(res: Response, query: ClientPaymentFindManyRequest) {
		const startDate = query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined
		const endDate = query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined

		const clientPayments = await this.prisma.paymentModel.findMany({
			where: {
				staffId: query.staffId,
				type: { in: [ServiceTypeEnum.client, ServiceTypeEnum.selling] },
				OR: [{ user: { fullname: { contains: query.search, mode: 'insensitive' } } }, { user: { phone: { contains: query.search, mode: 'insensitive' } } }],
				createdAt: {
					...(startDate && { gte: startDate }),
					...(endDate && { lte: endDate }),
				},
				AND: [
					{
						OR: [{ card: { not: 0 } }, { cash: { not: 0 } }, { transfer: { not: 0 } }, { other: { not: 0 } }, { description: { notIn: [''] } }],
					},
				],
			},
			select: {
				user: { select: { fullname: true } },
				description: true,
				cash: true,
				card: true,
				transfer: true,
				other: true,
				staff: { select: { phone: true } },
				createdAt: true,
			},
			orderBy: { createdAt: 'desc' },
		})

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Клиент оплаты')

		worksheet.columns = [
			{ header: '№', key: 'no', width: 5 },
			{ header: 'Клиент', key: 'client', width: 30 },
			{ header: 'Информация', key: 'info', width: 30 },
			{ header: 'Оплата наличными', key: 'cash', width: 18 },
			{ header: 'Оплата банковской', key: 'card', width: 18 },
			{ header: 'Оплата перечислением', key: 'transfer', width: 20 },
			{ header: 'Оплата другими способами', key: 'other', width: 25 },
			{ header: 'Пользователь', key: 'staff', width: 20 },
			{ header: 'Дата', key: 'date', width: 20 },
		]

		clientPayments.forEach((payment, index) => {
			worksheet.addRow({
				no: index + 1,
				client: payment.user.fullname,
				info: payment.description || '',
				cash: payment.cash || 0,
				card: payment.card || 0,
				transfer: payment.transfer || 0,
				other: payment.other || 0,
				staff: payment.staff.phone || '',
				date: formatDate(payment.createdAt),
			})
		})

		// Format date helper
		function formatDate(date: Date): string {
			const dd = String(date.getDate()).padStart(2, '0')
			const mm = String(date.getMonth() + 1).padStart(2, '0')
			const yyyy = date.getFullYear()
			const hh = String(date.getHours()).padStart(2, '0')
			const min = String(date.getMinutes()).padStart(2, '0')
			return `${dd}.${mm}.${yyyy} ${hh}:${min}`
		}

		// Response headers
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename="client-payments.xlsx"')

		await workbook.xlsx.write(res)
		res.end()
	}

	async supplierPaymentDownloadMany(res: Response, query: ClientPaymentFindManyRequest) {
		const startDate = query.startDate ? new Date(new Date(query.startDate).setHours(0, 0, 0, 0)) : undefined
		const endDate = query.endDate ? new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) : undefined

		const clientPayments = await this.prisma.paymentModel.findMany({
			where: {
				staffId: query.staffId,
				type: { in: [ServiceTypeEnum.supplier] },
				OR: [{ user: { fullname: { contains: query.search, mode: 'insensitive' } } }, { user: { phone: { contains: query.search, mode: 'insensitive' } } }],
				createdAt: {
					...(startDate && { gte: startDate }),
					...(endDate && { lte: endDate }),
				},
				AND: [
					{
						OR: [{ card: { not: 0 } }, { cash: { not: 0 } }, { transfer: { not: 0 } }, { other: { not: 0 } }, { description: { notIn: [''] } }],
					},
				],
			},
			select: {
				user: { select: { fullname: true } },
				description: true,
				cash: true,
				card: true,
				transfer: true,
				other: true,
				staff: { select: { phone: true } },
				createdAt: true,
			},
			orderBy: { createdAt: 'desc' },
		})

		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Клиент оплаты')

		worksheet.columns = [
			{ header: '№', key: 'no', width: 5 },
			{ header: 'Поставшик', key: 'supplier', width: 30 },
			{ header: 'Сумма', key: 'sum', width: 25 },
			{ header: 'dКем оприходан', key: 'staff', width: 20 },
			{ header: 'Информация', key: 'info', width: 30 },
			{ header: 'Дата', key: 'date', width: 20 },
		]

		clientPayments.forEach((payment, index) => {
			worksheet.addRow({
				no: index + 1,
				supplier: payment.user.fullname,
				sum: payment.cash.plus(payment.card).plus(payment.transfer).plus(payment.other),
				staff: payment.staff.phone || '',
				info: payment.description || '',
				date: formatDate(payment.createdAt),
			})
		})

		// Format date helper
		function formatDate(date: Date): string {
			const dd = String(date.getDate()).padStart(2, '0')
			const mm = String(date.getMonth() + 1).padStart(2, '0')
			const yyyy = date.getFullYear()
			const hh = String(date.getHours()).padStart(2, '0')
			const min = String(date.getMinutes()).padStart(2, '0')
			return `${dd}.${mm}.${yyyy} ${hh}:${min}`
		}

		// Response headers
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename="supplier-payments.xlsx"')

		await workbook.xlsx.write(res)
		res.end()
	}

	private formatDate(date: Date): string {
		const dd = String(date.getDate()).padStart(2, '0')
		const mm = String(date.getMonth() + 1).padStart(2, '0') // 0-based
		const yyyy = date.getFullYear()

		const hh = String(date.getHours()).padStart(2, '0')
		const min = String(date.getMinutes()).padStart(2, '0')

		return `${dd}.${mm}.${yyyy} ${hh}:${min}`
	}
}
