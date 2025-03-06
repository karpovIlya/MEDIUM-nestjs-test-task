import { Table, Model, Column, DataType, HasOne } from 'sequelize-typescript'
import { Session } from '../auth/sessions.model'

interface IUserCreationAttrs {
  login: string
  age: number
  description: string
  email: string
  password: string
}

@Table({
  tableName: 'users',
  createdAt: false,
  updatedAt: false,
})
export class User extends Model<User, IUserCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  login: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
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

  @HasOne(() => Session, { onDelete: 'cascade' })
  session: Session
}
