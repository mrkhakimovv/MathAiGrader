/**
 * Milliy Sertifikat — imtihon natijalari bo'yicha umumiy yordamchilar.
 *
 * Rasch hisobotini hisoblash mantig'i bir necha joyda kerak bo'ladi
 * (yakunlash, tahrirlash, natijani o'chirish, test kaliti o'zgarganda qayta
 * hisoblash, jonli natijalar oynasi). Hammasi shu fayldagi funksiyalardan
 * foydalanadi — shunda natija qayerdan hisoblansa ham bir xil chiqadi.
 */
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { CertExam, CertResult } from '../types';
import {
  dedupeBestAttempts,
  computeRaschReport,
  computeRaschWithReference,
  RaschReport,
} from './rasch';
import { itemDifficultiesFromMatrix, generateSyntheticMatrix, seedFromString } from './synthetic';

type ExamSyntheticSettings = Pick<CertExam, 'id' | 'syntheticEnabled' | 'syntheticCount'>;

/** Imtihonning barcha natijalarini Firestore'dan oladi. */
export async function fetchExamResults(examId: string): Promise<CertResult[]> {
  const snap = await getDocs(query(collection(db, 'cert_results'), where('examId', '==', examId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CertResult));
}

/**
 * Natijalar ro'yxatidan Rasch hisobotini hisoblaydi.
 * @param includeSynthetic  true — sintetik (tayanch) o'quvchilar ham ro'yxatga qaytadi
 *                          (faqat ekranda ko'rsatish uchun; bazaga HECH QACHON saqlanmaydi).
 * @returns hisobot yoki baholanadigan natija bo'lmasa null
 */
export function computeExamReportFromResults(
  exam: ExamSyntheticSettings,
  results: CertResult[],
  includeSynthetic = false
): RaschReport | null {
  const valid = results.filter((r) => Array.isArray(r.raschItems) && r.raschItems.length > 0);
  const best = dedupeBestAttempts(valid);
  if (best.length === 0) return null;

  const numItems = best[0].raschItems.length;
  const matrix = best
    .filter((r: any) => r.raschItems.length === numItems)
    .map((r: any) => ({ studentId: r.studentId, studentName: r.studentName, items: r.raschItems }));

  const synCount = exam.syntheticEnabled ? Math.max(0, Math.floor(exam.syntheticCount || 0)) : 0;
  if (synCount > 0) {
    const difficulties = itemDifficultiesFromMatrix(matrix);
    const synthetic = generateSyntheticMatrix(difficulties, {
      count: synCount,
      seed: seedFromString(exam.id), // barqaror: har safar aynan bir xil tayanch guruh
    });
    return computeRaschWithReference(matrix, synthetic, includeSynthetic);
  }
  return computeRaschReport(matrix);
}

/** Firestore'dan natijalarni olib, hisobotni hisoblaydi. */
export async function computeExamReport(
  exam: ExamSyntheticSettings,
  includeSynthetic = false
): Promise<RaschReport | null> {
  const results = await fetchExamResults(exam.id);
  return computeExamReportFromResults(exam, results, includeSynthetic);
}

/**
 * Imtihonni yakunlaydi: hisobotni hisoblab, imtihon hujjatiga muzlatadi.
 * @returns hisobot (natija bo'lmasa null — bu holda imtihon o'zgarmaydi)
 */
export async function finalizeExam(exam: CertExam): Promise<RaschReport | null> {
  const report = await computeExamReport(exam, false);
  if (!report) return null;
  await updateDoc(doc(db, 'cert_exams', exam.id), {
    status: 'ended',
    finalizedAt: exam.finalizedAt || new Date().toISOString(),
    raschReport: report,
  });
  return report;
}

/**
 * Yakunlangan imtihonning muzlatilgan hisobotini joriy natijalar bo'yicha yangilaydi
 * (natija o'chirilganda, kalit o'zgarganda, sintetik sozlama o'zgarganda).
 * Faol imtihonda hech narsa qilmaydi — u yakunlanganda baribir hisoblanadi.
 */
export async function refreshFrozenReport(exam: CertExam): Promise<void> {
  if (exam.status !== 'ended') return;
  const report = await computeExamReport(exam, false);
  await updateDoc(doc(db, 'cert_exams', exam.id), { raschReport: report ?? null });
}

/** Imtihonni va unga tegishli barcha natijalarni o'chiradi. */
export async function deleteExamWithResults(examId: string): Promise<void> {
  const snap = await getDocs(query(collection(db, 'cert_results'), where('examId', '==', examId)));
  // writeBatch bitta paketda 500 tagacha amal qabul qiladi
  for (let i = 0; i < snap.docs.length; i += 450) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  await deleteDoc(doc(db, 'cert_exams', examId));
}

/** Rasch darajasi uchun Tailwind rang klasslari. */
export function gradeColorClass(grade: string): string {
  if (grade === 'A+' || grade === 'A' || grade === 'B+') return 'text-emerald-600 dark:text-emerald-400';
  if (grade === 'NC') return 'text-rose-600 dark:text-rose-400';
  return 'text-amber-600 dark:text-amber-400';
}
