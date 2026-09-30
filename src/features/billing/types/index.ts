export type InvoicePaymentStatus = 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | 'REFUNDED';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING' | 'OTHER';

export type ExpenseCategory =
  | 'REAGENTS'
  | 'CONSUMABLES'
  | 'EQUIPMENT'
  | 'RENT'
  | 'UTILITIES'
  | 'SALARIES'
  | 'MAINTENANCE'
  | 'OTHER';

export interface InvoiceItem {
  id: string;
  invoiceId?: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2024-8842"
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientPhone?: string;
  reportId?: string | null;
  testsBilled: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: InvoicePaymentStatus;
  paymentMethod: PaymentMethod | null;
  paidAt?: string | null;
  notes?: string | null;
  createdAt: string;
  items: InvoiceItem[];
}

export interface Expense {
  id: string;
  expenseNumber: string; // e.g. "EXP-412"
  title: string;
  amount: number;
  category: ExpenseCategory;
  categoryLabel?: string;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  vendor: string | null;
  vendorInvoiceNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalExpenses: number;
  netMargin: number;
  marginPercentage: number;
  invoicesCount: number;
  expensesCount: number;
  realizedPercentage: number;
  collectionsByMethod: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export interface CreateInvoiceItemDto {
  description: string;
  unitPrice: number;
  quantity?: number;
}

export interface CreateInvoiceDto {
  patientId: string;
  patientName?: string;
  patientMrn?: string;
  reportId?: string;
  discount?: number;
  items: CreateInvoiceItemDto[];
  paymentMethod?: PaymentMethod;
  notes?: string;
  markAsPaid?: boolean;
}

export interface RecordPaymentDto {
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateExpenseDto {
  category: ExpenseCategory;
  title: string;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  vendor?: string;
  vendorInvoiceNumber?: string;
  notes?: string;
}

export interface InvoiceFilter {
  status?: 'ALL' | 'PAID' | 'PENDING';
  paymentMethod?: 'ALL' | PaymentMethod;
  search?: string;
  dateRange?: string;
}

export interface ExpenseFilter {
  category?: 'ALL' | ExpenseCategory;
  search?: string;
}

// ---------------------------------------------------------------------------
// Diagnostic Profitability & Unit Economics (PRD Section 2 Goal 2 & Section 6 P1)
// ---------------------------------------------------------------------------

export type TestExecutionType = 'IN_HOUSE' | 'OUTSOURCED';

export type StrategicRecommendation =
  | 'RUN_IN_HOUSE'
  | 'KEEP_OUTSOURCED'
  | 'SWITCH_TO_IN_HOUSE'
  | 'HIGH_MARGIN_PRIORITY';

export interface TestProfitabilityMetric {
  panelId: string;
  panelCode?: string;
  panelName: string;
  category: string;
  executionType: TestExecutionType;
  retailPrice: number;
  directCost: number; // Reagents & consumables for in-house, or B2B fee for outsourced
  directCostBreakdown?: {
    reagents?: number;
    consumables?: number;
    controlsCalibrators?: number;
    b2bFee?: number;
  };
  referralCommissionAvg: number;
  netMargin: number;
  marginPercentage: number;
  volumeMTD: number;
  totalRevenueMTD: number;
  totalProfitMTD: number;
  breakevenVolume?: number;
  strategicRecommendation: StrategicRecommendation;
  recommendationReason?: string;
}

export interface PnLRevenueBlock {
  grossPatientBilled: number;
  discountsConcessions: number;
  netRealizedRevenue: number;
}

export interface PnLCOGSBlock {
  reagentsAndKits: number;
  collectionConsumables: number;
  outsourcedReferenceLabFees: number;
  doctorReferralCommissions: number;
  totalDirectCOGS: number;
  grossDiagnosticMargin: number;
  grossMarginPercentage: number;
}

export interface PnLOpexBlock {
  technicianSalaries: number;
  facilityRent: number;
  powerAndUtilities: number;
  analyzerAMCAndMaintenance: number;
  bioMedicalWasteManagement: number;
  softwareAndLogistics: number;
  totalOperatingOverhead: number;
}

export interface DiagnosticPnLStatement {
  reportingPeriod: string;
  revenue: PnLRevenueBlock;
  cogs: PnLCOGSBlock;
  opex: PnLOpexBlock;
  netOperatingIncome: number;
  netMarginPercentage: number;
}

export interface ProfitabilitySummaryStats {
  netRevenueMTD: number;
  totalDirectCostMTD: number;
  grossMarginPercentage: number;
  netOperatingProfitMTD: number;
  inHouseMarginAvg: number;
  outsourcedMarginAvg: number;
  topPerformingTest: string;
}

