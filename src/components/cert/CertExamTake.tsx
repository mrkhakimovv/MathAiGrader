import React, { useState, useEffect, useRef } from 'react';
import { CertExam, CertTest, CertQuestion, Student } from '../../types';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { scoreCertAnswers } from '../../lib/certScoring';
import { cleanForFirestore } from '../../lib/db';
import { LatexRenderer } from './LatexRenderer';
import { MathAnswerField } from './MathAnswerField';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  X, 
  Loader2, 
  Menu,
  Check
} from 'lucide-react';

interface CertExamTakeProps {
  exam: CertExam;
  student: Student;
  onClose: () => void;
  onSubmitted: () => void;
}

export const CertExamTake: React.FC<CertExamTakeProps> = ({
  exam,
  student,
  onClose,
  onSubmitted
}) => {
  const [test, setTest] = useState<CertTest | null>(null);
  const [loadingTest, setLoadingTest] = useState(true);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  // Taymer ichidan chaqiriladigan avtomatik topshirish ENG SO'NGGI javoblarni
  // ko'rishi uchun ular ref'da ham saqlanadi (aks holda eskirgan — bo'sh — javoblar yuboriladi).
  const answersRef = useRef<Record<string, any>>({});
  answersRef.current = answers;
  const submittingRef = useRef(false);
  const setAnswer = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Unmount bo'lganda virtual klaviaturani yopish
  useEffect(() => {
    return () => {
      window.mathVirtualKeyboard?.hide();
    };
  }, []);

  const storageKey = `cert_progress_${exam.id}_${student.id}`;

  // Timer state
  const totalDurationSeconds = (exam.duration || 120) * 60;
  const [timeLeft, setTimeLeft] = useState<number>(totalDurationSeconds);
  const startTimeRef = useRef<number>(Date.now());

  // Load test document & restore localStorage progress
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoadingTest(true);
        const testRef = doc(db, 'cert_tests', exam.testId);
        const testSnap = await getDoc(testRef);

        if (!testSnap.exists()) {
          alert("Test varaqasi topilmadi!");
          onClose();
          return;
        }

        const tData = { id: testSnap.id, ...testSnap.data() } as CertTest;
        if (isMounted) setTest(tData);

        // Restore saved answers and timer
        try {
          const savedProgress = localStorage.getItem(storageKey);
          if (savedProgress) {
            const parsed = JSON.parse(savedProgress);
            if (parsed.answers) setAnswers(parsed.answers);
            if (parsed.startedAt) {
              const elapsedSeconds = Math.floor((Date.now() - parsed.startedAt) / 1000);
              const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);
              setTimeLeft(remaining);
              startTimeRef.current = parsed.startedAt;
            }
          } else {
            // First time opening
            const now = Date.now();
            startTimeRef.current = now;
            localStorage.setItem(storageKey, JSON.stringify({
              startedAt: now,
              answers: {}
            }));
          }
        } catch (e) {
          console.error("Error restoring exam progress:", e);
        }
      } catch (err) {
        console.error("Error loading cert test:", err);
      } finally {
        if (isMounted) setLoadingTest(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [exam.testId, exam.id, student.id, totalDurationSeconds]);

  // Persist answers on changes
  useEffect(() => {
    if (!test || isFinished) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        startedAt: startTimeRef.current,
        answers
      }));
    } catch (e) {}
  }, [answers, test, isFinished, storageKey]);

  // Warn on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFinished) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFinished]);

  // Countdown timer interval
  useEffect(() => {
    if (loadingTest || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Vaqt tugadi — eng so'nggi javoblar bilan avtomatik topshiriladi
          setTimeout(() => submitRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadingTest, isFinished]);

  const handleSubmitAnswers = async () => {
    if (submittingRef.current || isFinished || !test) return;
    submittingRef.current = true;
    const answers = answersRef.current;

    try {
      setIsSubmitting(true);

      // Score answers using certScoring
      const { raschItems, score, total } = await scoreCertAnswers(test, answers);

      // Count previous attempts
      const qAttempts = query(
        collection(db, 'cert_results'),
        where('examId', '==', exam.id),
        where('studentId', '==', student.id)
      );
      const attemptsSnap = await getDocs(qAttempts);
      const attempts = attemptsSnap.size + 1;

      const timeSpent = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
      const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.username;

      const resultPayload = cleanForFirestore({
        examId: exam.id,
        testId: test.id,
        teacherUsername: exam.teacherUsername,
        studentId: student.id,
        studentUsername: student.username,
        studentName,
        score,
        total,
        raschItems,
        answers,
        timeSpent,
        attempts,
        submittedAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'cert_results'), resultPayload);

      // Clear localStorage progress
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}

      setIsFinished(true);
      setShowConfirmFinish(false);
    } catch (err) {
      console.error("Error submitting cert exam:", err);
      submittingRef.current = false; // qayta urinishga ruxsat
      alert("Natijani yuborishda xatolik yuz berdi. Internetni tekshirib, \"Yakunlash\" tugmasini qayta bosing. Javoblaringiz saqlanib turibdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRef = useRef(handleSubmitAnswers);
  submitRef.current = handleSubmitAnswers;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loadingTest || !test) {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Imtihon topshiriqlari yuklanmoqda...
        </span>
      </div>
    );
  }

  // Completion screen
  if (isFinished) {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-center space-y-5 animate-scaleUp">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Imtihon Muvaffaqiyatli Yakunlandi!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Javoblaringiz qabul qilindi. Sizning yakuniy Rasch ballingiz va sertifikat darajangiz (A+, A, B...) imtihon yakunlangandan so'ng e'lon qilinadi.
            </p>
          </div>

          <button
            onClick={() => {
              onSubmitted();
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Sertifikatlar sahifasiga qaytish
          </button>
        </div>
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQ = questions[activeQIndex] || questions[0];
  const isLast5Min = timeLeft < 300;

  // Helpers to check if question answered
  const isAnswered = (q: CertQuestion) => {
    if (q.isOpenEnded) {
      return Boolean(answers[`${q.id}_0`]?.trim() || answers[`${q.id}_1`]?.trim());
    }
    return answers[q.id] !== undefined;
  };

  const answeredCount = questions.reduce((acc, q) => acc + (isAnswered(q) ? 1 : 0), 0);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 select-none animate-fadeIn">
      {/* Top Header */}
      <div className="p-3 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
            {test.mode === 'fast' ? "Tezkor" : "Rasmiy"}
          </span>
          <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {exam.title}
          </h2>
          <span className="hidden lg:inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 shrink-0">
            {answeredCount} / 45 topshirildi
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <span className="lg:hidden text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {answeredCount}/45
          </span>
          <div className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border font-mono font-black text-xs sm:text-base transition-colors ${
            isLast5Min 
              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
              : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowConfirmFinish(true)}
            disabled={isSubmitting}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 shrink-0" />}
            <span className="hidden sm:inline">Yakunlash</span>
            <span className="sm:hidden">Topshirish</span>
          </button>

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Savollar ro'yxati"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {test.mode === 'fast' ? (
            /* FAST MODE ANSWER SHEET */
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl text-xs text-amber-800 dark:text-amber-200">
                <strong>Javoblar varaqasi:</strong> Savollarning javoblarini quyidagi katakchalarga belgilang (1-35 test variantlari, 36-45 ochiq formulalar).
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1-35 */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    1–35-savollar: Test kalitlari
                  </h3>
                  <div className="space-y-2">
                    {questions.slice(0, 35).map((q, idx) => {
                      const opts = q.options?.length ? q.options : (idx >= 32 ? ['A','B','C','D','E','F'] : ['A','B','C','D']);
                      return (
                        <div 
                          key={q.id}
                          className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2"
                        >
                          <span className="w-6 sm:w-7 font-mono font-bold text-xs text-slate-600 dark:text-slate-400 shrink-0">{idx + 1}.</span>
                          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                            {opts.map((_, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isSelected = answers[q.id] === optIdx;
                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => setAnswer(q.id, optIdx)}
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

                {/* 36-45 */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    36–45-savollar: Ochiq javoblar (a va b)
                  </h3>
                  <div className="space-y-3">
                    {questions.slice(35, 45).map((q, localIdx) => {
                      const qIdx = 35 + localIdx;
                      return (
                        <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{qIdx + 1}-topshiriq javoblari:</span>
                          <div className="space-y-1.5">
                            <div>
                              <span className="text-[10px] font-bold text-slate-500">a) qism:</span>
                              <MathAnswerField
                                value={answers[`${q.id}_0`] || ''}
                                onChange={(val) => setAnswer(`${q.id}_0`, val)}
                                placeholder="Javobni kiriting..."
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500">b) qism:</span>
                              <MathAnswerField
                                value={answers[`${q.id}_1`] || ''}
                                onChange={(val) => setAnswer(`${q.id}_1`, val)}
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
            </div>
          ) : (
            /* FULL MODE QUESTION VIEW */
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {activeQIndex + 1}-savol / 45
                  </span>
                  <span className="text-slate-400">
                    {currentQ.isOpenEnded ? "Ochiq yozma masala (2 birlik)" : "1 birlik"}
                  </span>
                </div>

                {/* Question Text */}
                <div className="text-base sm:text-lg leading-relaxed text-slate-900 dark:text-slate-100 font-medium">
                  <LatexRenderer content={currentQ.text} />
                </div>

                {/* Optional Image */}
                {currentQ.imageUrl && (
                  <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                    <img 
                      src={currentQ.imageUrl} 
                      alt="Savol rasmi" 
                      className="max-h-72 object-contain mx-auto rounded-xl"
                    />
                  </div>
                )}

                {/* Options / Open inputs */}
                {!currentQ.isOpenEnded ? (
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = answers[currentQ.id] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setAnswer(currentQ.id, optIdx)}
                          className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-white text-indigo-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {letter}
                          </span>
                          <LatexRenderer content={opt} className={`flex-1 ${isSelected ? 'text-white' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        a) qism javobi (Formula yoki son):
                      </label>
                      <MathAnswerField
                        value={answers[`${currentQ.id}_0`] || ''}
                        onChange={(val) => setAnswer(`${currentQ.id}_0`, val)}
                        placeholder="Masalan: 3√7 / 7"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        b) qism javobi (Formula yoki son):
                      </label>
                      <MathAnswerField
                        value={answers[`${currentQ.id}_1`] || ''}
                        onChange={(val) => setAnswer(`${currentQ.id}_1`, val)}
                        placeholder="Masalan: 24"
                      />
                    </div>
                  </div>
                )}

                {/* Prev / Next controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={activeQIndex === 0}
                    onClick={() => setActiveQIndex(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Oldingi</span>
                  </button>

                  <button
                    disabled={activeQIndex === 44}
                    onClick={() => setActiveQIndex(prev => Math.min(44, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-30 cursor-pointer"
                  >
                    <span>Keyingi</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Backdrop for mobile drawer */}
        {mobileNavOpen && (
          <div 
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden animate-fadeIn"
          />
        )}

        {/* Right 1-45 Navigator Drawer (Desktop & Mobile) */}
        <div className={`w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 overflow-y-auto shrink-0 space-y-4 md:block ${
          mobileNavOpen ? 'fixed inset-y-0 right-0 z-50 shadow-2xl block animate-slideLeft' : 'hidden md:block'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Savollar Xaritasi (1–45)
            </h3>
            {mobileNavOpen && (
              <button 
                onClick={() => setMobileNavOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const answered = isAnswered(q);
              const isActive = activeQIndex === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveQIndex(idx);
                    setMobileNavOpen(false);
                  }}
                  className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : answered
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span>Javob berilgan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700 inline-block" />
              <span>Javob berilmagan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
              <span>Joriy savol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Imtihonni yakunlamoqchimisiz?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Siz 45 ta topshiriqdan <strong>{answeredCount}</strong> tasiga javob berdingiz ({45 - answeredCount} ta qoldi). Yakunlagandan so'ng javoblarni o'zgartirib bo'lmaydi.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmFinish(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Davom etish
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitAnswers}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Yuborilmoqda..." : "Ha, yakunlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
