export const STATUS_CONFIG = {
  Menunggu: { 
    label: 'Menunggu',
    bg: 'bg-amber-50', 
    text: 'text-amber-600', 
    dot: 'bg-amber-500' 
  },
  'Menunggu Approval': { 
    label: 'Menunggu Approval',
    bg: 'bg-amber-100', 
    text: 'text-amber-700', 
    dot: 'bg-amber-600' 
  },
  Disetujui: { 
    label: 'Disetujui',
    bg: 'bg-sky-50', 
    text: 'text-sky-600', 
    dot: 'bg-sky-500' 
  },
  Proses: { 
    label: 'Proses',
    bg: 'bg-indigo-50', 
    text: 'text-indigo-600', 
    dot: 'bg-indigo-500' 
  },
  'Proses Perbaikan': { 
    label: 'Proses Perbaikan',
    bg: 'bg-indigo-50', 
    text: 'text-indigo-600', 
    dot: 'bg-indigo-500' 
  },
  Selesai: { 
    label: 'Selesai',
    bg: 'bg-emerald-100', 
    text: 'text-emerald-700', 
    dot: 'bg-emerald-600' 
  },
};

export const ACTIVITY_TYPES = {
  STATUS_OVERRIDE: 'Status Override',
  DELEGATION: 'Delegasi',
  DATA_CORRECTION: 'Koreksi Data',
  EXPORT: 'Ekspor Data',
};

export const DASHBOARD_ROUTES = [
  { name: 'Overview', path: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Monitoring', path: '/dashboard/monitoring', icon: 'Activity' },
  { name: 'Reports', path: '/dashboard/reports', icon: 'FileText' },
  { name: 'Admin Panel', path: '/dashboard/admin', icon: 'ShieldAlert' },
];

export const SLA_TARGETS: Record<string, { respond: number; resolve: number }> = {
  'Jaringan Luar SDI': { respond: 4, resolve: 48 }, // 48 hours = 2 days
  'Jaringan Transfer': { respond: 4, resolve: 72 },
  'Pompa & Kelistrikan': { respond: 2, resolve: 24 },
  'Reservoir': { respond: 8, resolve: 96 },
  'Default': { respond: 6, resolve: 48 }
};
