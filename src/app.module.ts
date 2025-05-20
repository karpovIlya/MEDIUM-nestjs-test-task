import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { BalanceModule } from './modules/balance/balance.module'
import { AvatarsModule } from './modules/avatars/avatars.module'

import { createKeyv } from '@keyv/redis'
import { Keyv } from 'keyv'
import { CacheableMemory } from 'cacheable'
import { CACHE_TTL } from './common/consts/cache-ttl.const'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadModels: true,
      models: [],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
      prefix: 'queue',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        ttl: CACHE_TTL.SMALL_TTL,
        stores: [
          new Keyv({
            store: new CacheableMemory(),
          }),
          createKeyv(
            `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
          ),
        ],
      }),
    }),
    UsersModule,
    AuthModule,
    BalanceModule,
    AvatarsModule,
  ],
})
export class AppModule {}
