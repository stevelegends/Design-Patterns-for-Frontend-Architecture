import type { WithdrawalValidationContext } from '../domain/withdrawal.model';

export type WithdrawalValidator = {
  validate(context: WithdrawalValidationContext): void;
};

export class WithdrawalVerificationPolicy {
  requiresFaceVerification(totalAmount: number): boolean {
    return totalAmount > 10_000_000;
  }

  requiresOtp(totalAmount: number): boolean {
    return totalAmount > 10_000_000;
  }
}

export class VerifiedUserValidator implements WithdrawalValidator {
  validate(context: WithdrawalValidationContext) {
    if (!context.isUserVerified) {
      throw new Error('User must be verified before withdrawal.');
    }
  }
}

export class BalanceValidator implements WithdrawalValidator {
  validate(context: WithdrawalValidationContext) {
    if (context.amount > context.balance) {
      throw new Error('Insufficient balance.');
    }
  }
}

export class MinimumAmountValidator implements WithdrawalValidator {
  validate(context: WithdrawalValidationContext) {
    if (context.amount < context.minAmount) {
      throw new Error('Amount is below minimum withdrawal limit.');
    }
  }
}

export class DailyLimitValidator implements WithdrawalValidator {
  validate(context: WithdrawalValidationContext) {
    if (context.amount > context.dailyRemainingLimit) {
      throw new Error('Daily withdrawal limit exceeded.');
    }
  }
}

export class BankAccountValidator implements WithdrawalValidator {
  validate(context: WithdrawalValidationContext) {
    if (!context.isBankAccountActive) {
      throw new Error('Bank account is not active.');
    }
  }
}

export class WithdrawalValidationService {
  constructor(private validators: WithdrawalValidator[]) {}

  validate(context: WithdrawalValidationContext) {
    for (const validator of this.validators) {
      validator.validate(context);
    }
  }
}
