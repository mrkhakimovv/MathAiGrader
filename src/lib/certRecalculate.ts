import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { CertTest, CertExam, CertResult } from '../types';
import { scoreCertAnswers } from './certScoring';
import { refreshFrozenReport } from './certExam';

/**
 * Test kaliti o'zgarganda: shu testga bog'langan barcha imtihonlardagi natijalarni
 * saqlangan javoblar (answers) asosida qayta baholaydi. Yakunlangan imtihonlarda
 * muzlatilgan Rasch hisoboti ham yangilanadi.
 * @returns nechta natija o'zgargani
 */
export async function recalculateCertificateExams(test: CertTest): Promise<number> {
  if (!test || !test.id) return 0;
  let changedTotal = 0;

  const examSnap = await getDocs(query(collection(db, 'cert_exams'), where('testId', '==', test.id)));

  for (const examDoc of examSnap.docs) {
    const exam = { id: examDoc.id, ...examDoc.data() } as CertExam;
    const resSnap = await getDocs(query(collection(db, 'cert_results'), where('examId', '==', exam.id)));
    let changed = 0;

    for (const rDoc of resSnap.docs) {
      const res = { id: rDoc.id, ...rDoc.data() } as CertResult;
      if (!res.answers) continue;
      const { raschItems, score, total } = await scoreCertAnswers(test, res.answers);
      if (res.score !== score || JSON.stringify(res.raschItems || []) !== JSON.stringify(raschItems)) {
        await updateDoc(doc(db, 'cert_results', rDoc.id), { raschItems, score, total });
        changed++;
      }
    }

    if (changed > 0) {
      await refreshFrozenReport(exam);
      changedTotal += changed;
    }
  }
  return changedTotal;
}
