import { IsString } from 'class-validator'

export class RemoveFileDto {
	@IsString({ message: 'Ids must be string' })
	ids: string
}
