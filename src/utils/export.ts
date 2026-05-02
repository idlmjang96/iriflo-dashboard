import { WorkOrder } from '@/types/firestore';

export function convertToCSV(data: WorkOrder[]): string {
  if (data.length === 0) return '';

  const headers = [
    'ID Firestore',
    'No. WO',
    'Tanggal Kejadian',
    'Waktu Input Sistem',
    'Tanggal Laporan Dibuat',
    'Waktu Delegasi',
    'Waktu Selesai',
    'Pelapor',
    'Atasan',
    'Atasan IRIS',
    'Reservoir',
    'Lokasi',
    'Kategori',
    'Sub Kategori',
    'Detail Kerusakan',
    'Deskripsi',
    'PIC',
    'Status Verifikasi',
    'Status Perbaikan',
    'Mandor',
    'Catatan',
    'Admin Penyelesai'
  ];

  const formatCSVDate = (date: any) => {
    if (!date) return '';
    try {
      // Menangani Firestore Timestamp object
      if (date && typeof date === 'object') {
        if (typeof date.toDate === 'function') {
          return date.toDate().toLocaleString('id-ID').replace(',', '');
        } else if (typeof date.seconds === 'number') {
          return new Date(date.seconds * 1000).toLocaleString('id-ID').replace(',', '');
        }
      }
      
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      return d.toLocaleString('id-ID').replace(',', '');
    } catch (e) {
      return String(date);
    }
  };

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = data.map(wo => [
    escapeCSV(wo.id),
    escapeCSV(wo.nomor || wo.woNumber || ''),
    escapeCSV(wo.tanggalKejadian || ''),
    escapeCSV(formatCSVDate(wo.createdAt)),
    escapeCSV(formatCSVDate(wo.tanggalDibuat)),
    escapeCSV(formatCSVDate(wo.tglDelegasi)),
    escapeCSV(formatCSVDate(wo.tglSelesai)),
    escapeCSV(wo.pelaporNama || ''),
    escapeCSV(wo.atasanNama || ''),
    escapeCSV(wo.atasanIRIS || ''),
    escapeCSV(wo.reservoir || ''),
    escapeCSV(wo.lokasi || ''),
    escapeCSV(wo.kategori || ''),
    escapeCSV(wo.subKategori || ''),
    escapeCSV(wo.detailKerusakan || ''),
    escapeCSV((wo.uraian || wo.description || '').replace(/\n/g, ' ')),
    escapeCSV(wo.pic || ''),
    escapeCSV(wo.statusPersetujuan || wo.status || ''),
    escapeCSV(wo.statusPerbaikan || ''),
    escapeCSV(wo.mandorNama || ''),
    escapeCSV((wo.catatan || '').replace(/\n/g, ' ')),
    escapeCSV(wo.resolvedByAdmin || '')
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  return csvContent;
}


export function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
