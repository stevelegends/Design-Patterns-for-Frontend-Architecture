export type WithdrawalMethod = 'bank_transfer' | 'instant';

export type WithdrawalInput = {
  amount: number;
  currency: string;
  bankAccountId: string;
  method: WithdrawalMethod;
};

export type Withdrawal = {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  createdAt: Date;
};

export type WithdrawalDto = {
  withdrawal_id: number;
  amount_value: number;
  currency_code: string;
  state: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  created_at: string;
};

export type WithdrawalSubmissionPayload = {
  amount: number;
  currency: string;
  bankAccountId: string;
  method: WithdrawalMethod;
  faceVerificationToken?: string;
  otpVerificationToken?: string;
  device: {
    id: string;
    platform: string;
    appVersion: string;
  };
};

export type Wallet = {
  balance: number;
  minWithdrawalAmount: number;
  dailyRemainingWithdrawalLimit: number;
};

export type User = {
  id: string;
  isVerified: boolean;
};

export type BankAccount = {
  id: string;
  isActive: boolean;
};

export type DeviceInfo = {
  id: string;
  platform: string;
  appVersion: string;
};

export type WithdrawalValidationContext = {
  amount: number;
  balance: number;
  minAmount: number;
  dailyRemainingLimit: number;
  isUserVerified: boolean;
  isBankAccountActive: boolean;
};

export type WithdrawalFlowState =
  | { status: 'editing' }
  | { status: 'validating' }
  | { status: 'face_verification_required'; input: WithdrawalInput }
  | {
      status: 'face_verification_failed';
      input: WithdrawalInput;
      reason: string;
      attemptCount: number;
      maxAttempts: number;
      retryAfterMinutes: number;
    }
  | {
      status: 'retry_limit_reached';
      input: WithdrawalInput;
      retryAfterMinutes: number;
    }
  | { status: 'otp_required'; input: WithdrawalInput; faceToken: string }
  | {
      status: 'ready_to_submit';
      input: WithdrawalInput;
      faceToken?: string;
      otpToken?: string;
    }
  | { status: 'submitting' }
  | { status: 'success'; withdrawal: Withdrawal }
  | { status: 'error'; message: string };
