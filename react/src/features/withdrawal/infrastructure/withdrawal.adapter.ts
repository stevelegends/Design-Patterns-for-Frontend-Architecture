import type { Withdrawal, WithdrawalDto } from '../domain/withdrawal.model';

export function toWithdrawal(dto: WithdrawalDto): Withdrawal {
  return {
    id: String(dto.withdrawal_id),
    amount: dto.amount_value,
    currency: dto.currency_code,
    status: dto.state.toLowerCase() as Withdrawal['status'],
    createdAt: new Date(dto.created_at),
  };
}
