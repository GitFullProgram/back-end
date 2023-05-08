import { GenerateCode } from '@/utils/GenerateCode'
import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from './entities/user.entity'
import { ILike, Repository } from 'typeorm'
import { ReturnProfile } from '@/utils/ReturnProfile'
import { compare, genSalt, hash } from 'bcryptjs'
import { UserRole } from '@/shared/enums/UserRole.enum'
import { ConvertRoleToNumber } from '@/utils/ConvertRoleToNumber'
import {
	returnGlobalUser,
	returnRelationsUserProfile,
	returnUserProfile,
} from './returnUserObject'
import { AuthService } from '@/auth/auth.service'
import { UpdateProfileDto } from './dtos/UpdateProfile.dto'
import { UpdateUserDto } from './dtos/UpdateUser.dto'
import { FileEntity } from '@/files/entities/file.entity'
import { FilesService } from '@/files/files.service'
import { SendMailService } from '@/send-mail/send-mail.service'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(FileEntity)
		private fileRepository: Repository<FileEntity>,
		private authService: AuthService,
		private filesService: FilesService,
		private sendMailService: SendMailService
	) {}

	async getProfile(username: string) {
		const user = await this.userRepository.findOne({
			where: { username },
			...returnUserProfile,
		})
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		const tokens = await this.authService.issueToken(user.id)

		return {
			user,
			tokens,
		}
	}

	async updateProfile(username: string, updateProfileDto: UpdateProfileDto) {
		const user = await this.userRepository.findOne({
			where: { username },
			...returnUserProfile,
		})
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		if (updateProfileDto.email && user.email !== updateProfileDto.email) {
			if (!updateProfileDto.code) {
				await this.sendMailService.sendMailForConfirmCode(user.email, user.code)
				throw new BadRequestException('Please enter the code')
			}

			if (user.code !== updateProfileDto.code) {
				await this.sendMailService.sendMailForConfirmCode(user.email, user.code)
				throw new BadRequestException('Please enter the correct code')
			}

			const emailExists = await this.userRepository.findOne({
				where: { email: updateProfileDto.email },
			})
			if (emailExists) throw new BadRequestException('Email already exists')
			user.email = updateProfileDto.email
			user.code = GenerateCode()
		}

		if (
			updateProfileDto.username &&
			user.username !== updateProfileDto.username
		) {
			const usernameExists = await this.userRepository.findOne({
				where: { username: updateProfileDto.username },
			})
			if (usernameExists)
				throw new BadRequestException('Username already exists')

			user.username = updateProfileDto.username
		}

		if (updateProfileDto.password) {
			if (!updateProfileDto.currentPassword)
				throw new BadRequestException('Please enter the current password')

			const isValidPassword = await compare(
				updateProfileDto.currentPassword,
				user.password
			)
			if (!isValidPassword)
				throw new BadRequestException('Invalid current password')

			const salt = await genSalt(10)
			user.password = await hash(updateProfileDto.password, salt)
		}

		updateProfileDto.avatarPath
			? (user.avatarPath = updateProfileDto.avatarPath)
			: (user.avatarPath = user.avatarPath)
		updateProfileDto.name
			? (user.name = updateProfileDto.name)
			: (user.name = user.name)

		user.isActivated = false

		await this.userRepository.save(user)

		if (user.email === updateProfileDto.email) {
			await this.sendMailService.SendMailForActivateUser(
				user.email,
				user.activateLink
			)
		}

		return {
			user,
		}
	}

	async deleteProfile(username: string) {
		const user = await this.userRepository.findOne({
			where: { username },
		})
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		await this.filesService.removeAll(user.id)
		await this.filesService.deleteAllFromTrash(user.id)
		await this.userRepository.delete({ username })

		return {
			message: 'User deleted successfully',
		}
	}

	async updateOnline(online: boolean, username: string) {
		const user = await this.userRepository.findOne({ where: { username } })
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		user.online = online
		await this.userRepository.save(user)
		return
	}

	async activateProfile(activateLink: string) {
		const user = await this.userRepository.findOne({ where: { activateLink } })
		if (!user)
			throw new UnauthorizedException('User not found or you are not logged in')

		if (user.isActivated)
			throw new BadRequestException('User is already activated')

		user.isActivated = true
		await this.userRepository.save(user)

		return {
			message: 'User activated successfully',
		}
	}

	async checkExistingUsername(username: string, userUsername: string) {
		if (username !== userUsername) {
			const options = {
				username: username ? username : '',
			}
			const userBySlug = await this.userRepository.find({
				where: {
					username: ILike(`${options.username}`),
				},
			})
			if (userBySlug.length) {
				return {
					message: 'This user by username existing',
					access: false,
				}
			}
			return {
				message: 'This username is not busy',
				access: true,
			}
		} else {
			return {
				message: 'This username is yours',
				access: true,
			}
		}
	}

	async getAll(searchTerm?: string) {
		const options = {
			email: searchTerm ? searchTerm : '',
		}
		const users = await this.userRepository.find({
			where: { email: ILike(`%${options.email}%`) },
			...returnGlobalUser,
		})
		return users
	}

	async getByUsername(username: string) {
		const user = await this.userRepository.findOne({
			where: { username },
			...returnGlobalUser,
		})
		if (!user) throw new BadRequestException('User not found')

		return user
	}

	async getAllForAdmin(role: UserRole, searchTerm?: string) {
		const options = {
			email: searchTerm ? searchTerm : '',
		}
		const users = await this.userRepository.find({
			where: { email: ILike(`%${options.email}%`) },
			relations: returnRelationsUserProfile,
		})
		if (role === UserRole.ADMIN) {
			return users.map(user => {
				const { password, ...rest } = user
				return rest
			})
		}
		return users
	}

	async getByUsernameForAdmin(role: UserRole, username: string) {
		const user = await this.userRepository.findOne({
			where: { username },
			relations: returnRelationsUserProfile,
		})
		if (!user) throw new BadRequestException('User not found')

		if (role === UserRole.ADMIN) {
			const { password, ...rest } = user
			return rest
		}

		return user
	}

	async deleteUser(username: string, role: UserRole) {
		const user = await this.userRepository.findOne({ where: { username } })
		if (!user) throw new BadRequestException('User not found')

		const yourRole = ConvertRoleToNumber(role)
		const himRole = ConvertRoleToNumber(user.role)

		if (yourRole < himRole)
			throw new BadRequestException(
				"You don't have permission to delete this user"
			)

		await this.userRepository.delete({ username })

		return {
			message: 'User deleted successfully',
		}
	}

	async updateUser(
		username: string,
		updateUserDto: UpdateUserDto,
		role: UserRole
	) {
		const user = await this.userRepository.findOne({
			where: { username },
			relations: returnRelationsUserProfile,
		})
		if (!user) throw new BadRequestException('User not found')

		const yourRole = ConvertRoleToNumber(role)
		const himRole = ConvertRoleToNumber(user.role)

		if (yourRole < himRole)
			throw new BadRequestException(
				"You don't have permission to update this user"
			)

		if (updateUserDto.email && updateUserDto.email !== user.email) {
			const emailExists = await this.userRepository.findOne({
				where: { email: updateUserDto.email },
			})
			if (emailExists)
				throw new BadRequestException('User with this email already exists')

			user.email = updateUserDto.email
		}

		if (updateUserDto.password && yourRole >= 3) {
			const salt = await genSalt(10)
			user.password = await hash(updateUserDto.password, salt)
		}

		if (updateUserDto.username && updateUserDto.username !== user.username) {
			const usernameExists = await this.userRepository.findOne({
				where: { username: updateUserDto.username },
			})
			if (usernameExists)
				throw new BadRequestException('User with this username already exists')

			user.username = updateUserDto.username
		}
		updateUserDto.avatarPath
			? (user.avatarPath = updateUserDto.avatarPath)
			: (user.avatarPath = user.avatarPath)
		updateUserDto.name
			? (user.name = updateUserDto.name)
			: (user.name = user.name)

		user.isActivated = updateUserDto.isActivated
		if (role === UserRole.OWNER) {
			updateUserDto.role
				? (user.role = updateUserDto.role)
				: (user.role = user.role)
		} else if (
			role === UserRole.ADMIN &&
			user.role === UserRole.USER &&
			updateUserDto.role === UserRole.ADMIN
		) {
			updateUserDto.role
				? (user.role = updateUserDto.role)
				: (user.role = user.role)
		}

		await this.userRepository.save(user)
		if (role === UserRole.ADMIN) {
			const { password, ...rest } = user
			return rest
		}
		return user
	}
}
