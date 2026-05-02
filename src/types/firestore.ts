export interface WorkOrder {
  id: string;
  nomor?: string;
  woNumber?: string;
  status?: string;
  statusPerbaikan?: string;
  statusPersetujuan?: string;
  category?: string;
  kategori?: string;
  location?: string;
  lokasi?: string;
  description?: string;
  uraian?: string;
  detailKerusakan?: string;
  subKategori?: string;
  pic?: string;
  pelaporNama?: string;
  atasanNama?: string;
  atasanIRIS?: string;
  mandorNama?: string;
  assignedTo?: string;
  createdAt?: any;
  updatedAt?: any;
  tanggalDibuat?: any;
  tanggalKejadian?: string;
  tglDelegasi?: any;
  tglSelesai?: any;
  reservoir?: string;
  createdBy?: string;
  catatan?: string;
  imageBefore?: string;
  imageAfter?: string;
  isDummy?: boolean;
  resolvedByAdmin?: string;
}

export interface ActivityLog {
  id: string;
  type: 'STATUS_OVERRIDE' | 'DELEGATION' | 'DATA_CORRECTION' | 'EXPORT';
  woId?: string;
  adminName: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: any; // Firestore Timestamp
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'supervisor';
  email?: string;
}
