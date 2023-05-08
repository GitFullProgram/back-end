import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserEntity } from './entities/user.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from '@/strategies/jwt.strategy'
import { ConnectJWT } from '@/configs/ConnectJWT.config'
import { AuthModule } from '@/auth/auth.module'
import { FileEntity } from '@/files/entities/file.entity'
import { FilesModule } from '@/files/files.module'
import { SendMailModule } from '@/send-mail/send-mail.module'

@Module({
	controllers: [UsersController],
	providers: [UsersService, JwtStrategy],
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([UserEntity, FileEntity]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: ConnectJWT,
		}),
		AuthModule,
		FilesModule,
		SendMailModule,
	],
})
export class UsersModule {}
