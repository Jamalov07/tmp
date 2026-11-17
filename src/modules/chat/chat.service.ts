import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { UserTypeEnum } from '@prisma/client'
import { createResponse, ERROR_MSG } from '@common'
import { PrismaService } from '../shared/prisma'
import { BotService } from '../bot/bot.service'
import { ChatRepository } from './chat.repository'
import { ChatCreateTextRequestDto, ChatFindManyRequestDto } from './dtos'
import { SaveChatMessageInput } from './chat.types'

const TELEGRAM_DELETE_MS = 48 * 60 * 60 * 1000

@Injectable()
export class ChatService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly repository: ChatRepository,
		@Inject(forwardRef(() => BotService)) private readonly botService: BotService,
	) {}

	async findMany(query: ChatFindManyRequestDto) {
		await this.requireClient(query.clientId)
		const data = await this.repository.findMany(query)
		return createResponse({ data, success: { messages: ['get many success'] } })
	}

	async inbox() {
		const data = await this.repository.inbox()
		return createResponse({ data, success: { messages: ['get many success'] } })
	}

	async markRead(clientId: string) {
		await this.requireClient(clientId)
		await this.repository.markRead(clientId, new Date())
		return createResponse({ data: { clientId }, success: { messages: ['update one success'] } })
	}

	async createText(staffId: string, body: ChatCreateTextRequestDto) {
		await this.requireStaff(staffId)
		const client = await this.requireClient(body.clientId)
		const text = body.text.trim()
		if (!text) throw new BadRequestException(ERROR_MSG.CHAT.TEXT_REQUIRED.UZ)
		const telegramMessageId = await this.deliverText(client.telegram, text)
		const message = await this.repository.create({
			clientId: client.id,
			direction: 'out',
			text,
			staffId,
			telegramMessageId,
		})
		return createResponse({
			data: message,
			success: { messages: ['create one success'] },
			warning: telegramMessageId ? undefined : { is: true, messages: ['telegramga yuborilmadi, xabar saqlandi'] },
		})
	}

	async deleteOne(id: string) {
		const row = await this.repository.findOne(id)
		if (!row) throw new BadRequestException(ERROR_MSG.CHAT.NOT_FOUND.UZ)
		let telegramDeleted = false
		const age = Date.now() - new Date(row.createdAt).getTime()
		if (row.telegramMessageId && row.client?.telegram?.id && row.client.telegram.isActive !== false && age < TELEGRAM_DELETE_MS) {
			telegramDeleted = await this.botService.deleteTelegramMessage(row.client.telegram.id, row.telegramMessageId)
		}
		await this.repository.softDelete(id)
		const failedOnTelegram = !!row.telegramMessageId && !telegramDeleted
		return createResponse({
			data: { id: row.id, telegramDeleted },
			success: { messages: ['delete one success'] },
			warning: failedOnTelegram ? { is: true, messages: ['telegramdagi xabar o‘chirilmadi'] } : undefined,
		})
	}

	save(input: SaveChatMessageInput) {
		return this.repository.create(input)
	}

	async ingestTelegram(input: { telegramUserId: string; telegramMessageId: number; text?: string | null }) {
		const text = input.text?.trim()
		if (!text) return
		const botUser = await this.prisma.botUserModel.findFirst({
			where: { id: input.telegramUserId },
			select: { userId: true, isActive: true, user: { select: { id: true, type: true, deletedAt: true } } },
		})
		if (!botUser?.userId || botUser.isActive === false) return
		if (!botUser.user || botUser.user.deletedAt || botUser.user.type !== UserTypeEnum.client) return
		await this.repository.create({
			clientId: botUser.user.id,
			direction: 'in',
			text,
			telegramMessageId: input.telegramMessageId,
		})
	}

	private async requireClient(clientId: string) {
		const client = await this.prisma.userModel.findFirst({
			where: { id: clientId, type: UserTypeEnum.client, deletedAt: null },
			select: { id: true, telegram: { select: { id: true, isActive: true } } },
		})
		if (!client) throw new BadRequestException(ERROR_MSG.CLIENT.NOT_FOUND.UZ)
		return client
	}

	private async requireStaff(staffId: string) {
		const staff = await this.prisma.userModel.findFirst({
			where: { id: staffId, deletedAt: null, type: { in: [UserTypeEnum.staff, UserTypeEnum.admin] } },
			select: { id: true },
		})
		if (!staff) throw new BadRequestException(ERROR_MSG.AUTH.USER_NOT_FOUND_WITH_THIS_TOKEN.UZ)
		return staff
	}

	private async deliverText(telegram: { id: string; isActive: boolean } | null, text: string) {
		if (!telegram?.id || telegram.isActive === false) return null
		return this.botService.sendTextToClient(telegram.id, text)
	}
}
