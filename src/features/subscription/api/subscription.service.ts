import { apiClient } from '@/lib/api-client';
import {
  PlatformPlan,
  TenantSubscription,
  CreateOrderPayload,
  GatewayOrderResponse,
} from '../types';

export const subscriptionService = {
  /**
   * Fetch all active platform pricing plans (Starter, Growth, Scale)
   */
  async getPublicPlans(): Promise<PlatformPlan[]> {
    const { data } = await apiClient.get<PlatformPlan[]>('/billing/plans');
    return data;
  },

  /**
   * Fetch the current laboratory's subscription state, lifecycle status, and days remaining
   */
  async getTenantSubscription(): Promise<TenantSubscription> {
    const { data } = await apiClient.get<TenantSubscription>('/billing/subscription');
    return data;
  },

  /**
   * Initialize a checkout order with Razorpay gateway
   */
  async createSubscriptionOrder(payload: CreateOrderPayload): Promise<GatewayOrderResponse> {
    const { data } = await apiClient.post<GatewayOrderResponse>('/billing/orders', payload);
    return data;
  },
};
