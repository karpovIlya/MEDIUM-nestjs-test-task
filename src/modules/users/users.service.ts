import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Response } from 'express'
import * as bcrypt from 'bcryptjs'
import { User } from './users.model'
import { CreateUserDto } from './dto/create-user.dto'
import { CatchError } from 'src/common/decorators/catch-errors.decorator'
import { IRequestWithUser } from '../auth/guards/jwt-auth.guard'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { makePaginationObject } from 'src/common/helpers/make-pagination-oject'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  @CatchError
  async getAllUsers(paginationQuery: PaginationQueryDto, res: Response) {
    const { limit, page } = paginationQuery
    const paginatedUsers = await this.userRepository.findAndCountAll({
      attributes: { exclude: ['password'] },
      offset: (page - 1) * limit,
      limit,
    })
    const paginationData = makePaginationObject(
      limit,
      page,
      paginatedUsers.count,
    )
    console.log('ТИП LIMIT:', typeof limit)
    return res.status(200).json({
      success: true,
      statusCode: 200,
      result: {
        users: paginatedUsers.rows,
        pagination: paginationData,
      },
    })
  }

  @CatchError
  async getUser(req: IRequestWithUser, res: Response) {
    const userFromAccessToken = req.user
    await this.getUserByEmail(userFromAccessToken.email)

    if (!userFromAccessToken) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    const { iat: _iat, exp: _exp, ...payload } = userFromAccessToken
    void _iat
    void _exp

    return res.status(200).json({
      success: true,
      statusCode: 200,
      result: {
        user: payload,
      },
    })
  }

  @CatchError
  async deleteUser(req: IRequestWithUser, res: Response) {
    const userFromAccessToken = req.user
    await this.getUserByEmail(userFromAccessToken.email)

    if (!userFromAccessToken) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    await this.userRepository.destroy({ where: { id: userFromAccessToken.id } })

    const { iat: _iat, exp: _exp, ...payload } = userFromAccessToken
    void _iat
    void _exp

    return res.status(200).json({
      success: true,
      statusCode: 200,
      result: {
        deletedUser: payload,
      },
    })
  }

  @CatchError
  async getUserByEmail(soughtEmail: string) {
    const gettingUser = await this.userRepository.findOne({
      where: { email: soughtEmail },
    })

    if (!gettingUser) {
      throw new NotFoundException('There is no user with this email')
    }

    return gettingUser
  }

  @CatchError
  async createUser(userDto: CreateUserDto) {
    const isUserAlreadyExist = !!(await this.userRepository.findOne({
      where: { email: userDto.email },
    }))

    if (isUserAlreadyExist) {
      throw new ConflictException('This user already exists')
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10)
    const userDtoWithHashPassword = {
      ...userDto,
      password: hashedPassword,
    }

    return await this.userRepository.create(userDtoWithHashPassword)
  }
}
