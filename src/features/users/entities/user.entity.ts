import { IUser } from 'src/common/interfaces/user.interface'
import { compare, genSalt, hash } from 'bcryptjs'

export class UserEntity implements IUser {
  id?: number
  login: string
  email: string
  password: string
  age: number
  description: string
  balance?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null

  constructor(user: IUser) {
    this.id = user.id
    this.login = user.login
    this.email = user.email
    this.password = user.password
    this.age = user.age
    this.description = user.description
    this.balance = user.balance
    this.createdAt = user.createdAt
    this.updatedAt = user.updatedAt
    this.deletedAt = user.deletedAt
  }

  public async setPasswordHash(password: string): Promise<UserEntity> {
    const salt = await genSalt(10)
    this.password = await hash(password, salt)
    return this
  }

  public async comparePassword(password: string) {
    return await compare(password, this.password)
  }
}
