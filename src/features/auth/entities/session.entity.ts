import { ISession } from 'src/common/interfaces/session.interface'

export class SessionEntity implements ISession {
  id?: number
  refreshToken: string
  userId: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null

  constructor(session: ISession) {
    this.id = session.id
    this.refreshToken = session.refreshToken
    this.userId = session.userId
    this.createdAt = session.createdAt
    this.updatedAt = session.updatedAt
    this.deletedAt = session.deletedAt
  }
}
