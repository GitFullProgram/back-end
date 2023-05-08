import {
	IsOptional,
	IsString,
	IsEmail,
	IsNumber,
	IsEnum,
	IsBoolean,
} from 'class-validator'
import { UserRole } from '@/shared/enums/UserRole.enum'

export class UpdateUserDto {
	@IsOptional()
	@IsEmail({}, { message: 'Email must be valid' })
	email: string

	@IsOptional()
	@IsString({ message: 'Password must be string' })
	password: string

	@IsOptional()
	@IsString({ message: 'AvatarPath must be string' })
	avatarPath: string

	@IsOptional()
	@IsString({ message: 'Name must be string' })
	name: string

	@IsOptional()
	@IsString({ message: 'Username must be string' })
	username: string

	@IsOptional()
	@IsEnum(UserRole, { message: 'Role must be valid' })
	role: UserRole

	@IsOptional()
	@IsBoolean({ message: 'IsActivated must be boolean' })
	isActivated: boolean
}
