import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger'
import { GlobalModifyResponseDto, GlobalResponseDto, PaginationResponseDto } from '../../../common'
import { ActionFindManyData, ActionFindOneData, ActionFindOneResponse, ActionModifyResponse } from '../interfaces'
import { ActionRequiredDto } from './fields.dtos'

export class ActionFindOneDataDto extends PickType(ActionRequiredDto, ['id', 'url', 'name', 'method', 'description']) implements ActionFindOneData {
	// @ApiProperty({ type: RoleFindOneDataDto })
	// role: RoleFindOneData
}

export class ActionFindManyDataDto extends PaginationResponseDto implements ActionFindManyData {
	@ApiProperty({ type: ActionFindOneDataDto, isArray: true })
	data: ActionFindOneData[]
}

export class ActionFindManyResponseDto extends GlobalResponseDto implements ActionFindManyResponseDto {
	@ApiProperty({ type: ActionFindManyDataDto })
	data: ActionFindManyData | { data: ActionFindOneData[] }
}

export class ActionFindOneResponseDto extends GlobalResponseDto implements ActionFindOneResponse {
	@ApiProperty({ type: ActionFindOneDataDto })
	data: ActionFindOneData
}

export class ActionModifyResponseDto extends IntersectionType(GlobalResponseDto, GlobalModifyResponseDto) implements ActionModifyResponse {}
