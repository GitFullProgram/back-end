import { Module } from '@nestjs/common'
import { SendMailService } from './send-mail.service'
import { SendMailController } from './send-mail.controller'
import { MailerModule } from '@nestjs-modules/mailer'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '@/users/entities/user.entity'

@Module({
	controllers: [SendMailController],
	providers: [SendMailService],
	exports: [SendMailService],
	imports: [TypeOrmModule.forFeature([UserEntity])],
})
export class SendMailModule {}
