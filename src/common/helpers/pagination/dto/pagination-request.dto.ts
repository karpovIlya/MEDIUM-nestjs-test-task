import { IsNumber, IsPositive, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class PaginationReqDto {
  @Min(1)
  @IsPositive()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  limit: number

  @Min(1)
  @IsPositive()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  page: number

  @Min(0)
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  totalCount: number
}
