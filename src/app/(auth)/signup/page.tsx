import type { Metadata } from 'next';
import { FlaskConical } from 'lucide-react';
import { SignupForm } from '@/features/auth/components/signup-form';

export const metadata: Metadata = {
  title: 'Register Your Lab — LabOS',
  description:
    'Register your diagnostic laboratory on LabOS — precision-engineered lab operations for independent pathology labs in India.',
};

export default function SignupPage() {
  return (
    <>
      {/* Brand header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-primary" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Create LabOS Account
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Set up your credentials to begin laboratory onboarding
        </p>
      </div>

      <SignupForm />
    </>
  );
}
