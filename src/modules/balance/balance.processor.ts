import { Injectable } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { BalanceRepository } from './balance.repository'
import { BALANCE_JOBS } from './balance.producer'

@Injectable()
@Processor('balance')
export class BalanceProcessor extends WorkerHost {
  constructor(private readonly balanceRepository: BalanceRepository) {
    super()
  }

  async process(job: Job): Promise<any> {
    const { name } = job

    switch (name) {
      case BALANCE_JOBS.RESET_ALL_USERS_BALANCE:
        await this.resetAllUsersBalance()
        break
    }
  }

  private async resetAllUsersBalance() {
    await this.balanceRepository.resetAllUsersBalance()
  }
}
