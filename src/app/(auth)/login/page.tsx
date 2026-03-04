'use client';

import { getDemoAccounts } from '@/features/auth/model/credentials';
import { useAuth } from '@/features/auth/ui/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isBootstrapped } = useAuth();

  const [email, setEmail] = useState('admin@accessops.dev');
  const [password, setPassword] = useState('demo123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = useMemo(() => searchParams.get('next') || '/users', [searchParams]);
  const accounts = useMemo(() => getDemoAccounts(), []);

  if (isBootstrapped && isAuthenticated) {
    router.replace('/users');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success('Signed in');
      router.push(nextPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">AccessOps Login</h1>
        <p className="mt-2 text-sm text-zinc-600">Use one of demo accounts to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-800">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-800">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Demo credentials</p>
          <ul className="mt-2 space-y-1 text-xs text-zinc-700">
            {accounts.map((account) => (
              <li key={account.email}>
                {account.role}: {account.email} / {account.password}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
