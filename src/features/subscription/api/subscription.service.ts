import { api } from '@/lib/api-client';
import {
  PlatformPlan,
  TenantSubscription,
  CreateOrderPayload,
  GatewayOrderResponse,
  PlanSlug,
} from '../types';


interface SubscriptionApiResponse extends TenantSubscription {
  subscription?: TenantSubscription & {
    plan?: { name?: string; slug?: PlanSlug; featureEntitlements?: Record<string, unknown> };
  };
}

export const subscriptionService = {
  /**
   * Fetch all active platform pricing plans (Starter, Growth, Scale)
   */
  async getPublicPlans(): Promise<PlatformPlan[]> {
    return api.get<PlatformPlan[]>('/billing/plans');
  },

  /**
   * Fetch the current laboratory's subscription state, lifecycle status, and days remaining
   */
  async getTenantSubscription(): Promise<TenantSubscription> {
    const res = await api.get<SubscriptionApiResponse>('/billing/subscription');
    if (res?.subscription && res?.daysRemaining === undefined) {
      return {
        ...res.subscription,
        planName: res.subscription.plan?.name || 'Starter Plan',
        planSlug: res.subscription.plan?.slug || 'STARTER',
        daysRemaining: res.daysRemaining ?? 14,
        effectiveEntitlements: res.subscription.plan?.featureEntitlements || {},
      };
    }
    return res;
  },



  /**
   * Initialize a checkout order with Razorpay gateway
   */
  async createSubscriptionOrder(payload: CreateOrderPayload): Promise<GatewayOrderResponse> {
    return api.post<GatewayOrderResponse>('/billing/orders', payload);
  },
};
