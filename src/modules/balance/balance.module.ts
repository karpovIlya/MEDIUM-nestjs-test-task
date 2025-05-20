import { Module, forwardRef } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { BullModule } from '@nestjs/bullmq'

import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'

import { BalanceController } from './balance.controller'
import { BalanceService } from './balance.service'
import { BalanceRepository } from './balance.repository'
import { BalanceProducer } from './balance.producer'
import { BalanceProcessor } from './balance.processor'
import { TransactionRepository } from './transaction.repository'

import { Transactions } from './transactions.model'

@Module({
  controllers: [BalanceController],
  providers: [
    BalanceService,
    BalanceRepository,
    TransactionRepository,
    BalanceProducer,
    BalanceProcessor,
  ],
  imports: [
    SequelizeModule.forFeature([Transactions]),
    BullModule.registerQueue({
      name: 'balance',
    }),
    forwardRef(() => UsersModule),
    AuthModule,
  ],
  exports: [TransactionRepository],
})
export class BalanceModule {}
