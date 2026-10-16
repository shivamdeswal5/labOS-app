'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from './subscription.service';
import { SUBSCRIPTION_QUERY_KEYS } from './subscription.queries';
import {
  CreateOrderPayload,
  GatewayOrderResponse,
  PlanSlug,
  SimulatePaymentPayload,
  SubmitOfflinePaymentPayload,
} from '../types';

/**
 * Mutation to generate a gateway checkout order
 */
export function useCreateSubscriptionOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<GatewayOrderResponse, Error, CreateOrderPayload>({
    mutationFn: (payload) => subscriptionService.createSubscriptionOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.subscription });
    },
  });
}

/**
 * Mutation to schedule a subscription downgrade at current period end
 */
export function useScheduleDowngradeMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; scheduledPlanName: string; scheduledAt: string },
    Error,
    { planSlug: PlanSlug; billingCycle?: string }
  >({
    mutationFn: ({ planSlug, billingCycle }) =>
      subscriptionService.scheduleDowngrade(planSlug, billingCycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.subscription });
    },
  });
}

/**
 * Mutation to cancel a pending scheduled downgrade
 */
export function useCancelDowngradeMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, void>({
    mutationFn: () => subscriptionService.cancelDowngrade(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.subscription });
    },
  });
}

/**
 * Mutation to simulate payment capture (Dev Mode / Sandbox)
 */
export function useSimulatePaymentCaptureMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; status: string; message: string },
    Error,
    SimulatePaymentPayload
  >({
    mutationFn: (payload) => subscriptionService.simulatePaymentCapture(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.subscription });
    },
  });
}

/**
 * Mutation to submit 12-digit UTR for offline bank transfer verification
 */
export function useSubmitOfflinePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; utrNumber: string; message: string },
    Error,
    SubmitOfflinePaymentPayload
  >({
    mutationFn: (payload) => subscriptionService.submitOfflinePayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.subscription });
    },
  });
}
