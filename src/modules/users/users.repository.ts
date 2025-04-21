import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, Transaction } from 'sequelize'

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

  public async getUserByIdWithoutPassword(id: number) {
    return await this.userData.findByPk(id, {
      attributes: { exclude: ['password', 'deletedAt'] },
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

  public async getAllUsersWithPositiveBalance(transaction?: Transaction) {
    return await this.userData.findAll({
      attributes: ['id', 'balance'],
      where: { balance: { [Op.ne]: 0 } },
      transaction,
    })
  }

  public async resetAllUsersBalance(transaction?: Transaction) {
    await this.userData.update(
      { balance: 0 },
      { where: { balance: { [Op.ne]: 0 } }, transaction },
    )
  }

  public async addUserBalance(
    userId: number,
    addToBalance: number,
    transaction?: Transaction,
  ) {
    const user = await this.userData.findByPk(userId, { transaction })

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    const currentBalance = parseFloat(user.get('balance') as unknown as string)
    const newBalance = currentBalance + addToBalance

    await this.userData.update(
      { balance: newBalance },
      { where: { id: userId }, transaction },
    )
  }

  public async subtractUserBalance(
    userId: number,
    subtractToBalance: number,
    transaction?: Transaction,
  ) {
    if (subtractToBalance < 0) {
      throw new BadRequestException(ERROR_MESSAGES.NEGATIVE_BALANCE)
    }

    const user = await this.userData.findByPk(userId, { transaction })

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    const currentBalance = parseFloat(user.get('balance') as unknown as string)

    if (currentBalance < subtractToBalance) {
      throw new BadRequestException(ERROR_MESSAGES.NOT_ENOUGH_MONEY)
    }

    const newBalance = currentBalance - subtractToBalance

    await this.userData.update(
      { balance: newBalance },
      { where: { id: userId }, transaction },
    )
  }
}
