'use client';
'use no memo';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle2, Mail, Building2 } from 'lucide-react';
import { signupSchema, type SignupSchema } from '../../schemas/signup.schema';
import { useSignup } from '../../api/use-auth';
import { cn } from '@/lib/utils';

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<SignupSchema>>['register']>;
  endAdornment?: React.ReactNode;
}

function Field({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  error,
  registration,
  endAdornment,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          {...registration}
          className={cn(
            'w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
            endAdornment ? 'pr-10' : '',
            error
              ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
              : '',
          )}
        />
        {endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

export function SignupForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [emailConfirmRequired, setEmailConfirmRequired] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState('');
  const signup = useSignup();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      ownerFullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = handleSubmit((values) => {
    setSubmittedEmail(values.email);
    signup.mutate(values, {
      onSuccess: (result) => {
        if (result.requiresEmailConfirmation) {
          setEmailConfirmRequired(true);
        }
      },
    });
  });

  if (emailConfirmRequired) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Verify your email
        </h2>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
          We sent a verification link to{' '}
          <strong className="text-foreground">{submittedEmail}</strong>.
          Click the link in your inbox to activate your account and start lab onboarding.
        </p>
        <p className="text-xs text-muted-foreground pt-2">
          Already verified?{' '}
          <Link href="/login" className="text-foreground font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {signup.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs"
        >
          <span className="shrink-0 font-bold">⚠</span>
          <span>{(signup.error as Error).message}</span>
        </div>
      )}

      <Field
        id="signup-owner-name"
        label="Full Name"
        placeholder="Dr. Rajesh Kumar Sharma"
        autoComplete="name"
        error={errors.ownerFullName?.message}
        registration={register('ownerFullName')}
      />

      <Field
        id="signup-email"
        label="Work Email"
        type="email"
        placeholder="dr.sharma@apexdiag.in"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        registration={register('email')}
      />

      <Field
        id="signup-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        error={errors.password?.message}
        registration={register('password')}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {/* Password strength indicators */}
      {passwordValue && (
        <div className="flex gap-3 text-[11px] px-0.5">
          <span className={cn('flex items-center gap-1', passwordValue.length >= 8 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground')}>
            <CheckCircle2 className="w-3 h-3" /> 8+ chars
          </span>
          <span className={cn('flex items-center gap-1', /[A-Z]/.test(passwordValue) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground')}>
            <CheckCircle2 className="w-3 h-3" /> Uppercase
          </span>
          <span className={cn('flex items-center gap-1', /[0-9]/.test(passwordValue) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground')}>
            <CheckCircle2 className="w-3 h-3" /> Number
          </span>
        </div>
      )}

      <Field
        id="signup-confirm-password"
        label="Confirm Password"
        type={showConfirm ? 'text' : 'password'}
        placeholder="Repeat password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        registration={register('confirmPassword')}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {/* Onboarding preview chip */}
      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
        <Building2 className="w-4 h-4 text-primary shrink-0" />
        <span>Lab details, NABL ID & test panels are configured in the next onboarding step.</span>
      </div>

      <button
        id="signup-submit-btn"
        type="submit"
        disabled={signup.isPending}
        className={cn(
          'w-full h-10 flex items-center justify-center gap-2 rounded-lg mt-2',
          'bg-primary text-primary-foreground text-sm font-semibold',
          'hover:bg-primary/90 active:scale-[0.99] transition-all shadow-xs',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {signup.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Account…
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Create Account & Continue
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Already registered?{' '}
        <Link href="/login" className="text-foreground font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
