import { Component } from '@angular/core';
import type { WithdrawalFlowState, WithdrawalInput } from '../domain/withdrawal.model';
import {
  completeFaceVerificationUseCase,
  completeOtpVerificationUseCase,
  startWithdrawalUseCase,
  submitWithdrawalUseCase,
} from '../application/withdrawal.usecases';

@Component({
  selector: 'app-withdrawal',
  template: `
    <div>
      <h3>Withdrawal Flow</h3>

      <div *ngIf="state.status === 'editing'">
        <label>Withdrawal Amount</label>
        <input [(ngModel)]="amountInput" type="number" />
        <button (click)="startWithdrawal()">Continue</button>
      </div>

      <div *ngIf="state.status === 'validating'">Validating withdrawal...</div>

      <div *ngIf="state.status === 'face_verification_required'">
        <p>Face verification is required for this withdrawal.</p>
        <button (click)="completeFaceVerification()">Complete Face Verification</button>
      </div>

      <div *ngIf="state.status === 'face_verification_failed'">
        <p>Face verification failed</p>
        <p>{{ state.reason }}</p>
        <p>Attempt {{ state.attemptCount }} of {{ state.maxAttempts }}</p>
        <button (click)="completeFaceVerification()">Retry</button>
      </div>

      <div *ngIf="state.status === 'retry_limit_reached'">
        <p>Retry limit reached</p>
        <p>Please try again in {{ state.retryAfterMinutes }} minutes.</p>
      </div>

      <div *ngIf="state.status === 'otp_required'">
        <label>Enter OTP</label>
        <input [(ngModel)]="otpCode" type="text" />
        <button (click)="completeOtp()">Verify OTP</button>
      </div>

      <div *ngIf="state.status === 'ready_to_submit'">
        <p>Review Withdrawal</p>
        <p>Amount: {{ state.input.amount }}</p>
        <p>Currency: {{ state.input.currency }}</p>
        <button (click)="submitWithdrawal()">Confirm Withdrawal</button>
      </div>

      <div *ngIf="state.status === 'submitting'">Submitting withdrawal...</div>

      <div *ngIf="state.status === 'success'">
        <p>Withdrawal Created</p>
        <p>ID: {{ state.withdrawal.id }}</p>
        <p>Status: {{ state.withdrawal.status }}</p>
        <button (click)="reset()">Done</button>
      </div>

      <div *ngIf="state.status === 'error'">
        <p>Error: {{ state.message }}</p>
        <button (click)="reset()">Try Again</button>
      </div>
    </div>
  `,
})
export class WithdrawalComponent {
  state: WithdrawalFlowState = { status: 'editing' };
  amountInput = '12000000';
  otpCode = '123456';

  private getInput(): WithdrawalInput {
    return {
      amount: Number(this.amountInput),
      currency: 'VND',
      bankAccountId: 'bank-account-1',
      method: 'bank_transfer',
    };
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong.';
  }

  async startWithdrawal(): Promise<void> {
    try {
      this.state = { status: 'validating' };
      const nextState = await startWithdrawalUseCase.execute(this.getInput());
      this.state = nextState;
    } catch (error) {
      this.state = { status: 'error', message: this.getErrorMessage(error) };
    }
  }

  async completeFaceVerification(): Promise<void> {
    if (this.state.status !== 'face_verification_required' && this.state.status !== 'face_verification_failed') {
      return;
    }

    const attemptCount = this.state.status === 'face_verification_failed' ? this.state.attemptCount : 0;

    try {
      const nextState = await completeFaceVerificationUseCase.execute(this.getInput(), attemptCount);
      this.state = nextState;

      if (this.state.status === 'face_verification_failed') {
        window.alert(this.state.reason);
      }

      if (this.state.status === 'retry_limit_reached') {
        window.alert(`Please try again in ${this.state.retryAfterMinutes} minutes.`);
      }
    } catch (error) {
      this.state = { status: 'error', message: this.getErrorMessage(error) };
    }
  }

  async completeOtp(): Promise<void> {
    if (this.state.status !== 'otp_required') {
      return;
    }

    try {
      const nextState = await completeOtpVerificationUseCase.execute({
        input: this.state.input,
        faceToken: this.state.faceToken,
        otpCode: this.otpCode,
      });
      this.state = nextState;
    } catch (error) {
      this.state = { status: 'error', message: this.getErrorMessage(error) };
    }
  }

  async submitWithdrawal(): Promise<void> {
    if (this.state.status !== 'ready_to_submit') {
      return;
    }

    const readyState = this.state;

    try {
      this.state = { status: 'submitting' };
      const withdrawal = await submitWithdrawalUseCase.execute({
        input: readyState.input,
        faceToken: readyState.faceToken,
        otpToken: readyState.otpToken,
      });

      this.state = { status: 'success', withdrawal };
    } catch (error) {
      this.state = { status: 'error', message: this.getErrorMessage(error) };
    }
  }

  reset(): void {
    this.state = { status: 'editing' };
  }
}
