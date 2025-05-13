import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma'
import * as ExcelJS from 'exceljs'
import { Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
@Injectable()
export class ExcelService {
	private readonly prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}
}
