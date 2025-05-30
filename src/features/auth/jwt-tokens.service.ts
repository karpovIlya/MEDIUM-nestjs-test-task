import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  TToken,
  IJwtPayload,
} from 'src/common/interfaces/jwt-payload.interface'
import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'

@Injectable()
export class JwtTokensSevice {
  public readonly REFRESH_MAX_AGE = 14 * 24 * 60 * 60 * 1000
  private readonly _ACCESS_TOKEN_EXPIRES_IN = '15m'
  private readonly _REFRESH_TOKEN_EXPIRES_IN = '14d'

  constructor(private readonly jwtService: JwtService) {}

  public generateToken(tokenType: TToken, payload: object) {
    const secret =
      tokenType === 'access'
        ? process.env.JWT_ACCESS_SECRET
        : process.env.JWT_REFRESH_SECRET
    const expiresIn =
      tokenType === 'access'
        ? this._ACCESS_TOKEN_EXPIRES_IN
        : this._REFRESH_TOKEN_EXPIRES_IN

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    })
  }

  public verifyToken(token: string, tokenSecret: string): IJwtPayload {
    try {
      return this.jwtService.verify<IJwtPayload>(token, {
        secret: tokenSecret,
      })
    } catch (_error) {
      void _error
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
    }
  }

  public getUserFromAccessToken(authHeader: string) {
    const bearer = authHeader.split(' ')[0]
    const accessToken = authHeader.split(' ')[1]

    if (bearer !== 'Bearer' || !accessToken) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN)
    }

    return this.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET || '')
  }
}
