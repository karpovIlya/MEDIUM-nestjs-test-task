import { ApiProperty } from '@nestjs/swagger'
import { TransactionResDto } from './transaction-res.dto'

export class TransferTransactionResDto {
  @ApiProperty({
    description: 'Transaction of the sender',
    type: TransactionResDto,
  })
  senderTransaction: TransactionResDto

  @ApiProperty({
    description: 'Transaction of the recipient',
    type: TransactionResDto,
  })
  recipientTransaction: TransactionResDto
}
