import { Injectable } from '@nestjs/common'
import { PdfService, PrismaService } from '../shared'
import { Context, Markup, Telegraf } from 'telegraf'
import { Message } from 'telegraf/typings/core/types/typegram'
import { BotLanguageEnum } from '@prisma/client'
import { SellingFindOneData } from '../selling'
import { InjectBot } from 'nestjs-telegraf'
import { MyBotName } from './constants'

@Injectable()
export class BotService {
	private readonly prisma: PrismaService
	private readonly pdfService: PdfService
	constructor(
		prisma: PrismaService,
		pdfService: PdfService,
		@InjectBot(MyBotName) private readonly bot: Telegraf<Context>,
	) {
		this.prisma = prisma
		this.pdfService = pdfService
	}

	async onStart(context: Context) {
		const user = await this.findBotUserById(context.from.id)
		if (user) {
			if (user.language) {
				if (user.userId) {
					context.reply(`${user.user.fullname} siz allaqachon ro'yhatdan o'tgansiz!`)
				} else {
					context.reply("Ro'yhatdan o'tish uchun telefon raqam yuborish tugmasini bosing.", {
						parse_mode: 'HTML',
						reply_markup: Markup.keyboard([[Markup.button.contactRequest('📲 Raqam yuborish')]])
							.oneTime()
							.resize().reply_markup,
					})
				}
			} else {
				await context.reply("O'zingizga qulay bo'lgan tilni tanlang.", {
					parse_mode: 'HTML',
					reply_markup: Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
						.oneTime()
						.resize().reply_markup,
				})
			}
		} else {
			await this.createBotUserWithId(context.from.id)
			await context.reply("O'zingizga qulay bo'lgan tilni tanlang.", {
				parse_mode: 'HTML',
				...Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
					.oneTime()
					.resize(),
			})
		}
	}

	async onSelectLanguage(context: Context, language: BotLanguageEnum) {
		const user = await this.findBotUserById(context.from.id)

		if (user) {
			const user2 = await this.updateBotUserWithId(context.from.id, { language: language })
			await context.reply("Ro'yhatdan o'tish uchun telefon raqam yuborish tugmasini bosing.", {
				parse_mode: 'HTML',
				...Markup.keyboard([[Markup.button.contactRequest('📲 Raqam yuborish')]])
					.oneTime()
					.resize(),
			})
		} else {
			await this.createBotUserWithId(context.from.id)
			await context.reply("Hayrli kun. O'zingizga qulay bo'lgan tilni tanlang.", {
				parse_mode: 'HTML',
				...Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
					.oneTime()
					.resize(),
			})
		}
	}

	async onContact(context: Context) {
		const user = await this.findBotUserById(context.from.id)
		if (user && 'contact' in context.message) {
			if (user.language) {
				const usr = await this.findUserByPhone(context.message.contact.phone_number)
				if (usr) {
					await this.updateBotUserWithId(context.from.id, { userId: usr.id })
					await context.reply("Tabriklaymiz. Muvaffaqiyatli ro'yhatdan o'tdingiz!")
				} else {
					await context.reply("Bizda sizning ma'lumotlar topilmadi.")
				}
			} else {
				await this.createBotUserWithId(context.from.id)
				await context.reply("Hayrli kun. O'zingizga qulay bo'lgan tilni tanlang.", {
					parse_mode: 'HTML',
					...Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
						.oneTime()
						.resize(),
				})
			}
		} else {
			await this.createBotUserWithId(context.from.id)
			await context.reply("Hayrli kun. O'zingizga qulay bo'lgan tilni tanlang.", {
				parse_mode: 'HTML',
				...Markup.keyboard([["O'zbek tili"], ['Русскый язык'], ['English language']])
					.oneTime()
					.resize(),
			})
		}
	}

	async sendSellingToClient(selling: SellingFindOneData) {
		const bufferPdf = await this.pdfService.generateInvoicePdfBuffer(selling)

		await this.bot.telegram.sendDocument(selling.client.telegram?.id, { source: bufferPdf, filename: 'harid.pdf' }, { caption: `🧾 Sizning haridingiz haqida hisobot tayyor.` })
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
