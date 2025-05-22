import { ConfigModule, ConfigService } from '@nestjs/config'
import { SequelizeModuleAsyncOptions } from '@nestjs/sequelize'

export const getSequelizeConfig = (): SequelizeModuleAsyncOptions => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    dialect: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: +configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    autoLoadModels: true,
    synchronize: true,
  }),
})
