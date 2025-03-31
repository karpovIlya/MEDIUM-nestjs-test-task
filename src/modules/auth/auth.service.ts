import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

import { UsersService } from '../users/users.service'
import { UsersRepository } from '../users/users.repository'

import { SessionRepository } from './sessions.repository'
import { JwtTokensSevice, IJwtPayload } from './jwt-tokens.service'

import { CreateUserDto } from '../users/dto/create-user.dto'
import { GetUserResDto } from '../users/dto/get-user-res.dto'
import { SignInDto } from './dto/sign-in.dto'
import { TokensResDto } from './dto/tokens-res.dto'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtTokensSevice: JwtTokensSevice,
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async signUp(userDto: CreateUserDto): Promise<TokensResDto> {
    const createdUser = await this.userService.createUser(userDto)
    const createdUserJson = createdUser.toJSON()

    const createdUserWithoutPassword = {
      id: createdUserJson.id,
      login: createdUserJson.login,
      age: createdUserJson.age,
      description: createdUserJson.description,
      email: createdUserJson.email,
      createdAt: createdUserJson.createdAt,
      updatedAt: createdUserJson.updatedAt,
    }

    const tokens = {
      accessToken: this.jwtTokensSevice.generateToken(
        'access',
        createdUserWithoutPassword,
      ),
      refreshToken: this.jwtTokensSevice.generateToken(
        'refresh',
        createdUserWithoutPassword,
      ),
    }

    await this.sessionRepository.addSession(
      createdUserWithoutPassword.id,
      tokens.refreshToken,
    )

    return tokens
  }

  async signIn(signInDto: SignInDto): Promise<TokensResDto> {
    const user = await this.userRepository.getUserByEmail(signInDto.email)
    const userJson = user.toJSON()

    if (
      !user ||
      !(await bcrypt.compare(signInDto.password, user.toJSON().password))
    ) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDITIONALS)
    }

    const userWithoutPassword = {
      id: userJson.id,
      login: userJson.login,
      age: userJson.age,
      description: userJson.description,
      email: userJson.email,
      createdAt: userJson.createdAt,
      updatedAt: userJson.updatedAt,
    }

    await this.sessionRepository.destroySession(userJson.id)

    const tokens = {
      accessToken: this.jwtTokensSevice.generateToken(
        'access',
        userWithoutPassword,
      ),
      refreshToken: this.jwtTokensSevice.generateToken(
        'refresh',
        userWithoutPassword,
      ),
    }

    await this.sessionRepository.addSession(
      userWithoutPassword.id,
      tokens.refreshToken,
    )

    return tokens
  }

  async logout(userJwtPayload: IJwtPayload): Promise<GetUserResDto> {
    const currentSession = await this.sessionRepository.getSessionById(
      userJwtPayload.id,
    )

    if (!currentSession) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
    }

    await this.sessionRepository.destroySession(userJwtPayload.id)

    return {
      id: userJwtPayload.id,
      login: userJwtPayload.login,
      age: userJwtPayload.age,
      description: userJwtPayload.description,
      email: userJwtPayload.email,
      createdAt: userJwtPayload.createdAt,
      updatedAt: userJwtPayload.updatedAt,
    }
  }

  async updateToken(refreshToken: string) {
    const refreshTokenPayload = this.jwtTokensSevice.verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || '',
    ) as IJwtPayload
    const currentSession = await this.sessionRepository.getSessionById(
      refreshTokenPayload.id,
    )

    if (
      !currentSession ||
      currentSession.toJSON().refreshToken !== refreshToken
    ) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
    }

    const accessTokenPayload = {
      id: refreshTokenPayload.id,
      login: refreshTokenPayload.login,
      age: refreshTokenPayload.age,
      description: refreshTokenPayload.description,
      email: refreshTokenPayload.email,
      createdAt: refreshTokenPayload.createdAt,
      updatedAt: refreshTokenPayload.updatedAt,
    }

    return this.jwtTokensSevice.generateToken('access', accessTokenPayload)
  }
}
