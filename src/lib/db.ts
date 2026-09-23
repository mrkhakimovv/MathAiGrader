import { collection, addDoc, getDocs, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, getDoc, setDoc, where, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { GradingResult, Payment, AttendanceRecord } from '../types';

type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

/**
 * Strips all undefined fields from objects before sending to Firestore.
 * Firestore strictly rejects undefined in any document field.
 */
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => cleanForFirestore(item)) as any;
  }
  if (typeof obj === 'object') {
    // Preserve special Firestore objects like FieldValue, Timestamp, Date
    if (obj.constructor && obj.constructor.name !== 'Object') {
      return obj;
    }
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

export const cleanupOldAnalyses = async () => {
  try {
    const q = query(collection(db, 'history'));
    const snapshot = await getDocs(q);
    
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    const updatePromises: Promise<void>[] = [];
    
    snapshot.docs.forEach((document) => {
      const data = document.data();
      if (data.createdAt && data.createdAt.seconds) {
        const createdAtTime = data.createdAt.seconds * 1000;
        if (now - createdAtTime > oneWeek) {
          if (data.feedback !== null || data.errorSteps !== null || data.transcription !== null) {
            updatePromises.push(
              updateDoc(doc(db, 'history', document.id), {
                feedback: null,
                errorSteps: null,
                transcription: null
              })
            );
          }
        }
      }
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Failed to cleanup old analyses:", error);
  }
};

export const saveResult = async (result: GradingResult & { studentUsername?: string, studentName?: string }) => {
  try {
    const payload = cleanForFirestore({
      ...result,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'history'), payload);
  } catch (error) {
    handleFirestoreError(error, "write", 'history');
  }
};

export const subscribeToHistory = (callback: (history: GradingResult[]) => void) => {
  const q = query(collection(db, 'history'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GradingResult));
    callback(history);
  }, (error) => {
    handleFirestoreError(error, "get", 'history');
  });
};

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  const q = query(collection(db, collectionName));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    handleFirestoreError(error, "get", collectionName);
  });
};

export const saveToCollection = async (collectionName: string, data: any) => {
  try {
    const payload = cleanForFirestore({
      ...data,
      createdAt: serverTimestamp(),
    });
    const docRef = await addDoc(collection(db, collectionName), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, "write", collectionName);
    throw error;
  }
};

// ============================================================
// XARAJAT HISOBINI TOZALASH (soft-reset)
// Grading yozuvlari O'CHIRILMAYDI (ular boshqa joyda ham kerak).
// Faqat "reset nuqtasi" (vaqt) saqlanadi. Xarajat oynasi shu
// vaqtdan KEYINGI grading'largagina hisob yuritadi. Ya'ni hisob
// nol'dan boshlanadi, lekin hech qanday ma'lumot yo'qolmaydi.
// ============================================================

// Reset nuqtasini o'qish (millisekundda). 0 => hech qachon tozalanmagan.
export const getExpensesResetAt = async (): Promise<number> => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'expenses'));
    if (!snap.exists()) return 0;
    const v = snap.data()?.resetAtMs;
    return typeof v === 'number' ? v : 0;
  } catch (error) {
    handleFirestoreError(error, 'get', 'settings/expenses');
    return 0;
  }
};

// Reset nuqtasini "hozir" ga o'rnatish. Qaytadi: yangi reset vaqti (ms).
export const resetExpensesHistory = async (): Promise<number> => {
  const nowMs = Date.now();
  try {
    await setDoc(
      doc(db, 'settings', 'expenses'),
      { resetAtMs: nowMs, resetAt: serverTimestamp(), resetBy: auth.currentUser?.email ?? null },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, 'write', 'settings/expenses');
  }
  return nowMs;
};

// ============================================================
// TO'LOVLAR VA DAVOMAT (Payments & Attendance)
// ============================================================

export const subscribeToTeacherCollection = (
  collectionName: string,
  teacherUsername: string,
  callback: (data: any[]) => void
) => {
  const q = query(
    collection(db, collectionName),
    where('teacherUsername', '==', teacherUsername)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, 'list', collectionName);
    }
  );
};

export const addPayment = async (
  payment: Omit<Payment, 'id' | 'createdAt'>
) => {
  try {
    const payload = cleanForFirestore({
      ...payment,
      createdAt: serverTimestamp(),
    });
    const docRef = await addDoc(collection(db, 'payments'), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', 'payments');
    throw error;
  }
};

export const deletePayment = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'payments', id));
  } catch (error) {
    handleFirestoreError(error, 'delete', `payments/${id}`);
    throw error;
  }
};

export const updatePayment = async (id: string, data: Partial<Payment>) => {
  try {
    const payload = cleanForFirestore(data);
    await updateDoc(doc(db, 'payments', id), payload);
  } catch (error) {
    handleFirestoreError(error, 'update', `payments/${id}`);
    throw error;
  }
};

export const saveAttendance = async (
  groupId: string,
  date: string,
  data: Omit<AttendanceRecord, 'id'>
) => {
  const docId = `${groupId}_${date}`;
  try {
    const payload = cleanForFirestore({
      ...data,
      updatedAt: Date.now(),
    });
    await setDoc(doc(db, 'attendance', docId), payload, { merge: true });
    return docId;
  } catch (error) {
    handleFirestoreError(error, 'write', `attendance/${docId}`);
    throw error;
  }
};

export const updateStudentDiscounts = async (
  studentId: string,
  discounts: { [groupId: string]: number }
) => {
  try {
    await updateDoc(doc(db, 'students', studentId), { discounts });
  } catch (error) {
    handleFirestoreError(error, 'update', `students/${studentId}`);
    throw error;
  }
};

export const updateStudentInitialFee = async (
  studentId: string,
  groupId: string,
  amount: number | null,
  month: string
) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    const snap = await getDoc(studentRef);
    const currentData = snap.exists() ? snap.data() : {};

    const initialFees = { ...(currentData.initialFees || {}) };
    const initialFeeMonths = { ...(currentData.initialFeeMonths || {}) };

    if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
      delete initialFees[groupId];
      delete initialFeeMonths[groupId];
    } else {
      initialFees[groupId] = amount;
      initialFeeMonths[groupId] = month;
    }

    const payload = cleanForFirestore({
      initialFees,
      initialFeeMonths,
      initialFee: amount ?? null,
      initialFeeMonth: month,
      joinMonth: currentData.joinMonth || month,
    });

    await updateDoc(studentRef, payload);
  } catch (error) {
    handleFirestoreError(error, 'update', `students/${studentId}`);
    throw error;
  }
};

export const subscribeToStudentPayments = (
  studentId: string,
  callback: (data: Payment[]) => void
) => {
  const q = query(
    collection(db, 'payments'),
    where('studentId', '==', studentId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, 'list', 'payments');
    }
  );
};
