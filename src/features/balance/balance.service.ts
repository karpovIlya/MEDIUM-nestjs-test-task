import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common'

import { BalanceRepository } from './repositories/balance.repository'
import { TransactionRepository } from './repositories/transaction.repository'
import { BalanceProducer } from './producers/balance.producer'

import { AllTransactionsResDto } from './dto/all-transactions-res.dto'
import { TransactionResDto } from './dto/transaction-res.dto'
import { TransferTransactionResDto } from './dto/transfer-transaction-res.dto'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'
import { Pagination } from 'src/common/helpers/pagination/pagination.helper'

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name)

  constructor(
    private readonly balanceRepository: BalanceRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly balanceProducer: BalanceProducer,
  ) {}

  async getPaginatedTransactions(
    userId: number,
    limit: number,
    page: number,
  ): Promise<AllTransactionsResDto> {
    this.logger.log('🔍 Beginning of getting paginated transactions')

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

    this.logger.log('✅ Getting paginated transactions was successful')

    return {
      transactions: paginatedTransactions,
      pagination: transactionsPagination.pageData,
    }
  }

  async add(userId: number, amount: number): Promise<TransactionResDto> {
    this.logger.log('🔍 Beginning of adding transaction')

    const createdTransaction = await this.balanceRepository.addTransaction(
      userId,
      amount,
    )

    if (!createdTransaction) {
      this.logger.error('❌ Internal server error')
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      )
    }

    this.logger.log('✅ Adding transaction was successful')

    return createdTransaction
  }

  async subtract(userId: number, amount: number): Promise<TransactionResDto> {
    this.logger.log('🔍 Beginning of subtracting transaction')

    const createdTransaction = await this.balanceRepository.subtractTransaction(
      userId,
      amount,
    )

    if (!createdTransaction) {
      this.logger.error('❌ Internal server error')
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      )
    }

    this.logger.log('✅ Subtracting transaction was successful')

    return createdTransaction
  }

  async transfer(
    senderId: number,
    recipientId: number,
    amount: number,
  ): Promise<TransferTransactionResDto> {
    this.logger.log('🔍 Beginning of transferring transaction')

    if (senderId === recipientId) {
      this.logger.error('❌ Same user')
      throw new BadRequestException(ERROR_MESSAGES.SAME_USER)
    }

    const { senderTransaction, recipientTransaction } =
      await this.balanceRepository.transferTransaction(
        senderId,
        recipientId,
        amount,
      )

    if (!senderTransaction || !recipientTransaction) {
      this.logger.error('❌ Internal server error')
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      )
    }

    this.logger.log('✅ Transferring transaction was successful')

    return {
      senderTransaction: senderTransaction,
      recipientTransaction: recipientTransaction,
    }
  }

  async resetAllUsersBalance() {
    await this.balanceProducer.addResetAllUsersBalanceJob()

    return {
      message: 'Reset all users balance job added to queue',
    }
  }
}
