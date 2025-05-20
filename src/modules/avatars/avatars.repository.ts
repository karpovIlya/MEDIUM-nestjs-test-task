import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Avatar } from './avatars.model'
import { IAvatarCreationAttrs } from './avatars.model'

@Injectable()
export class AvatarsRepository {
  constructor(
    @InjectModel(Avatar) private readonly avatarData: typeof Avatar,
  ) {}

  public async countUserAvatars(userId: number) {
    return await this.avatarData.count({ where: { userId } })
  }

  public async getUserAvatar(avatarId: number) {
    return await this.avatarData.findOne({ where: { id: avatarId } })
  }

  public async getUserAvatars(userId: number) {
    return await this.avatarData.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    })
  }

  public async createAvatar(avatarData: IAvatarCreationAttrs) {
    return await this.avatarData.create(avatarData)
  }

  public async deleteAvatar(id: number) {
    return await this.avatarData.destroy({ where: { id } })
  }
}
