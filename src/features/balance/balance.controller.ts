import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { BalanceService } from './balance.service'
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface'

import { User } from 'src/common/decorators/user.decorator'
import { AllTransactionsResDto } from './dto/all-transactions-res.dto'
import { TransactionResDto } from './dto/transaction-res.dto'
import { TransferTransactionResDto } from './dto/transfer-transaction-res.dto'
import { PaginationQueryDto } from 'src/common/helpers/pagination/dto/pagination-query.dto'
import { BalanceAmountDto } from './dto/balance-amount.dto'
import { ERROR_RESPONSES } from 'src/common/consts/error-responses.const'

@Controller('/balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get('/transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated transactions' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated transactions',
    type: AllTransactionsResDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.NOT_FOUND_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  getTransactions(
    @User() user: IJwtPayload,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.balanceService.getPaginatedTransactions(
      user.id,
      paginationQuery.limit,
      paginationQuery.page,
    )
  }

  @Post('/add')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Top up your balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns a adding transaction',
    type: TransactionResDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.NOT_FOUND_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async add(@User() user: IJwtPayload, @Body() amountDto: BalanceAmountDto) {
    return await this.balanceService.add(user.id, amountDto.amount)
  }

  @Post('/subtract')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reduce your balance' })
  @ApiResponse({
    status: 200,
    description: 'Returns a subtracting transaction',
    type: TransactionResDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.NOT_FOUND_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async subtract(
    @User() user: IJwtPayload,
    @Body() amountDto: BalanceAmountDto,
  ) {
    return await this.balanceService.subtract(user.id, amountDto.amount)
  }

  @Post('/transfer/:recipientId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Make a transfer between two users' })
  @ApiResponse({
    status: 200,
    description: 'Returns a transfer transaction',
    type: TransferTransactionResDto,
  })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.NOT_FOUND_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.SAME_USER_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async transfer(
    @User() user: IJwtPayload,
    @Param('recipientId') recipientId: number,
    @Body() amountDto: BalanceAmountDto,
  ) {
    return await this.balanceService.transfer(
      user.id,
      recipientId,
      amountDto.amount,
    )
  }

  @Post('/reset-all-to-zero')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resets the balance of all users' })
  @ApiResponse(ERROR_RESPONSES.UNAUTHORIZED_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.BAD_REQUEST_EXCEPTION)
  @ApiResponse(ERROR_RESPONSES.INTERNAL_SERVER_ERROR_EXCEPTION)
  async resetAllToZero() {
    return await this.balanceService.resetAllUsersBalance()
  }
}
