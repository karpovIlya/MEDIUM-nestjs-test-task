import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { AuthService, IJwtPayload } from '../auth.service'
import { Request } from 'express'

export interface IRequestWithUser extends Request {
  user: IJwtPayload
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest() as IRequestWithUser
    const authHeader =
      typeof req.headers?.authorization === 'string'
        ? req.headers.authorization
        : ''

    try {
      const userFromAccessToken =
        this.authService.getUserFromAccessToken(authHeader)
      req.user = userFromAccessToken

      return true
    } catch (error) {
      void error
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
