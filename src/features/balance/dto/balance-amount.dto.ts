import { IsNumber, IsPositive, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class BalanceAmountDto {
  @Min(10)
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Amount of money to add/subtract/transfer',
    example: 100,
    minimum: 10,
  })
  amount: number
}
