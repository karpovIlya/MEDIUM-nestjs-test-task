import {
  ITransaction,
  TTransactionType,
} from 'src/common/interfaces/transaction.interface'

export class TransactionEntity implements ITransaction {
  id?: number
  type: TTransactionType
  amount: number
  userId: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null

  constructor(transaction: ITransaction) {
    this.id = transaction.id
    this.type = transaction.type
    this.amount = transaction.amount
    this.userId = transaction.userId
    this.createdAt = transaction.createdAt
    this.updatedAt = transaction.updatedAt
    this.deletedAt = transaction.deletedAt
  }
}
