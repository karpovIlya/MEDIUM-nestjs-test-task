import { Controller, Get, Delete, UseInterceptors, Query } from '@nestjs/common'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { UsersService } from './users.service'
import { UsersFiltersQueryDto } from './dto/users-filters-query.dto'
import { GetAllUsersResDto } from './dto/get-all-users-res.dto'
import { GetUserResDto } from './dto/get-user-res.dto'

import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface'

import { PaginationQueryDto } from 'src/common/helpers/pagination/dto/pagination-query.dto'
import { User } from 'src/common/decorators/user.decorator'
import { ERROR_RESPONSES } from 'src/common/consts/error-responses.const'

@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
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
  @UseInterceptors(CacheInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Getting your own user' })
  @ApiResponse({
    status: 200,
    description: 'Returns your own user',
    type: GetUserResDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async getUser(@User() user: IJwtPayload): Promise<GetUserResDto> {
    return await this.userService.getUser(user)
  }

  @Delete('/my')
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
