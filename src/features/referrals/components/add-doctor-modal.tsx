'use client';

import * as React from 'react';
import { X, UserPlus, Stethoscope, Building2, Phone, Mail, Percent, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateDoctor } from '../api/use-commission';
import type { CommissionType } from '../types';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDoctorModal({ isOpen, onClose }: AddDoctorModalProps) {
  const [name, setName] = React.useState('');
  const [clinic, setClinic] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [specialty, setSpecialty] = React.useState('');
  const [regNumber, setRegNumber] = React.useState('');
  const [commissionType, setCommissionType] = React.useState<CommissionType>('PERCENTAGE');
  const [commissionValue, setCommissionValue] = React.useState<string>('15');
  const [pan, setPan] = React.useState('');
  const [bankAccount, setBankAccount] = React.useState('');
  const [ifsc, setIfsc] = React.useState('');

  const createDoctorMutation = useCreateDoctor();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createDoctorMutation.mutateAsync({
        name,
        clinicName: clinic,
        phone,
        email,
        specialty,
        registrationNumber: regNumber,
        commissionType,
        commissionValue: Number(commissionValue) || 0,
        pan,
        bankAccount,
        ifsc,
      });
      onClose();
    } catch (err) {
      console.error('Failed to register doctor:', err);
    }
  };

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
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs">
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
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rajiv Sethi"
                  className="w-full h-8 pl-8 pr-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Specialty
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Endocrinology, Nephrology"
                className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
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
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                  placeholder="e.g. Apex Diabetes Care, Bandra"
                  className="w-full h-8 pl-8 pr-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Medical Council Reg #
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. KMC-48192"
                className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
              />
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
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 00000"
                  className="w-full h-8 pl-8 pr-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@clinic.com"
                  className="w-full h-8 pl-8 pr-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
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
                onClick={() => setCommissionType('PERCENTAGE')}
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
                onClick={() => setCommissionType('FLAT')}
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
                onClick={() => setCommissionType('NONE')}
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
                  value={commissionValue}
                  onChange={(e) => setCommissionValue(e.target.value)}
                  placeholder={commissionType === 'PERCENTAGE' ? '15' : '200'}
                  className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
                />
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
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="AAAPC2019K"
                  className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-semibold text-muted-foreground mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="HDFC0001042"
                  className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-semibold text-muted-foreground mb-1">
                  Bank Account
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="501002941829"
                  className="w-full h-8 px-2.5 text-xs bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
                />
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
