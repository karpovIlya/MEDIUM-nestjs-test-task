import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { User } from '../users/users.model'

export interface IAvatarCreationAttrs {
  userId: number
  path: string
}

@Table({ tableName: 'avatars' })
export class Avatar extends Model<Avatar, IAvatarCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number

  @Column({
    type: DataType.STRING(128),
    unique: true,
    allowNull: false,
  })
  path: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @ForeignKey(() => User)
  userId: number

  @BelongsTo(() => User)
  user: User
}
