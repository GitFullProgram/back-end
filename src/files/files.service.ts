import { Injectable, BadRequestException } from '@nestjs/common'
import { UpdateFileDto } from './dtos/UpdateFile.dto'
import {
	ensureDir,
	writeFile,
	rename,
	remove,
	move,
	PathLike,
	readFile,
	watchFile,
	ensureFile,
	stat,
	exists,
} from 'fs-extra'
import { path } from 'app-root-path'
import { v4 } from 'uuid'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, ILike, Not, IsNull } from 'typeorm'
import { FileEntity } from './entities/file.entity'
import { returnUserProfileObject } from '@/users/returnUserObject'
import { UserEntity } from '@/users/entities/user.entity'
import { ReturnProfile } from '@/utils/ReturnProfile'
import { ConvertBToMb } from '@/utils/ConvertBToMb'
import { SortTypeFile } from '@/shared/enums/SortTypeFile.enum'

const newPath = path.slice(2)

@Injectable()
export class FilesService {
	constructor(
		@InjectRepository(FileEntity)
		private fileRepository: Repository<FileEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>
	) {}

	async uploadFiles(
		files: Express.Multer.File[],
		userId: number,
		folder: string = 'defaults'
	) {
		const user = await this.userRepository.findOne({
			where: { id: userId },
		})
		if (user.currentStorage > user.maxStorage)
			throw new BadRequestException('Your storage is full')
		return Promise.all(
			files.map(async file => {
				const uploadFolder = `${path}/uploads/${folder}`
				await ensureDir(uploadFolder)

				const uuid = v4()

				const rs = file.originalname.split('.')[1]
				await writeFile(`${uploadFolder}/${uuid}.${rs}`, file.buffer)

				const newFile = this.fileRepository.create({
					filename: `${uuid}.${rs}`,
					url: `/uploads/${folder}/${uuid}.${rs}`,
					mimetype: file.mimetype,
					size: file.size,
					rs,
					user,
					folder,
				})

				user.currentStorage = user.currentStorage + ConvertBToMb(file.size)

				await this.userRepository.save(user)

				await this.fileRepository.save(newFile)
				return {
					...newFile,
					user: ReturnProfile(newFile.user),
				}
			})
		)
	}

	async update(id: number, updateFileDto: UpdateFileDto, userId: number) {
		const file = await this.fileRepository.findOne({
			where: { id },
			relations: { user: true },
			select: {
				user: {
					...returnUserProfileObject,
					files: false,
				},
			},
		})
		if (!file) throw new BadRequestException('File not found')

		if (file.user.id !== userId)
			throw new BadRequestException("You don't have this file")

		const fileExist = await exists(
			`${newPath}/uploads/${file.folder}/${updateFileDto.filename}.${file.rs}`
		)
		if (fileExist) throw new BadRequestException('This file is exist')

		await rename(
			`${newPath}/uploads/${file.folder}/${file.filename}`,
			`${newPath}/uploads/${file.folder}/${updateFileDto.filename}.${file.rs}`
		)

		file.filename = `${updateFileDto.filename}.${file.rs}`
		file.url = `/uploads/${file.folder}/${updateFileDto.filename}.${file.rs}`

		await this.fileRepository.save(file)
		return file
	}

	async checkFileExist(filename: string, id: number) {
		const file = await this.fileRepository.findOne({
			where: { id },
			relations: { user: true },
			select: {
				user: {
					...returnUserProfileObject,
					files: false,
				},
			},
		})
		if (!file) throw new BadRequestException('File not found')

		if (filename === file.filename.split('.')[0])
			return {
				access: true,
				message: 'This filename is this file',
			}

		const fileExist = await exists(
			`${newPath}/uploads/${file.folder}/${filename}.${file.rs}`
		)
		if (fileExist)
			return {
				access: false,
				message: 'This filename is exist',
			}

		return {
			access: true,
			message: 'This filename is not exist',
		}
	}

	async remove(ids: string, userId: number) {
		const arrayIds = ids.split(',')
		return Promise.all(
			arrayIds.map(async id => {
				const file = await this.fileRepository.findOne({
					where: { id: +id },
					relations: { user: true },
					select: {
						user: {
							...returnUserProfileObject,
							files: false,
						},
					},
				})

				if (!file) throw new BadRequestException('File not found')

				if (file.user.id !== userId)
					throw new BadRequestException("You don't have this file")

				await move(
					`${newPath}/uploads/${file.folder}/${file.filename}`,
					`${newPath}/uploads/trash/${file.filename}`
				)
				file.url = `/uploads/trash/${file.filename}`
				await this.fileRepository.save(file)

				await this.fileRepository.softDelete(id)
			})
		)
	}

	async removeAll(userId: number) {
		const files = await this.fileRepository.find({
			relations: {
				user: true,
			},
			where: {
				user: {
					id: userId,
				},
			},
		})

		if (files.length) {
			return Promise.all(
				files.map(async file => {
					await move(
						`${newPath}/uploads/${file.folder}/${file.filename}`,
						`${newPath}/uploads/trash/${file.filename}`
					)
					file.url = `/uploads/trash/${file.filename}`
					await this.fileRepository.save(file)
					await this.fileRepository.softDelete(file.id)
				})
			)
		}
		return
	}

	async restore(ids: string, userId: number) {
		const arrayIds = ids.split(',')
		return Promise.all(
			arrayIds.map(async id => {
				const file = await this.fileRepository.findOne({
					where: { id: +id, deletedAt: Not(IsNull()) },
					relations: { user: true },
					withDeleted: true,
					select: {
						user: {
							...returnUserProfileObject,
							files: false,
						},
					},
				})

				if (!file) throw new BadRequestException('File not found')

				if (file.user.id !== userId)
					throw new BadRequestException("You don't have this file")

				await move(
					`${newPath}/uploads/trash/${file.filename}`,
					`${newPath}/uploads/${file.folder}/${file.filename}`
				)
				file.url = `/uploads/${file.folder}/${file.filename}`
				await this.fileRepository.save(file)

				await this.fileRepository.restore(id)
			})
		)
	}

	async restoreAll(userId: number) {
		const files = await this.fileRepository.find({
			relations: {
				user: true,
			},
			withDeleted: true,
			where: {
				user: {
					id: userId,
				},
				deletedAt: Not(IsNull()),
			},
		})

		if (files.length) {
			return Promise.all(
				files.map(async file => {
					await move(
						`${newPath}/uploads/trash/${file.filename}`,
						`${newPath}/uploads/${file.folder}/${file.filename}`
					)
					file.url = `/uploads/${file.folder}/${file.filename}`
					await this.fileRepository.save(file)
					await this.fileRepository.restore(file.id)
				})
			)
		}
		return
	}

	async getAll(sort: SortTypeFile, userId: number, searchTerm?: string) {
		return await this.fileRepository.find({
			relations: { user: true },
			select: {
				user: {
					...returnUserProfileObject,
					files: false,
				},
			},
			withDeleted: sort === SortTypeFile.TRASH,
			where: {
				deletedAt: sort === SortTypeFile.TRASH ? Not(IsNull()) : null,
				mimetype: ILike(`%${sort === SortTypeFile.IMAGE ? 'image' : ''}%`),
				filename: ILike(`%${searchTerm ? searchTerm : ''}%`),
				user: {
					id: userId,
				},
			},
		})
	}

	async getById(id: number, userId: number) {
		const file = await this.fileRepository.findOne({
			where: { id },
			relations: { user: true },
			select: {
				user: {
					...returnUserProfileObject,
					files: false,
				},
			},
		})

		if (!file) throw new BadRequestException('File not found')

		if (file.user.id !== userId)
			throw new BadRequestException("You don't have this file")

		return file
	}

	async deleteFromTrash(ids: string, userId: number) {
		const arrayIds = ids.split(',')
		return Promise.all(
			arrayIds.map(async id => {
				const file = await this.fileRepository.findOne({
					where: { id: +id },
					relations: { user: true },
					withDeleted: true,
					select: {
						user: {
							...returnUserProfileObject,
							files: false,
						},
					},
				})

				if (!file) throw new BadRequestException('File not found')

				if (file.deletedAt === null)
					throw new BadRequestException("This file don't have in trash")

				if (file.user.id !== userId)
					throw new BadRequestException("You don't have this file")

				const user = await this.userRepository.findOne({
					where: { id: userId },
				})

				user.currentStorage = user.currentStorage - ConvertBToMb(file.size)

				await this.userRepository.save(user)

				await remove(`${newPath}/uploads/trash/${file.filename}`)

				await this.fileRepository.delete(id)
			})
		)
	}

	async deleteAllFromTrash(userId: number) {
		const files = await this.fileRepository.find({
			relations: {
				user: true,
			},
			withDeleted: true,
			where: {
				deletedAt: Not(IsNull()),
				user: {
					id: userId,
				},
			},
		})

		const user = await this.userRepository.findOne({
			where: { id: userId },
		})

		files.map(file => {
			user.currentStorage = user.currentStorage - ConvertBToMb(file.size)
		})

		await this.userRepository.save(user)

		if (files.length) {
			return Promise.all(
				files.map(async file => {
					await remove(`${newPath}/uploads/trash/${file.filename}`)
					await this.fileRepository.delete(file.id)
				})
			)
		}
		return
	}
}
