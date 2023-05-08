import { MinLength, IsString } from 'class-validator'

export class ResetPasswordDto {
	@MinLength(8, { message: 'Password must be greater than 8 characters' })
	@IsString({ message: 'Password must be string' })
	password: string
}
