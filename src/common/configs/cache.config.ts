import { ConfigModule, ConfigService } from '@nestjs/config'
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager'
import { createKeyv } from '@keyv/redis'
import { Keyv } from 'keyv'
import { CacheableMemory } from 'cacheable'
import { seconds } from '../helpers/time.helper'

const getRedisUrl = (configService: ConfigService): string => {
  const host = configService.get('REDIS_HOST')
  const port = configService.get('REDIS_PORT')

  return `redis://${host}:${port}`
}

export const getCacheConfig = (): CacheModuleAsyncOptions => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    ttl: seconds(30),
    stores: [
      new Keyv({ store: new CacheableMemory() }),
      createKeyv(getRedisUrl(configService)),
    ],
  }),
})
