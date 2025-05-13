import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { createResponse } from '@common'
import { AuthGetStaffProfile, AuthGetValidTokensRequest, AuthSignOutRequest, StaffSignInRequest } from './interfaces'
import { JsonWebTokenService } from './jwt.service'
import { AuthRepository } from './auth.repository'
import { StaffRepository } from '../staff'

@Injectable()
export class AuthService {
	private readonly authRepository: AuthRepository
	private readonly jwtService: JsonWebTokenService
	private readonly staffRepository: StaffRepository

	constructor(authRepository: AuthRepository, jwtService: JsonWebTokenService, staffRepository: StaffRepository) {
		this.authRepository = authRepository
		this.staffRepository = staffRepository
		this.jwtService = jwtService
	}

	async signIn(body: StaffSignInRequest) {
		const staff = await this.authRepository.findOneStaff(body)

		if (!staff) {
			throw new UnauthorizedException('staff unauthorized')
		}

		if (staff.deletedAt) {
			throw new BadRequestException('staff was deleted')
		}

		const isCorrect = await bcrypt.compare(body.password, staff.password)
		if (!isCorrect) {
			throw new UnauthorizedException('wrong password')
		}
		delete staff.password

		const tokens = await this.jwtService.getTokens({ id: staff.id })
		await this.staffRepository.updateOne({ id: staff.id }, { token: tokens.refreshToken })

		return createResponse({ data: { staff: { ...staff }, tokens: tokens }, success: { messages: ['sign in success'] } })
	}

	async signOut(body: AuthSignOutRequest) {
		const staff = await this.staffRepository.getOne({ id: body.user?.id, isDeleted: false })

		if (!staff.token) {
			return createResponse({ data: null, success: { messages: ['sign out success'] }, warning: { is: true, messages: ['already sign out'] } })
		}
		await this.staffRepository.updateOne({ id: staff.id }, { token: '' })

		return createResponse({ data: null, success: { messages: ['sign out success'] } })
	}

	async getValidTokens(body: AuthGetValidTokensRequest) {
		const staff = await this.staffRepository.getOne({ id: body.user.id, token: body.user.token, isDeleted: false })

		if (!staff) {
			throw new UnauthorizedException('staff not found')
		}

		const tokens = await this.jwtService.getTokens({ id: body.user.id })
		await this.staffRepository.updateOne({ id: staff.id }, { token: tokens.refreshToken })
		return createResponse({ data: { staff: staff, tokens: tokens }, success: { messages: ['refresh token success'] } })
	}

	async getStaffProfile(body: AuthGetStaffProfile) {
		const staff = await this.staffRepository.getOne({ id: body.user.id, token: body.user.token, isDeleted: false })

		if (!staff) {
			throw new UnauthorizedException('staff not found')
		}

		return createResponse({ data: staff, success: { messages: ['staff get profile success'] } })
	}
}
