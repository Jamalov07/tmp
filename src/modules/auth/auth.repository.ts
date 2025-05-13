import { Injectable } from '@nestjs/common'
import { PrismaService } from '@shared'
import { StaffSignInRequest } from './interfaces'

@Injectable()
export class AuthRepository {
	private readonly prisma: PrismaService

	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async findOneStaff(body: StaffSignInRequest) {
		const staff = await this.prisma.userModel.findFirst({
			where: { phone: body.phone },
			select: {
				id: true,
				fullname: true,
				password: true,
				phone: true,
				createdAt: true,
				deletedAt: true,
				updatedAt: true,
				actions: true,
				payments: true,
			},
		})

		return staff
	}
}
