import { Module } from '@nestjs/common'
import { FilesService } from './files.service'
import { FilesController } from './files.controller'
import { ServeStaticModule } from '@nestjs/serve-static'
import { path } from 'app-root-path'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FileEntity } from './entities/file.entity'
import { UserEntity } from '@/users/entities/user.entity'

@Module({
	controllers: [FilesController],
	providers: [FilesService],
	imports: [
		ServeStaticModule.forRoot({
			rootPath: `${path}/uploads`,
			serveRoot: '/uploads',
		}),
		TypeOrmModule.forFeature([FileEntity, UserEntity]),
	],
	exports: [FilesService],
})
export class FilesModule {}
