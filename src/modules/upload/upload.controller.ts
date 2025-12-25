import { Controller, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UploadService } from './upload.service'
import { UploadQueryDto } from './dtos/request.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'
import { EXCEL_FILE_PIPE } from './helpers'

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	@Post('staff')
	@UseInterceptors(FileInterceptor('file'))
	async uploadStaff(@UploadedFile(new ParseFilePipe(EXCEL_FILE_PIPE)) file: Express.Multer.File, @Query() query: UploadQueryDto) {
		return this.uploadService.uploadStaff(file, query)
	}

	@Post('supplier')
	@UseInterceptors(FileInterceptor('file'))
	async uploadSupplier(@UploadedFile(new ParseFilePipe(EXCEL_FILE_PIPE)) file: Express.Multer.File, @Query() query: UploadQueryDto) {
		return this.uploadService.uploadSupplier(file, query)
	}

	@Post('client')
	@UseInterceptors(FileInterceptor('file'))
	async uploadClient(@UploadedFile(new ParseFilePipe(EXCEL_FILE_PIPE)) file: Express.Multer.File, @Query() query: UploadQueryDto) {
		return this.uploadService.uploadClient(file, query)
	}

	@Post('product')
	@UseInterceptors(FileInterceptor('file'))
	async uploadProduct(@UploadedFile(new ParseFilePipe(EXCEL_FILE_PIPE)) file: Express.Multer.File, @Query() query: UploadQueryDto) {
		return this.uploadService.uploadProduct(file, query)
	}
}
