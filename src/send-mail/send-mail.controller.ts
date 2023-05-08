import {
	Controller,
	UsePipes,
	ValidationPipe,
	HttpCode,
	Post,
	Body,
} from '@nestjs/common'
import { SendMailService } from './send-mail.service'
import { SendMailDto } from './dtos/SendMail.dto'

@Controller('send-mail')
export class SendMailController {
	constructor(private readonly sendMailService: SendMailService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('reset')
	async SendMailForResetPassword(@Body() sendMailDto: SendMailDto) {
		await this.sendMailService.SendMailForResetPassword(sendMailDto)
		return {
			message: 'An email with instructions has been sent to you.',
		}
	}
}
