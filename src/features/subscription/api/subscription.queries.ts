'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from './subscription.service';
import { PlatformPlan, TenantSubscription, CreateOrderPayload, GatewayOrderResponse } from '../types';

export const SUBSCRIPTION_QUERY_KEYS = {
  plans: ['platform-plans'] as const,
  subscription: ['tenant-subscription'] as const,
};

export const DEFAULT_DEMO_PLANS: PlatformPlan[] = [
  {
    id: 'plan-starter-default',
    slug: 'STARTER',
    name: 'Starter Plan',
    description: 'Essential operating system for small standalone labs (1–2 technicians, up to 500 samples/mo).',
    monthlyPriceInr: 499,
    yearlyPriceInr: 4990,
    isActive: true,
    isPublic: true,
    featureEntitlements: {
      maxUsers: 2,
      maxMonthlySamples: 500,
      barcodePrinting: true,
      letterheadAlignment: true,
      whatsappDelivery: true,
      referralDoctorLedger: true,
    },
  },
  {
    id: 'plan-growth-default',
    slug: 'GROWTH',
    name: 'Growth Plan',
    description: 'Comprehensive software for established diagnostic centers with doctor networks (up to 2,000 samples/mo).',
    monthlyPriceInr: 999,
    yearlyPriceInr: 9990,
    isActive: true,
    isPublic: true,
    featureEntitlements: {
      maxUsers: 6,
      maxMonthlySamples: 2000,
      barcodePrinting: true,
      letterheadAlignment: true,
      whatsappDelivery: true,
      referralDoctorLedger: true,
      nablOutsourcedSync: true,
      barcodeScannerDirect: true,
      diagnosticPnl: true,
    },
  },
  {
    id: 'plan-scale-default',
    slug: 'SCALE',
    name: 'Scale Plan',
    description: 'High-throughput platform for diagnostics with home collection fleets and multi-counters (up to 10,000 samples/mo).',
    monthlyPriceInr: 1999,
    yearlyPriceInr: 19990,
    isActive: true,
    isPublic: true,
    featureEntitlements: {
      maxUsers: 20,
      maxMonthlySamples: 10000,
      barcodePrinting: true,
      letterheadAlignment: true,
      whatsappDelivery: true,
      referralDoctorLedger: true,
      nablOutsourcedSync: true,
      barcodeScannerDirect: true,
      diagnosticPnl: true,
      homeCollectionGps: true,
      multiCounterLedger: true,
      slaSupport: true,
    },
  },
];

export const DEFAULT_DEMO_SUBSCRIPTION: TenantSubscription = {
  id: 'sub-default-demo',
  labId: 'lab-demo',
  planId: 'plan-starter-default',
  planSlug: 'STARTER',
  planName: 'Starter Plan',
  status: 'TRIALING',
  billingCycle: 'MONTHLY',
  trialStart: new Date().toISOString(),
  trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  currentPeriodStart: null,
  currentPeriodEnd: null,
  gracePeriodEnd: null,
  daysRemaining: 14,
  effectiveEntitlements: {
    maxUsers: 2,
    maxMonthlySamples: 500,
    barcodePrinting: true,
    letterheadAlignment: true,
    whatsappDelivery: true,
  },
};

/**
 * Hook to retrieve available platform plans
 */
export function usePublicPlansQuery() {
  return useQuery<PlatformPlan[]>({
    queryKey: SUBSCRIPTION_QUERY_KEYS.plans,
    queryFn: async () => {
      try {
        const plans = await subscriptionService.getPublicPlans();
        return Array.isArray(plans) && plans.length > 0 ? plans : DEFAULT_DEMO_PLANS;
      } catch {
        return DEFAULT_DEMO_PLANS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to retrieve current laboratory's subscription state
 */
export function useTenantSubscriptionQuery() {
  return useQuery<TenantSubscription>({
    queryKey: SUBSCRIPTION_QUERY_KEYS.subscription,
    queryFn: async () => {
      try {
        const sub = await subscriptionService.getTenantSubscription();
        return sub || DEFAULT_DEMO_SUBSCRIPTION;
      } catch {
        return DEFAULT_DEMO_SUBSCRIPTION;
      }
    },
    staleTime: 30 * 1000,
  });
}

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
