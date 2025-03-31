import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'
import { BaseExceptionDto } from '../dto/base-exception.dto'
import { ERROR_MESSAGES } from '../consts/error-messages.const'

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly BASE_SERVER_EXCEPTION: BaseExceptionDto = {
    code: 500,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  }

  handleException = (exception: unknown): BaseExceptionDto => {
    if (!(exception instanceof HttpException)) {
      return this.BASE_SERVER_EXCEPTION
    }

    const status = exception.getStatus()
    const response = exception.getResponse()
    let message: string | string[]

    if (typeof response === 'string') {
      message = response
    } else if ('message' in response) {
      message = (response as BaseExceptionDto).message
    } else {
      message = ERROR_MESSAGES.UNEXPECTED_ERROR
    }

    return {
      code: status,
      message: message,
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>()
    const exceptionData = this.handleException(exception)

    return res.status(exceptionData.code ?? 500).json(exceptionData)
  }
}
