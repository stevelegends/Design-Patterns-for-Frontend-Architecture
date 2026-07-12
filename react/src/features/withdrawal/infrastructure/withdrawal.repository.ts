import type {
  BankAccount,
  DeviceInfo,
  User,
  Wallet,
  Withdrawal,
  WithdrawalDto,
  WithdrawalSubmissionPayload,
} from '../domain/withdrawal.model';
import { toWithdrawal } from './withdrawal.adapter';

export interface WithdrawalRepository {
  submit(payload: WithdrawalSubmissionPayload): Promise<Withdrawal>;
}

const withdrawalApi = {
  async submit(payload: WithdrawalSubmissionPayload): Promise<WithdrawalDto> {
    return {
      withdrawal_id: 1001,
      amount_value: payload.amount,
      currency_code: payload.currency,
      state: 'PENDING',
      created_at: new Date().toISOString(),
    };
  },
};

export class ApiWithdrawalRepository implements WithdrawalRepository {
  async submit(payload: WithdrawalSubmissionPayload): Promise<Withdrawal> {
    const dto = await withdrawalApi.submit(payload);
    return toWithdrawal(dto);
  }
}

export class WalletRepository {
  async getWallet(): Promise<Wallet> {
    return {
      balance: 50_000_000,
      minWithdrawalAmount: 100_000,
      dailyRemainingWithdrawalLimit: 30_000_000,
    };
  }
}

export class UserRepository {
  async getCurrentUser(): Promise<User> {
    return {
      id: 'user-1',
      isVerified: true,
    };
  }
}

export class BankAccountRepository {
  async getById(id: string): Promise<BankAccount> {
    return {
      id,
      isActive: true,
    };
  }
}

export class DeviceRepository {
  async getDeviceInfo(): Promise<DeviceInfo> {
    return {
      id: 'device-123',
      platform: 'ios',
      appVersion: '1.0.0',
    };
  }
}
