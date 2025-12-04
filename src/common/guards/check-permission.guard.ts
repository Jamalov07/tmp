import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException, RequestMethod, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../../modules/shared'
import { ActionMethodEnum } from '@prisma/client'
import { Request } from 'express'
import { CRequest } from '../interfaces'
import { ERROR_MSG } from '../constants'

@Injectable()
export class CheckPermissionGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<CRequest>()

		if (!request.user) {
			throw new UnauthorizedException(ERROR_MSG.GUARD_USER_NOT_FOUND.UZ)
		}

		const controller = context.getClass()
		const baseRoute = Reflect.getMetadata('path', controller) || ''

		const handler = context.getHandler()
		const route = Reflect.getMetadata('path', handler) || ''
		const method = Reflect.getMetadata('method', handler)

		if (method === undefined) {
			throw new BadRequestException(ERROR_MSG.HTTP_METHOD_METADATA_NOT_FOUND.UZ)
		}

		const fullRoute = `${baseRoute}/${route}`.replace(/\/+/g, '/')
		const methodType = RequestMethod[method].toLowerCase() as ActionMethodEnum

		const payload = { url: fullRoute, name: handler.name, method: methodType }

		const action = await this.prisma.actionModel.findFirst({ where: { ...payload } })

		if (!action) {
			throw new NotFoundException(ERROR_MSG.NOT_FOUND(`${methodType.toUpperCase()} /${fullRoute}`).UZ)
		}
		// const staff = await this.prisma.staffModel.findFirst({
		// 	select: { actions: { select: { name: true, method: true, url: true } } },
		// })

		// if (!staff) {
		// throw new BadRequestException(ERROR_MSG.AUTH.PERMISSION_NOT_GRANTED.UZ)
		// }

		return true
	}
}
