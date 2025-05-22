import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

import { UsersService } from '../users/users.service'
import { UsersRepository } from '../users/repositories/users.repository'

import { SessionRepository } from './repositories/sessions.repository'
import { JwtTokensSevice } from './jwt-tokens.service'

import { CreateUserDto } from '../users/dto/create-user.dto'
import { GetUserResDto } from '../users/dto/get-user-res.dto'
import { SignInDto } from './dto/sign-in.dto'
import { TokensResDto } from './dto/tokens-res.dto'
import { NewAccessTokenDto } from './dto/new-access-token-res.dto'

import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface'
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

    const tokens = {
      accessToken: this.jwtTokensSevice.generateToken('access', {
        id: createdUser.id,
        email: createdUser.email,
      }),
      refreshToken: this.jwtTokensSevice.generateToken('refresh', {
        id: createdUser.id,
        email: createdUser.email,
      }),
    }

    await this.sessionRepository.addSession(
      createdUser?.id || 0,
      tokens.refreshToken,
    )

    this.logger.log('✅ Signing up was successful')

    return tokens
  }

  async signIn(signInDto: SignInDto): Promise<TokensResDto> {
    this.logger.log('🔍 Beginning of signing in')

    const user = await this.userRepository.getUserByEmail(signInDto.email)

    if (!user || !(await user.comparePassword(signInDto.password))) {
      this.logger.error('❌ Invalid credentials')
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDITIONALS)
    }

    await this.sessionRepository.destroySession(user?.id || 0)

    const tokens = {
      accessToken: this.jwtTokensSevice.generateToken('access', {
        id: user.id,
        email: user.email,
      }),
      refreshToken: this.jwtTokensSevice.generateToken('refresh', {
        id: user.id,
        email: user.email,
      }),
    }

    await this.sessionRepository.addSession(user?.id || 0, tokens.refreshToken)

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

    const user = await this.userRepository.getUserById(userJwtPayload.id)

    if (!user) {
      this.logger.error('❌ User not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_USER_WITH_THIS_ID)
    }

    await this.sessionRepository.destroySession(userJwtPayload.id)

    this.logger.log('✅ Logging out was successful')

    return user
  }

  async updateToken(refreshToken: string): Promise<NewAccessTokenDto> {
    this.logger.log('🔍 Beginning of updating token')

    const refreshTokenPayload = this.jwtTokensSevice.verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || '',
    )
    const currentSession = await this.sessionRepository.getSessionById(
      refreshTokenPayload.id,
    )

    if (!currentSession || currentSession.refreshToken !== refreshToken) {
      this.logger.error('❌ Invalid token')
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
    }

    const accessTokenPayload = {
      id: refreshTokenPayload.id,
      email: refreshTokenPayload.email,
    }

    this.logger.log('✅ Updating token was successful')

    const newAccessToken = this.jwtTokensSevice.generateToken(
      'access',
      accessTokenPayload,
    )

    return { newAccessToken }
  }
}
