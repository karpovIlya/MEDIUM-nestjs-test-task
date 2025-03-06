import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

interface IException {
  message: string
  statusCode: number
}

const INTERNAL_SERVER_EXCEPTION: IException = {
  message: 'Internal Server Error',
  statusCode: 500,
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>()
    const errorStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR
    const errorResponse: IException =
      exception instanceof HttpException
        ? (exception.getResponse() as IException)
        : INTERNAL_SERVER_EXCEPTION

    return res.status(errorStatus).json({
      success: false,
      statusCode: errorStatus,
      result: { message: errorResponse.message },
    })
  }
}
