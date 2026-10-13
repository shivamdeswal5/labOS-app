'use client';
'use no memo';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { newBookingSchema, type NewBookingSchema } from '../schemas/new-booking.schema';
import type { CreateCollectionDto, Phlebotomist } from '../types';
import {
  BookingDemographicsSection,
  BookingSlotSection,
  BookingTestSelector,
  TIME_SLOTS,
} from './_components';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateCollectionDto) => void;
  phlebotomists: Phlebotomist[];
  isSubmitting?: boolean;
}

export function NewBookingModal({
  isOpen,
  onClose,
  onSubmit,
  phlebotomists,
  isSubmitting = false,
}: NewBookingModalProps) {
  const [selectedTests, setSelectedTests] = useState<string[]>([
    'HbA1c & Fasting Blood Sugar',
    'Lipid Profile Extended',
  ]);
  const [assignedPhlebotomistId, setAssignedPhlebotomistId] = useState<string>('');

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewBookingSchema>({
    resolver: zodResolver(newBookingSchema),
    defaultValues: {
      patientName: '',
      patientPhone: '',
      patientAge: '',
      patientSex: 'MALE',
      address: '',
      preferredDate: new Date().toISOString().split('T')[0],
      timeSlot: TIME_SLOTS[1],
      isFastingRequired: true,
      specialInstructions: '',
    },
  });

  const patientName = watch('patientName');
  const patientPhone = watch('patientPhone');
  const patientAge = watch('patientAge') || '';
  const patientSex = watch('patientSex');
  const address = watch('address');
  const preferredDate = watch('preferredDate');
  const timeSlot = watch('timeSlot');
  const isFastingRequired = watch('isFastingRequired');
  const specialInstructions = watch('specialInstructions') || '';

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      reset({
        patientName: '',
        patientPhone: '',
        patientAge: '',
        patientSex: 'MALE',
        address: '',
        preferredDate: new Date().toISOString().split('T')[0],
        timeSlot: TIME_SLOTS[1],
        isFastingRequired: true,
        specialInstructions: '',
      });
      setSelectedTests([
        'HbA1c & Fasting Blood Sugar',
        'Lipid Profile Extended',
      ]);
      setAssignedPhlebotomistId('');
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const toggleTest = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test],
    );
  };

  const onSubmitHandler = handleSubmit((values) => {
    const assignedPhleb = phlebotomists.find((p) => p.id === assignedPhlebotomistId);

    const dto: CreateCollectionDto = {
      patientName: values.patientName.trim(),
      patientPhone: values.patientPhone.trim(),
      patientAge: values.patientAge?.trim() || undefined,
      patientSex: values.patientSex,
      address: values.address.trim(),
      preferredDate: values.preferredDate,
      timeSlot: values.timeSlot,
      isFastingRequired: values.isFastingRequired,
      testNames: selectedTests,
      specialInstructions: values.specialInstructions?.trim() || undefined,
      assignedPhlebotomistId: assignedPhleb?.id,
      assignedPhlebotomistName: assignedPhleb?.name,
    };

    onSubmit(dto);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Book Home Sample Collection
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Schedule patient home visit, allocate phlebotomist, and enforce cold-chain vacutainers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmitHandler} noValidate className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <BookingDemographicsSection
            patientName={patientName}
            onPatientNameChange={(val) => setValue('patientName', val, { shouldValidate: true })}
            patientPhone={patientPhone}
            onPatientPhoneChange={(val) => setValue('patientPhone', val, { shouldValidate: true })}
            patientAge={patientAge}
            onPatientAgeChange={(val) => setValue('patientAge', val, { shouldValidate: true })}
            patientSex={patientSex}
            onPatientSexChange={(val) => setValue('patientSex', val, { shouldValidate: true })}
            address={address}
            onAddressChange={(val) => setValue('address', val, { shouldValidate: true })}
            errors={{
              patientName: errors.patientName?.message,
              patientPhone: errors.patientPhone?.message,
              patientAge: errors.patientAge?.message,
              address: errors.address?.message,
            }}
          />

          <BookingSlotSection
            preferredDate={preferredDate}
            onPreferredDateChange={(val) => setValue('preferredDate', val, { shouldValidate: true })}
            timeSlot={timeSlot}
            onTimeSlotChange={(val) => setValue('timeSlot', val, { shouldValidate: true })}
            isFastingRequired={isFastingRequired}
            onFastingChange={(val) => setValue('isFastingRequired', val, { shouldValidate: true })}
          />

          <BookingTestSelector
            selectedTests={selectedTests}
            onToggleTest={toggleTest}
            assignedPhlebotomistId={assignedPhlebotomistId}
            onPhlebotomistChange={setAssignedPhlebotomistId}
            phlebotomists={phlebotomists}
            specialInstructions={specialInstructions}
            onSpecialInstructionsChange={(val) => setValue('specialInstructions', val, { shouldValidate: true })}
          />

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground font-semibold"
            >
              {isSubmitting ? 'Booking Collection...' : 'Confirm Home Collection Booking'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
