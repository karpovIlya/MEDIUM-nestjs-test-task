import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class NewAccessTokenDto {
  @IsString()
  @ApiProperty({ description: 'Updated access token' })
  newAccessToken: string
}
