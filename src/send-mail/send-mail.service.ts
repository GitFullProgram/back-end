import { Injectable, BadRequestException } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { SendMailDto } from './dtos/SendMail.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from '@/users/entities/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class SendMailService {
	constructor(
		private mailerService: MailerService,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
	) {}

	async SendMailForActivateUser(email: string, link?: string) {
		return await this.mailerService.sendMail({
			to: email,
			from: email,
			subject: 'Activate profile',
			html: `You give this send for active profile<br><br>
            <a href='http://localhost:3000/profile/activate/${link}'>Click here</a>
            `,
		})
	}

	async SendMailForResetPassword(sendMailDto: SendMailDto) {
		const user = await this.userRepository.findOne({
			where: { email: sendMailDto.email },
		})
		if (!user)
			throw new BadRequestException('User with this email does not exist')
		return await this.mailerService.sendMail({
			to: sendMailDto.email,
			from: sendMailDto.email,
			subject: 'Activate profile',
			html: `You give this send for reset password<br><br>
            <a href='http://localhost:3000/auth/reset/${user.resetLink}'>Click here</a>
            `,
		})
	}

	async sendMailForConfirmCode(email: string, code: number) {
		return await this.mailerService.sendMail({
			to: email,
			from: email,
			subject: 'Confirm code',
			html: `You give this send for confirm code<br><br>
           Your code: <b>${code}</b>
            `,
		})
	}
}
