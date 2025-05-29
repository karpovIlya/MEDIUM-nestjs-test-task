export type TTransactionType = 'adding' | 'subtraction'
export interface ITransaction {
  id?: number
  type: TTransactionType
  amount: number
  userId: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}
