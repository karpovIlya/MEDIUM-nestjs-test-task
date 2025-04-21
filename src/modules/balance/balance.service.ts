import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common'

import { BalanceRepository } from './balance.repository'
import { TransactionRepository } from './transaction.repository'
import { BalanceProducer } from './balance.producer'
import { TransactionResDto } from './dto/transaction-res.dto'
import { TransferTransactionResDto } from './dto/transfer-transaction-res.dto'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'
import { Pagination } from 'src/common/helpers/pagination/pagination.helper'

@Injectable()
export class BalanceService {
  constructor(
    private readonly balanceRepository: BalanceRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly balanceProducer: BalanceProducer,
  ) {}

  async getPaginatedTransactions(userId: number, limit: number, page: number) {
    const transactionsCount =
      await this.transactionRepository.getUserTransactionsCount(userId)
    const transactionsPagination = new Pagination({
      totalCount: transactionsCount,
      limit,
      page,
    })

    const paginatedTransactions =
      await this.transactionRepository.getPaginatedUserTransactions(
        userId,
        transactionsPagination.limit,
        transactionsPagination.offset,
      )

    return {
      transactions: paginatedTransactions.rows,
      pagination: transactionsPagination.pageData,
    }
  }

  async add(userId: number, amount: number): Promise<TransactionResDto> {
    const createdTransaction = await this.balanceRepository.addTransaction(
      userId,
      amount,
    )

    if (!createdTransaction) {
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      )
    }

    return createdTransaction.toJSON() as TransactionResDto
  }

  async subtract(userId: number, amount: number): Promise<TransactionResDto> {
    const createdTransaction = await this.balanceRepository.subtractTransaction(
      userId,
      amount,
    )

    if (!createdTransaction) {
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      )
    }

    return createdTransaction.toJSON() as TransactionResDto
  }

  async transfer(
    senderId: number,
    recipientId: number,
    amount: number,
  ): Promise<TransferTransactionResDto> {
    if (senderId === recipientId) {
      throw new BadRequestException(ERROR_MESSAGES.SAME_USER)
    }

    const { senderTransaction, recipientTransaction } =
      await this.balanceRepository.transferTransaction(
        senderId,
        recipientId,
        amount,
      )

    if (!senderTransaction || !recipientTransaction) {
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      )
    }

    return {
      senderTransaction: senderTransaction.toJSON() as TransactionResDto,
      recipientTransaction: recipientTransaction.toJSON() as TransactionResDto,
    }
  }

  async resetAllUsersBalance() {
    await this.balanceProducer.addResetAllUsersBalanceJob()

    return {
      message: 'Reset all users balance job added to queue',
    }
  }
}
