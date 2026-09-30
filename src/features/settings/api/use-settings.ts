'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type {
  LabProfile,
  StaffMember,
  UpdateLabDto,
  UpdateProfileDto,
  InviteStaffDto,
} from '../types';

export const LAB_PROFILE_QUERY_KEY = ['lab-profile'] as const;
export const STAFF_MEMBERS_QUERY_KEY = ['staff-members'] as const;
export const CURRENT_PROFILE_QUERY_KEY = ['current-profile'] as const;

export const DEMO_LAB_PROFILE: LabProfile = {
  id: 'lab-apex-01',
  name: 'Apex Diagnostic Center & Advanced Pathology Lab',
  nablId: 'MC-4192 / 2024',
  address: 'Shop 4, Ground Floor, 100ft Road, Indiranagar, Bengaluru - 560038',
  phoneNumbers: ['+91 80 4123 4567'],
  officialEmail: 'reports@apexdiagnostic.in',
  whatsappNumber: '+91 98800 12345',
  logoUrl: '/brand/apex_logo.svg',
  accentColor: '#0F172A',
  tagline: 'Precision Diagnostics & Clinical Pathology Excellence',
  footerNote: 'NOT VALID FOR MEDICO LEGAL PURPOSE',
  reportLanguage: 'en',
  accreditedSince: '2021',
  scopeNotes: 'Accredited testing scope: Clinical Biochemistry & Hematology under ISO 15189:2022.',
};

export const DEMO_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-01',
    labId: 'lab-apex-01',
    fullName: 'Dr. Rajesh K. Sharma',
    email: 'rajesh@apexdiagnostic.in',
    role: 'OWNER',
    qualification: 'MD Path (Pathologist)',
    councilRegistration: 'KMC Reg #48291',
    signOffScope: 'Authorized Signatory · All Panels',
    signatureUrl: '/signatures/dr_sharma_sig.png',
    lastActive: 'Active now',
    isOnline: true,
    createdAt: '2023-01-15T09:00:00Z',
  },
  {
    id: 'staff-02',
    labId: 'lab-apex-01',
    fullName: 'Dr. Sunita Nair',
    email: 'sunita.nair@apexdiagnostic.in',
    role: 'PATHOLOGIST',
    qualification: 'MBBS, DCP (Clinical Pathology)',
    councilRegistration: 'KMC Reg #51902',
    signOffScope: 'Authorized Signatory · Hem & Biochem',
    signatureUrl: '/signatures/dr_nair_sig.png',
    lastActive: '2 hours ago',
    isOnline: false,
    createdAt: '2023-04-10T10:30:00Z',
  },
  {
    id: 'staff-03',
    labId: 'lab-apex-01',
    fullName: 'S. Nair',
    email: 's.nair@apexdiagnostic.in',
    role: 'SR_TECHNICIAN',
    qualification: 'B.Sc MLT (Hematology Spec)',
    councilRegistration: 'KA-MLT-8812',
    signOffScope: 'Specimen Accession & Analyzer Feed (Pre-validation only)',
    signatureUrl: null,
    lastActive: '15 mins ago',
    isOnline: true,
    createdAt: '2023-06-01T08:00:00Z',
  },
  {
    id: 'staff-04',
    labId: 'lab-apex-01',
    fullName: 'Anand Vernekar',
    email: 'anand.v@apexdiagnostic.in',
    role: 'TECHNICIAN',
    qualification: 'DMLT',
    councilRegistration: 'KA-MLT-9421',
    signOffScope: 'Phlebotomy & Data Entry (Barcode labeling & collection logging)',
    signatureUrl: null,
    lastActive: 'Active now',
    isOnline: true,
    createdAt: '2023-08-20T11:00:00Z',
  },
  {
    id: 'staff-05',
    labId: 'lab-apex-01',
    fullName: 'Priya G.',
    email: 'billing@apexdiagnostic.in',
    role: 'BILLING',
    qualification: 'B.Com (Healthcare Admin)',
    councilRegistration: null,
    signOffScope: 'Invoicing & Cash Settlements Only (Zero clinical telemetry)',
    signatureUrl: null,
    lastActive: '1 day ago',
    isOnline: false,
    createdAt: '2023-11-05T09:15:00Z',
  },
];

export function useLabProfile() {
  return useQuery<LabProfile>({
    queryKey: LAB_PROFILE_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get<LabProfile>('/labs/current');
        return {
          ...DEMO_LAB_PROFILE,
          ...res,
          phoneNumbers: res.phoneNumbers || DEMO_LAB_PROFILE.phoneNumbers,
        };
      } catch {
        return DEMO_LAB_PROFILE;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateLabProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateLabDto) => {
      try {
        return await api.put<LabProfile>('/labs/current', dto);
      } catch {
        return { ...DEMO_LAB_PROFILE, ...dto };
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(LAB_PROFILE_QUERY_KEY, updated);
      queryClient.invalidateQueries({ queryKey: LAB_PROFILE_QUERY_KEY });
    },
  });
}

export function useStaffMembers() {
  return useQuery<StaffMember[]>({
    queryKey: STAFF_MEMBERS_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get<StaffMember[]>('/labs/members');
        return res && res.length > 0 ? res : DEMO_STAFF_MEMBERS;
      } catch {
        return DEMO_STAFF_MEMBERS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useInviteStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: InviteStaffDto) => {
      const newMember: StaffMember = {
        id: `staff-${Date.now().toString(36)}`,
        labId: 'lab-apex-01',
        fullName: dto.fullName,
        email: dto.email,
        role: dto.role,
        qualification: dto.qualification || null,
        councilRegistration: dto.councilRegistration || null,
        signOffScope: dto.signOffScope || `${dto.role} workstation authorization`,
        signatureUrl: null,
        lastActive: 'Just invited',
        isOnline: false,
        createdAt: new Date().toISOString(),
      };
      try {
        const res = await api.post<StaffMember>('/labs/members', dto);
        return res || newMember;
      } catch {
        return newMember;
      }
    },
    onSuccess: (newMember) => {
      queryClient.setQueryData<StaffMember[]>(STAFF_MEMBERS_QUERY_KEY, (old) => [
        ...(old || DEMO_STAFF_MEMBERS),
        newMember,
      ]);
      queryClient.invalidateQueries({ queryKey: STAFF_MEMBERS_QUERY_KEY });
    },
  });
}

export function useCurrentStaffProfile() {
  return useQuery<StaffMember>({
    queryKey: CURRENT_PROFILE_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get<StaffMember>('/labs/me');
        return res || DEMO_STAFF_MEMBERS[0];
      } catch {
        return DEMO_STAFF_MEMBERS[0];
      }
    },
  });
}

export function useUpdateStaffProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateProfileDto) => {
      try {
        return await api.put<StaffMember>('/labs/me', dto);
      } catch {
        return { ...DEMO_STAFF_MEMBERS[0], ...dto };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRENT_PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STAFF_MEMBERS_QUERY_KEY });
    },
  });
}
