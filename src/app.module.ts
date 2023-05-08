import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { ConnectToDatabase } from './configs/ConnectToDatabase.config'
import { UsersModule } from './users/users.module'
import { FilesModule } from './files/files.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { SendMailModule } from './send-mail/send-mail.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		AuthModule,
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: ConnectToDatabase,
		}),
		UsersModule,
		FilesModule,
		MailerModule.forRoot({
			transport: {
				host: 'smtp.gmail.com',
				secure: false,
				auth: {
					user: 'ahmetsinfail987@gmail.com',
					pass: 'tkvpxwnhgpmpiniq',
				},
			},
		}),
		SendMailModule,
	],
})
export class AppModule {}
