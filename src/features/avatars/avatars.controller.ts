import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Delete,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'

import { AvatarsService } from './avatars.service'

import { FileTypeValidationPipe } from 'src/providers/files/s3/pipes/file-type-validation.pipe'
import { FileSizeValidationPipe } from 'src/providers/files/s3/pipes/file-size.validation.pipe'

import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface'
import { UploadFileResultDto } from 'src/providers/files/s3/dto/upload-file-result.dto'
import { AvatarDto, GetAvatarsResultDto } from './dto/get-avatars-result.dto'
import { ERROR_RESPONSES } from 'src/common/consts/error-responses.const'
import { User } from 'src/common/decorators/user.decorator'

@Controller('/avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Getting all user avatars' })
  @ApiResponse({
    status: 200,
    description: 'Returns all user avatars',
    type: GetAvatarsResultDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async getUserAvatars(
    @User() user: IJwtPayload,
  ): Promise<GetAvatarsResultDto> {
    return this.avatarsService.getUserAvatars(user.id)
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Uploading avatar' })
  @ApiResponse({
    status: 200,
    description: 'Returns path touploaded avatar',
    type: UploadFileResultDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async uploadAvatar(
    @User() user: IJwtPayload,
    @UploadedFile(new FileTypeValidationPipe(), new FileSizeValidationPipe())
    avatarFile: Express.Multer.File,
  ): Promise<UploadFileResultDto> {
    return await this.avatarsService.createAvatar(user.id, avatarFile)
  }

  @Delete('/delete/:avatarId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deleting avatar' })
  @ApiResponse({
    status: 200,
    description: 'Returns deleted avatar',
    type: AvatarDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async deleteAvatar(
    @User() user: IJwtPayload,
    @Param('avatarId') avatarId: number,
  ): Promise<AvatarDto> {
    return await this.avatarsService.deleteAvatar(user.id, avatarId)
  }
}
