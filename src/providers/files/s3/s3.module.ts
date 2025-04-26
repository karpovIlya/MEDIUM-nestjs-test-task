import * as AWS from '@aws-sdk/client-s3'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { S3Lib } from './constants/do-spaces-service-lib.constant'
import { S3Service } from './s3.service'

@Module({
  imports: [ConfigModule],
  providers: [
    S3Service,
    {
      provide: S3Lib,
      useFactory: () => {
        return new AWS.S3({
          endpoint: `http://${process.env.MINIO_HOST}:${process.env.MINIO_PORT}`,
          region: 'ru-central1',
          credentials: {
            accessKeyId: process.env.MINIO_ACCESS_KEY || '',
            secretAccessKey: process.env.MINIO_SECRET_KEY || '',
          },
        })
      },
    },
  ],
  exports: [S3Service, S3Lib],
})
export class S3Module {}
