import { Injectable, BadRequestException } from '@nestjs/common'

import { IFileService } from 'src/providers/files/files.adapter'

import { AvatarsRepository } from './avatars.repository'
import { AvatarDto, GetAvatarsResultDto } from './dto/get-avatars-result.dto'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'
import { UploadFileResultDto } from 'src/providers/files/s3/dto/upload-file-result.dto'

@Injectable()
export class AvatarsService {
  private readonly MAX_AVATARS_COUNT = 2

  constructor(
    private readonly filesService: IFileService,
    private readonly avatarsRepository: AvatarsRepository,
  ) {}

  public async getUserAvatars(userId: number): Promise<GetAvatarsResultDto> {
    const avatars = await this.avatarsRepository.getUserAvatars(userId)

    return {
      avatars: avatars.map((avatar) => avatar.toJSON() as unknown as AvatarDto),
    }
  }

  public async createAvatar(
    userId: number,
    avatarFile: Express.Multer.File,
  ): Promise<UploadFileResultDto> {
    const countUserAvatars =
      await this.avatarsRepository.countUserAvatars(userId)

    if (countUserAvatars >= this.MAX_AVATARS_COUNT) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_HAS_AVATAR)
    }

    const { path } = await this.filesService.uploadFile({
      name: avatarFile.originalname,
      file: avatarFile,
      folder: 'avatars',
    })

    await this.avatarsRepository.createAvatar({ userId, path })

    return { path }
  }

  public async deleteAvatar(
    userId: number,
    avatarId: number,
  ): Promise<AvatarDto> {
    const avatar = await this.avatarsRepository.getUserAvatar(avatarId)

    if (!avatar || avatar.toJSON().userId !== userId) {
      throw new BadRequestException(ERROR_MESSAGES.AVATAR_NOT_FOUND)
    }

    await this.filesService.removeFile({ path: avatar.toJSON().path })
    await this.avatarsRepository.deleteAvatar(avatarId)

    return avatar.toJSON() as unknown as AvatarDto
  }
}
