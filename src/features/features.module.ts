import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { BalanceModule } from './balance/balance.module'
import { AvatarsModule } from './avatars/avatars.module'

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'

@Module({
  imports: [UsersModule, AuthModule, BalanceModule, AvatarsModule],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class FeaturesModule {}
