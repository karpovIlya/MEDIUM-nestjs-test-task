import { IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

import { PaginationResDto } from 'src/common/helpers/pagination/dto/pagination-response.dto'
import { TransactionResDto } from './transaction-res.dto'

export class AllTransactionsResDto {
  @IsArray()
  @Type(() => TransactionResDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [TransactionResDto] })
  transactions: TransactionResDto[]

  @ValidateNested()
  @Type(() => PaginationResDto)
  @ApiProperty({ type: PaginationResDto })
  pagination: PaginationResDto
}
