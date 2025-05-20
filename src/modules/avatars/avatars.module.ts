import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { FilesModule } from 'src/providers/files/files.module'
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'

import { AvatarsController } from './avatars.controller'
import { AvatarsRepository } from './avatars.repository'
import { AvatarsService } from './avatars.service'
import { Avatar } from './avatars.model'

@Module({
  controllers: [AvatarsController],
  providers: [AvatarsService, AvatarsRepository],
  imports: [
    SequelizeModule.forFeature([Avatar]),
    forwardRef(() => UsersModule),
    FilesModule,
    AuthModule,
  ],
})
export class AvatarsModule {}
