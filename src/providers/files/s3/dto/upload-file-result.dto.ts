import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UploadFileResultDto {
  @ApiProperty({
    example: '/profiles/avatars',
  })
  @IsString()
  @IsNotEmpty()
  readonly path: string
}
