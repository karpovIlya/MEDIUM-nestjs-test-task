import { Table, Model, Column, DataType, HasOne } from 'sequelize-typescript'
import { Session } from '../auth/sessions.model'

interface IUserCreationAttrs {
  login: string
  age: number
  description: string
  email: string
  password: string
}

@Table({ tableName: 'users', paranoid: true })
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
    type: DataType.DATE,
    allowNull: true,
  })
  declare deletedAt: Date | null

  @HasOne(() => Session)
  session: Session
}
