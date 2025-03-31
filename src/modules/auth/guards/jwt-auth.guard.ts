import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { JwtTokensSevice, IJwtPayload } from '../jwt-tokens.service'
import { UsersRepository } from 'src/modules/users/users.repository'
import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'

export interface IRequestWithUser extends Request {
  user: IJwtPayload
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokensSevice: JwtTokensSevice,
    private readonly userRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<IRequestWithUser>()
    const authHeader =
      typeof req.headers?.authorization === 'string'
        ? req.headers.authorization
        : ''

    try {
      const userFromAccessToken =
        this.jwtTokensSevice.getUserFromAccessToken(authHeader)

      await this.userRepository.getUserByEmail(userFromAccessToken.email)

      if (!userFromAccessToken) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
      }

      req.user = userFromAccessToken

      return true
    } catch (error) {
      void error
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
    }
  }
}
