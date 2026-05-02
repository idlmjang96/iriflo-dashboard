import { db } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { WorkOrder, ActivityLog } from '@/types/firestore';

export async function getWorkOrders(filters?: {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  limit?: number;
}): Promise<WorkOrder[]> {
  let constraints: any[] = [];

  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }
  if (filters?.category) {
    constraints.push(where('category', '==', filters.category));
  }
  if (filters?.dateFrom) {
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    constraints.push(where('createdAt', '<=', Timestamp.fromDate(filters.dateTo)));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(filters?.limit || 1000));

  const q = query(collection(db, 'work_orders'), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Mapping from Firestore (original migration) to Dashboard fields
      woNumber: data.nomor || data.wo || data.woNumber || 'NO-ID',
      location: data.lokasi || data.location || 'Unknown Location',
      category: data.kategori || data.category || 'Uncategorized',
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      tglSelesai: data.tglSelesai?.toDate() || data.tanggalSelesai?.toDate() || data.finishedAt?.toDate() || data.tglSelesai,
    } as WorkOrder;
  });
}

export function subscribeToWorkOrders(
  callback: (data: WorkOrder[]) => void,
  filters?: { status?: string; limit?: number }
): Unsubscribe {
  let constraints: any[] = [];

  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(filters?.limit || 1000));

  const q = query(collection(db, 'work_orders'), ...constraints);

  return onSnapshot(q, 
    (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          woNumber: d.nomor || d.wo || d.woNumber || 'NO-ID',
          location: d.lokasi || d.location || 'Unknown Location',
          category: d.kategori || d.category || 'Uncategorized',
          createdAt: d.createdAt?.toDate(),
          updatedAt: d.updatedAt?.toDate(),
          tglSelesai: d.tglSelesai?.toDate() || d.tanggalSelesai?.toDate() || d.finishedAt?.toDate() || d.tglSelesai,
        } as WorkOrder;
      });
      callback(data);
    },
    (error) => {
      console.error("Firestore Subscription Error:", error);
    }
  );
}

export async function getWorkOrder(id: string): Promise<WorkOrder | null> {
  const docRef = doc(db, 'work_orders', id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    woNumber: data.nomor || data.wo || data.woNumber || 'NO-ID',
    location: data.lokasi || data.location || 'Unknown Location',
    category: data.kategori || data.category || 'Uncategorized',
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    tglSelesai: data.tglSelesai?.toDate() || data.tanggalSelesai?.toDate() || data.finishedAt?.toDate() || data.tglSelesai,
  } as WorkOrder;
}

export async function updateWorkOrderStatus(
  woId: string,
  newStatus: string,
  reason?: string,
  adminName?: string,
  completionDate?: Date
): Promise<void> {
  const woRef = doc(db, 'work_orders', woId);

  // Get old status
  const oldWO = await getWorkOrder(woId);

  // Build update payload
  const updatePayload: Record<string, any> = {
    status: newStatus,
    updatedAt: Timestamp.now(),
  };

  // If admin is completing the WO, record who did it and when
  if (newStatus === 'Selesai') {
    updatePayload.resolvedByAdmin = adminName || 'Admin';
    updatePayload.tglSelesai = completionDate 
      ? Timestamp.fromDate(completionDate) 
      : Timestamp.now();
    updatePayload.statusPerbaikan = 'Selesai';
  }

  // If reverting to Menunggu, clear admin resolution fields
  if (newStatus === 'Menunggu') {
    updatePayload.resolvedByAdmin = '';
    updatePayload.tglSelesai = null;
    updatePayload.statusPerbaikan = 'Menunggu';
  }

  // Update WO
  await updateDoc(woRef, updatePayload);

  // Log activity
  await addDoc(collection(db, 'activity_logs'), {
    type: 'STATUS_OVERRIDE',
    woId,
    oldValue: oldWO?.status,
    newValue: newStatus,
    reason: reason || 'Tidak ada alasan diberikan',
    adminName: adminName || 'Admin',
    timestamp: Timestamp.now(),
  });
}

export async function getActivityLogs(limitCount: number = 50): Promise<ActivityLog[]> {
  const q = query(
    collection(db, 'activity_logs'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate(),
  } as ActivityLog));
}

export function subscribeToActivityLogs(
  callback: (data: ActivityLog[]) => void,
  limitCount: number = 50
): Unsubscribe {
  const q = query(
    collection(db, 'activity_logs'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, 
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      } as ActivityLog));
      callback(data);
    },
    (error) => {
      console.error("Activity Logs Subscription Error:", error);
    }
  );
}
