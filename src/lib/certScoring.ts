import { CertTest, CertQuestion } from '../types';
import { answersEqual } from '../components/cert/MathAnswerField';

async function checkOpen(userAns: any, correctAns: any): Promise<number> {
  const u = userAns !== undefined && userAns !== null ? String(userAns).trim() : '';
  const c = correctAns !== undefined && correctAns !== null ? String(correctAns).trim() : '';

  if (!u || !c) return 0;

  // 1. Direct normalized string match
  const cleanU = u.replace(/\s+/g, '').toLowerCase();
  const cleanC = c.replace(/\s+/g, '').toLowerCase();
  if (cleanU === cleanC) return 1;

  // 2. Math equivalence via compute-engine
  try {
    const isEq = await answersEqual(u, c);
    if (isEq) return 1;
  } catch (err) {
    console.error("Error evaluating open answer equality:", err);
  }

  return cleanU === cleanC ? 1 : 0;
}

export async function scoreCertAnswers(
  test: CertTest,
  answers: Record<string, any>
): Promise<{ raschItems: number[]; score: number; total: number }> {
  const questions = test.questions || [];
  const raschItems: number[] = [];

  for (const q of questions) {
    if (q.isOpenEnded) {
      const correctA = q.subAnswers?.[0]?.correctAnswerText || '';
      const correctB = q.subAnswers?.[1]?.correctAnswerText || '';

      const userA = answers[`${q.id}_0`];
      const userB = answers[`${q.id}_1`];

      const resA = await checkOpen(userA, correctA);
      const resB = await checkOpen(userB, correctB);

      raschItems.push(resA);
      raschItems.push(resB);
    } else {
      const userChoice = answers[q.id];
      const isCorrect = 
        q.correctOptionIndex >= 0 && 
        userChoice !== undefined && 
        userChoice !== null && 
        Number(userChoice) === Number(q.correctOptionIndex);

      raschItems.push(isCorrect ? 1 : 0);
    }
  }

  // Ensure total is 55 or matches questions unit length
  const total = raschItems.length || 55;
  const score = raschItems.reduce((acc, curr) => acc + curr, 0);

  return {
    raschItems,
    score,
    total
  };
}
