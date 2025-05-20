import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
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
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly jwtTokensSevice: JwtTokensSevice,
    private readonly userService: UsersService,
    private readonly userRepository: UsersRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async signUp(userDto: CreateUserDto): Promise<TokensResDto> {
    this.logger.log('🔍 Beginning of signing up')

    const createdUser = await this.userService.createUser(userDto)
    const createdUserJson = createdUser.toJSON()

    const createdUserWithoutPassword = {
      id: createdUserJson.id,
      login: createdUserJson.login,
      age: createdUserJson.age,
      email: createdUserJson.email,
      description: createdUserJson.description,
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

    this.logger.log('✅ Signing up was successful')

    return tokens
  }

  async signIn(signInDto: SignInDto): Promise<TokensResDto> {
    this.logger.log('🔍 Beginning of signing in')

    const user = await this.userRepository.getUserByEmail(signInDto.email)
    const userJson = user.toJSON()

    if (
      !user ||
      !(await bcrypt.compare(signInDto.password, user.toJSON().password))
    ) {
      this.logger.error('❌ Invalid credentials')
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

    this.logger.log('✅ Signing in was successful')

    return tokens
  }

  async logout(userJwtPayload: IJwtPayload): Promise<GetUserResDto> {
    this.logger.log('🔍 Beginning of logging out')
    const currentSession = await this.sessionRepository.getSessionById(
      userJwtPayload.id,
    )

    if (!currentSession) {
      this.logger.error('❌ Invalid token')
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
    }

    const user = await this.userRepository.getUserByIdWithoutPassword(
      userJwtPayload.id,
    )

    if (!user) {
      this.logger.error('❌ User not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    await this.sessionRepository.destroySession(userJwtPayload.id)

    this.logger.log('✅ Logging out was successful')

    return user.toJSON() as GetUserResDto
  }

  async updateToken(refreshToken: string) {
    this.logger.log('🔍 Beginning of updating token')

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
      this.logger.error('❌ Invalid token')
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
    }

    const accessTokenPayload = {
      id: refreshTokenPayload.id,
      login: refreshTokenPayload.login,
      age: refreshTokenPayload.age,
      email: refreshTokenPayload.email,
      description: refreshTokenPayload.description,
      createdAt: refreshTokenPayload.createdAt,
      updatedAt: refreshTokenPayload.updatedAt,
    }

    this.logger.log('✅ Updating token was successful')

    return this.jwtTokensSevice.generateToken('access', accessTokenPayload)
  }
}
