import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FilesModule } from 'src/providers/files/files.module'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'

import { AvatarsController } from './avatars.controller'
import { AvatarsRepository } from './repositories/avatars.repository'
import { AvatarsService } from './avatars.service'
import { Avatar } from './models/avatars.model'

@Module({
  imports: [
    SequelizeModule.forFeature([Avatar]),
    forwardRef(() => UsersModule),
    FilesModule,
    AuthModule,
  ],
  controllers: [AvatarsController],
  providers: [AvatarsService, AvatarsRepository],
  exports: [AvatarsRepository],
})
export class AvatarsModule {}
