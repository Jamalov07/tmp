import { Injectable } from '@nestjs/common'
import { UploadQueryDto } from './dtos/request.dto'
import { Express } from 'express'
import { CLIENT_EXCEL_MAP, PRODUCT_EXCEL_MAP, readExcel, STAFF_EXCEL_MAP, SUPPLIER_EXCEL_MAP } from './helpers'
import { UploadModeEnum } from './enums'
import { PrismaService } from '../shared'
import { ServiceTypeEnum, UserTypeEnum } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class UploadService {
	constructor(private readonly prisma: PrismaService) {}

	async uploadStaff(file: Express.Multer.File, query: UploadQueryDto) {
		const rows = readExcel(file.buffer)

		if (query.mode === UploadModeEnum.OVERWRITE) {
			await this.prisma.userModel.deleteMany({
				where: {
					type: { in: [UserTypeEnum.admin, UserTypeEnum.staff] },
				},
			})
		}

		const staffsData = []

		for (const row of rows) {
			const data: any = {}

			for (const excelKey in STAFF_EXCEL_MAP) {
				data[STAFF_EXCEL_MAP[excelKey]] = row[excelKey]
			}

			if (!data.id || !data.phone || !data.fullname) continue

			const phone = String(data.phone).trim()
			const fullname = String(data.fullname).trim()
			const createdAt = data.createdAt ? new Date(data.createdAt) : new Date()

			staffsData.push({
				id: data.id,
				phone,
				fullname,
				password: bcrypt.hashSync(phone, 7),
				type: data.role === 'super_admin' ? UserTypeEnum.admin : UserTypeEnum.staff,
				createdAt,
				balance: new Decimal(0),
			})
		}

		const staffs = await this.prisma.userModel.createMany({
			data: staffsData,
			skipDuplicates: true,
		})

		return {
			count: staffs.count,
		}
	}

	async uploadSupplier(file: Express.Multer.File, query: UploadQueryDto) {
		const rows = readExcel(file.buffer)

		const mainStaff =
			(await this.prisma.userModel.findFirst({ where: { type: UserTypeEnum.admin } })) ?? (await this.prisma.userModel.findFirst({ where: { type: UserTypeEnum.staff } }))

		if (query.mode === UploadModeEnum.OVERWRITE) {
			await this.prisma.$transaction([
				this.prisma.paymentModel.deleteMany({
					where: { type: ServiceTypeEnum.supplier },
				}),
				this.prisma.userModel.deleteMany({
					where: { type: UserTypeEnum.supplier },
				}),
			])
		}

		const suppliersData = []
		const paymentsData = []

		for (const row of rows) {
			const data: any = {}

			for (const excelKey in SUPPLIER_EXCEL_MAP) {
				data[SUPPLIER_EXCEL_MAP[excelKey]] = row[excelKey]
			}

			if (!data.id || !data.phone || !data.name) continue

			const phone = String(data.phone).trim()
			const fullname = String(data.name).trim()
			const debt = new Decimal(data.debt ?? 0)
			const createdAt = data.createdAt ? new Date(data.createdAt) : new Date()

			suppliersData.push({
				id: data.id,
				phone,
				fullname,
				password: bcrypt.hashSync(phone, 7),
				type: UserTypeEnum.supplier,
				createdAt,
				balance: debt,
			})

			if (!debt.isZero()) {
				paymentsData.push({
					id: uuidv4(),
					type: ServiceTypeEnum.supplier,
					userId: data.id,
					staffId: mainStaff.id,
					other: debt,
					total: debt,
					description: `import qilingan boshlang'ich qiymat ${debt.toFixed(2)}`,
					createdAt,
				})
			}
		}

		const [suppliers, payments] = await this.prisma.$transaction([
			this.prisma.userModel.createMany({
				data: suppliersData,
				skipDuplicates: true,
			}),
			this.prisma.paymentModel.createMany({
				data: paymentsData,
				skipDuplicates: false,
			}),
		])

		return {
			suppliers: suppliers.count,
			payments: payments.count,
		}
	}

	async uploadClient(file: Express.Multer.File, query: UploadQueryDto) {
		const rows = readExcel(file.buffer)

		const mainStaff =
			(await this.prisma.userModel.findFirst({ where: { type: UserTypeEnum.admin } })) ?? (await this.prisma.userModel.findFirst({ where: { type: UserTypeEnum.staff } }))

		if (query.mode === UploadModeEnum.OVERWRITE) {
			await this.prisma.$transaction([
				this.prisma.paymentModel.deleteMany({
					where: { type: ServiceTypeEnum.client },
				}),
				this.prisma.userModel.deleteMany({
					where: { type: UserTypeEnum.client },
				}),
			])
		}

		const clientsData = []
		const paymentsData = []

		for (const row of rows) {
			const data: any = {}

			for (const excelKey in CLIENT_EXCEL_MAP) {
				data[CLIENT_EXCEL_MAP[excelKey]] = row[excelKey]
			}

			if (!data.id || !data.phone || !data.name) continue

			const phone = String(data.phone).trim()
			const fullname = String(data.name).trim()
			const debt = new Decimal(data.debt ?? 0)
			const createdAt = data.createdAt ? new Date(data.createdAt) : new Date()

			clientsData.push({
				id: data.id,
				phone,
				fullname,
				password: bcrypt.hashSync(phone, 7),
				type: UserTypeEnum.client,
				createdAt,
				balance: debt,
			})

			if (!debt.isZero()) {
				paymentsData.push({
					id: uuidv4(),
					type: ServiceTypeEnum.client,
					userId: data.id,
					staffId: mainStaff.id,
					other: debt,
					total: debt,
					description: `import qilingan boshlang'ich qiymat ${debt.toFixed(2)}`,
					createdAt,
				})
			}
		}

		const [clients, payments] = await this.prisma.$transaction([
			this.prisma.userModel.createMany({
				data: clientsData,
				skipDuplicates: true,
			}),
			this.prisma.paymentModel.createMany({
				data: paymentsData,
				skipDuplicates: false,
			}),
		])

		return {
			clients: clients.count,
			payments: payments.count,
		}
	}

	async uploadProduct(file: Express.Multer.File, query: UploadQueryDto) {
		const rows = readExcel(file.buffer)

		if (query.mode === UploadModeEnum.OVERWRITE) {
			await this.prisma.productModel.deleteMany({})
			await this.prisma.productMVModel.deleteMany({})
		}

		const mainStaff =
			(await this.prisma.userModel.findFirst({ where: { type: UserTypeEnum.admin } })) ?? (await this.prisma.userModel.findFirst({ where: { type: UserTypeEnum.staff } }))

		const productsData = []
		const productMVsData = []

		for (const row of rows) {
			const data: any = {}

			for (const excelKey in PRODUCT_EXCEL_MAP) {
				data[PRODUCT_EXCEL_MAP[excelKey]] = row[excelKey]
			}

			// minimal validation
			if (!data.id || !data.name || !data.price) continue

			const cost = new Decimal(data.cost ?? 0)
			const price = new Decimal(data.price ?? 0)
			const count = Number(data.count ?? 0)

			productsData.push({
				id: data.id,
				name: String(data.name).trim(),
				cost,
				count,
				price,
				minAmount: Number(data.minAmount ?? 0),
				createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
			})

			productMVsData.push({
				id: uuidv4(),
				productId: data.id,
				staffId: mainStaff.id,
				cost,
				price,
				count,
				totalCost: cost.mul(count),
				totalPrice: price.mul(count),
				type: ServiceTypeEnum.arrival,
				createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
			})
		}

		const [products, productMVs] = await this.prisma.$transaction([
			this.prisma.productModel.createMany({
				data: productsData,
				skipDuplicates: true,
			}),
			this.prisma.productMVModel.createMany({
				data: productMVsData,
				skipDuplicates: false,
			}),
		])

		return {
			products: products.count,
			productMVs: productMVs.count,
		}
	}
}
