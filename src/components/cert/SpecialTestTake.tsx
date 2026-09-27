import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CertTest, CertSpecialResult } from '../../types';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { scoreCertAnswers } from '../../lib/certScoring';
import { cleanForFirestore } from '../../lib/db';
import { getBrowserInfo } from '../../lib/certUtils';
import { 
  itemDifficultiesFromMatrix, 
  generateSyntheticMatrix, 
  seedFromString 
} from '../../lib/synthetic';
import { computeRaschWithReference } from '../../lib/rasch';
import { MathAnswerField } from './MathAnswerField';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  Send, 
  Lock, 
  User, 
  Trophy, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const SpecialTestTake: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<CertTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'name_input' | 'taking' | 'submitting' | 'result'>('name_input');
  const [candidateName, setCandidateName] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [finalResult, setFinalResult] = useState<CertSpecialResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!testId) return;

    const fetchTest = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'cert_tests', testId));
        // Ochiq havola faqat "Maxsus" rejimdagi testlar uchun ishlaydi.
        // Guruh imtihonlariga biriktirilgan testlar bu yo'l bilan ochilmasligi kerak.
        if (!snap.exists() || snap.data()?.mode !== 'special') {
          setTest(null);
        } else {
          setTest({ id: snap.id, ...snap.data() } as CertTest);
        }
      } catch (err) {
        console.error("Error loading special test:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Maxsus test yuklanmoqda...
        </span>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Test topilmadi</h2>
          <p className="text-xs text-slate-500">
            Kiritilgan havola noto'g'ri yoki test o'chirib yuborilgan bo'lishi mumkin.
          </p>
        </div>
      </div>
    );
  }

  const isEnded = test.isEnded || test.isClosed || test.status === 'completed';
  if (isEnded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ushbu test yakunlangan</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Test muallifi tomonidan javoblar qabuli to'xtatilgan. Hozirda yangi javoblar qabul qilinmaydi.
          </p>
        </div>
      </div>
    );
  }

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      alert("Iltimos, ism-familiyangizni kiriting!");
      return;
    }
    setStep('taking');
  };

  const handleSubmit = async () => {
    if (step === 'submitting') return;

    try {
      setStep('submitting');

      // Check again if test closed
      const freshSnap = await getDoc(doc(db, 'cert_tests', test.id));
      const freshData = freshSnap.data() as CertTest | undefined;
      if (freshData?.isEnded || freshData?.isClosed || freshData?.status === 'completed') {
        alert("Ushbu test allaqachon yakunlangan. Javoblaringiz qabul qilinmadi.");
        setStep('name_input');
        return;
      }

      // 1. Score answers
      const { raschItems, score, total } = await scoreCertAnswers(test, answers);

      // 2. Fetch existing results to compute Rasch
      const qOld = query(collection(db, 'cert_special_results'), where('testId', '==', test.id));
      const oldSnap = await getDocs(qOld);
      const oldResults = oldSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as CertSpecialResult))
        .filter(r => r.items && r.items.length === 55);

      const currentCandidateId = `current_${Date.now()}`;
      const matrix = [
        ...oldResults.map(r => ({
          studentId: r.id || '',
          studentName: r.studentName,
          items: r.items
        })),
        {
          studentId: currentCandidateId,
          studentName: candidateName.trim(),
          items: raschItems
        }
      ];

      // 3. Compute Rasch with 10,000 synthetic cohort
      const difficulties = itemDifficultiesFromMatrix(matrix);
      const synthetic = generateSyntheticMatrix(difficulties, {
        count: 10000,
        seed: seedFromString(test.id)
      });
      const report = computeRaschWithReference(matrix, synthetic, false);

      const myRasch = report.results.find(r => r.studentId === currentCandidateId) || {
        ball: 50,
        grade: 'NC',
        theta: 0,
        rank: 1,
        percentile: 50,
        correct: score
      };

      const browserInfo = getBrowserInfo();

      const docData: any = {
        testId: test.id,
        teacherUsername: test.teacherUsername,
        testTitle: test.title,
        studentName: candidateName.trim(),
        score,
        total: total || 55,
        ball: myRasch.ball,
        grade: myRasch.grade,
        theta: myRasch.theta,
        percentile: myRasch.percentile ?? 0,
        rank: myRasch.rank ?? 1,
        items: raschItems,
        answers,
        platform: 'web',
        browserInfo,
        submittedAt: new Date().toISOString()
      };

      const ref = await addDoc(collection(db, 'cert_special_results'), cleanForFirestore(docData));
      docData.id = ref.id;

      setFinalResult(docData);
      setStep('result');
    } catch (err) {
      console.error("Error submitting special test:", err);
      alert("Javoblarni yuborishda xatolik yuz berdi.");
      setStep('taking');
    }
  };

  // STEP 1: NAME INPUT
  if (step === 'name_input') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-scaleUp">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Milliy Sertifikat • Maxsus Test</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {test.title}
            </h1>
            <p className="text-xs text-slate-500">
              45 ta savol (55 birlik) • Rasch modeli asosida baholash
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs text-indigo-900 dark:text-indigo-200">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Imtihon qoidalari:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 opacity-90">
              <li>1–35-savollar: Test variantlari (A–D / A–F)</li>
              <li>36–45-savollar: Ochiq matematik formulalar (a va b)</li>
              <li>Natijangiz Rasch modeli (T-ball) bo'yicha darhol hisoblanadi</li>
            </ul>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Ism va familiyangiz:
              </label>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Aliyev"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Testni boshlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // STEP 3: RESULT SCREEN
  if (step === 'result' && finalResult) {
    const errorCount = (finalResult.total || 55) - finalResult.score;
    const efficiencyPct = Math.round((finalResult.score / (finalResult.total || 55)) * 100);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-scaleUp">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Natija Muvaffaqiyatli Hisoblandi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {finalResult.studentName}
            </h2>
            <p className="text-xs text-slate-500">{finalResult.testTitle}</p>
          </div>

          {/* Big Score Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-xl text-center space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Rasch Modeli Balli (T-Shkala)
            </div>
            <div className="text-5xl font-black text-amber-300">
              {finalResult.ball}
            </div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-black border border-white/30">
              Daraja: {finalResult.grade}
            </div>
          </div>

          {/* Detailed metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-slate-400 font-semibold">To'g'ri</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {finalResult.score} / {finalResult.total}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-slate-400 font-semibold">Xato</div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {errorCount}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-slate-400 font-semibold">Samaradorlik</div>
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {efficiencyPct}%
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-slate-400 font-semibold">Foizli o'rin</div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {finalResult.percentile}%
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
            Natijangiz 10 000 ta kalibrlangan kohorta va ishtirokchilar guruhi ichida Rasch modeli orqali standartlashtirildi.
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: ANSWER SHEET TAKING
  const questions = test.questions || [];

  const answeredCount = questions.reduce((acc, q) => {
    if (q.isOpenEnded) {
      const a = Boolean(answers[`${q.id}_0`]?.trim());
      const b = Boolean(answers[`${q.id}_1`]?.trim());
      return acc + (a || b ? 1 : 0);
    }
    return acc + (answers[q.id] !== undefined ? 1 : 0);
  }, 0);

  const progressPct = Math.round((answeredCount / 45) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">
              {candidateName}
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="hidden sm:inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {answeredCount} / 45 savol belgilandi ({progressPct}%)
            </span>
          </div>
          <h2 className="text-xs sm:text-base font-bold truncate">
            {test.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="sm:hidden text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {answeredCount}/45
          </span>
          <button
            onClick={() => {
              if (answeredCount < 45) {
                setShowConfirmModal(true);
              } else {
                handleSubmit();
              }
            }}
            disabled={step === 'submitting'}
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {step === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">{step === 'submitting' ? "Hisoblanmoqda..." : "Natijani ko'rish"}</span>
            <span className="sm:hidden">{step === 'submitting' ? "Kuting..." : "Natija"}</span>
          </button>
        </div>
      </div>

      {/* Answer Sheet Grid */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1-35 Closed */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1–35-savollar: Test kalitlari
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                1–32 (A–D) • 33–35 (A–F)
              </span>
            </div>

            <div className="space-y-2">
              {questions.slice(0, 35).map((q, idx) => {
                const opts = q.options?.length ? q.options : (idx >= 32 ? ['A','B','C','D','E','F'] : ['A','B','C','D']);
                return (
                  <div 
                    key={q.id}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2"
                  >
                    <span className="w-6 sm:w-8 font-mono font-bold text-xs text-slate-600 dark:text-slate-400 shrink-0">{idx + 1}.</span>
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                      {opts.map((_, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isSelected = answers[q.id] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setAnswers({ ...answers, [q.id]: optIdx })}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 36-45 Open */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                36–45-savollar: Ochiq formulalar (a va b)
              </h3>
              <span className="text-[11px] font-bold text-indigo-500">
                2 birlikdan
              </span>
            </div>

            <div className="space-y-3.5">
              {questions.slice(35, 45).map((q, localIdx) => {
                const qIdx = 35 + localIdx;
                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {qIdx + 1}-topshiriq:
                    </span>
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">a) qism:</span>
                        <MathAnswerField
                          value={answers[`${q.id}_0`] || ''}
                          onChange={(val) => setAnswers({ ...answers, [`${q.id}_0`]: val })}
                          placeholder="Javobni kiriting..."
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">b) qism:</span>
                        <MathAnswerField
                          value={answers[`${q.id}_1`] || ''}
                          onChange={(val) => setAnswers({ ...answers, [`${q.id}_1`]: val })}
                          placeholder="Javobni kiriting..."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Submit Banner */}
        <div className="p-6 rounded-3xl bg-indigo-600 text-white text-center space-y-3 shadow-xl shadow-indigo-600/20">
          <h3 className="text-lg font-bold">
            {answeredCount === 45 ? "Barcha 45 ta savol to'ldirildi!" : `${answeredCount} / 45 ta savolga javob berildi`}
          </h3>
          <p className="text-xs text-indigo-100 max-w-md mx-auto">
            Tugmani bosishingiz bilan javoblaringiz tekshirilib, Rasch modeli (T-ball) bo'yicha darhol sertifikat darajangiz chiqariladi.
          </p>
          <button
            onClick={() => {
              if (answeredCount < 45) {
                setShowConfirmModal(true);
              } else {
                handleSubmit();
              }
            }}
            disabled={step === 'submitting'}
            className="px-8 py-3.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {step === 'submitting' ? "Hisoblanmoqda..." : "Javoblarni yuborish va natijani ko'rish"}
          </button>
        </div>
      </div>

      {/* Confirmation Modal for incomplete answers */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Barcha savollar to'ldirilmadi
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Siz 45 ta savoldan <strong>{answeredCount}</strong> tasiga javob berdingiz ({45 - answeredCount} ta qoldi). Shunda ham topshirishni xohlaysizmi?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Davom etish
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Ha, yuborish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

