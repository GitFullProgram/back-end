import { IsString, IsBoolean } from 'class-validator'

export class UpdateFileDto {
	@IsString({ message: 'Filename must be string' })
	filename: string

	@IsBoolean({ message: 'Private must be boolean' })
	private: boolean
}
