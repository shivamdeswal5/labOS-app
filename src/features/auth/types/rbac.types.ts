/**
 * Role-Based Access Control (RBAC) Domain Types & Permission Matrix
 * Aligned with PRD Section 2 Goal 2, Section 6 P1, and NABL ISO 15189 standards
 */

export type AppRole = 'OWNER' | 'PATHOLOGIST' | 'TECHNICIAN' | 'PHLEBOTOMIST';

export type Permission =
  // Clinical Reports & Worklist
  | 'REPORTS:VIEW'
  | 'REPORTS:CREATE'
  | 'REPORTS:ENTRY'
  | 'REPORTS:FINALIZE'
  | 'REPORTS:DELETE'
  // Billing & Finance
  | 'BILLING:INVOICES_VIEW'
  | 'BILLING:INVOICE_CREATE'
  | 'BILLING:EXPENSES_VIEW'
  | 'BILLING:PNL_VIEW'
  // Doctor Referrals & Outsourcing
  | 'REFERRALS:VIEW_OUTSOURCED'
  | 'REFERRALS:DISPATCH_OUTSOURCED'
  | 'REFERRALS:COMMISSIONS_VIEW'
  | 'REFERRALS:SETTLE_COMMISSIONS'
  // Home Collections & Dispatch
  | 'COLLECTIONS:VIEW'
  | 'COLLECTIONS:DISPATCH'
  | 'COLLECTIONS:COLLECT'
  // Master Settings & Catalog
  | 'SETTINGS:LAB_PROFILE'
  | 'SETTINGS:MANAGE_STAFF'
  | 'SETTINGS:TEST_CATALOG';

export interface RoleMetadata {
  role: AppRole;
  displayName: string;
  badgeLabel: string;
  description: string;
  simulatedName: string;
  simulatedTitle: string;
  badgeColorClass: string;
}

export const ROLE_METADATA: Record<AppRole, RoleMetadata> = {
  OWNER: {
    role: 'OWNER',
    displayName: 'Lab Owner / Director',
    badgeLabel: 'Owner / Superuser',
    description: 'Full unrestricted governance across all clinical, financial, and administrative operations.',
    simulatedName: 'Dr. Deswal',
    simulatedTitle: 'Lab Director & Superuser',
    badgeColorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  },
  PATHOLOGIST: {
    role: 'PATHOLOGIST',
    displayName: 'Consultant Pathologist',
    badgeLabel: 'Pathologist (Sign-off)',
    description: 'Exclusive sign-off authority for diagnostic reports with digital signature and MCI registration.',
    simulatedName: 'Dr. Sunita Sharma',
    simulatedTitle: 'Consultant Pathologist (MD, DMC #48291)',
    badgeColorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  },
  TECHNICIAN: {
    role: 'TECHNICIAN',
    displayName: 'Senior Lab Technician',
    badgeLabel: 'Bench Technician',
    description: 'Patient intake, accessioning, specimen analysis, and cashier receipt issuance. No sign-off.',
    simulatedName: 'Rohan Verma',
    simulatedTitle: 'Senior Lab Technician (DMLT)',
    badgeColorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  },
  PHLEBOTOMIST: {
    role: 'PHLEBOTOMIST',
    displayName: 'Field Phlebotomist',
    badgeLabel: 'Phlebotomist',
    description: 'Home sample collection visits, vacutainer barcode scanning, and sample transit logistics.',
    simulatedName: 'Vikram Singh',
    simulatedTitle: 'Field Phlebotomy Specialist',
    badgeColorClass: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-800',
  },
};

/**
 * Authoritative Permission Matrix by Role
 */
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  OWNER: [
    'REPORTS:VIEW',
    'REPORTS:CREATE',
    'REPORTS:ENTRY',
    'REPORTS:FINALIZE',
    'REPORTS:DELETE',
    'BILLING:INVOICES_VIEW',
    'BILLING:INVOICE_CREATE',
    'BILLING:EXPENSES_VIEW',
    'BILLING:PNL_VIEW',
    'REFERRALS:VIEW_OUTSOURCED',
    'REFERRALS:DISPATCH_OUTSOURCED',
    'REFERRALS:COMMISSIONS_VIEW',
    'REFERRALS:SETTLE_COMMISSIONS',
    'COLLECTIONS:VIEW',
    'COLLECTIONS:DISPATCH',
    'COLLECTIONS:COLLECT',
    'SETTINGS:LAB_PROFILE',
    'SETTINGS:MANAGE_STAFF',
    'SETTINGS:TEST_CATALOG',
  ],
  PATHOLOGIST: [
    'REPORTS:VIEW',
    'REPORTS:ENTRY',
    'REPORTS:FINALIZE', // Exclusive medical sign-off
    'REFERRALS:VIEW_OUTSOURCED', // Review incoming reference lab results
    'COLLECTIONS:VIEW',
  ],
  TECHNICIAN: [
    'REPORTS:VIEW',
    'REPORTS:CREATE', // Front-desk intake
    'REPORTS:ENTRY',  // Bench test entry
    'BILLING:INVOICES_VIEW',
    'BILLING:INVOICE_CREATE', // Front-desk cashier invoice & receipt printing
    'REFERRALS:VIEW_OUTSOURCED',
    'REFERRALS:DISPATCH_OUTSOURCED', // Courier manifest dispatch
    'COLLECTIONS:VIEW',
  ],
  PHLEBOTOMIST: [
    'COLLECTIONS:VIEW',
    'COLLECTIONS:COLLECT',
  ],
};

/**
 * Route-Level Authorization Gate
 * Maps top-level pathnames to authorized roles
 */
export const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  '/': ['OWNER', 'PATHOLOGIST', 'TECHNICIAN'],
  '/reports/new': ['OWNER', 'TECHNICIAN'],
  '/accessions': ['OWNER', 'PATHOLOGIST', 'TECHNICIAN'],
  '/patients': ['OWNER', 'PATHOLOGIST', 'TECHNICIAN', 'PHLEBOTOMIST'],
  '/collections': ['OWNER', 'TECHNICIAN', 'PHLEBOTOMIST'],
  '/referrals': ['OWNER', 'PATHOLOGIST', 'TECHNICIAN'],
  '/billing': ['OWNER', 'TECHNICIAN'],
  '/panels': ['OWNER'],
  '/settings': ['OWNER'],
};
