import { Injectable } from '@nestjs/common'
import { BotService } from './bot.service'
import { Ctx, Hears, On, Start, Update } from 'nestjs-telegraf'
import { Context } from 'telegraf'
import { BotLanguageEnum } from '@prisma/client'
import { ChatService } from '../chat/chat.service'

const LANGUAGE_BUTTONS = new Set(["O'zbek tili", 'Русскый язык', 'English language'])

@Update()
@Injectable()
export class BotUpdate {
	constructor(
		private readonly botService: BotService,
		private readonly chatService: ChatService,
	) {}

	@Start()
	async onStart(@Ctx() ctx: Context) {
		return this.botService.onStart(ctx)
	}

	@Hears("O'zbek tili")
	async onSelectUzbek(@Ctx() ctx: Context) {
		return await this.botService.onSelectLanguage(ctx, BotLanguageEnum.uz)
	}

	@Hears('Русскый язык')
	async onSelectRussian(@Ctx() ctx: Context) {
		return await this.botService.onSelectLanguage(ctx, BotLanguageEnum.ru)
	}

	@Hears('English language')
	async onSelectEnglish(@Ctx() ctx: Context) {
		return await this.botService.onSelectLanguage(ctx, BotLanguageEnum.en)
	}

	@On('contact')
	async onContact(@Ctx() ctx: Context) {
		return await this.botService.onContact(ctx)
	}

	@On('text')
	async onText(@Ctx() ctx: Context) {
		const text = ctx.message && 'text' in ctx.message ? ctx.message.text : ''
		if (!text || text.startsWith('/') || LANGUAGE_BUTTONS.has(text) || !ctx.from || !ctx.message) return
		await this.chatService.ingestTelegram({
			telegramUserId: String(ctx.from.id),
			telegramMessageId: ctx.message.message_id,
			text,
		})
	}

	@On('photo')
	async onPhoto(@Ctx() ctx: Context) {
		const message = ctx.message
		if (!message || !('photo' in message) || !ctx.from) return
		const caption = 'caption' in message ? message.caption?.trim() : ''
		await this.chatService.ingestTelegram({
			telegramUserId: String(ctx.from.id),
			telegramMessageId: message.message_id,
			text: caption ? `Rasm: ${caption}` : 'Rasm yuborildi',
		})
	}

	@On('document')
	async onDocument(@Ctx() ctx: Context) {
		const message = ctx.message
		if (!message || !('document' in message) || !ctx.from) return
		const name = message.document.file_name || 'hujjat'
		const caption = 'caption' in message ? message.caption?.trim() : ''
		await this.chatService.ingestTelegram({
			telegramUserId: String(ctx.from.id),
			telegramMessageId: message.message_id,
			text: caption ? `Hujjat (${name}): ${caption}` : `Hujjat yuborildi: ${name}`,
		})
	}
}
