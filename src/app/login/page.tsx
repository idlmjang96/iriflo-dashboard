'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Waves } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(pin);
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1215] relative overflow-hidden font-sans">
      {/* Background patterns - Industrial Sage/Green */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-600 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900 rounded-full blur-[140px]" />
        {/* Sublte Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <div className="w-full max-w-md z-10 px-4">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-10 transition-all hover:border-green-500/30 group">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-green-500 text-white mb-6 shadow-2xl shadow-green-500/40 ring-4 ring-green-500/10 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <Waves size={40} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">
              IRIFLO <span className="text-green-500 not-italic">DASHBOARD</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-px w-8 bg-green-500/30" />
              <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em]">Monitoring System</p>
              <div className="h-px w-8 bg-green-500/30" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                Security Access PIN
              </label>
              <Input
                type="password"
                value={pin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPin(e.target.value)}
                placeholder="••••••"
                disabled={isLoading}
                className="bg-slate-900/50 border-white/10 text-white text-center text-4xl tracking-[0.5em] h-20 rounded-2xl focus:ring-green-500/30 focus:border-green-500/50 placeholder:text-slate-800 transition-all font-black shadow-inner"
                maxLength={6}
                inputMode="numeric"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5 text-xs text-red-400 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || pin.length === 0}
              className="w-full h-16 bg-green-600 hover:bg-green-500 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-green-600/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="uppercase tracking-widest text-sm">Verifikasi...</span>
                </div>
              ) : (
                <span className="uppercase tracking-widest text-sm">Akses Dashboard</span>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/5 mb-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                Restricted Access System
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
