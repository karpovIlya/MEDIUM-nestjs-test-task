import {
  Injectable,
  Logger,
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
  private readonly logger = new Logger(UsersRepository.name)

  constructor(@InjectModel(User) private readonly userData: typeof User) {}

  public async getUserCount() {
    this.logger.log('🔍 Beginning of getting user count')

    const userCount = await this.userData.count()

    this.logger.log('✅ Getting user count was successful')

    return userCount
  }

  public async getUserByEmail(soughtEmail: string) {
    this.logger.log('🔍 Beginning of getting user by email')

    const user = await this.userData.findOne({
      where: { email: soughtEmail },
    })

    if (!user) {
      this.logger.error('❌ User not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_EMAIL)
    }

    this.logger.log('✅ Getting user by email was successful')

    return user
  }

  public async getPaginatedUsers(
    limit: number,
    offset: number,
    filters: UsersFiltersQueryDto,
  ) {
    this.logger.log('🔍 Beginning of getting paginated users')

    const paginatedUsers = await this.userData.findAndCountAll({
      attributes: { exclude: ['password', 'deletedAt'] },
      where: {
        login: { [Op.like]: `%${filters.login || ''}%` },
      },
      offset,
      limit,
    })

    this.logger.log('✅ Getting paginated users was successful')

    return paginatedUsers
  }

  public async getUserByIdWithoutPassword(id: number) {
    this.logger.log('🔍 Beginning of getting user by id')

    const user = await this.userData.findByPk(id, {
      attributes: { exclude: ['password', 'deletedAt'] },
    })

    if (!user) {
      this.logger.error('❌ User not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    this.logger.log('✅ Getting user by id was successful')

    return user
  }

  public async checkUserAlreadyExist(email: string) {
    this.logger.log('🔍 Beginning of checking user already exist')

    const user = await this.userData.findOne({ where: { email } })

    this.logger.log('✅ Checking user already exist was successful')

    return !!user
  }

  public async addUser(userDto: CreateUserDto) {
    this.logger.log('🔍 Beginning of adding user')

    const user = await this.userData.create(userDto)

    this.logger.log('✅ Adding user was successful')

    return user
  }

  public async destroyUser(id: number) {
    this.logger.log('🔍 Beginning of destroying user')

    await this.userData.destroy({ where: { id } })

    this.logger.log('✅ Destroying user was successful')
  }

  public async getAllUsersWithPositiveBalance(transaction?: Transaction) {
    this.logger.log('🔍 Beginning of getting all users with positive balance')

    const users = await this.userData.findAll({
      attributes: ['id', 'balance'],
      where: { balance: { [Op.ne]: 0 } },
      transaction,
    })

    this.logger.log('✅ Getting all users with positive balance was successful')

    return users
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
    this.logger.log('🔍 Beginning of adding user balance')

    const user = await this.userData.findByPk(userId, { transaction })

    if (!user) {
      this.logger.error('❌ User not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    const currentBalance = parseFloat(user.get('balance') as unknown as string)
    const newBalance = currentBalance + addToBalance

    await this.userData.update(
      { balance: newBalance },
      { where: { id: userId }, transaction },
    )

    this.logger.log('✅ Adding user balance was successful')
  }

  public async subtractUserBalance(
    userId: number,
    subtractToBalance: number,
    transaction?: Transaction,
  ) {
    this.logger.log('🔍 Beginning of subtracting user balance')

    if (subtractToBalance < 0) {
      this.logger.error('❌ Negative balance')
      throw new BadRequestException(ERROR_MESSAGES.NEGATIVE_BALANCE)
    }

    const user = await this.userData.findByPk(userId, { transaction })

    if (!user) {
      this.logger.error('❌ User not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    const currentBalance = parseFloat(user.get('balance') as unknown as string)

    if (currentBalance < subtractToBalance) {
      this.logger.error('❌ Not enough money')
      throw new BadRequestException(ERROR_MESSAGES.NOT_ENOUGH_MONEY)
    }

    const newBalance = currentBalance - subtractToBalance

    await this.userData.update(
      { balance: newBalance },
      { where: { id: userId }, transaction },
    )

    this.logger.log('✅ Subtracting user balance was successful')
  }
}
