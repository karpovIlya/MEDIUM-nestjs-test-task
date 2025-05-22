import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { JwtTokensSevice } from '../jwt-tokens.service'
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'
import { IS_PUBLIC_ROUTE_KEY } from 'src/common/consts/public-route-key.const'

export interface IRequestWithUser extends Request {
  user: IJwtPayload
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokensSevice: JwtTokensSevice,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_ROUTE_KEY,
      context.getHandler(),
    )

    if (isPublic) {
      return true
    }

    const req = context.switchToHttp().getRequest<IRequestWithUser>()
    const authHeader =
      typeof req.headers?.authorization === 'string'
        ? req.headers.authorization
        : ''
    const accessToken = authHeader.split(' ')[1]

    try {
      const accessTokenPayload = this.jwtTokensSevice.verifyToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET || '',
      )

      if (!accessTokenPayload) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
      }

      req.user = accessTokenPayload

      return true
    } catch (error) {
      void error
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
    }
  }
}
