import { Injectable } from '@nestjs/common'
import { CommonRepository } from './common.repository'

@Injectable()
export class CommonService {
	private readonly commonRepository: CommonRepository
	constructor(commonRepository: CommonRepository) {
		this.commonRepository = commonRepository
	}
}
