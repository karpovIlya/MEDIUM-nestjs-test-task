import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'

import { User } from './users.model'
import { UsersFiltersQueryDto } from './dto/users-filters-query.dto'
import { CreateUserDto } from './dto/create-user.dto'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User) private readonly userData: typeof User) {}

  public async getUserCount() {
    return await this.userData.count()
  }

  public async getUserByEmail(soughtEmail: string) {
    const user = await this.userData.findOne({
      where: { email: soughtEmail },
    })

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_EMAIL)
    }

    return user
  }

  public async getPaginatedUsers(
    limit: number,
    offset: number,
    filters: UsersFiltersQueryDto,
  ) {
    return await this.userData.findAndCountAll({
      attributes: { exclude: ['password', 'deletedAt'] },
      where: {
        login: { [Op.like]: `%${filters.login || ''}%` },
      },
      offset,
      limit,
    })
  }

  public async checkUserAlreadyExist(email: string) {
    return !!(await this.userData.findOne({ where: { email } }))
  }

  public async addUser(userDto: CreateUserDto) {
    return await this.userData.create(userDto)
  }

  public async destroyUser(id: number) {
    return await this.userData.destroy({ where: { id } })
  }
}
