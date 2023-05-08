import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	UseInterceptors,
	UploadedFiles,
	Query,
	ParseFilePipe,
	MaxFileSizeValidator,
	Put,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { FilesService } from './files.service'
import { UpdateFileDto } from './dtos/UpdateFile.dto'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Auth } from '@/auth/decorators/auth.decorator'
import { User } from '@/users/decorators/user.decorator'
import { SortTypeFile } from '@/shared/enums/SortTypeFile.enum'
import { RemoveFileDto } from './dtos/RemoveFile.dto'

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post('')
	@HttpCode(200)
	@Auth()
	@UseInterceptors(FilesInterceptor('files'))
	async uploadFiles(
		@UploadedFiles(
			new ParseFilePipe({
				validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 20 })],
			})
		)
		files: Express.Multer.File[],
		@User('id') id: number,
		@Query('folder') folder?: string
	) {
		return this.filesService.uploadFiles(files, id, folder)
	}

	@Put('restore')
	@HttpCode(200)
	@Auth()
	async restore(
		@Body() removeFileDto: RemoveFileDto,
		@User('id') userId: number
	) {
		return this.filesService.restore(removeFileDto.ids, userId)
	}

	@Put('restore/all')
	@HttpCode(200)
	@Auth()
	async restoreAll(@User('id') userId: number) {
		return this.filesService.restoreAll(userId)
	}

	@Put(':id')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth()
	async update(
		@Param('id') id: string,
		@Body() updateFileDto: UpdateFileDto,
		@User('id') userId: number
	) {
		return this.filesService.update(+id, updateFileDto, userId)
	}

	@Get('exist-filename/:id')
	@Auth()
	async checkFileExist(
		@Param('id') id: string,
		@Query('filename') filename: string
	) {
		return this.filesService.checkFileExist(filename, +id)
	}

	@Delete()
	@HttpCode(200)
	@Auth()
	async remove(
		@Body() removeFileDto: RemoveFileDto,
		@User('id') userId: number
	) {
		return this.filesService.remove(removeFileDto.ids, userId)
	}

	@Delete('all')
	@HttpCode(200)
	@Auth()
	async removeAll(@User('id') userId: number) {
		return this.filesService.removeAll(userId)
	}

	@Delete('trash')
	@HttpCode(200)
	@Auth()
	async deleteFromTrash(
		@Body() removeFileDto: RemoveFileDto,
		@User('id') userId: number
	) {
		return this.filesService.deleteFromTrash(removeFileDto.ids, userId)
	}

	@Delete('trash/all')
	@HttpCode(200)
	@Auth()
	async deleteAllFromTrash(@User('id') userId: number) {
		return this.filesService.deleteAllFromTrash(userId)
	}

	@Get()
	@Auth()
	async getAll(
		@Query('sort') sort: SortTypeFile,
		@User('id') userId: number,
		@Query('searchTerm') searchTerm?: string
	) {
		return this.filesService.getAll(sort, userId, searchTerm)
	}

	@Get(':id')
	@Auth()
	async getById(@Param('id') id: string, @User('id') userId: number) {
		return this.filesService.getById(+id, userId)
	}
}
