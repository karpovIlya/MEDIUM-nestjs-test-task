import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { User } from 'src/features/users/models/users.model'
import { ISession } from 'src/common/interfaces/session.interface'

@Table({ tableName: 'sessions' })
export class Session extends Model<Session, ISession> {
  @Column({
    type: DataType.TEXT,
    unique: true,
    allowNull: false,
  })
  refreshToken: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @ForeignKey(() => User)
  userId: number

  @BelongsTo(() => User)
  user: User
}
