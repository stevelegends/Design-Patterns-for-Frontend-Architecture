import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import type { Withdrawal, WithdrawalFlowState, WithdrawalInput } from '../domain/withdrawal.model';
import {
  completeFaceVerificationUseCase,
  completeOtpVerificationUseCase,
  startWithdrawalUseCase,
  submitWithdrawalUseCase,
} from '../application/withdrawal.usecases';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function useWithdrawalViewModel() {
  const [state, setState] = useState<WithdrawalFlowState>({ status: 'editing' });

  async function start(input: WithdrawalInput) {
    try {
      setState({ status: 'validating' });
      const nextState = await startWithdrawalUseCase.execute(input);
      setState(nextState);
    } catch (error) {
      setState({ status: 'error', message: getErrorMessage(error) });
    }
  }

  async function completeFaceVerification() {
    if (state.status !== 'face_verification_required' && state.status !== 'face_verification_failed') return;

    const attemptCount = state.status === 'face_verification_failed' ? state.attemptCount : 0;

    try {
      const nextState = await completeFaceVerificationUseCase.execute(state.input, attemptCount);
      setState(nextState);
    } catch (error) {
      setState({ status: 'error', message: getErrorMessage(error) });
    }
  }

  async function completeOtp(otpCode: string) {
    if (state.status !== 'otp_required') return;

    try {
      const nextState = await completeOtpVerificationUseCase.execute({
        input: state.input,
        faceToken: state.faceToken,
        otpCode,
      });
      setState(nextState);
    } catch (error) {
      setState({ status: 'error', message: getErrorMessage(error) });
    }
  }

  async function submit() {
    if (state.status !== 'ready_to_submit') return;

    try {
      setState({ status: 'submitting' });
      const withdrawal = await submitWithdrawalUseCase.execute({
        input: state.input,
        faceToken: state.faceToken,
        otpToken: state.otpToken,
      });
      setState({ status: 'success', withdrawal });
    } catch (error) {
      setState({ status: 'error', message: getErrorMessage(error) });
    }
  }

  function reset() {
    setState({ status: 'editing' });
  }

  return {
    state,
    start,
    completeFaceVerification,
    completeOtp,
    submit,
    reset,
  };
}

function WithdrawalForm(props: { onSubmit: (input: WithdrawalInput) => void }) {
  const [amount, setAmount] = useState('12000000');

  function handleSubmit() {
    props.onSubmit({
      amount: Number(amount),
      currency: 'VND',
      bankAccountId: 'bank-account-1',
      method: 'bank_transfer',
    });
  }

  return (
    <View>
      <Text>Withdrawal Amount</Text>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginVertical: 12 }} />
      <Button title="Continue" onPress={handleSubmit} />
    </View>
  );
}

function LoadingView(props: { text?: string }) {
  return (
    <View>
      <Text>{props.text ?? 'Loading...'}</Text>
    </View>
  );
}

function FaceVerificationView(props: { onComplete: () => void }) {
  return (
    <View>
      <Text>Face verification is required for this withdrawal.</Text>
      <Button title="Complete Face Verification" onPress={props.onComplete} />
    </View>
  );
}

function OtpView(props: { onSubmit: (otpCode: string) => void }) {
  const [otpCode, setOtpCode] = useState('123456');

  return (
    <View>
      <Text>Enter OTP</Text>
      <TextInput value={otpCode} onChangeText={setOtpCode} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginVertical: 12 }} />
      <Button title="Verify OTP" onPress={() => props.onSubmit(otpCode)} />
    </View>
  );
}

function ReviewWithdrawalView(props: {
  state: Extract<WithdrawalFlowState, { status: 'ready_to_submit' }>;
  onConfirm: () => void;
}) {
  return (
    <View>
      <Text>Review Withdrawal</Text>
      <Text>Amount: {props.state.input.amount}</Text>
      <Text>Currency: {props.state.input.currency}</Text>
      <Text>Bank Account: {props.state.input.bankAccountId}</Text>
      <Button title="Confirm Withdrawal" onPress={props.onConfirm} />
    </View>
  );
}

function SuccessView(props: { withdrawal: Withdrawal; onDone: () => void }) {
  return (
    <View>
      <Text>Withdrawal Created</Text>
      <Text>ID: {props.withdrawal.id}</Text>
      <Text>Status: {props.withdrawal.status}</Text>
      <Button title="Done" onPress={props.onDone} />
    </View>
  );
}

function ErrorView(props: { message: string; onRetry: () => void }) {
  return (
    <View>
      <Text>Error: {props.message}</Text>
      <Button title="Try Again" onPress={props.onRetry} />
    </View>
  );
}

function FaceVerificationFailureView(props: {
  state: Extract<WithdrawalFlowState, { status: 'face_verification_failed' }>;
  onRetry: () => void;
}) {
  return (
    <View>
      <Text>Face verification failed</Text>
      <Text>{props.state.reason}</Text>
      <Text>Attempt {props.state.attemptCount} of {props.state.maxAttempts}</Text>
      <Button title="Retry" onPress={props.onRetry} />
    </View>
  );
}

function RetryLimitReachedView(props: { state: Extract<WithdrawalFlowState, { status: 'retry_limit_reached' }> }) {
  return (
    <View>
      <Text>Retry limit reached</Text>
      <Text>Please try again in {props.state.retryAfterMinutes} minutes.</Text>
    </View>
  );
}

export function WithdrawalScreen() {
  const vm = useWithdrawalViewModel();

  useEffect(() => {
    if (vm.state.status === 'face_verification_failed') {
      Alert.alert('Face verification failed', vm.state.reason, [{ text: 'Retry', onPress: vm.completeFaceVerification }]);
    }

    if (vm.state.status === 'retry_limit_reached') {
      Alert.alert('Retry limit reached', `Please try again in ${vm.state.retryAfterMinutes} minutes.`, [{ text: 'OK' }]);
    }
  }, [vm.state.status]);

  switch (vm.state.status) {
    case 'editing':
      return <WithdrawalForm onSubmit={vm.start} />;
    case 'validating':
      return <LoadingView text="Validating withdrawal..." />;
    case 'face_verification_required':
      return <FaceVerificationView onComplete={vm.completeFaceVerification} />;
    case 'face_verification_failed':
      return <FaceVerificationFailureView state={vm.state} onRetry={vm.completeFaceVerification} />;
    case 'retry_limit_reached':
      return <RetryLimitReachedView state={vm.state} />;
    case 'otp_required':
      return <OtpView onSubmit={vm.completeOtp} />;
    case 'ready_to_submit':
      return <ReviewWithdrawalView state={vm.state} onConfirm={vm.submit} />;
    case 'submitting':
      return <LoadingView text="Submitting withdrawal..." />;
    case 'success':
      return <SuccessView withdrawal={vm.state.withdrawal} onDone={vm.reset} />;
    case 'error':
      return <ErrorView message={vm.state.message} onRetry={vm.reset} />;
    default:
      return null;
  }
}
