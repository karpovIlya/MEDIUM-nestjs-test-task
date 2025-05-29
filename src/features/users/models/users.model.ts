import {
  Table,
  Model,
  Column,
  DataType,
  HasOne,
  HasMany,
} from 'sequelize-typescript'
import { IUser } from 'src/common/interfaces/user.interface'
import { Session } from 'src/features/auth/models/sessions.model'
import { Transactions } from 'src/features/balance/models/transactions.model'
import { Avatar } from 'src/features/avatars/models/avatars.model'

@Table({ tableName: 'users', paranoid: true })
export class User extends Model<User, IUser> {
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  login: string

  @Column({
    type: DataType.SMALLINT,
    allowNull: false,
    validate: {
      min: 18,
      max: 100,
    },
  })
  age: number

  @Column({
    type: DataType.STRING(1024),
    allowNull: false,
  })
  description: string

  @Column({
    type: DataType.STRING(128),
    unique: true,
    allowNull: false,
  })
  email: string

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  password: string

  @Column({
    type: DataType.DECIMAL(9, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
    get(this: User) {
      const rawValue = String(this.getDataValue('balance'))
      return parseFloat(rawValue)
    },
  })
  balance: number

  @HasOne(() => Session)
  session: Session

  @HasMany(() => Transactions)
  transactions: Transactions

  @HasMany(() => Avatar)
  avatars: Avatar[]
}
