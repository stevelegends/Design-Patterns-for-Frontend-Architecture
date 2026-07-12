import type { DeviceInfo, WithdrawalInput, WithdrawalSubmissionPayload } from '../domain/withdrawal.model';

export class WithdrawalSubmissionBuilder {
  private payload: Partial<WithdrawalSubmissionPayload> = {};

  withInput(input: WithdrawalInput) {
    this.payload.amount = input.amount;
    this.payload.currency = input.currency;
    this.payload.bankAccountId = input.bankAccountId;
    this.payload.method = input.method;
    return this;
  }

  withFaceVerification(faceToken?: string) {
    if (faceToken) {
      this.payload.faceVerificationToken = faceToken;
    }
    return this;
  }

  withOtpVerification(otpToken?: string) {
    if (otpToken) {
      this.payload.otpVerificationToken = otpToken;
    }
    return this;
  }

  withDevice(device: DeviceInfo) {
    this.payload.device = {
      id: device.id,
      platform: device.platform,
      appVersion: device.appVersion,
    };
    return this;
  }

  build(): WithdrawalSubmissionPayload {
    if (!this.payload.amount) {
      throw new Error('Amount is required.');
    }

    if (!this.payload.currency) {
      throw new Error('Currency is required.');
    }

    if (!this.payload.bankAccountId) {
      throw new Error('Bank account is required.');
    }

    if (!this.payload.method) {
      throw new Error('Withdrawal method is required.');
    }

    if (!this.payload.device) {
      throw new Error('Device info is required.');
    }

    return this.payload as WithdrawalSubmissionPayload;
  }
}
