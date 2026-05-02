'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Secara default arahkan ke dashboard, middleware/context akan menangani proteksi
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-pulse text-blue-500 font-bold tracking-widest uppercase text-sm">
        Initializing IRIFLO...
      </div>
    </div>
  );
}
