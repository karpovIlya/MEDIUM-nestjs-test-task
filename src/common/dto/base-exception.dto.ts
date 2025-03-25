import { IsInt, IsPositive, IsString, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class BaseExceptionDto {
  @IsInt()
  @Min(100)
  @IsPositive()
  @ApiProperty({ description: 'Exception status code', minimum: 400 })
  code: number

  @IsString({ each: true })
  @ApiProperty({
    description: 'Exception message',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[]
}
