import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator'

export class UpdateProfileDto {
	@IsOptional()
	@IsEmail({}, { message: 'Email must be valid' })
	email: string

	@IsOptional()
	@IsString({ message: 'CurrentPassword must be string' })
	currentPassword: string

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
	@IsNumber({}, { message: 'Code must be number' })
	code: number
}
