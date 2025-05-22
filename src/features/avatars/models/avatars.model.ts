import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { User } from 'src/features/users/models/users.model'
import { IAvatar } from 'src/common/interfaces/avatar.interface'

@Table({ tableName: 'avatars' })
export class Avatar extends Model<Avatar, IAvatar> {
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
