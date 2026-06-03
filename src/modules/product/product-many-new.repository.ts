import { Injectable } from '@nestjs/common'
import { Prisma, ServiceTypeEnum } from '@prisma/client'
import { PrismaService } from '../shared'
import { ProductFindManyRequest } from './interfaces'

type ProductFindManyTotals = {
	total_cost: Prisma.Decimal
	total_price: Prisma.Decimal
	total_count: bigint
}

@Injectable()
export class ProductManyNewRepository {
	private readonly prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	private buildNameFilter(query: ProductFindManyRequest) {
		if (!query.search) {
			return {}
		}

		const searchWords = query.search.split(/\s+/).filter(Boolean)
		if (searchWords.length === 0) {
			return {}
		}

		return {
			[searchWords.length > 1 ? 'AND' : 'OR']: searchWords.map((word) => ({
				name: {
					contains: word,
					mode: 'insensitive' as const,
				},
			})),
		}
	}

	private buildNameFilterSql(query: ProductFindManyRequest): Prisma.Sql {
		if (!query.search) {
			return Prisma.empty
		}

		const searchWords = query.search.split(/\s+/).filter(Boolean)
		if (searchWords.length === 0) {
			return Prisma.empty
		}

		const conditions = searchWords.map((word) => Prisma.sql`name ILIKE ${'%' + word + '%'}`)
		const joinOperator = searchWords.length > 1 ? ' AND ' : ' OR '

		return Prisma.sql`AND (${Prisma.join(conditions, joinOperator)})`
	}

	private getPaginationOptions(query: ProductFindManyRequest): Pick<Prisma.ProductModelFindManyArgs, 'take' | 'skip'> {
		if (!query.pagination) {
			return {}
		}

		return { take: query.pageSize, skip: (query.pageNumber - 1) * query.pageSize }
	}

	async findMany(query: ProductFindManyRequest) {
		const nameFilter = this.buildNameFilter(query)
		const paginationOptions = this.getPaginationOptions(query)

		return this.prisma.productModel.findMany({
			where: {
				...nameFilter,
			},
			select: {
				id: true,
				cost: true,
				price: true,
				count: true,
				createdAt: true,
				name: true,
				minAmount: true,
			},
			...paginationOptions,
		})
	}

	async countFindMany(query: ProductFindManyRequest) {
		const nameFilter = this.buildNameFilter(query)

		return this.prisma.productModel.count({
			where: {
				...nameFilter,
			},
		})
	}

	async aggregateFindManyTotals(query: ProductFindManyRequest): Promise<ProductFindManyTotals> {
		const nameFilterSql = this.buildNameFilterSql(query)

		const [result] = await this.prisma.$queryRaw<ProductFindManyTotals[]>`
			SELECT
				COALESCE(SUM(cost * count), 0)::decimal AS total_cost,
				COALESCE(SUM(price * count), 0)::decimal AS total_price,
				COALESCE(SUM(count), 0)::bigint AS total_count
			FROM product
			WHERE TRUE
			${nameFilterSql}
		`

		return result
	}

	async getLastSellingDatesByProductIds(productIds: string[]) {
		if (productIds.length === 0) {
			return new Map<string, Date>()
		}

		const rows = await this.prisma.$queryRaw<Array<{ product_id: string; date: Date }>>`
			SELECT DISTINCT ON (pm.product_id)
				pm.product_id,
				s.date
			FROM product_mv pm
			INNER JOIN selling s ON s.id = pm.selling_id
			WHERE pm.type = ${ServiceTypeEnum.selling}::service_type
				AND pm.product_id = ANY(${productIds}::uuid[])
			ORDER BY pm.product_id, s.date DESC
		`

		return new Map(rows.map((row) => [row.product_id, row.date]))
	}
}
