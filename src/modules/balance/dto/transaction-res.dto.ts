import {
  IsInt,
  IsDate,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { TTransactionType } from '../transactions.model'

export class TransactionResDto {
  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: 'The ID of a transaction',
    example: 1,
    minimum: 1,
  })
  id: number

  @IsString()
  @ApiProperty({
    description: 'Type of transaction',
    example: 'adding',
  })
  type: TTransactionType

  @Min(0)
  @IsNumber()
  @ApiProperty({
    description: 'Amount of money to add/subtract/transfer',
    example: 100,
    minimum: 0,
  })
  amount: number

  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: 'User ID',
    example: 1,
    minimum: 1,
  })
  userId: number

  @IsDate()
  @IsOptional()
  createdAt?: Date

  @IsDate()
  @IsOptional()
  updatedAt?: Date

  @IsDate()
  @IsOptional()
  deletedAt?: Date | null
}
