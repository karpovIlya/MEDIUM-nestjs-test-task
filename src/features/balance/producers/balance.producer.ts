import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

export const BALANCE_JOBS = {
  RESET_ALL_USERS_BALANCE: 'resetAllUsersBalance',
}

@Injectable()
export class BalanceProducer {
  constructor(@InjectQueue('balance') private readonly balanceQueue: Queue) {}

  async addResetAllUsersBalanceJob() {
    await this.balanceQueue.add(BALANCE_JOBS.RESET_ALL_USERS_BALANCE, null)
  }
}
