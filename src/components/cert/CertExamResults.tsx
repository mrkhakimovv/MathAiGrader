import React, { useState, useEffect, useMemo } from 'react';
import { CertExam, CertResult } from '../../types';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  arrayUnion 
} from 'firebase/firestore';
import { 
  dedupeBestAttempts, 
  computeRaschReport, 
  computeRaschWithReference, 
  RaschReport, 
  RaschResult 
} from '../../lib/rasch';
import { 
  itemDifficultiesFromMatrix, 
  generateSyntheticMatrix, 
  seedFromString 
} from '../../lib/synthetic';
import { RaschStatsPanel } from './RaschStatsPanel';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import { 
  X, 
  Search, 
  Download, 
  FileText, 
  Trash2, 
  Filter, 
  Loader2, 
  Trophy, 
  Award, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface CertExamResultsProps {
  exam: CertExam;
  onClose: () => void;
}

export const CertExamResults: React.FC<CertExamResultsProps> = ({ exam, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<RaschReport | null>(null);
  const [search, setSearch] = useState('');
  const [onlyReal, setOnlyReal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [rawResults, setRawResults] = useState<CertResult[]>([]);

  const fetchAndCompute = async () => {
    try {
      setLoading(true);
      const resQuery = query(collection(db, 'cert_results'), where('examId', '==', exam.id));
      const snap = await getDocs(resQuery);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CertResult));
      setRawResults(list);

      const valid = list.filter(r => r.raschItems && r.raschItems.length > 0);
      const deduped = dedupeBestAttempts(valid);

      if (deduped.length === 0) {
        setReport(null);
        setLoading(false);
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

      let computedReport: RaschReport;
      if (exam.syntheticEnabled && exam.syntheticCount > 0) {
        const difficulties = itemDifficultiesFromMatrix(matrix);
        const synthetic = generateSyntheticMatrix(difficulties, {
          count: exam.syntheticCount,
          seed: seedFromString(exam.id)
        });
        // Pass true to include synthetic rows in the live results list
        computedReport = computeRaschWithReference(matrix, synthetic, true);
      } else {
        computedReport = computeRaschReport(matrix);
      }

      setReport(computedReport);
    } catch (err) {
      console.error("Error computing exam results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndCompute();
  }, [exam.id]);

  const filteredResults = useMemo(() => {
    if (!report || !report.results) return [];
    return report.results.filter(r => {
      if (onlyReal && r.synthetic) return false;
      if (search.trim() && !r.studentName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [report, onlyReal, search]);

  const handleDeleteStudentResult = async (studentId: string, studentName: string) => {
    if (!window.confirm(`${studentName} ning natijasini o'chirishni tasdiqlaysizmi? O'quvchi imtihonni qayta topshirishi mumkin bo'ladi.`)) return;

    try {
      setLoading(true);
      // 1. Delete all cert_results docs for this exam and student
      const q = query(
        collection(db, 'cert_results'),
        where('examId', '==', exam.id),
        where('studentId', '==', studentId)
      );
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'cert_results', d.id)));
      await Promise.all(deletePromises);

      // 2. Add studentId to allowedRetakes
      await updateDoc(doc(db, 'cert_exams', exam.id), {
        allowedRetakes: arrayUnion(studentId)
      });

      // 3. Re-fetch and re-calculate
      await fetchAndCompute();
    } catch (err) {
      console.error("Error deleting student result:", err);
      alert("Natijani o'chirishda xatolik yuz berdi.");
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!report || !report.results || report.results.length === 0) return;

    const data = filteredResults.map((r, i) => ({
      "O'rin": r.rank ?? i + 1,
      "O'quvchi F.I.Sh": r.studentName,
      "To'g'ri": r.correct,
      "Qobiliyat (θ)": Number(r.theta).toFixed(2),
      "Rasch Balli": r.ball,
      "Daraja": r.grade,
      "Turi": r.synthetic ? "Tayanch (Sintetik)" : "Real o'quvchi",
      "Foizli o'rin": r.percentile !== undefined ? `${r.percentile}%` : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Natijalar");
    XLSX.writeFile(wb, `sertifikat_${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}_natijalar.xlsx`);
  };

  const handleExportPdf = async () => {
    if (!report || !report.results) return;

    try {
      setIsExportingPdf(true);
      const docPdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = docPdf.internal.pageSize.getWidth();

      // Title header
      docPdf.setFontSize(16);
      docPdf.setTextColor(30, 41, 59);
      docPdf.text(`Milliy Sertifikat Imtihon Natijalari`, 40, 45);

      docPdf.setFontSize(11);
      docPdf.setTextColor(100, 116, 139);
      docPdf.text(`Imtihon: ${exam.title} (${exam.subject}) | Sana: ${exam.date}`, 40, 65);

      // Capture Rasch stats panel as image
      const panelEl = document.getElementById('rasch-stats-panel');
      let startY = 85;

      if (panelEl) {
        try {
          const imgData = await toPng(panelEl, { quality: 0.95, pixelRatio: 2 });
          const imgWidth = pageWidth - 80;
          const imgHeight = (panelEl.clientHeight / panelEl.clientWidth) * imgWidth;
          
          if (imgHeight < 360) {
            docPdf.addImage(imgData, 'PNG', 40, 80, imgWidth, imgHeight);
            startY = 80 + imgHeight + 20;
          }
        } catch (captureErr) {
          console.warn("Could not capture panel image for PDF:", captureErr);
        }
      }

      // Add Table
      const realOnlyForPdf = report.results.filter(r => !r.synthetic);
      const tableRows = realOnlyForPdf.map((r, idx) => [
        r.rank ?? idx + 1,
        r.studentName,
        `${r.correct} / ${report.stats.numItems}`,
        r.theta.toFixed(2),
        r.ball,
        r.grade,
        r.percentile !== undefined ? `${r.percentile}%` : '-'
      ]);

      autoTable(docPdf, {
        startY: Math.min(startY, 450),
        head: [["O'rin", "O'quvchi F.I.Sh", "To'g'ri", "θ", "Ball", "Daraja", "Foizli o'rin"]],
        body: tableRows,
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        theme: 'striped'
      });

      docPdf.save(`sertifikat_${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}_natijalar.pdf`);
    } catch (err) {
      console.error("PDF eksportida xatolik:", err);
      alert("PDF yaratishda xatolik yuz berdi.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden animate-fadeIn">
      {/* Top Bar */}
      <div className="p-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
              exam.status === 'ended' 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {exam.status === 'ended' ? "Yakunlangan Imtihon" : "Faol Imtihon (Jonli Rasch)"}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-lg">
              {exam.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Guruhlar: {exam.groupNames?.join(', ') || 'Barchasi'} • Sana: {exam.date} {exam.startTime}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || !report}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>PDF yuklab olish</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={!report}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Excel yuklab olish</span>
          </button>

          <button
            onClick={fetchAndCompute}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="font-semibold text-sm">Rasch modeli va natijalar hisoblanmoqda...</span>
          </div>
        ) : !report ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Hozircha baholanadigan natijalar yo'q
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              O'quvchilar ushbu imtihonni topshirgach, ularning javoblari avtomatik ravishda Rasch modeli orqali tahlil qilinadi.
            </p>
          </div>
        ) : (
          <>
            {/* Rasch Stats Panel Component */}
            <RaschStatsPanel report={report} />

            {/* Results Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden space-y-4">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Reyting va Natijalar Jadvali</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rasch modeli (T-ball) bo'yicha saralangan ishtirokchilar
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {exam.syntheticEnabled && (
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={onlyReal}
                        onChange={(e) => setOnlyReal(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Faqat real o'quvchilar</span>
                    </label>
                  )}

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ism bo'yicha qidiruv..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                      <th className="py-3.5 px-6">O'rin</th>
                      <th className="py-3.5 px-6">O'quvchi F.I.Sh</th>
                      <th className="py-3.5 px-6 text-center">To'g'ri (55 dan)</th>
                      <th className="py-3.5 px-6 text-center">Qobiliyat (θ)</th>
                      <th className="py-3.5 px-6 text-center">Rasch Balli</th>
                      <th className="py-3.5 px-6 text-center">Daraja</th>
                      <th className="py-3.5 px-6 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredResults.map((r, idx) => {
                      const isSynthetic = r.synthetic;
                      const place = r.rank ?? idx + 1;

                      return (
                        <tr 
                          key={r.studentId}
                          className={`transition-colors ${
                            isSynthetic 
                              ? 'opacity-60 bg-slate-50/40 dark:bg-slate-950/30' 
                              : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3.5 px-6 font-mono font-bold text-slate-400">
                            {place}
                          </td>

                          <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <span>{r.studentName}</span>
                              {place <= 3 && !isSynthetic && (
                                <Trophy className={`w-3.5 h-3.5 ${
                                  place === 1 ? 'text-amber-500' : place === 2 ? 'text-slate-400' : 'text-amber-700'
                                }`} />
                              )}
                              {isSynthetic && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  Tayanch
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-6 text-center font-bold font-mono">
                            {r.correct} <span className="text-slate-400 text-xs font-normal">/ {report.stats.numItems}</span>
                          </td>

                          <td className="py-3.5 px-6 text-center font-mono text-slate-600 dark:text-slate-400">
                            {r.theta.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-6 text-center font-mono font-black text-slate-900 dark:text-white text-base">
                            <span className={r.ball >= 70 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                              {r.ball}
                            </span>
                          </td>

                          <td className="py-3.5 px-6 text-center">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
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
                          </td>

                          <td className="py-3.5 px-6 text-right">
                            {!isSynthetic && (
                              <button
                                onClick={() => handleDeleteStudentResult(r.studentId, r.studentName)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Natijani o'chirish (qayta topshirishga ruxsat)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
