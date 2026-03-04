'use client';

import { useEffect } from 'react';

type DashboardErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardErrorPage({ error, reset }: DashboardErrorPageProps) {
  useEffect(() => {
    console.error('Dashboard route error:', error);
  }, [error]);

  return (
    <section className="mx-auto mt-10 max-w-xl rounded-lg border border-red-200 bg-red-50 p-6">
      <h2 className="text-xl font-semibold text-red-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-red-800">Dashboard failed to render this route. Try reloading this segment.</p>
      <button
        type="button"
        className="mt-4 rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
        onClick={() => reset()}
      >
        Try again
      </button>
    </section>
  );
}
