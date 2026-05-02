'use client';
import { User, Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest hidden md:block">
          System Overview / <span className="text-green-700">Production</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />
        
        <div className="h-6 w-[1px] bg-slate-200" />
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">Admin IRIFLO</p>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
