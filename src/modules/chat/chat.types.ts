import { ChatMessageDirectionEnum } from '@prisma/client'

export type ChatMessageView = {
	id: string
	clientId: string
	direction: ChatMessageDirectionEnum
	text: string | null
	telegramMessageId: number | null
	staffId: string | null
	staff: { id: string; fullname: string } | null
	createdAt: Date
}

export type SaveChatMessageInput = {
	clientId: string
	direction: ChatMessageDirectionEnum
	text?: string | null
	telegramMessageId?: number | null
	staffId?: string | null
}
