import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { AvatarEntity } from '../entities/avatar.entity'
import { Avatar } from 'src/features/avatars/models/avatars.model'
import { IAvatar } from 'src/common/interfaces/avatar.interface'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'

@Injectable()
export class AvatarsRepository {
  private readonly logger = new Logger(AvatarsRepository.name)

  constructor(
    @InjectModel(Avatar) private readonly avatarData: typeof Avatar,
  ) {}

  public async countUserAvatars(userId: number): Promise<number> {
    this.logger.log('🔍 Beginning of getting avatars count')

    const avatarsCount = await this.avatarData.count({ where: { userId } })

    this.logger.log('✅ Getting avatar count was successful')

    return avatarsCount
  }

  public async getUserAvatar(avatarId: number): Promise<AvatarEntity> {
    this.logger.log('🔍 Beginning of getting avatar')

    const avatar = await this.avatarData.findOne({ where: { id: avatarId } })

    if (!avatar) {
      this.logger.error('❌ Avatar not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_AVATAR_WITH_THIS_ID)
    }

    this.logger.log('✅ Getting avatar was successful')

    return new AvatarEntity(avatar.toJSON())
  }

  public async deleteUserAvatar(userId: number): Promise<void> {
    this.logger.log('🔍 Beginning of destroying user avatar')

    await this.avatarData.destroy({ where: { userId } })

    this.logger.log('✅ Destroying user avatar was successful')
  }

  public async getUserAvatars(userId: number): Promise<AvatarEntity[]> {
    this.logger.log('🔍 Beginning of getting user avatars')

    const avatars = await this.avatarData.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    })

    if (!avatars) {
      this.logger.error('❌ This user dont have avatars')
      throw new NotFoundException(ERROR_MESSAGES.NO_AVATAR_WITH_THIS_ID)
    }

    this.logger.log('✅ Getting user avatars was successful')

    return avatars.map((avatar) => new AvatarEntity(avatar.toJSON()))
  }

  public async createAvatar(avatarData: IAvatar): Promise<AvatarEntity> {
    this.logger.log('🔍 Beginning of adding avatar')

    const avatar = await this.avatarData.create(avatarData)

    this.logger.log('✅ Adding avatar was successful')

    return new AvatarEntity(avatar.toJSON())
  }

  public async deleteAvatar(id: number) {
    this.logger.log('🔍 Beginning of destroying avatar')

    await this.avatarData.destroy({ where: { id } })

    this.logger.log('✅ Destroying avatar was successful')
  }
}
