export interface ISession {
  id?: number
  refreshToken: string
  userId: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}
