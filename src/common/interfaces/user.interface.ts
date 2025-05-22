export interface IUser {
  id?: number
  login: string
  age: number
  description: string
  email: string
  password: string
  balance?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}
