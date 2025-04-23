import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

import { UsersRepository } from './users.repository'
import { SessionRepository } from '../auth/sessions.repository'
import { TransactionRepository } from '../balance/transaction.repository'
import { UsersFiltersQueryDto } from './dto/users-filters-query.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { GetAllUsersResDto } from './dto/get-all-users-res.dto'
import { GetUserResDto } from './dto/get-user-res.dto'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'
import { Pagination } from 'src/common/helpers/pagination/pagination.helper'
import { IJwtPayload } from '../auth/jwt-tokens.service'

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly transactionRepository: TransactionRepository,
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

    const paginatedUsers = await this.userRepository.getPaginatedUsers(
      usersPagination.limit,
      usersPagination.offset,
      filters,
    )

    return {
      users: paginatedUsers.rows,
      pagination: usersPagination.pageData,
    }
  }

  async getUser(userJwtPayload: IJwtPayload): Promise<GetUserResDto> {
    const user = await this.userRepository.getUserByIdWithoutPassword(
      userJwtPayload.id,
    )

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    return user.toJSON() as GetUserResDto
  }

  async deleteUser(userJwtPayload: IJwtPayload): Promise<GetUserResDto> {
    const user = await this.userRepository.getUserByIdWithoutPassword(
      userJwtPayload.id,
    )

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    await this.userRepository.destroyUser(userJwtPayload.id)
    await this.sessionRepository.destroySession(userJwtPayload.id)
    await this.transactionRepository.destroyAllUserTransactions(
      userJwtPayload.id,
    )

    return user.toJSON() as GetUserResDto
  }

  async createUser(userDto: CreateUserDto) {
    const isUserAlreadyExist = await this.userRepository.checkUserAlreadyExist(
      userDto.email,
    )

    if (isUserAlreadyExist) {
      throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXIST)
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10)
    const userDtoWithHashPassword: CreateUserDto = {
      ...userDto,
      password: hashedPassword,
    }

    return await this.userRepository.addUser(userDtoWithHashPassword)
  }
}
