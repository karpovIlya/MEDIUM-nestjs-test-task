import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtTokensSevice } from './jwt-tokens.service'
import { SessionRepository } from './repositories/sessions.repository'

import { UsersModule } from '../users/users.module'
import { User } from '../users/models/users.model'

import { Session } from './models/sessions.model'

import { getJwtConfig } from 'src/common/configs/jwt.config'

@Module({
  imports: [
    SequelizeModule.forFeature([User, Session]),
    JwtModule.registerAsync(getJwtConfig()),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtTokensSevice, SessionRepository],
  exports: [AuthService, JwtTokensSevice, SessionRepository],
})
export class AuthModule {}
