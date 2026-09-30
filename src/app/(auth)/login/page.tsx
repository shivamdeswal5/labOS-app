import type { Metadata } from 'next';
import { FlaskConical } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Sign In — LabOS',
  description:
    'Sign in to LabOS — the precision-engineered diagnostic laboratory operating system for independent pathology labs in India.',
};

export default function LoginPage() {
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
          Welcome back
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Sign in to your diagnostic workstation
        </p>
      </div>

      <LoginForm />
    </>
  );
}
