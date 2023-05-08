import { IsEmail, IsString, MinLength } from 'class-validator'

export class RegisterDto {
	@IsEmail({}, { message: 'Email must be valid' })
	email: string

	@IsString({ message: 'Name must be string' })
	name: string

	@MinLength(8, { message: 'Password must be greater than 8 characters' })
	@IsString({ message: 'Password must be string' })
	password: string
}
