import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any) {
    const MAX_FILE_SIZE = 1024 * 1024 * 10
    const { size: fileSize } = value

    if (fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(ERROR_MESSAGES.FILE_SIZE_TOO_LARGE)
    }

    return value
  }
}
