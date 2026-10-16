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

  /**
   * Preview a subscription transition (proration credit, GST, and downgrade scheduling)
   */
  async previewTransition(
    planSlug: PlanSlug,
    billingCycle: string,
  ): Promise<import('../types').TransitionPreviewResponse> {
    return api.get<import('../types').TransitionPreviewResponse>(
      '/billing/subscriptions/preview-transition',
      {
        params: { planSlug, billingCycle },
      },
    );
  },

  /**
   * Schedule a downgrade to take effect at the conclusion of current billing period
   */
  async scheduleDowngrade(
    planSlug: PlanSlug,
    billingCycle?: string,
  ): Promise<{
    success: boolean;
    message: string;
    scheduledPlanName: string;
    scheduledAt: string;
  }> {
    return api.post('/billing/subscriptions/schedule-downgrade', {
      planSlug,
      billingCycle,
    });
  },

  /**
   * Cancel a pending scheduled downgrade
   */
  async cancelDowngrade(): Promise<{ success: boolean; message: string }> {
    return api.delete('/billing/subscriptions/cancel-downgrade');
  },

  /**
   * Simulate payment capture (Dev Mode / Sandbox testing)
   */
  async simulatePaymentCapture(
    payload: import('../types').SimulatePaymentPayload,
  ): Promise<{ success: boolean; status: string; message: string }> {
    return api.post('/billing/payments/simulate-capture', payload);
  },

  /**
   * Submit 12-digit UTR for offline bank transfer verification
   */
  async submitOfflinePayment(
    payload: import('../types').SubmitOfflinePaymentPayload,
  ): Promise<{ success: boolean; utrNumber: string; message: string }> {
    return api.post('/billing/payments/offline-utr', payload);
  },

  /**
   * Fetch all historical subscription tax invoices for the authenticated laboratory
   */
  async getTenantInvoices(): Promise<import('../types').TenantInvoice[]> {
    return api.get<import('../types').TenantInvoice[]>('/billing/invoices');
  },
};
