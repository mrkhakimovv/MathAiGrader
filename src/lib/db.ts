import { collection, addDoc, getDocs, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { GradingResult } from '../types';

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
    await addDoc(collection(db, 'history'), {
      ...result,
      createdAt: serverTimestamp(),
    });
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
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
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