import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/sequelize'
import { Request, Response } from 'express'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'
import { CatchError } from 'src/common/decorators/catch-errors.decorator'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { SignInDto } from './dto/sign-in.dto'
import { Session } from './sessions.model'
import { User } from '../users/users.model'
import { IRequestWithUser } from './guards/jwt-auth.guard'

const ACCESS_TOKEN_EXPIRES_IN = '15m'
const REFRESH_TOKEN_EXPIRES_IN = '14d'

export interface IJwtPayload {
  id: number
  login: string
  email: string
  age: number
  description: string
  iat: number
  exp: number
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    @InjectModel(Session) private sessionRepository: typeof Session,
  ) {}

  @CatchError
  async signUp(userDto: CreateUserDto, res: Response) {
    const createdUser = await this.userService.createUser(userDto)
    return await this.generateToken(createdUser, res)
  }

  @CatchError
  async signIn(signInDto: SignInDto, res: Response) {
    const user = await this.userService.getUserByEmail(signInDto.email)

    if (
      !user ||
      !(await bcrypt.compare(signInDto.password, user.toJSON().password))
    ) {
      throw new UnauthorizedException('Invalid credentials')
    }

    await this.sessionRepository.destroy({ where: { userId: user.id } })
    return await this.generateToken(user, res)
  }

  @CatchError
  async logout(req: IRequestWithUser, res: Response) {
    const accessTokenPayload = req.user
    const currentSession = await this.sessionRepository.findOne({
      where: { userId: accessTokenPayload.id },
    })

    if (!currentSession) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    currentSession?.destroy()
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 0,
    })

    return res.status(200).json({
      success: true,
      statusCode: 200,
    })
  }

  @CatchError
  async updateToken(req: Request, res: Response) {
    const refreshToken =
      typeof req.cookies?.refreshToken === 'string'
        ? (req.cookies.refreshToken as string)
        : ''
    const refreshTokenPayload = this.verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || '',
    ) as IJwtPayload
    const currentSession = await this.sessionRepository.findOne({
      where: { userId: refreshTokenPayload.id },
    })

    if (
      !currentSession ||
      currentSession.toJSON().refreshToken !== refreshToken
    ) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    const { iat: _iat, exp: _exp, ...accessTokenPayload } = refreshTokenPayload
    void _iat
    void _exp

    const newAccessToken = this.jwtService.sign(accessTokenPayload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'ACCESS_SECRET',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    })

    return res.status(200).json({
      success: true,
      statusCode: 200,
      result: { newAccessToken },
    })
  }

  @CatchError
  async generateToken(userData: User, res: Response) {
    const { password: _password, ...payload } = userData.toJSON()
    void _password

    const tokens = {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'ACCESS_SECRET',
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'REFRESH_SECRET',
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      }),
    }

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    })

    await this.sessionRepository.create({
      userId: userData.id,
      refreshToken: tokens.refreshToken,
    })

    return res.status(200).json({
      success: true,
      statusCode: 200,
      result: {
        user: payload,
        token: tokens,
      },
    })
  }

  getUserFromAccessToken(authHeader: string) {
    const bearer = authHeader.split(' ')[0]
    const accessToken = authHeader.split(' ')[1]

    if (bearer !== 'Bearer' || !accessToken) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    return this.verifyToken(
      accessToken,
      process.env.JWT_ACCESS_SECRET || '',
    ) as IJwtPayload
  }

  verifyToken(token: string, tokenSecret: string) {
    try {
      return this.jwtService.verify(token, {
        secret: tokenSecret,
      })
    } catch (_error) {
      void _error
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
