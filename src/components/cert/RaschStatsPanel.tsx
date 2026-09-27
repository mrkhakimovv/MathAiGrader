import React from 'react';
import { RaschReport } from '../../lib/rasch';
import { Award, Users, BarChart3, HelpCircle, Target, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

interface RaschStatsPanelProps {
  report: RaschReport;
  highlightStudentId?: string;
}

export const RaschStatsPanel: React.FC<RaschStatsPanelProps> = ({ report, highlightStudentId }) => {
  if (!report || !report.stats) return null;

  const { stats, results } = report;
  const highlightResult = highlightStudentId ? results.find(r => r.studentId === highlightStudentId) : null;

  // Grade breakdown
  const gradeCounts: Record<string, number> = {
    'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'NC': 0
  };
  results.forEach(r => {
    if (gradeCounts[r.grade] !== undefined) {
      gradeCounts[r.grade]++;
    }
  });

  return (
    <div id="rasch-stats-panel" className="space-y-6">
      {/* Highlighted Student Result Block */}
      {highlightResult && (
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl border border-indigo-700/50">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Sizning Shaxsiy Natijangiz</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">{highlightResult.studentName}</h3>
              <p className="text-indigo-200 text-xs mt-1">
                Rasch modeli bo'yicha standartlashtirilgan T-ball va darajangiz
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 sm:gap-3">
              <div className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-0 sm:min-w-[90px]">
                <div className="text-[11px] sm:text-xs text-indigo-200 font-medium truncate">Ball (T-shkala)</div>
                <div className="text-xl sm:text-3xl font-black text-amber-300 mt-0.5">{highlightResult.ball}</div>
              </div>

              <div className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-0 sm:min-w-[90px]">
                <div className="text-[11px] sm:text-xs text-indigo-200 font-medium truncate">Daraja</div>
                <div className={`text-xl sm:text-3xl font-black mt-0.5 ${
                  highlightResult.grade === 'A+' || highlightResult.grade === 'A' ? 'text-emerald-400' :
                  highlightResult.grade === 'B+' || highlightResult.grade === 'B' ? 'text-blue-400' :
                  highlightResult.grade === 'C+' || highlightResult.grade === 'C' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {highlightResult.grade}
                </div>
              </div>

              <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-0">
                <div className="text-[11px] sm:text-xs text-indigo-200 font-medium truncate">To'g'ri javoblar</div>
                <div className="text-lg sm:text-2xl font-black mt-0.5">{highlightResult.correct} / {stats.numItems || 55}</div>
              </div>

              <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-0">
                <div className="text-[11px] sm:text-xs text-indigo-200 font-medium truncate">Qobiliyat (θ)</div>
                <div className="text-base sm:text-lg font-mono font-bold mt-0.5">{highlightResult.theta.toFixed(2)}</div>
              </div>

              <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-0 col-span-2 sm:col-span-1">
                <div className="text-[11px] sm:text-xs text-indigo-200 font-medium truncate">O'rin</div>
                <div className="text-base sm:text-lg font-black mt-0.5">{highlightResult.rank ?? '-'}-o'rin</div>
              </div>
            </div>
          </div>

          {highlightResult.percentile !== undefined && (
            <div className="mt-4 pt-4 border-t border-white/15 flex items-center gap-2 text-xs sm:text-sm text-indigo-100 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Siz ishtirokchilarning <strong>{highlightResult.percentile}%</strong> idan yuqori natija qayd etdingiz.
              </span>
            </div>
          )}
        </div>
      )}

      {/* General Rasch Statistics Cards */}
      <div>
        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          <span>Umumiy Rasch Statistikasi (N={stats.n + (stats.referenceN || 0)})</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Real O'quvchilar</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.n}</div>
            <div className="text-[11px] text-slate-400">Sertifikat nomzodlari</div>
          </div>

          {stats.referenceN ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Tayanch (Sintetik)</div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">+{stats.referenceN.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400">Kalibrlangan kohorta</div>
            </div>
          ) : null}

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Baholash Birliklari</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.numItems}</div>
            <div className="text-[11px] text-slate-400">35 test + 20 yozma</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">O'rtacha Ball (Mean)</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.meanBall.toFixed(1)}</div>
            <div className="text-[11px] text-slate-400">T-shkala normasi: ~50</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">O'rtacha To'g'ri Javob</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.meanCorrect.toFixed(1)} / {stats.numItems}</div>
            <div className="text-[11px] text-slate-400">Birliklar bo'yicha</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">O'rtacha Qobiliyat (μ)</div>
            <div className="text-xl sm:text-2xl font-mono font-black text-slate-900 dark:text-white mt-1">{stats.mu.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400">Sigma σ = {stats.sigma.toFixed(2)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Qobiliyat Oralig'i (θ)</div>
            <div className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white mt-1">
              [{stats.minTheta.toFixed(2)} ; {stats.maxTheta.toFixed(2)}]
            </div>
            <div className="text-[11px] text-slate-400">Minimal / Maksimal</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Test Qiyinchiligi</div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.testDifficulty.toFixed(1)}%</div>
            <div className="text-[11px] text-slate-400">O'rtacha xato ulushi</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Eng Oson Savol</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.minItemDifficulty.toFixed(1)}%</div>
            <div className="text-[11px] text-slate-400">Xato javob ko'rsatkichi</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Eng Qiyin Savol</div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.maxItemDifficulty.toFixed(1)}%</div>
            <div className="text-[11px] text-slate-400">Xato javob ko'rsatkichi</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">O'rtacha Logit (b_j)</div>
            <div className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white mt-1">
              {stats.meanLogit.toFixed(2)} ± {stats.sigmaLogit.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400">Savollar qiyinlik logiti</div>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            <span>Sertifikat Darajalari Taqsimoti</span>
          </span>
          <span className="text-xs font-normal lowercase text-slate-400">Jami baholangan: {results.length}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[
            { grade: 'A+', min: '≥70', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300' },
            { grade: 'A', min: '65-69.9', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300' },
            { grade: 'B+', min: '60-64.9', color: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300' },
            { grade: 'B', min: '55-59.9', color: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300' },
            { grade: 'C+', min: '50-54.9', color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300' },
            { grade: 'C', min: '46-49.9', color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300' },
            { grade: 'NC', min: '<46', color: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300' },
          ].map(item => {
            const count = gradeCounts[item.grade] || 0;
            const pct = results.length > 0 ? ((count / results.length) * 100).toFixed(0) : '0';
            return (
              <div key={item.grade} className={`p-3 rounded-2xl border text-center ${item.color}`}>
                <div className="text-lg font-black">{item.grade}</div>
                <div className="text-xl font-black mt-0.5">{count} ta</div>
                <div className="text-[10px] opacity-75 mt-0.5">{pct}% ({item.min})</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 55 Units Difficulty Grid */}
      {stats.itemDifficultyPct && stats.itemDifficultyPct.length > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                <span>55 Baholash Birligi Qiyinchilik Xaritasi (% xato javob)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Har bir katakcha — 1 birlik (1-32: yopiq test, 33-35: ko'p variantli, 36-55: ochiq a/b qismlar)
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Oson (≤33%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-amber-500 inline-block" /> O'rta (34-66%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-rose-500 inline-block" /> Qiyin (&gt;66%)</span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-11 gap-1 sm:gap-2">
            {stats.itemDifficultyPct.map((pct, idx) => {
              const num = idx + 1;
              const bg = pct <= 33 
                ? 'bg-emerald-500 text-white' 
                : pct <= 66 
                ? 'bg-amber-500 text-white' 
                : 'bg-rose-500 text-white';

              const unitLabel = num <= 32 
                ? `${num}` 
                : num <= 35 
                ? `${num}` 
                : `${36 + Math.floor((num - 36) / 2)}${(num - 36) % 2 === 0 ? 'a' : 'b'}`;

              return (
                <div 
                  key={idx}
                  title={`${unitLabel}-birlik: ${pct.toFixed(1)}% xato (Logit: ${(stats.itemLogit?.[idx] ?? 0).toFixed(2)})`}
                  className={`p-1 sm:p-2 rounded-xl text-center font-bold text-xs flex flex-col justify-center items-center cursor-help transition-transform hover:scale-105 shadow-2xs ${bg}`}
                >
                  <span className="text-[10px] sm:text-[11px] opacity-90">{unitLabel}</span>
                  <span className="text-[10px] sm:text-[11px] font-mono font-black">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
