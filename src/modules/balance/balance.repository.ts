import { Injectable, Logger } from '@nestjs/common'
import { InjectConnection } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize-typescript'

import { UsersRepository } from 'src/modules/users/users.repository'
import { TransactionRepository } from './transaction.repository'
import { TTransactionType } from './transactions.model'

@Injectable()
export class BalanceRepository {
  private readonly logger = new Logger(BalanceRepository.name)

  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly usersRepository: UsersRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  public async addTransaction(userId: number, addToBalance: number) {
    this.logger.log('🔍 Beginning of adding transaction')

    const transaction = await this.sequelize.transaction()

    try {
      await this.usersRepository.addUserBalance(
        userId,
        addToBalance,
        transaction,
      )

      const createdTransaction =
        await this.transactionRepository.createTransaction(
          {
            userId,
            amount: addToBalance,
            type: 'adding',
          },
          transaction,
        )

      this.logger.log('✅ Adding transaction was successful')

      await transaction.commit()
      return createdTransaction
    } catch (error) {
      this.logger.error('❌ Adding transaction failed')
      await transaction.rollback()
      throw error
    }
  }

  public async subtractTransaction(userId: number, subtractToBalance: number) {
    this.logger.log('🔍 Beginning of subtracting transaction')

    const transaction = await this.sequelize.transaction()

    try {
      await this.usersRepository.subtractUserBalance(
        userId,
        subtractToBalance,
        transaction,
      )

      const createdTransaction =
        await this.transactionRepository.createTransaction(
          {
            userId,
            amount: subtractToBalance,
            type: 'subtraction',
          },
          transaction,
        )

      this.logger.log('✅ Subtracting transaction was successful')

      await transaction.commit()
      return createdTransaction
    } catch (error) {
      this.logger.error('❌ Subtracting transaction failed')
      await transaction.rollback()
      throw error
    }
  }

  public async transferTransaction(
    senderId: number,
    recipientId: number,
    transferAmount: number,
  ) {
    this.logger.log('🔍 Beginning of transferring transaction')

    const transaction = await this.sequelize.transaction()

    try {
      await this.usersRepository.subtractUserBalance(
        senderId,
        transferAmount,
        transaction,
      )
      await this.usersRepository.addUserBalance(
        recipientId,
        transferAmount,
        transaction,
      )

      const createdSenderTransaction =
        await this.transactionRepository.createTransaction(
          {
            type: 'subtraction',
            amount: transferAmount,
            userId: senderId,
          },
          transaction,
        )
      const createdRecipientTransaction =
        await this.transactionRepository.createTransaction(
          {
            type: 'adding',
            amount: transferAmount,
            userId: recipientId,
          },
          transaction,
        )

      this.logger.log('✅ Transferring transaction was successful')

      await transaction.commit()

      return {
        senderTransaction: createdSenderTransaction,
        recipientTransaction: createdRecipientTransaction,
      }
    } catch (error) {
      this.logger.error('❌ Transferring transaction failed')
      await transaction.rollback()
      throw error
    }
  }

  public async resetAllUsersBalance() {
    this.logger.log('🔍 Beginning of resetting all users balance')

    const transaction = await this.sequelize.transaction()

    try {
      const users =
        await this.usersRepository.getAllUsersWithPositiveBalance(transaction)
      await this.usersRepository.resetAllUsersBalance(transaction)

      await this.transactionRepository.createManyTransactions(
        users.map((user) => ({
          userId: user.get('id'),
          amount: parseFloat(user.get('balance') as unknown as string),
          type: 'subtraction' as TTransactionType,
        })),
        transaction,
      )

      this.logger.log('✅ Resetting all users balance was successful')

      await transaction.commit()
    } catch (error) {
      this.logger.error('❌ Resetting all users balance failed')
      await transaction.rollback()
      throw error
    }
  }
}
