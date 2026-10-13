'use client';
'use no memo';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UserPlus, Stethoscope, Building2, Phone, Mail, Percent, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCreateDoctor } from '../api/use-commission';
import { addDoctorSchema, type AddDoctorSchema } from '../schemas/add-doctor.schema';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDoctorModal({ isOpen, onClose }: AddDoctorModalProps) {
  const createDoctorMutation = useCreateDoctor();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddDoctorSchema>({
    resolver: zodResolver(addDoctorSchema),
    defaultValues: {
      name: '',
      specialty: '',
      clinic: '',
      regNumber: '',
      phone: '',
      email: '',
      commissionType: 'PERCENTAGE',
      commissionValue: 15,
      pan: '',
      bankAccount: '',
      ifsc: '',
    },
  });

  const commissionType = watch('commissionType');

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createDoctorMutation.mutateAsync({
        name: values.name.trim(),
        clinicName: values.clinic?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        email: values.email?.trim() || undefined,
        specialty: values.specialty?.trim() || undefined,
        registrationNumber: values.regNumber?.trim() || undefined,
        commissionType: values.commissionType,
        commissionValue: values.commissionType === 'NONE' ? 0 : Number(values.commissionValue) || 0,
        pan: values.pan?.trim() ? values.pan.toUpperCase().trim() : undefined,
        bankAccount: values.bankAccount?.trim() || undefined,
        ifsc: values.ifsc?.trim() ? values.ifsc.toUpperCase().trim() : undefined,
      });
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to register doctor:', err);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Add Referring Clinician</h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                ISO 15189:2022 &amp; Section 194H Compliant Directory
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} noValidate className="p-4 space-y-3.5 overflow-y-auto text-xs">
          {/* Identity & Clinic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Doctor Full Name *
              </label>
              <div className="relative">
                <Stethoscope className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Dr. Rajiv Sethi"
                  className={cn(
                    'w-full h-8 pl-8 pr-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary',
                    errors.name && 'border-destructive focus:border-destructive'
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Specialty
              </label>
              <input
                type="text"
                {...register('specialty')}
                placeholder="e.g. Endocrinology, Nephrology"
                className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              {errors.specialty && (
                <p className="text-[11px] text-destructive mt-1">{errors.specialty.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Clinic / Hospital Affiliation
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('clinic')}
                  placeholder="e.g. Apex Diabetes Care, Bandra"
                  className="w-full h-8 pl-8 pr-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              {errors.clinic && (
                <p className="text-[11px] text-destructive mt-1">{errors.clinic.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Medical Council Reg #
              </label>
              <input
                type="text"
                {...register('regNumber')}
                placeholder="e.g. KMC-48192"
                className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
              />
              {errors.regNumber && (
                <p className="text-[11px] text-destructive mt-1">{errors.regNumber.message}</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+91 98201 00000"
                  className={cn(
                    'w-full h-8 pl-8 pr-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono',
                    errors.phone && 'border-destructive focus:border-destructive'
                  )}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="doctor@clinic.com"
                  className={cn(
                    'w-full h-8 pl-8 pr-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary',
                    errors.email && 'border-destructive focus:border-destructive'
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Commission Model Agreement */}
          <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Percent className="w-3.5 h-3.5 text-primary" />
              <span>Commission &amp; Referral Agreement</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setValue('commissionType', 'PERCENTAGE', { shouldValidate: true })}
                className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                  commissionType === 'PERCENTAGE'
                    ? 'bg-card border-primary text-foreground font-semibold shadow-sm'
                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Percentage (%)
              </button>

              <button
                type="button"
                onClick={() => setValue('commissionType', 'FLAT', { shouldValidate: true })}
                className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                  commissionType === 'FLAT'
                    ? 'bg-card border-primary text-foreground font-semibold shadow-sm'
                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Flat (₹/case)
              </button>

              <button
                type="button"
                onClick={() => setValue('commissionType', 'NONE', { shouldValidate: true })}
                className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                  commissionType === 'NONE'
                    ? 'bg-card border-primary text-foreground font-semibold shadow-sm'
                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                None (Tie-up)
              </button>
            </div>

            {commissionType !== 'NONE' && (
              <div>
                <label className="block text-[10px] uppercase font-mono font-semibold text-muted-foreground mb-1">
                  {commissionType === 'PERCENTAGE' ? 'Commission Percentage (%)' : 'Flat Amount per Case (₹)'}
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('commissionValue')}
                  placeholder={commissionType === 'PERCENTAGE' ? '15' : '200'}
                  className={cn(
                    'w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono',
                    errors.commissionValue && 'border-destructive focus:border-destructive'
                  )}
                />
                {errors.commissionValue && (
                  <p className="text-[11px] text-destructive mt-1">{errors.commissionValue.message}</p>
                )}
              </div>
            )}
          </div>

          {/* TDS & Banking (TDS 194H) */}
          <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>Banking &amp; TDS Tax Info (TDS 194H)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-mono font-semibold text-muted-foreground mb-1">
                  PAN for TDS
                </label>
                <input
                  type="text"
                  {...register('pan')}
                  placeholder="AAAPC2019K"
                  className={cn(
                    'w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono uppercase',
                    errors.pan && 'border-destructive focus:border-destructive'
                  )}
                />
                {errors.pan && (
                  <p className="text-[11px] text-destructive mt-1">{errors.pan.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-semibold text-muted-foreground mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  {...register('ifsc')}
                  placeholder="HDFC0001042"
                  className={cn(
                    'w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono uppercase',
                    errors.ifsc && 'border-destructive focus:border-destructive'
                  )}
                />
                {errors.ifsc && (
                  <p className="text-[11px] text-destructive mt-1">{errors.ifsc.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-semibold text-muted-foreground mb-1">
                  Bank Account
                </label>
                <input
                  type="text"
                  {...register('bankAccount')}
                  placeholder="501002941829"
                  className={cn(
                    'w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono',
                    errors.bankAccount && 'border-destructive focus:border-destructive'
                  )}
                />
                {errors.bankAccount && (
                  <p className="text-[11px] text-destructive mt-1">{errors.bankAccount.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createDoctorMutation.isPending}
              className="h-8 text-xs font-semibold"
            >
              {createDoctorMutation.isPending ? 'Registering...' : 'Register Clinician'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
