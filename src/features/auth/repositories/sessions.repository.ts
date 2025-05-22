import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Session } from '../models/sessions.model'
import { SessionEntity } from '../entities/session.entity'

import { ERROR_MESSAGES } from 'src/common/consts/error-messages.const'

@Injectable()
export class SessionRepository {
  private readonly logger = new Logger(SessionRepository.name)

  constructor(
    @InjectModel(Session) private readonly sessionData: typeof Session,
  ) {}

  public async destroySession(userId: number) {
    this.logger.log('🔍 Beginning of destroying session')

    await this.sessionData.destroy({ where: { userId } })

    this.logger.log('✅ Destroying session was successful')
  }

  public async getSessionById(userId: number): Promise<SessionEntity> {
    this.logger.log('🔍 Beginning of getting session by id')

    const session = await this.sessionData.findOne({ where: { userId } })

    if (!session) {
      this.logger.error('❌ User not found')
      throw new NotFoundException(ERROR_MESSAGES.NO_SESSION_WITH_THIS_ID)
    }

    this.logger.log('✅ Getting session by id was successful')

    return new SessionEntity(session.toJSON())
  }

  public async addSession(userId: number, refreshToken: string) {
    this.logger.log('🔍 Beginning of adding session')

    const session = await this.sessionData.create({ userId, refreshToken })

    this.logger.log('✅ Adding user was successful')

    return new SessionEntity(session.toJSON())
  }
}
