import { WorkOrder } from '@/types/firestore';

export function convertToCSV(data: WorkOrder[]): string {
  if (data.length === 0) return '';

  const headers = [
    'ID Firestore',
    'No. WO',
    'Tanggal Kejadian',
    'Tgl Input',
    'Jam Input',
    'Tgl Laporan',
    'Jam Laporan',
    'Tgl Delegasi',
    'Jam Delegasi',
    'Tgl Selesai',
    'Jam Selesai',
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

  const formatCSVDateParts = (date: unknown) => {
    if (!date) return { date: '', time: '' };
    try {
      let d: Date;
      if (date && typeof date === 'object') {
        const ts = date as { toDate?: () => Date; seconds?: number };
        if (typeof ts.toDate === 'function') {
          d = ts.toDate();
        } else if (typeof ts.seconds === 'number') {
          d = new Date(ts.seconds * 1000);
        } else {
          d = new Date(String(date));
        }
      } else {
        d = new Date(String(date));
      }

      if (isNaN(d.getTime())) return { date: String(date), time: '' };
      
      const datePart = d.toLocaleDateString('id-ID');
      const timePart = d.toLocaleTimeString('id-ID').replace(/\./g, ':');
      
      return { date: datePart, time: timePart };
    } catch {
      return { date: String(date), time: '' };
    }
  };

  const escapeCSV = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = data.map(wo => {
    const createdAt = formatCSVDateParts(wo.createdAt);
    const tanggalDibuat = formatCSVDateParts(wo.tanggalDibuat);
    const tglDelegasi = formatCSVDateParts(wo.tglDelegasi);
    const tglSelesai = formatCSVDateParts(wo.tglSelesai);

    return [
      escapeCSV(wo.id),
      escapeCSV(wo.nomor || wo.woNumber || ''),
      escapeCSV(wo.tanggalKejadian || ''),
      escapeCSV(createdAt.date),
      escapeCSV(createdAt.time),
      escapeCSV(tanggalDibuat.date),
      escapeCSV(tanggalDibuat.time),
      escapeCSV(tglDelegasi.date),
      escapeCSV(tglDelegasi.time),
      escapeCSV(tglSelesai.date),
      escapeCSV(tglSelesai.time),
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
    ];
  });

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
