import {
	Controller,
	Post,
	HttpCode,
	Body,
	UsePipes,
	ValidationPipe,
	Res,
	Param,
	Get,
	Req,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dtos/login.dto'
import { Response, Request } from 'express'
import { RegisterDto } from './dtos/register.dto'
import { ResetPasswordDto } from './dtos/resetPassword.dto'

const cookieData = {
	httpOnly: true,
	maxAge: 15 * 24 * 60 * 60 * 1000,
	path: '/api',
}

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) response: Response
	) {
		const result = await this.authService.login(loginDto)
		response.cookie('refreshToken', result.tokens.refreshToken, cookieData)

		return {
			user: result.user,
			token: result.tokens.accessToken,
		}
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('register')
	async register(
		@Body() registerDto: RegisterDto,
		@Res({ passthrough: true }) response: Response
	) {
		const result = await this.authService.register(registerDto)
		response.cookie('refreshToken', result.tokens.refreshToken, cookieData)

		return {
			user: result.user,
			token: result.tokens.accessToken,
		}
	}

	@Get('token')
	async GetNewTokens(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response
	) {
		const refreshToken = request.cookies.refreshToken
		const data = await this.authService.GetNewTokens(refreshToken)
		response.cookie('refreshToken', data.tokens.refreshToken, cookieData)

		return {
			user: data.user,
			token: data.tokens.accessToken,
		}
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('reset/:resetLink')
	async resetPassword(
		@Body() resetPasswordDto: ResetPasswordDto,
		@Param('resetLink') resetLink: string
	) {
		return await this.authService.resetPassword(resetLink, resetPasswordDto)
	}

	@Get('logout')
	async logout(@Res({ passthrough: true }) response: Response) {
		response.clearCookie('refreshToken', { path: '/api' })
		return
	}

	@Get('reset/:resetLink')
	async checkResetLink(@Param('resetLink') resetLink: string) {
		return await this.authService.checkResetLink(resetLink)
	}
}
