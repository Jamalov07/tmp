import { Injectable } from '@nestjs/common'
import { Prisma, UserTypeEnum } from '@prisma/client'
import { PrismaService } from '../shared/prisma'

const reminderSelect = {
	id: true,
	clientId: true,
	startDate: true,
	sendHour: true,
	description: true,
	lastSentOn: true,
	createdAt: true,
	updatedAt: true,
	client: { select: { id: true, fullname: true, phone: true } },
} satisfies Prisma.ReminderModelSelect

@Injectable()
export class ReminderRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findMany(query: { clientId?: string; pageNumber?: number; pageSize?: number; pagination?: boolean }) {
		const pageNumber = query.pageNumber || 1
		const pageSize = query.pageSize || 10
		const where = { deletedAt: null, client: { type: UserTypeEnum.client }, ...(query.clientId ? { clientId: query.clientId } : {}) }
		const pagination = query.pagination !== false ? { take: pageSize, skip: (pageNumber - 1) * pageSize } : {}
		const [rows, totalCount] = await Promise.all([
			this.prisma.reminderModel.findMany({ where, ...pagination, select: reminderSelect }),
			this.prisma.reminderModel.count({ where }),
		])
		return {
			data: rows,
			totalCount,
			pageSize: rows.length,
			pagesCount: query.pagination === false ? 1 : Math.ceil(totalCount / pageSize),
		}
	}

	findOne(id: string) {
		return this.prisma.reminderModel.findFirst({ where: { id, deletedAt: null }, select: reminderSelect })
	}

	create(data: { clientId: string; startDate: Date; sendHour: number; description: string }) {
		return this.prisma.reminderModel.create({ data, select: reminderSelect })
	}

	update(id: string, data: { startDate?: Date; sendHour?: number; description?: string }) {
		return this.prisma.reminderModel.update({ where: { id }, data, select: reminderSelect })
	}

	softDelete(id: string) {
		return this.prisma.reminderModel.update({ where: { id }, data: { deletedAt: new Date() } })
	}

	findDue(today: Date, hour: number) {
		return this.prisma.reminderModel.findMany({
			where: {
				deletedAt: null,
				startDate: { lte: today },
				sendHour: hour,
				OR: [{ lastSentOn: null }, { lastSentOn: { lt: today } }],
				client: { type: UserTypeEnum.client, deletedAt: null },
			},
			select: {
				id: true,
				description: true,
				client: { select: { id: true, fullname: true, phone: true, telegram: { select: { id: true, isActive: true } } } },
			},
		})
	}

	findDueForChannel(today: Date) {
		return this.prisma.reminderModel.findMany({
			where: {
				deletedAt: null,
				startDate: { lte: today },
				client: { type: UserTypeEnum.client, deletedAt: null },
			},
			select: {
				id: true,
				description: true,
				client: { select: { id: true, fullname: true, phone: true, telegram: { select: { id: true, isActive: true } } } },
			},
		})
	}

	markSent(id: string, today: Date) {
		return this.prisma.reminderModel.update({ where: { id }, data: { lastSentOn: today } })
	}
}
