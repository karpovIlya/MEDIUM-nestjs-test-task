import { ConfigModule, ConfigService } from '@nestjs/config'
import { SharedBullAsyncConfiguration } from '@nestjs/bullmq'

export const getBullConfig = (): SharedBullAsyncConfiguration => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    connection: {
      host: configService.get('REDIS_HOST'),
      port: +configService.get('REDIS_PORT'),
    },
    prefix: 'queue',
  }),
})
