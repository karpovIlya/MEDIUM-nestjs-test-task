import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { User } from '../users/users.model'

export type TTransactionType = 'adding' | 'subtraction'
export interface ITransactionCreationAttrs {
  type: TTransactionType
  amount: number
  userId: number
}

@Table({ tableName: 'transactions', paranoid: true })
export class Transactions extends Model<
  Transactions,
  ITransactionCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number

  @Column({
    type: DataType.ENUM('adding', 'subtraction'),
    allowNull: false,
  })
  type: TTransactionType

  @Column({
    type: DataType.DECIMAL(9, 2),
    allowNull: false,
    validate: {
      min: 10,
    },
  })
  amount: number

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare deletedAt: Date | null

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @ForeignKey(() => User)
  userId: number

  @BelongsTo(() => User)
  user: User
}
