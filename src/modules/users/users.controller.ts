import {
  Controller,
  Get,
  Delete,
  Req,
  Res,
  UseGuards,
  UsePipes,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Response } from 'express'
import { UsersService } from './users.service'
import { IRequestWithUser, JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'

@Controller('api/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Getting paginated users' })
  @ApiResponse({
    status: 200,
    description: 'Returns a set of users',
  })
  async getAllUsers(
    @Query() paginationQuery: PaginationQueryDto,
    @Res() res: Response,
  ) {
    return await this.userService.getAllUsers(paginationQuery, res)
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Getting your own user' })
  @ApiResponse({
    status: 200,
    description: 'Returns your own user',
  })
  getUser(@Req() req: IRequestWithUser, @Res() res: Response) {
    return this.userService.getUser(req, res)
  }

  @Delete('/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletion your own user' })
  @ApiResponse({
    status: 200,
    description: 'Returns your own deleted user',
  })
  async deleteUser(@Req() req: IRequestWithUser, @Res() res: Response) {
    return await this.userService.deleteUser(req, res)
  }
}
