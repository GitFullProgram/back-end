import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: false })
	app.use(cookieParser())
	app.setGlobalPrefix('api')
	app.enableCors({
		credentials: true,
		origin: true,
	})
	await app.listen(4200)
}
bootstrap()
