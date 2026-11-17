import { Injectable } from '@nestjs/common'
import { ChatMessageDirectionEnum, Prisma } from '@prisma/client'
import { PrismaService } from '../shared/prisma'
import { ChatMessageView } from './chat.types'

const chatMessageSelect = {
	id: true,
	clientId: true,
	direction: true,
	text: true,
	telegramMessageId: true,
	staffId: true,
	createdAt: true,
	staff: { select: { id: true, fullname: true } },
} satisfies Prisma.ChatMessageModelSelect

const toView = (row: Prisma.ChatMessageModelGetPayload<{ select: typeof chatMessageSelect }>): ChatMessageView => ({
	id: row.id,
	clientId: row.clientId,
	direction: row.direction,
	text: row.text,
	telegramMessageId: row.telegramMessageId,
	staffId: row.staffId,
	staff: row.staff,
	createdAt: row.createdAt,
})

@Injectable()
export class ChatRepository {
	constructor(private readonly prisma: PrismaService) {}

	async findMany(query: { clientId: string; pageNumber?: number; pageSize?: number; pagination?: boolean }) {
		const pageNumber = query.pageNumber || 1
		const pageSize = query.pageSize || 10
		const where = { clientId: query.clientId, deletedAt: null }
		const pagination = query.pagination !== false ? { take: pageSize, skip: (pageNumber - 1) * pageSize } : {}
		const [rows, totalCount] = await Promise.all([
			this.prisma.chatMessageModel.findMany({ where, ...pagination, orderBy: { createdAt: 'desc' }, select: chatMessageSelect }),
			this.prisma.chatMessageModel.count({ where }),
		])
		return {
			data: rows.map(toView),
			totalCount,
			pageSize: rows.length,
			pagesCount: query.pagination === false ? 1 : Math.ceil(totalCount / pageSize),
		}
	}

	findOne(id: string) {
		return this.prisma.chatMessageModel.findFirst({
			where: { id, deletedAt: null },
			select: {
				...chatMessageSelect,
				client: { select: { telegram: { select: { id: true, isActive: true } } } },
			},
		})
	}

	softDelete(id: string) {
		return this.prisma.chatMessageModel.update({ where: { id }, data: { deletedAt: new Date() } })
	}

	markRead(clientId: string, at: Date) {
		return this.prisma.userModel.update({ where: { id: clientId }, data: { chatReadAt: at } })
	}

	async create(input: SaveChatInput) {
		const row = await this.prisma.chatMessageModel.create({
			data: {
				clientId: input.clientId,
				direction: input.direction,
				text: input.text ?? null,
				telegramMessageId: input.telegramMessageId ?? null,
				staffId: input.staffId ?? null,
			},
			select: chatMessageSelect,
		})
		return toView(row)
	}

	private unreadCounts(ids: string[]) {
		const clientIds = Prisma.join(ids.map((id) => Prisma.sql`${id}::uuid`))
		return this.prisma.$queryRaw<Array<{ client_id: string; unread: number }>>`
			SELECT m.client_id, COUNT(*)::int AS unread
			FROM chat_message m
			INNER JOIN "user" u ON u.id = m.client_id
			WHERE m.deleted_at IS NULL
				AND m.direction = 'in'
				AND m.client_id IN (${clientIds})
				AND (u.chat_read_at IS NULL OR m.created_at > u.chat_read_at)
			GROUP BY m.client_id
		`
	}

	async inbox() {
		const rows = await this.prisma.$queryRaw<InboxRow[]>`
			SELECT DISTINCT ON (m.client_id)
				m.client_id,
				m.text,
				m.direction::text AS direction,
				m.created_at,
				u.fullname,
				u.phone,
				b.is_active AS telegram_active
			FROM chat_message m
			INNER JOIN "user" u ON u.id = m.client_id AND u.deleted_at IS NULL AND u.type = 'client'
			LEFT JOIN bot_user b ON b.user_id = u.id
			WHERE m.deleted_at IS NULL
			ORDER BY m.client_id, m.created_at DESC
		`
		const sorted = [...rows].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
		const ids = sorted.map((row) => row.client_id)
		const counts = ids.length ? await this.unreadCounts(ids) : []
		const countByClient = new Map(counts.map((row) => [row.client_id, Number(row.unread) || 0]))
		return sorted.map((row) => ({
			id: row.client_id,
			fullname: row.fullname,
			phone: row.phone || '',
			telegram: row.telegram_active === null ? null : { isActive: row.telegram_active },
			incomingCount: countByClient.get(row.client_id) || 0,
			unreadCount: countByClient.get(row.client_id) || 0,
			lastMessage: {
				text: row.text,
				direction: row.direction,
				createdAt: row.created_at,
			},
		}))
	}
}

type SaveChatInput = {
	clientId: string
	direction: ChatMessageDirectionEnum
	text?: string | null
	telegramMessageId?: number | null
	staffId?: string | null
}

type InboxRow = {
	client_id: string
	text: string | null
	direction: ChatMessageDirectionEnum
	created_at: Date
	fullname: string
	phone: string
	telegram_active: boolean | null
}
