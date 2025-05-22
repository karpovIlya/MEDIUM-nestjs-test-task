import { Controller, Post, Body, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Response } from 'express'

import { AuthService } from './auth.service'
import { JwtTokensSevice } from './jwt-tokens.service'
import { TokensResDto } from './dto/tokens-res.dto'
import { NewAccessTokenDto } from './dto/new-access-token-res.dto'
import { SignInDto } from './dto/sign-in.dto'

import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface'

import { CreateUserDto } from '../users/dto/create-user.dto'
import { GetUserResDto } from '../users/dto/get-user-res.dto'

import { Public } from 'src/common/decorators/public.decorator'
import { User } from 'src/common/decorators/user.decorator'
import { RefreshToken } from 'src/common/decorators/refresh-token.decorator'
import { ERROR_RESPONSES } from 'src/common/consts/error-responses.const'

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtTokensSevice: JwtTokensSevice,
  ) {}

  @Public()
  @Post('/sign-up')
  @ApiOperation({ summary: 'Sign-up new account' })
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
    type: TokensResDto,
  })
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async signUp(@Body() userDto: CreateUserDto, @Res() res: Response) {
    const tokens = await this.authService.signUp(userDto)

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.jwtTokensSevice.REFRESH_MAX_AGE,
    })

    res.json(tokens)
  }

  @Public()
  @Post('/sign-in')
  @ApiOperation({ summary: 'Sign-in your account' })
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
    type: TokensResDto,
  })
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const tokens = await this.authService.signIn(signInDto)

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: this.jwtTokensSevice.REFRESH_MAX_AGE,
    })

    res.json(tokens)
  }

  @Post('/logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from your account' })
  @ApiResponse({
    status: 200,
    description: 'You delete your session. Returns logut user',
    type: GetUserResDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async logout(@User() user: IJwtPayload, @Res() res: Response) {
    const logoutUser = await this.authService.logout(user)

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 0,
    })

    res.json(logoutUser)
  }

  @Public()
  @Post('/update-token')
  @ApiOperation({ summary: 'Update your access token' })
  @ApiResponse({
    status: 200,
    description: 'Returns new access token',
    type: NewAccessTokenDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async updateToken(
    @RefreshToken() refreshToken: string,
  ): Promise<NewAccessTokenDto> {
    return await this.authService.updateToken(refreshToken)
  }
}
