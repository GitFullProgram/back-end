import { CheckRoleGuard } from '@/guards/CheckRole.guard'

import { CheckAuthGuard } from '@/guards/CheckAuth.guard'
import { UserRole } from '@/shared/enums/UserRole.enum'
import { ConvertRoleToNumber } from '@/utils/ConvertRoleToNumber'
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export const Auth = (role: UserRole = UserRole.USER) => {
	const numRole = ConvertRoleToNumber(role)
	if (numRole === 1) {
		return applyDecorators(UseGuards(CheckAuthGuard))
	} else if (numRole >= 2) {
		return applyDecorators(
			SetMetadata('role', numRole),
			UseGuards(CheckAuthGuard, new CheckRoleGuard(new Reflector()))
		)
	}
}
