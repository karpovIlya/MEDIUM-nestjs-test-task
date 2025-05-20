import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RemoveFilePayloadDto {
  @ApiProperty({
    example: '/profiles/avatars/123',
  })
  @IsString()
  @IsNotEmpty()
  readonly path: string
}
