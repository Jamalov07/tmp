import { Injectable } from '@nestjs/common'
import { BotService } from './bot.service'
import { Ctx, Hears, On, Start } from 'nestjs-telegraf'
import { Context } from 'telegraf'
import { Message } from 'telegraf/typings/core/types/typegram'
import { BotLanguageEnum } from '@prisma/client'

@Injectable()
export class BotUpdate {
	private readonly botService: BotService
	constructor(botService: BotService) {
		this.botService = botService
	}

	@Start()
	async onStart(@Ctx() ctx: Context): Promise<Message.TextMessage> {
		return this.botService.onStart(ctx)
	}

	@Hears("O'zbek tili")
	async onSelectUzbek(@Ctx() ctx: Context): Promise<Message.TextMessage> {
		return this.botService.onSelectLanguage(ctx, BotLanguageEnum.uz)
	}

	@Hears('Русскый язык')
	async onSelectRussian(@Ctx() ctx: Context): Promise<Message.TextMessage> {
		return this.botService.onSelectLanguage(ctx, BotLanguageEnum.ru)
	}

	@Hears('English language')
	async onSelectEnglish(@Ctx() ctx: Context): Promise<Message.TextMessage> {
		return this.botService.onSelectLanguage(ctx, BotLanguageEnum.en)
	}

	@On('contact')
	async onContact(@Ctx() ctx: Context): Promise<Message.TextMessage> {
		return this.botService.onContact(ctx)
	}
}
