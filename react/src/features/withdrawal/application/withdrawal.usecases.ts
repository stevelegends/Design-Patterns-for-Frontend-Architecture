import type { WithdrawalFlowState, WithdrawalInput } from '../domain/withdrawal.model';
import {
  BankAccountRepository,
  DeviceRepository,
  UserRepository,
  WalletRepository,
  ApiWithdrawalRepository,
} from '../infrastructure/withdrawal.repository';
import {
  BalanceValidator,
  BankAccountValidator,
  DailyLimitValidator,
  MinimumAmountValidator,
  VerifiedUserValidator,
  WithdrawalValidationService,
  WithdrawalVerificationPolicy,
} from './validation';
import { WithdrawalSubmissionBuilder } from './withdrawal.builder';

class FaceVerificationRepository {
  async verify(): Promise<{ faceToken: string }> {
    throw new Error('Face verification failed: the face could not be verified. Please try again.');
  }
}

class OtpRepository {
  async verify(otpCode: string): Promise<{ otpToken: string }> {
    if (otpCode !== '123456') {
      throw new Error('Invalid OTP code.');
    }

    return { otpToken: 'otp-token-xyz' };
  }
}

export class StartWithdrawalUseCase {
  constructor(
    private walletRepository: WalletRepository,
    private userRepository: UserRepository,
    private bankAccountRepository: BankAccountRepository,
    private validationService: WithdrawalValidationService,
    private verificationPolicy: WithdrawalVerificationPolicy,
  ) {}

  async execute(input: WithdrawalInput): Promise<WithdrawalFlowState> {
    const wallet = await this.walletRepository.getWallet();
    const user = await this.userRepository.getCurrentUser();
    const bankAccount = await this.bankAccountRepository.getById(input.bankAccountId);

    this.validationService.validate({
      amount: input.amount,
      balance: wallet.balance,
      minAmount: wallet.minWithdrawalAmount,
      dailyRemainingLimit: wallet.dailyRemainingWithdrawalLimit,
      isUserVerified: user.isVerified,
      isBankAccountActive: bankAccount.isActive,
    });

    if (this.verificationPolicy.requiresFaceVerification(input.amount)) {
      return { status: 'face_verification_required', input };
    }

    return { status: 'ready_to_submit', input };
  }
}

export class CompleteFaceVerificationUseCase {
  constructor(private faceVerificationRepository: FaceVerificationRepository) {}

  async execute(input: WithdrawalInput, attemptCount = 0, maxAttempts = 5): Promise<WithdrawalFlowState> {
    try {
      const result = await this.faceVerificationRepository.verify();
      return { status: 'otp_required', input, faceToken: result.faceToken };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Face verification failed.';
      const nextAttemptCount = attemptCount + 1;

      if (nextAttemptCount >= maxAttempts) {
        return { status: 'retry_limit_reached', input, retryAfterMinutes: 5 };
      }

      return {
        status: 'face_verification_failed',
        input,
        reason,
        attemptCount: nextAttemptCount,
        maxAttempts,
        retryAfterMinutes: 5,
      };
    }
  }
}

export class CompleteOtpVerificationUseCase {
  constructor(private otpRepository: OtpRepository) {}

  async execute(params: {
    input: WithdrawalInput;
    faceToken: string;
    otpCode: string;
  }): Promise<WithdrawalFlowState> {
    const result = await this.otpRepository.verify(params.otpCode);
    return {
      status: 'ready_to_submit',
      input: params.input,
      faceToken: params.faceToken,
      otpToken: result.otpToken,
    };
  }
}

export class SubmitWithdrawalUseCase {
  constructor(
    private withdrawalRepository: ApiWithdrawalRepository,
    private deviceRepository: DeviceRepository,
  ) {}

  async execute(params: {
    input: WithdrawalInput;
    faceToken?: string;
    otpToken?: string;
  }) {
    const device = await this.deviceRepository.getDeviceInfo();
    const payload = new WithdrawalSubmissionBuilder()
      .withInput(params.input)
      .withFaceVerification(params.faceToken)
      .withOtpVerification(params.otpToken)
      .withDevice(device)
      .build();

    return this.withdrawalRepository.submit(payload);
  }
}

export const withdrawalValidationService = new WithdrawalValidationService([
  new VerifiedUserValidator(),
  new BalanceValidator(),
  new MinimumAmountValidator(),
  new DailyLimitValidator(),
  new BankAccountValidator(),
]);

export const startWithdrawalUseCase = new StartWithdrawalUseCase(
  new WalletRepository(),
  new UserRepository(),
  new BankAccountRepository(),
  withdrawalValidationService,
  new WithdrawalVerificationPolicy(),
);

export const completeFaceVerificationUseCase = new CompleteFaceVerificationUseCase(
  new FaceVerificationRepository(),
);

export const completeOtpVerificationUseCase = new CompleteOtpVerificationUseCase(
  new OtpRepository(),
);

export const submitWithdrawalUseCase = new SubmitWithdrawalUseCase(
  new ApiWithdrawalRepository(),
  new DeviceRepository(),
);
