import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtTokensSevice } from './jwt-tokens.service'
import { SessionRepository } from './sessions.repository'

import { UsersModule } from '../users/users.module'
import { User } from '../users/users.model'

import { Session } from './sessions.model'

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtTokensSevice, SessionRepository],
  imports: [
    SequelizeModule.forFeature([User, Session]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'SECRET',
      signOptions: {
        expiresIn: '15m',
      },
    }),
    forwardRef(() => UsersModule),
  ],
  exports: [AuthService, JwtTokensSevice, SessionRepository],
})
export class AuthModule {}
