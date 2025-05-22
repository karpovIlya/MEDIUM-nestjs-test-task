import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { FeaturesModule } from './features/features.module'

import { getSequelizeConfig } from './common/configs/sequelize.config'
import { getBullConfig } from './common/configs/bull.config'
import { getCacheConfig } from './common/configs/cache.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SequelizeModule.forRootAsync(getSequelizeConfig()),
    BullModule.forRootAsync(getBullConfig()),
    CacheModule.registerAsync({
      isGlobal: true,
      ...getCacheConfig(),
    }),
    FeaturesModule,
  ],
})
export class AppModule {}
