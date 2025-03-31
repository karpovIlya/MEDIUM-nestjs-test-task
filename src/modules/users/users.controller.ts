import { Controller, Get, Delete, UseGuards, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { UsersService } from './users.service'
import { UsersFiltersQueryDto } from './dto/users-filters-query.dto'
import { GetAllUsersResDto } from './dto/get-all-users-res.dto'
import { GetUserResDto } from './dto/get-user-res.dto'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { IJwtPayload } from '../auth/jwt-tokens.service'

import { PaginationQueryDto } from 'src/common/helpers/pagination/dto/pagination-query.dto'
import { User } from 'src/common/decorators/user.decorator'
import { ERROR_RESPONSES } from 'src/common/consts/error-responses.const'

@Controller('api/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Getting paginated users' })
  @ApiResponse({
    status: 200,
    description: 'Returns a set of users',
    type: GetAllUsersResDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async getAllUsers(
    @Query() paginationQuery: PaginationQueryDto,
    @Query() usersFilters: UsersFiltersQueryDto,
  ): Promise<GetAllUsersResDto> {
    const { limit, page } = paginationQuery
    return await this.userService.getAllUsers(limit, page, usersFilters)
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Getting your own user' })
  @ApiResponse({
    status: 200,
    description: 'Returns your own user',
    type: GetUserResDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  getUser(@User() user: IJwtPayload): GetUserResDto {
    return this.userService.getUser(user)
  }

  @Delete('/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletion your own user' })
  @ApiResponse({
    status: 200,
    description: 'Returns your own deleted user',
    type: GetUserResDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async deleteUser(@User() user: IJwtPayload): Promise<GetUserResDto> {
    return await this.userService.deleteUser(user)
  }
}
