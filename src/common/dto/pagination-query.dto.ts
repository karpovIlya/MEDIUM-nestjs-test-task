import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class PaginationQueryDto {
  @Min(1)
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @ApiProperty({
    description: 'The limit of a elements on a page',
    default: 10,
    required: false,
  })
  limit: number = 10

  @Min(1)
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @ApiProperty({ description: 'The page number', default: 1, required: false })
  page: number = 1
}
