import { Type } from 'class-transformer'
import {
  IsInt,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class PaginationPageDto {
  @IsInt()
  @Min(0)
  @ApiProperty({ description: 'Amount of elements in list', minimum: 0 })
  totalCount: number

  @IsInt()
  @Min(1)
  @ApiProperty({ description: 'Amount of pages in list', minimum: 1 })
  totalCountPage: number

  @IsInt()
  @Min(1)
  @ApiProperty({ description: 'Current page', minimum: 1 })
  currentPage: number
}

export class PaginationResDto {
  @Min(1)
  @IsPositive()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @ApiProperty({ description: 'The limit of a elements on a page', minimum: 1 })
  limit: number

  @Min(0)
  @IsPositive()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @ApiProperty({ description: 'The offset in table', minimum: 0 })
  offset: number

  @ValidateNested()
  @Type(() => PaginationPageDto)
  @ApiProperty({ type: PaginationPageDto })
  pageInfo: PaginationPageDto
}
