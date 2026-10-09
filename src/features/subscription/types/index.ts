export type PlanSlug = 'STARTER' | 'GROWTH' | 'SCALE';

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'GRACE_PERIOD' | 'LOCKED';

export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface PlanFeatureEntitlements {
  maxUsers?: number;
  maxMonthlySamples?: number;
  barcodePrinting?: boolean;
  letterheadAlignment?: boolean;
  whatsappDelivery?: boolean;
  referralDoctorLedger?: boolean;
  nablOutsourcedSync?: boolean;
  barcodeScannerDirect?: boolean;
  diagnosticPnl?: boolean;
  homeCollectionGps?: boolean;
  multiCounterLedger?: boolean;
  slaSupport?: boolean;
  [key: string]: unknown;
}

export interface PlatformPlan {
  id: string;
  slug: PlanSlug;
  name: string;
  description: string;
  monthlyPriceInr: number;
  yearlyPriceInr: number;
  featureEntitlements: PlanFeatureEntitlements;
  isActive: boolean;
  isPublic: boolean;
}

export interface TenantSubscription {
  id: string;
  labId: string;
  planId: string;
  planSlug: PlanSlug;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  trialStart: string;
  trialEnd: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  gracePeriodEnd: string | null;
  daysRemaining: number;
  effectiveEntitlements: PlanFeatureEntitlements;
}

export interface CreateOrderPayload {
  planId: string;
  billingCycle: BillingCycle;
}

export interface GatewayOrderResponse {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
  labName: string;
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}
