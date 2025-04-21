import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize-typescript'

import { UsersRepository } from 'src/modules/users/users.repository'
import { TransactionRepository } from './transaction.repository'
import { TTransactionType } from './transactions.model'

@Injectable()
export class BalanceRepository {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly usersRepository: UsersRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  public async addTransaction(userId: number, addToBalance: number) {
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

      await transaction.commit()
      return createdTransaction
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  public async subtractTransaction(userId: number, subtractToBalance: number) {
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

      await transaction.commit()
      return createdTransaction
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  public async transferTransaction(
    senderId: number,
    recipientId: number,
    transferAmount: number,
  ) {
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

      await transaction.commit()

      return {
        senderTransaction: createdSenderTransaction,
        recipientTransaction: createdRecipientTransaction,
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  public async resetAllUsersBalance() {
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

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
