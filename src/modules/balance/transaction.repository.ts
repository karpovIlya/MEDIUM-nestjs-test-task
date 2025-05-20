import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Transaction } from 'sequelize'

import { Transactions, ITransactionCreationAttrs } from './transactions.model'

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectModel(Transactions)
    private readonly transactionData: typeof Transactions,
  ) {}

  public async createTransaction(
    creatingTransaction: ITransactionCreationAttrs,
    transaction?: Transaction,
  ) {
    return await this.transactionData.create(creatingTransaction, {
      transaction,
    })
  }

  public async createManyTransactions(
    creatingTransactions: ITransactionCreationAttrs[],
    transaction?: Transaction,
  ) {
    return await this.transactionData.bulkCreate(creatingTransactions, {
      transaction,
    })
  }

  public async destroyTransaction(id: number) {
    return await this.transactionData.destroy({ where: { id } })
  }

  public async destroyAllUserTransactions(userId: number) {
    return await this.transactionData.destroy({ where: { userId } })
  }

  public async getUserTransactionsCount(userId: number) {
    return await this.transactionData.count({ where: { userId } })
  }

  public async getPaginatedUserTransactions(
    userId: number,
    limit: number,
    offset: number,
  ) {
    return await this.transactionData.findAndCountAll({
      where: { userId },
      offset,
      limit,
    })
  }
}
