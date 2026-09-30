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
  id: 'lab-deswal-01',
  name: 'Deswal Diagnostic Laboratory',
  nablId: '',
  address: 'Near Main Bus Stand, Barara, Ambala, Haryana - 133201',
  phoneNumbers: ['+91 85688 84848'],
  officialEmail: '',
  whatsappNumber: '+91 85688 84848',
  logoUrl: null,
  accentColor: '#0f766e',
  tagline: 'Clinical Pathology, Biochemistry & Diagnostic Center',
  footerNote: 'Computer Generated Diagnostic Examination Report',
  reportLanguage: 'en',
  printSettings: {
    stationeryType: 'PLAIN',
    headerMarginMm: 48,
    footerMarginMm: 24,
  },
};

export const DEMO_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-01',
    labId: 'lab-deswal-01',
    fullName: 'Deswal',
    email: 'deswal@gmail.com',
    role: 'OWNER',
    qualification: 'Lab Director / In-Charge',
    councilRegistration: '',
    signOffScope: 'Authorized Signatory · All Diagnostic Panels',
    signatureUrl: null,
    lastActive: 'Active now',
    isOnline: true,
    createdAt: '2024-01-01T09:00:00Z',
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
          printSettings: res.printSettings || DEMO_LAB_PROFILE.printSettings,
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
        return {
          ...DEMO_LAB_PROFILE,
          ...dto,
          printSettings: {
            ...DEMO_LAB_PROFILE.printSettings,
            ...(dto.printSettings || {}),
          },
        };
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
