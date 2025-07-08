import { Injectable } from '@nestjs/common'
import { PrismaService } from '../shared'
import { Context, Markup } from 'telegraf'
import { Message } from 'telegraf/typings/core/types/typegram'
import { BotLanguageEnum } from '@prisma/client'

@Injectable()
export class BotService {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async onStart(context: Context): Promise<Message.TextMessage> {
		const user = await this.findBotUserById(context.from.id)
		if (user) {
			if (user.language) {
				if (user.userId) {
					return context.reply(`${user.user.fullname} siz allaqachon ro'yhatdan o'tgansiz!`)
				} else {
					return context.reply("Ro'yhatdan o'tish uchun telefon raqam yuborish tugmasini bosing.", {
						parse_mode: 'HTML',
						...Markup.keyboard([[Markup.button.contactRequest('📲 Raqam yuborish')]])
							.oneTime()
							.resize(),
					})
				}
			} else {
				return await context.reply("O'zingizga qulay bo'lgan tilni tanlang.", {
					parse_mode: 'HTML',
					...Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
						.oneTime()
						.resize(),
				})
			}
		} else {
			await this.createBotUserWithId(context.from.id)
			return await context.reply("O'zingizga qulay bo'lgan tilni tanlang.", {
				parse_mode: 'HTML',
				...Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
					.oneTime()
					.resize(),
			})
		}
	}

	async onSelectLanguage(context: Context, language: BotLanguageEnum): Promise<Message.TextMessage> {
		const user = await this.findBotUserById(context.from.id)

		if (user) {
			const user2 = await this.updateBotUserWithId(context.from.id, { language: language })
			return context.reply("Ro'yhatdan o'tish uchun telefon raqam yuborish tugmasini bosing.", {
				parse_mode: 'HTML',
				...Markup.keyboard([[Markup.button.contactRequest('📲 Raqam yuborish')]])
					.oneTime()
					.resize(),
			})
		} else {
			await this.createBotUserWithId(context.from.id)
			return await context.reply("Hayrli kun. O'zingizga qulay bo'lgan tilni tanlang.", {
				parse_mode: 'HTML',
				...Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
					.oneTime()
					.resize(),
			})
		}
	}

	async onContact(context: Context): Promise<Message.TextMessage> {
		const user = await this.findBotUserById(context.from.id)
		if (user && 'contact' in context.message) {
			if (user.language) {
				const usr = await this.findUserByPhone(context.message.contact.phone_number)
				if (usr) {
					await this.updateBotUserWithId(context.from.id, { userId: usr.id })
					return await context.reply("Tabriklaymiz. Muvaffaqiyatli ro'yhatdan o'tdingiz!")
				} else {
					await context.reply("Bizda sizning ma'lumotlar topilmadi.")
				}
			} else {
				await this.createBotUserWithId(context.from.id)
				return await context.reply("Hayrli kun. O'zingizga qulay bo'lgan tilni tanlang.", {
					parse_mode: 'HTML',
					...Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
						.oneTime()
						.resize(),
				})
			}
		} else {
			await this.createBotUserWithId(context.from.id)
			return await context.reply("Hayrli kun. O'zingizga qulay bo'lgan tilni tanlang.", {
				parse_mode: 'HTML',
				...Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
					.oneTime()
					.resize(),
			})
		}
	}

	private async findBotUserById(id: number | string) {
		const user = await this.prisma.botUserModel.findFirst({ where: { id: String(id) }, select: { id: true, language: true, isActive: true, userId: true, user: true } })
		return user
	}

	private async createBotUserWithId(id: number | string) {
		const user = await this.prisma.botUserModel.create({ data: { id: String(id) } })
		return user
	}

	private async updateBotUserWithId(id: number | string, body: { userId?: string; language?: BotLanguageEnum }) {
		const user = await this.prisma.botUserModel.update({ where: { id: String(id) }, data: { language: body.language, userId: body.userId } })
		return user
	}

	private async findUserByPhone(phone: string) {
		const user = await this.prisma.userModel.findFirst({ where: { phone: phone } })
		return user
	}
}
