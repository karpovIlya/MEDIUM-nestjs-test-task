import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  transform(value: any) {
    const { mimetype } = value

    if (
      !mimetype ||
      (mimetype !== 'image/jpeg' &&
        mimetype !== 'image/png' &&
        mimetype !== 'image/jpg')
    ) {
      throw new BadRequestException(
        ERROR_MESSAGES.ONLY_JPEG_AND_PNG_FILES_ARE_ALLOWED,
      )
    }

    return value
  }
}
