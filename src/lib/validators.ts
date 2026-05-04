const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const pinAttempts: Map<string, { count: number; lockedUntil?: number }> = new Map();

export function validatePIN(pin: string, ipAddress: string): boolean {
  const correctPin = process.env.NEXT_PUBLIC_DASHBOARD_PIN || process.env.DASHBOARD_PIN || '1234';
  
  // Check lockout
  const record = pinAttempts.get(ipAddress);
  if (record?.lockedUntil && Date.now() < record.lockedUntil) {
    throw new Error('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
  }
  
  // Validate PIN
  if (pin !== correctPin) {
    const newRecord = record ? { ...record, count: record.count + 1 } : { count: 1 };
    
    if (newRecord.count >= MAX_PIN_ATTEMPTS) {
      newRecord.lockedUntil = Date.now() + PIN_LOCKOUT_DURATION;
    }
    
    pinAttempts.set(ipAddress, newRecord);
    return false;
  }
  
  // Clear attempts on success
  pinAttempts.delete(ipAddress);
  return true;
}

export function isValidDateRange(dateFrom?: Date, dateTo?: Date): boolean {
  if (!dateFrom || !dateTo) return true;
  return dateFrom < dateTo;
}

export function sanitizeString(input: string, maxLength = 500): string {
  return input.trim().substring(0, maxLength);
}
