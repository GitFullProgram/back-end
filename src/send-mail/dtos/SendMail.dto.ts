import { IsString, IsEmail } from 'class-validator'

export class SendMailDto {
    @IsEmail({}, { message: 'Email field must be a correct format' })
	@IsString({ message: 'Email field must be a string' })
	email: string
}
