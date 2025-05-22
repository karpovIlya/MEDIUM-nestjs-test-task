import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { AuthModule } from '../auth/auth.module'
import { BalanceModule } from '../balance/balance.module'
import { AvatarsModule } from '../avatars/avatars.module'

import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UsersRepository } from './repositories/users.repository'
import { User } from './models/users.model'

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => BalanceModule),
    forwardRef(() => AvatarsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
