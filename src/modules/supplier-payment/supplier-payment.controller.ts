import { Body, Controller, Delete, Get, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
	SupplierPaymentFindManyRequestDto,
	SupplierPaymentFindOneRequestDto,
	SupplierPaymentFindManyResponseDto,
	SupplierPaymentFindOneResponseDto,
	SupplierPaymentModifyResponseDto,
	SupplierPaymentUpdateOneRequestDto,
	SupplierPaymentDeleteOneRequestDto,
	SupplierPaymentCreateOneRequestDto,
	SupplierPaymentCreateOneResponseDto,
} from './dtos'
import { SupplierPaymentService } from './supplier-payment.service'
import { AuthOptions, CRequest } from '../../common'

@ApiTags('SupplierPayment')
@Controller('supplier-payment')
export class SupplierPaymentController {
	private readonly supplierPaymentService: SupplierPaymentService

	constructor(supplierPaymentService: SupplierPaymentService) {
		this.supplierPaymentService = supplierPaymentService
	}

	@Get('many')
	@ApiOkResponse({ type: SupplierPaymentFindManyResponseDto })
	@ApiOperation({ summary: 'get all supplierPayments' })
	async findMany(@Query() query: SupplierPaymentFindManyRequestDto): Promise<SupplierPaymentFindManyResponseDto> {
		return this.supplierPaymentService.findMany(query)
	}

	@Get('one')
	@ApiOperation({ summary: 'find one supplierPayment' })
	@ApiOkResponse({ type: SupplierPaymentFindOneResponseDto })
	async findOne(@Query() query: SupplierPaymentFindOneRequestDto): Promise<SupplierPaymentFindOneResponseDto> {
		return this.supplierPaymentService.findOne(query)
	}

	@Post('one')
	@AuthOptions(true, true)
	@ApiOperation({ summary: 'create one supplierPayment' })
	@ApiOkResponse({ type: SupplierPaymentCreateOneResponseDto })
	async createOne(@Req() request: CRequest, @Body() body: SupplierPaymentCreateOneRequestDto): Promise<SupplierPaymentCreateOneResponseDto> {
		return this.supplierPaymentService.createOne(request, body)
	}

	@Patch('one')
	@ApiOperation({ summary: 'update one supplierPayment' })
	@ApiOkResponse({ type: SupplierPaymentModifyResponseDto })
	async updateOne(@Query() query: SupplierPaymentFindOneRequestDto, @Body() body: SupplierPaymentUpdateOneRequestDto): Promise<SupplierPaymentModifyResponseDto> {
		return this.supplierPaymentService.updateOne(query, body)
	}

	@Delete('one')
	@ApiOperation({ summary: 'delete one supplierPayment' })
	@ApiOkResponse({ type: SupplierPaymentModifyResponseDto })
	async deleteOne(@Query() query: SupplierPaymentDeleteOneRequestDto): Promise<SupplierPaymentModifyResponseDto> {
		return this.supplierPaymentService.deleteOne(query)
	}
}
