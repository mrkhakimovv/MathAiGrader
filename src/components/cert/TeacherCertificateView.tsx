import React, { useState, useEffect } from 'react';
import { CertTest, CertExam, CertResult, Group, Student } from '../../types';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  getDocs 
} from 'firebase/firestore';
import { 
  dedupeBestAttempts, 
  computeRaschReport, 
  computeRaschWithReference 
} from '../../lib/rasch';
import { 
  itemDifficultiesFromMatrix, 
  generateSyntheticMatrix, 
  seedFromString 
} from '../../lib/synthetic';
import { CertTestBuilder } from './CertTestBuilder';
import { AssignOrEditExamModal } from './AssignOrEditExamModal';
import { CertExamResults } from './CertExamResults';
import { SpecialTestShareModal } from './SpecialTestShareModal';
import { SpecialTestResultsModal } from './SpecialTestResultsModal';
import { 
  Award, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  FileText, 
  Share2, 
  BarChart3, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  Eye, 
  Send, 
  Layers, 
  Zap, 
  Globe, 
  X,
  Lock,
  Unlock,
  Loader2
} from 'lucide-react';

interface TeacherCertificateViewProps {
  currentUser: string;
  groups: Group[];
  students: Student[];
}

export const TeacherCertificateView: React.FC<TeacherCertificateViewProps> = ({
  currentUser,
  groups,
  students
}) => {
  const [activeTab, setActiveTab] = useState<'exams' | 'tests'>('exams');
  const [tests, setTests] = useState<CertTest[]>([]);
  const [exams, setExams] = useState<CertExam[]>([]);
  const [results, setResults] = useState<CertResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showModeModal, setShowModeModal] = useState(false);
  const [builderMode, setBuilderMode] = useState<'full' | 'fast' | 'special'>('fast');
  const [editingTest, setEditingTest] = useState<CertTest | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const [assigningTest, setAssigningTest] = useState<CertTest | null>(null);
  const [editingExam, setEditingExam] = useState<CertExam | null>(null);

  const [viewingExamResults, setViewingExamResults] = useState<CertExam | null>(null);
  const [sharingSpecialTest, setSharingSpecialTest] = useState<CertTest | null>(null);
  const [viewingSpecialResults, setViewingSpecialResults] = useState<CertTest | null>(null);

  // Real-time listener for tests
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'cert_tests'), where('teacherUsername', '==', currentUser));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertTest));
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTests(list);
    }, (err) => {
      console.error("Error fetching cert_tests:", err);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Real-time listener for exams
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'cert_exams'), where('teacherUsername', '==', currentUser));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertExam));
      list.sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.startTime || '00:00'}`).getTime();
        const timeB = new Date(`${b.date}T${b.startTime || '00:00'}`).getTime();
        return timeB - timeA;
      });
      setExams(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching cert_exams:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Real-time listener for results to show submission counts
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'cert_results'), where('teacherUsername', '==', currentUser));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertResult));
      setResults(list);
    }, (err) => {
      console.error("Error fetching cert_results:", err);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Count submissions for an exam
  const getSubmissionCount = (examId: string) => {
    const examResults = results.filter(r => r.examId === examId);
    const uniqueStudents = new Set(examResults.map(r => r.studentId));
    return uniqueStudents.size;
  };

  // Finalize / End Exam Action (Section 4.4)
  const handleFinalizeExam = async (exam: CertExam) => {
    if (!window.confirm("Ushbu imtihonni yakunlashni tasdiqlaysizmi? Yakunlangach, barcha natijalar Rasch modeli bo'yicha muzlatiladi va o'quvchilarga ko'rinadi.")) {
      return;
    }

    try {
      const resQuery = query(collection(db, 'cert_results'), where('examId', '==', exam.id));
      const snap = await getDocs(resQuery);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertResult));

      const valid = list.filter(r => r.raschItems && r.raschItems.length > 0);
      const deduped = dedupeBestAttempts(valid);

      if (deduped.length === 0) {
        alert("Baholanadigan natija yo'q.");
        return;
      }

      const targetLen = deduped[0].raschItems.length;
      const matrix = deduped
        .filter(r => r.raschItems.length === targetLen)
        .map(r => ({
          studentId: r.studentId,
          studentName: r.studentName,
          items: r.raschItems
        }));

      let report: any = null;
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
        status: 'ended',
        finalizedAt: exam.finalizedAt || new Date().toISOString(),
        raschReport: report
      });

      alert(`Imtihon muvaffaqiyatli yakunlandi (${matrix.length} real ${exam.syntheticEnabled ? `+ ${exam.syntheticCount} tayanch` : ''} o'quvchi bilan baholandi).`);
    } catch (err) {
      console.error("Error finalizing exam:", err);
      alert("Imtihonni yakunlashda xatolik yuz berdi.");
    }
  };

  // Re-open exam
  const handleReopenExam = async (exam: CertExam) => {
    if (!window.confirm("Imtihonni qayta ochishni tasdiqlaysizmi?")) return;
    try {
      await updateDoc(doc(db, 'cert_exams', exam.id), {
        status: 'active'
      });
    } catch (err) {
      console.error("Error reopening exam:", err);
      alert("Imtihonni qayta ochishda xatolik yuz berdi.");
    }
  };

  // Delete Exam
  const handleDeleteExam = async (exam: CertExam) => {
    if (!window.confirm(`"${exam.title}" imtihonini va unga tegishli natijalarni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteDoc(doc(db, 'cert_exams', exam.id));
    } catch (err) {
      console.error("Error deleting exam:", err);
      alert("Imtihonni o'chirishda xatolik yuz berdi.");
    }
  };

  // Delete Test
  const handleDeleteTest = async (test: CertTest) => {
    if (!window.confirm(`"${test.title}" testini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteDoc(doc(db, 'cert_tests', test.id));
    } catch (err) {
      console.error("Error deleting test:", err);
      alert("Testni o'chirishda xatolik yuz berdi.");
    }
  };

  // Toggle Special Test status (End / Reopen)
  const handleToggleSpecialTestEnded = async (test: CertTest) => {
    const isCurrentlyEnded = test.isEnded || test.isClosed || test.status === 'completed';
    const newStatus = isCurrentlyEnded ? 'active' : 'completed';
    try {
      await updateDoc(doc(db, 'cert_tests', test.id), {
        isEnded: !isCurrentlyEnded,
        isClosed: !isCurrentlyEnded,
        status: newStatus,
        endedAt: !isCurrentlyEnded ? new Date().toISOString() : null
      });
    } catch (err) {
      console.error("Error toggling special test status:", err);
    }
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.groupNames && e.groupNames.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-600/15">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide uppercase border border-white/20">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Milliy Sertifikat • Rasch Modeli Tizimi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Matematika Milliy Sertifikat Moduli
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm font-normal leading-relaxed">
              45 ta savoldan (55 birlik) iborat testlarni boshqarish, guruhlarga rasmiy imtihon sifatida biriktirish, ochiq havolali maxsus testlar va 10 000 tayanch o'quvchili Rasch tahlili.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setEditingTest(null);
                setShowModeModal(true);
              }}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi test yaratish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Faol Imtihonlar ({exams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Sertifikat Testlari ({tests.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'exams' ? "Imtihon yoki guruh qidiruvi..." : "Test nomi bo'yicha qidiruv..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: FAOL IMTIHONLAR (Active Exams)                    */}
      {/* ======================================================== */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span>Imtihonlar yuklanmoqda...</span>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Hozircha biriktirilgan imtihonlar yo'q
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                "Sertifikat testlari" bo'limidan biror testni tanlab, o'z guruhlaringizga rasmiy imtihon sifatida biriktiring.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredExams.map((exam) => {
                const submissions = getSubmissionCount(exam.id);
                const isEnded = exam.status === 'ended';

                return (
                  <div
                    key={exam.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                          isEnded
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {isEnded ? "Yakunlangan" : "Faol"}
                        </span>

                        <span className="text-xs font-semibold text-slate-500">
                          {exam.subject}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {exam.title}
                      </h3>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Guruhlar:</span>
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {exam.groupNames?.join(', ') || 'Barchasi'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Sana va vaqt:</span>
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {exam.date} • {exam.startTime} ({exam.duration} daqiqa)
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Award className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Topshirganlar:</span>
                          </span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {submissions} ta o'quvchi
                          </span>
                        </div>

                        {exam.syntheticEnabled && (
                          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Rasch tayanch kohortasi:</span>
                            </span>
                            <span>+{exam.syntheticCount.toLocaleString()} sintetik o'quvchi</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => setViewingExamResults(exam)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Natijalar (Rasch)</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isEnded ? (
                          <button
                            onClick={() => handleReopenExam(exam)}
                            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Imtihonni qayta ochish"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Qayta ochish</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFinalizeExam(exam)}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Imtihonni yakunlash va Rasch hisobotini muzlatish"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Yakunlash</span>
                          </button>
                        )}

                        <button
                          onClick={() => setEditingExam(exam)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteExam(exam)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SERTIFIKAT TESTLARI (Cert Tests Bank)              */}
      {/* ======================================================== */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Hozircha testlar yaratilmagan
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                "Yangi test yaratish" tugmasini bosib, To'liq, Tezkor yoki Maxsus ochiq test yarating.
              </p>
              <button
                onClick={() => {
                  setEditingTest(null);
                  setShowModeModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Test yaratish</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTests.map((test) => {
                const isSpecial = test.mode === 'special';
                const isEnded = test.isEnded || test.isClosed || test.status === 'completed';

                return (
                  <div 
                    key={test.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                          test.mode === 'full'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
                            : test.mode === 'fast'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {test.mode === 'full' ? "To'liq (Savol + Javob)" : test.mode === 'fast' ? "Tezkor (Kalitlar)" : "Maxsus Test (Ochiq)"}
                        </span>

                        {isSpecial && (
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            isEnded ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {isEnded ? "Yakunlangan" : "Qabul faol"}
                          </span>
                        )}

                        <span className="text-xs text-slate-400">
                          {test.createdAt ? new Date(test.createdAt).toLocaleDateString('uz-UZ') : ''}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {test.title}
                      </h3>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>Savollar: <strong>45 ta</strong></span>
                        <span>Baholash: <strong>55 birlik</strong></span>
                        <span>Model: <strong>Rasch (1P)</strong></span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      {!isSpecial ? (
                        <button
                          onClick={() => setAssigningTest(test)}
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Imtihon sifatida biriktirish</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSharingSpecialTest(test)}
                            className="px-3.5 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1E88E5] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Ulashish</span>
                          </button>

                          <button
                            onClick={() => setViewingSpecialResults(test)}
                            className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>Natijalar</span>
                          </button>

                          <button
                            onClick={() => handleToggleSpecialTestEnded(test)}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title={isEnded ? "Qayta ochish" : "Testni yakunlash"}
                          >
                            {isEnded ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => {
                            setEditingTest(test);
                            setBuilderMode(test.mode || 'fast');
                            setShowBuilder(true);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteTest(test)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MODE CHOOSER (3 Options)                          */}
      {/* ======================================================== */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Yangi Test Rejimini Tanlang
                </h3>
              </div>
              <button
                onClick={() => setShowModeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option A: Full Mode */}
              <button
                onClick={() => {
                  setBuilderMode('full');
                  setShowModeModal(false);
                  setShowBuilder(true);
                }}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                    To'liq (Savol + Javob)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Har bir savol matni (LaTeX), rasm va variantlar kiritiladi. O'quvchi to'liq onlayn varaqada yechadi.
                  </div>
                </div>
              </button>

              {/* Option B: Fast Mode */}
              <button
                onClick={() => {
                  setBuilderMode('fast');
                  setShowModeModal(false);
                  setShowBuilder(true);
                }}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-left transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                    Faqat Javoblar (Tezkor)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Faqat to'g'ri kalitlar (A–D, A–F) va ochiq a/b javoblari kiritiladi. Qog'ozda yechilgan testlarni tez tekshirish uchun.
                  </div>
                </div>
              </button>

              {/* Option C: Special Public Mode */}
              <button
                onClick={() => {
                  setBuilderMode('special');
                  setShowModeModal(false);
                  setShowBuilder(true);
                }}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-left transition-all group flex items-start gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600">
                    Maxsus Test (Ochiq havola)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Guruhga bog'lanmagan havola orqali istalgan kishi (ro'yxatdan o'tmaganlar ham) topshirishi mumkin. Telegram/QR orqali ulashiladi.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TEST BUILDER */}
      {showBuilder && (
        <CertTestBuilder
          test={editingTest}
          mode={builderMode}
          teacherUsername={currentUser}
          onClose={() => {
            setShowBuilder(false);
            setEditingTest(null);
          }}
          onSaved={() => {
            setShowBuilder(false);
            setEditingTest(null);
          }}
        />
      )}

      {/* MODAL: ASSIGN / EDIT EXAM */}
      {(assigningTest || editingExam) && (
        <AssignOrEditExamModal
          test={assigningTest}
          examToEdit={editingExam}
          teacherUsername={currentUser}
          groups={groups}
          onClose={() => {
            setAssigningTest(null);
            setEditingExam(null);
          }}
          onSaved={() => {
            setAssigningTest(null);
            setEditingExam(null);
          }}
        />
      )}

      {/* MODAL: EXAM RESULTS (LIVE RASCH) */}
      {viewingExamResults && (
        <CertExamResults
          exam={viewingExamResults}
          onClose={() => setViewingExamResults(null)}
        />
      )}

      {/* MODAL: SPECIAL TEST SHARE */}
      {sharingSpecialTest && (
        <SpecialTestShareModal
          test={sharingSpecialTest}
          onClose={() => setSharingSpecialTest(null)}
        />
      )}

      {/* MODAL: SPECIAL TEST RESULTS */}
      {viewingSpecialResults && (
        <SpecialTestResultsModal
          test={viewingSpecialResults}
          onClose={() => setViewingSpecialResults(null)}
          onShare={() => {
            const test = viewingSpecialResults;
            setViewingSpecialResults(null);
            setSharingSpecialTest(test);
          }}
        />
      )}
    </div>
  );
};
