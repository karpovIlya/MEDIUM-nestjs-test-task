import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class TokensResDto {
  @IsString()
  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string

  @IsString()
  @ApiProperty({ description: 'Access token' })
  accessToken: string
}
