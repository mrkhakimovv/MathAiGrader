import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CertTest, CertSpecialResult } from '../../types';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  writeBatch 
} from 'firebase/firestore';
import { 
  computeRaschWithReference 
} from '../../lib/rasch';
import { 
  itemDifficultiesFromMatrix, 
  generateSyntheticMatrix, 
  seedFromString 
} from '../../lib/synthetic';
import * as XLSX from 'xlsx';
import { 
  X, 
  Search, 
  Download, 
  RotateCcw, 
  Trash2, 
  Award, 
  Users, 
  TrendingUp, 
  Trophy, 
  Monitor, 
  Smartphone, 
  Copy, 
  Check, 
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SpecialTestResultsModalProps {
  test: CertTest;
  onClose: () => void;
  onShare: () => void;
}

export const SpecialTestResultsModal: React.FC<SpecialTestResultsModalProps> = ({
  test,
  onClose,
  onShare
}) => {
  const [results, setResults] = useState<CertSpecialResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'cert_special_results'), where('testId', '==', test.id));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertSpecialResult));
      list.sort((a, b) => (b.ball || 0) - (a.ball || 0));
      setResults(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching special results:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [test.id]);

  const filtered = results.filter(r => 
    r.studentName.toLowerCase().includes(search.toLowerCase())
  );

  // Recalculate Rasch for all special test respondents with 10,000 synthetic cohort
  const handleRecalculateRasch = async () => {
    const valid = results.filter(r => r.items && r.items.length === 55);
    if (valid.length === 0) {
      alert("Qayta hisoblash uchun 55 birlik to'liq natijalar mavjud emas.");
      return;
    }

    try {
      setIsRecalculating(true);
      const matrix = valid.map(r => ({
        studentId: r.id || '',
        studentName: r.studentName,
        items: r.items
      }));

      const difficulties = itemDifficultiesFromMatrix(matrix);
      const synthetic = generateSyntheticMatrix(difficulties, {
        count: 10000,
        seed: seedFromString(test.id)
      });

      const report = computeRaschWithReference(matrix, synthetic, false);
      // writeBatch bitta paketda 500 tagacha amal qabul qiladi — bo'lib yozamiz
      const rows = report.results.filter(res => res.studentId);
      for (let i = 0; i < rows.length; i += 450) {
        const batch = writeBatch(db);
        rows.slice(i, i + 450).forEach(res => {
          batch.update(doc(db, 'cert_special_results', res.studentId), {
            ball: res.ball,
            grade: res.grade,
            theta: res.theta,
            score: res.correct,
            rank: res.rank ?? null,
            percentile: res.percentile ?? null
          });
        });
        await batch.commit();
      }
      alert("Barcha natijalar Rasch modeli (10 000 tayanch o'quvchi) bilan muvaffaqiyatli qayta hisoblandi!");
    } catch (err) {
      console.error("Qayta hisoblashda xatolik:", err);
      alert("Qayta hisoblashda xatolik yuz berdi.");
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`${name} ning ushbu natijasini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteDoc(doc(db, 'cert_special_results', id));
    } catch (err) {
      console.error("Natijani o'chirishda xatolik:", err);
      alert("O'chirishda xatolik yuz berdi.");
    }
  };

  const handleExportExcel = () => {
    if (results.length === 0) {
      alert("Eksport qilish uchun natijalar yo'q.");
      return;
    }

    // Sheet 1: General Results
    const summaryData = results.map((r, i) => ({
      "O'rin": r.rank || i + 1,
      "Ism-familiya": r.studentName,
      "Rasch Balli": r.ball,
      "Daraja": r.grade,
      "To'g'ri": r.score,
      "Xato": (r.total || 55) - r.score,
      "Foizli o'rin (%)": r.percentile !== undefined ? `${r.percentile}%` : '-',
      "Qobiliyat (θ)": Number(r.theta || 0).toFixed(2),
      "Qurilma": `${r.browserInfo?.deviceType || '-'} (${r.browserInfo?.browser || '-'})`,
      "Topshirilgan sana": r.submittedAt ? new Date(r.submittedAt).toLocaleString('uz-UZ') : '-'
    }));

    // Sheet 2: 1-55 Items Matrix
    const matrixData = results.map((r, i) => {
      const row: Record<string, any> = {
        "O'rin": r.rank || i + 1,
        "Ism-familiya": r.studentName,
        "Ball": r.ball,
        "Daraja": r.grade
      };
      for (let j = 0; j < 55; j++) {
        const unitName = j < 32 
          ? `S${j + 1}` 
          : j < 35 
          ? `S${j + 1}` 
          : `S${36 + Math.floor((j - 36) / 2)}${(j - 36) % 2 === 0 ? 'a' : 'b'}`;
        row[unitName] = r.items && r.items[j] !== undefined ? r.items[j] : 0;
      }
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    const ws2 = XLSX.utils.json_to_sheet(matrixData);

    XLSX.utils.book_append_sheet(wb, ws1, "Umumiy natijalar");
    XLSX.utils.book_append_sheet(wb, ws2, "1-55 savollar matritsasi");

    XLSX.writeFile(wb, `Maxsus_Test_${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_Natijalar.xlsx`);
  };

  // Stats calculations
  const totalCount = results.length;
  const certifiedCount = results.filter(r => r.grade && r.grade !== 'NC').length;
  const avgBall = totalCount > 0 
    ? (results.reduce((acc, curr) => acc + (curr.ball || 0), 0) / totalCount).toFixed(1) 
    : '0';
  const maxBall = totalCount > 0 
    ? Math.max(...results.map(r => r.ball || 0)) 
    : 0;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 shrink-0">
                Maxsus Test
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {test.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ochiq havola orqali topshirgan barcha ishtirokchilar reyestri
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onShare}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4 shrink-0" />
              <span>Havola</span>
            </button>

            <button
              onClick={handleRecalculateRasch}
              disabled={isRecalculating || results.length === 0}
              className="px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isRecalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">Rasch'ni qayta hisoblash</span>
              <span className="sm:hidden">Rasch</span>
            </button>

            <button
              onClick={handleExportExcel}
              disabled={results.length === 0}
              className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Excel</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="p-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100/50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500">Topshirganlar</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount} ta</div>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">O'rtacha Rasch Ball</div>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{avgBall}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Eng Yuqori Ball</div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{maxBall}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Sertifikat Olganlar</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {certifiedCount} ta ({totalCount > 0 ? ((certifiedCount / totalCount) * 100).toFixed(0) : 0}%)
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ism-familiya bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">Ko'rsatilmoqda: {filtered.length} ta</span>
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span>Natijalar yuklanmoqda...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Hech qanday natija topilmadi.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r, idx) => {
                const isExpanded = expandedId === r.id;
                return (
                  <div key={r.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div 
                      className="p-3 sm:p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : (r.id || null))}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <span className="w-6 sm:w-7 text-xs font-mono font-bold text-slate-400 shrink-0">
                          {r.rank || idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{r.studentName}</span>
                            {r.grade === 'A+' && <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 sm:gap-2 mt-0.5 truncate">
                            <span>{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('uz-UZ') : ''}</span>
                            <span>•</span>
                            <span>{r.browserInfo?.deviceType || 'Veb'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            <span className={r.ball >= 70 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                              {Number(r.ball).toFixed(1)}
                            </span>
                            <span className="text-[10px] sm:text-xs text-slate-400 font-normal"> ball</span>
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400">
                            {r.score} / {r.total || 55}
                          </div>
                        </div>

                        <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-xs font-black border ${
                          r.grade === 'A+' || r.grade === 'A'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : r.grade === 'B+' || r.grade === 'B'
                            ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                            : r.grade === 'C+' || r.grade === 'C'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {r.grade}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (r.id) handleDelete(r.id, r.studentName);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Device & System Info */}
                    {isExpanded && (
                      <div className="px-6 pb-4 pt-1 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 animate-fadeIn">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Topshiruvchi qurilmasi va texnik ma'lumotlari:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div><strong>Brauzer:</strong> {r.browserInfo?.browser || '-'}</div>
                          <div><strong>OS:</strong> {r.browserInfo?.os || '-'}</div>
                          <div><strong>Qurilma:</strong> {r.browserInfo?.deviceType || '-'}</div>
                          <div><strong>Ekran:</strong> {r.browserInfo?.screen || '-'}</div>
                          <div><strong>Qobiliyat (θ):</strong> {Number(r.theta || 0).toFixed(3)}</div>
                          <div><strong>Foizli o'rin:</strong> {r.percentile !== undefined ? `${r.percentile}%` : '-'}</div>
                          <div><strong>Til:</strong> {r.browserInfo?.language || '-'}</div>
                          <div><strong>Referrer:</strong> {r.browserInfo?.referrer || '-'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
