import {
  Controller,
  Post,
  UsePipes,
  UseGuards,
  ValidationPipe,
  Body,
  Res,
  Req,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { SignInDto } from './dto/sign-in.dto'
import { IRequestWithUser, JwtAuthGuard } from './guards/jwt-auth.guard'

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Sign-up new account' })
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
  })
  async signUp(@Body() userDto: CreateUserDto, @Res() res: Response) {
    return await this.authService.signUp(userDto, res)
  }

  @Post('/sign-in')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Sign-in your account' })
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
  })
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    return await this.authService.signIn(signInDto, res)
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from your account' })
  @ApiResponse({ status: 200 })
  async logout(@Req() req: IRequestWithUser, @Res() res: Response) {
    return await this.authService.logout(req, res)
  }

  @Post('/update-token')
  @ApiOperation({ summary: 'Update your access token' })
  @ApiResponse({ status: 200, description: 'Returns new access token' })
  updateToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.updateToken(req, res)
  }
}
