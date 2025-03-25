import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Session } from './sessions.model'

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session) private readonly sessionData: typeof Session,
  ) {}

  public async destroySession(userId: number) {
    return this.sessionData.destroy({ where: { userId } })
  }

  public async getSessionById(userId: number) {
    return this.sessionData.findOne({ where: { userId } })
  }

  public async addSession(userId: number, refreshToken: string) {
    return this.sessionData.create({ userId, refreshToken })
  }
}
