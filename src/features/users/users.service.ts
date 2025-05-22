import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'

import { UsersRepository } from './repositories/users.repository'
import { SessionRepository } from '../auth/repositories/sessions.repository'
import { TransactionRepository } from '../balance/repositories/transaction.repository'
import { AvatarsRepository } from '../avatars/repositories/avatars.repository'
import { UsersFiltersQueryDto } from './dto/users-filters-query.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { GetAllUsersResDto } from './dto/get-all-users-res.dto'
import { GetUserResDto } from './dto/get-user-res.dto'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'
import { Pagination } from 'src/common/helpers/pagination/pagination.helper'
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface'
import { UserEntity } from './entities/user.entity'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    private readonly userRepository: UsersRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly avatarRepository: AvatarsRepository,
  ) {}

  async getAllUsers(
    limit: number,
    page: number,
    filters: UsersFiltersQueryDto,
  ): Promise<GetAllUsersResDto> {
    const usersCount = await this.userRepository.getUserCount()
    const usersPagination = new Pagination({
      totalCount: usersCount,
      limit,
      page,
    })

    this.logger.log('🔍 Beginning of getting all users')

    const paginatedUsers = await this.userRepository.getPaginatedUsers(
      usersPagination.limit,
      usersPagination.offset,
      filters,
    )

    this.logger.log('✅ Getting all users was successful')

    return {
      users: paginatedUsers,
      pagination: usersPagination.pageData,
    }
  }

  async getUser(userJwtPayload: IJwtPayload): Promise<GetUserResDto> {
    const user = await this.userRepository.getUserById(userJwtPayload.id)

    this.logger.log('🔍 Beginning of getting user')

    if (!user) {
      this.logger.error('❌ User not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    this.logger.log('✅ Getting user was successful')

    return user
  }

  async deleteUser(userJwtPayload: IJwtPayload): Promise<GetUserResDto> {
    const user = await this.userRepository.getUserById(userJwtPayload.id)

    this.logger.log('🔍 Beginning of deleting user')

    if (!user) {
      this.logger.error('❌ User not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    await this.userRepository.destroyUser(userJwtPayload.id)
    await this.sessionRepository.destroySession(userJwtPayload.id)
    await this.transactionRepository.destroyAllUserTransactions(
      userJwtPayload.id,
    )
    await this.avatarRepository.deleteUserAvatar(userJwtPayload.id)

    this.logger.log('✅ Deleting user was successful')

    return user
  }

  async createUser(userDto: CreateUserDto) {
    const isUserAlreadyExist = await this.userRepository.checkUserAlreadyExist(
      userDto.email,
    )

    this.logger.log('🔍 Beginning of creating user')

    if (isUserAlreadyExist) {
      this.logger.error('❌ User already exists')
      throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXIST)
    }

    const newUserEntity = await new UserEntity({
      ...userDto,
      password: '',
    }).setPasswordHash(userDto.password)

    this.logger.log('✅ Creating user was successful')

    return await this.userRepository.addUser(newUserEntity)
  }
}
