import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const ConnectToDatabase = async (
	configService: ConfigService
): Promise<TypeOrmModuleOptions> => {
	return {
		port: 5432,
		type: 'postgres',
		host: configService.get('DB_HOST'),
		username: configService.get('DB_USERNAME'),
		password: configService.get<string>('DB_PASSWORD'),
		database: configService.get<string>('DB_DATABASE'),
		synchronize: true,
		autoLoadEntities: true,
		keepConnectionAlive: true,
	}
}
