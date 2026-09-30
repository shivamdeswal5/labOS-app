import { api } from '@/lib/api-client';
import type {
  OutsourcedTest,
  OutsourcedTestStatus,
  CreateOutsourcedTestDto,
  UpdateOutsourcedStatusDto,
} from '../types';

/**
 * Pure API service layer for Outsourced Reference Lab testing.
 * Strict DDD parity with NestJS referrals bounded context (`src/modules/referrals/features/outsourced/`).
 * Contains zero React hooks or UI dependencies.
 */
export const outsourcedService = {
  /**
   * Fetches all outsourced tests scoped to the authenticated laboratory tenant.
   * Optionally filtered by lifecycle status or specific report accession.
   */
  async listOutsourcedTests(
    status?: OutsourcedTestStatus,
    reportId?: string,
  ): Promise<OutsourcedTest[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (reportId) params.append('reportId', reportId);

    const queryString = params.toString();
    const url = queryString
      ? `/referrals/outsourced?${queryString}`
      : '/referrals/outsourced';

    return api.get<OutsourcedTest[]>(url);
  },

  /**
   * Creates a new outsourced test send-out record linked to a clinical accession report.
   */
  async createOutsourcedTest(dto: CreateOutsourcedTestDto): Promise<OutsourcedTest> {
    return api.post<OutsourcedTest>('/referrals/outsourced', dto);
  },

  /**
   * Updates lifecycle status, wholesale B2B cost, or courier/clinical remarks.
   */
  async updateOutsourcedStatus(
    id: string,
    dto: UpdateOutsourcedStatusDto,
  ): Promise<OutsourcedTest> {
    return api.patch<OutsourcedTest>(`/referrals/outsourced/${id}/status`, dto);
  },
};
