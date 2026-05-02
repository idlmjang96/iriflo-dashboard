'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DASHBOARD_ROUTES } from '@/constants/dashboard';
import * as LucideIcons from 'lucide-react';
import { LogOut, Waves, LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col h-screen transition-transform duration-300 ease-in-out shadow-xl
        lg:translate-x-0 lg:static lg:shadow-sm lg:shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Waves className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-green-700 tracking-tighter italic">IRIFLO</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] -mt-1">Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4">
        {DASHBOARD_ROUTES.map((route) => {
          const IconComponent = LucideIcons[route.icon as keyof typeof LucideIcons] as LucideIcon;
          const isActive = pathname === route.path;

          return (
            <Link 
              key={route.path}
              href={route.path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group
                ${isActive 
                  ? 'bg-green-50 text-green-700 border-l-4 border-green-500 shadow-sm' 
                  : 'text-slate-600 hover:text-green-700 hover:bg-green-50/50'}
              `}
            >
              <IconComponent 
                size={20} 
                className={`${isActive ? 'text-green-600' : 'text-slate-500 group-hover:text-green-600'} transition-colors`} 
              />
              {route.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100 space-y-4">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-300 border border-white" />
            <div>
              <p className="text-xs font-bold text-slate-900">Administrator</p>
              <p className="text-[10px] text-slate-600">Super Admin Mode</p>
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all group"
        >
          <LogOut size={20} className="text-red-500 group-hover:text-red-600" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  </>
  );
}
