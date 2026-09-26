import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { CertTest, CertExam, CertResult } from '../types';
import { scoreCertAnswers } from './certScoring';
import { 
  dedupeBestAttempts, 
  computeRaschReport, 
  computeRaschWithReference 
} from './rasch';
import { 
  itemDifficultiesFromMatrix, 
  generateSyntheticMatrix, 
  seedFromString 
} from './synthetic';

export async function recalculateCertificateExams(test: CertTest): Promise<void> {
  if (!test || !test.id) return;

  try {
    // 1. Get all cert_exams for this test
    const examQuery = query(collection(db, 'cert_exams'), where('testId', '==', test.id));
    const examSnap = await getDocs(examQuery);

    for (const examDoc of examSnap.docs) {
      const exam = { id: examDoc.id, ...examDoc.data() } as CertExam;

      // 2. Get all cert_results for this exam
      const resQuery = query(collection(db, 'cert_results'), where('examId', '==', exam.id));
      const resSnap = await getDocs(resQuery);

      for (const rDoc of resSnap.docs) {
        const res = { id: rDoc.id, ...rDoc.data() } as CertResult;
        if (res.answers) {
          const { raschItems, score, total } = await scoreCertAnswers(test, res.answers);
          const oldScore = res.score;
          const oldItemsStr = JSON.stringify(res.raschItems || []);
          const newItemsStr = JSON.stringify(raschItems);

          if (oldScore !== score || oldItemsStr !== newItemsStr) {
            await updateDoc(doc(db, 'cert_results', rDoc.id), {
              raschItems,
              score,
              total
            });
          }
        }
      }

      // 3. If exam is ended, recompute Rasch report
      if (exam.status === 'ended') {
        const refreshedResSnap = await getDocs(resQuery);
        const allResults = refreshedResSnap.docs.map(d => ({ id: d.id, ...d.data() } as CertResult));
        const validResults = allResults.filter(r => r.raschItems && r.raschItems.length > 0);
        const deduped = dedupeBestAttempts(validResults);

        if (deduped.length > 0) {
          const targetLen = deduped[0].raschItems.length;
          const matrix = deduped
            .filter(r => r.raschItems.length === targetLen)
            .map(r => ({
              studentId: r.studentId,
              studentName: r.studentName,
              items: r.raschItems
            }));

          let report = null;
          if (exam.syntheticEnabled && exam.syntheticCount > 0) {
            const difficulties = itemDifficultiesFromMatrix(matrix);
            const synthetic = generateSyntheticMatrix(difficulties, {
              count: exam.syntheticCount,
              seed: seedFromString(exam.id)
            });
            report = computeRaschWithReference(matrix, synthetic, false);
          } else {
            report = computeRaschReport(matrix);
          }

          await updateDoc(doc(db, 'cert_exams', exam.id), {
            raschReport: report
          });
        }
      }
    }
  } catch (err) {
    console.error("Error in recalculateCertificateExams:", err);
  }
}
