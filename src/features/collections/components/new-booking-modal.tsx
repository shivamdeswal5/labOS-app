'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [patientName, setPatientName] = React.useState('');
  const [patientPhone, setPatientPhone] = React.useState('');
  const [patientAge, setPatientAge] = React.useState('');
  const [patientSex, setPatientSex] = React.useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [address, setAddress] = React.useState('');
  const [preferredDate, setPreferredDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = React.useState(TIME_SLOTS[1]);
  const [isFastingRequired, setIsFastingRequired] = React.useState(true);
  const [selectedTests, setSelectedTests] = React.useState<string[]>([
    'HbA1c & Fasting Blood Sugar',
    'Lipid Profile Extended',
  ]);
  const [specialInstructions, setSpecialInstructions] = React.useState('');
  const [assignedPhlebotomistId, setAssignedPhlebotomistId] = React.useState<string>('');

  // Handle Escape key to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleTest = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !address.trim()) return;

    const assignedPhleb = phlebotomists.find((p) => p.id === assignedPhlebotomistId);

    const dto: CreateCollectionDto = {
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientAge: patientAge.trim() || undefined,
      patientSex,
      address: address.trim(),
      preferredDate,
      timeSlot,
      isFastingRequired,
      testNames: selectedTests,
      specialInstructions: specialInstructions.trim() || undefined,
      assignedPhlebotomistId: assignedPhleb?.id,
      assignedPhlebotomistName: assignedPhleb?.name,
    };

    onSubmit(dto);
  };

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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <BookingDemographicsSection
            patientName={patientName}
            onPatientNameChange={setPatientName}
            patientPhone={patientPhone}
            onPatientPhoneChange={setPatientPhone}
            patientAge={patientAge}
            onPatientAgeChange={setPatientAge}
            patientSex={patientSex}
            onPatientSexChange={setPatientSex}
            address={address}
            onAddressChange={setAddress}
          />

          <BookingSlotSection
            preferredDate={preferredDate}
            onPreferredDateChange={setPreferredDate}
            timeSlot={timeSlot}
            onTimeSlotChange={setTimeSlot}
            isFastingRequired={isFastingRequired}
            onFastingChange={setIsFastingRequired}
          />

          <BookingTestSelector
            selectedTests={selectedTests}
            onToggleTest={toggleTest}
            assignedPhlebotomistId={assignedPhlebotomistId}
            onPhlebotomistChange={setAssignedPhlebotomistId}
            phlebotomists={phlebotomists}
            specialInstructions={specialInstructions}
            onSpecialInstructionsChange={setSpecialInstructions}
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
