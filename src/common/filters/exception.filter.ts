import { Response } from 'express'
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { GlobalResponse } from '../interfaces'

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>()

		console.log(exception)
		const erMes = Array.isArray(exception?.response?.message)
			? exception?.response?.message.length
				? exception?.response?.message
				: [exception?.response?.message || 'internal server error']
			: [exception?.response?.message || 'internal server error']

		const cResponse: GlobalResponse & { data: null } = {
			data: null,
			status: exception?.status || 500,
			success: { is: false, messages: [] },
			warning: { is: false, messages: [] },
			error: { is: true, messages: erMes },
		}
		response.status(exception?.status || 500).json(cResponse)
	}
}
