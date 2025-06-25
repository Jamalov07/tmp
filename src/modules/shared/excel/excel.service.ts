import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma'
import * as ExcelJS from 'exceljs'
import { Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { SellingFindManyRequest, SellingFindOneRequest } from '../../selling'
import { ArrivalFindManyRequest, ArrivalFindOneRequest } from '../../arrival'
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
}
