'use client';
'use no memo';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { loginSchema, type LoginSchema } from '../../schemas/login.schema';
import { useLogin, useForgotPassword } from '../../api/use-auth';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [forgotSentEmail, setForgotSentEmail] = React.useState<string | null>(null);
  const login = useLogin();
  const forgotPassword = useForgotPassword();

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values);
  });

  const handleForgotPassword = () => {
    const email = getValues('email');
    if (!email) {
      setError('email', { message: 'Enter your email address to reset password' });
      return;
    }
    forgotPassword.mutate(email, {
      onSuccess: () => setForgotSentEmail(email),
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {/* Global error */}
      {login.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs"
        >
          <span className="shrink-0 font-bold">⚠</span>
          <span>{(login.error as Error).message}</span>
        </div>
      )}

      {/* Forgot password confirmation */}
      {forgotSentEmail && (
        <div
          role="status"
          className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs"
        >
          <span className="shrink-0 font-bold">✓</span>
          <span>Password reset link sent to <strong>{forgotSentEmail}</strong>.</span>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          autoFocus
          inputMode="email"
          placeholder="dr.sharma@apexdiag.in"
          {...register('email')}
          className={cn(
            'w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
            errors.email
              ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
              : '',
          )}
        />
        {errors.email && (
          <p className="text-xs text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Password
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={forgotPassword.isPending}
            className="text-xs text-muted-foreground hover:text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:underline"
          >
            {forgotPassword.isPending ? 'Sending…' : 'Forgot password?'}
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className={cn(
              'w-full h-10 px-3 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
              errors.password
                ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                : '',
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        id="login-submit-btn"
        type="submit"
        disabled={login.isPending}
        className={cn(
          'w-full h-10 flex items-center justify-center gap-2 rounded-lg mt-2',
          'bg-primary text-primary-foreground text-sm font-semibold',
          'hover:bg-primary/90 active:scale-[0.99] transition-all shadow-xs',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {login.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Sign in to Workstation
          </>
        )}
      </button>

      {/* Signup link */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        New lab?{' '}
        <Link
          href="/signup"
          className="text-foreground font-semibold hover:underline"
        >
          Register your diagnostic lab
        </Link>
      </p>
    </form>
  );
}
