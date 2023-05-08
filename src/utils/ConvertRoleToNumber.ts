import { UserRole } from '@/shared/enums/UserRole.enum'

export const ConvertRoleToNumber = (userRole: string) => {
	return userRole === UserRole.OWNER
		? 3
		: userRole === UserRole.ADMIN
		? 2
		: userRole === UserRole.USER
		? 1
		: 0
}
