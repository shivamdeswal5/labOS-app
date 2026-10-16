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
  scheduledPlanId?: string | null;
  scheduledPlanSlug?: PlanSlug | null;
  scheduledPlanName?: string | null;
  scheduledBillingCycle?: BillingCycle | null;
  scheduledAt?: string | null;
  customerGstin?: string | null;
}

export interface TransitionPreviewResponse {
  allowed: boolean;
  reason: string | null;
  transitionType: 'SAME_PLAN' | 'UPGRADE' | 'DOWNGRADE' | 'CYCLE_CHANGE' | 'NEW_ACTIVATION';
  isImmediate: boolean;
  effectiveDate: string;
  currentPlan: {
    id: string;
    slug: PlanSlug;
    name: string;
    priceInr: number;
    billingCycle: BillingCycle;
    periodEnd: string | null;
    daysRemaining: number;
  } | null;
  targetPlan: {
    id: string;
    slug: PlanSlug;
    name: string;
    priceInr: number;
    billingCycle: BillingCycle;
  };
  prorationCreditInPaise: number;
  grossAmountInPaise: number;
  taxGstInPaise: number;
  netAmountInPaise: number;
  explanation: string;
}

export interface SimulatePaymentPayload {
  orderId: string;
  action: 'SUCCESS' | 'DECLINE' | 'TIMEOUT';
}

export interface SubmitOfflinePaymentPayload {
  orderId: string;
  utrNumber: string;
  bankName?: string;
  notes?: string;
}

export interface CreateOrderPayload {
  planSlug: PlanSlug;
  billingCycle: BillingCycle;
  planId?: string;
}

export interface GatewayOrderResponse {
  orderId: string;
  keyId: string;
  amount: number;
  amountInPaise?: number;
  currency: string;
  planName?: string;
  labName?: string;
  alreadyFulfilled?: boolean;
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

export interface TenantInvoice {
  id: string;
  invoiceNumber: string;
  amountInr: number;
  subtotalInr: number;
  taxAmountInr: number;
  customerGstin: string | null;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  pdfUrl: string | null;
  status: string;
  createdAt: string;
  paymentMethod?: string | null;
  providerPaymentId?: string | null;
}

