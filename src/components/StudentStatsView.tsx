import React, { useState, useMemo } from 'react';
import { BarChart2, Wallet, History } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GradingResult, Payment, AttendanceRecord } from '../types';
import { formatDateUZ } from '../lib/utils';
import { formatSom } from '../lib/finance';
import { StudentPaymentHistoryModal } from './StudentPaymentHistoryModal';

export interface StudentStatsViewProps {
  tasks: any[];
  history: GradingResult[];
  studentInfo?: any;
  payments?: Payment[];
  attendance?: AttendanceRecord[];
  groupDetails?: any[];
}

export function StudentStatsView({ 
  tasks = [], 
  history = [], 
  studentInfo, 
  payments = [], 
  attendance = [],
  groupDetails = []
}: StudentStatsViewProps) {
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);

  const uniqueHistoryMap = new Map();
  history.forEach(h => {
    const key = h.taskId || h.createdAt || Math.random().toString();
    if (!uniqueHistoryMap.has(key) || uniqueHistoryMap.get(key).score < h.score) {
      uniqueHistoryMap.set(key, h);
    }
  });
  
  const uniqueHistory = Array.from(uniqueHistoryMap.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const completedTasks = uniqueHistory.length;
  const averageScore = uniqueHistory.length > 0 
    ? (uniqueHistory.reduce((sum, r) => sum + r.score, 0) / uniqueHistory.length).toFixed(1) 
    : '0';

  const studentTasks = tasks.filter(t => !t.group || t.group === 'Barcha guruhlar' || t.group === studentInfo?.group || (studentInfo?.groups && studentInfo.groups.includes(t.group)));

  // Payments for this student
  const myPayments = useMemo(() => {
    if (!studentInfo?.id && !studentInfo?.username) return [];
    return payments
      .filter((p) => 
        (studentInfo.id && p.studentId === studentInfo.id) || 
        (studentInfo.username && p.studentUsername?.toLowerCase() === studentInfo.username.toLowerCase())
      )
      .sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));
  }, [payments, studentInfo]);

  const totalPaidSum = useMemo(() => {
    return myPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [myPayments]);

  // Attendance stats for this student
  const attendanceStats = useMemo(() => {
    if (!studentInfo?.id && !studentInfo?.username) return { total: 0, keldi: 0, kelmadi: 0, rate: 100 };
    let total = 0;
    let keldi = 0;
    let kelmadi = 0;

    attendance.forEach((rec) => {
      const st = (studentInfo.id && rec.records?.[studentInfo.id]) ||
                 (studentInfo.username && rec.records?.[studentInfo.username]);
      if (st) {
        total++;
        if (st === 'keldi' || st === 'kechikdi') keldi++;
        else if (st === 'kelmadi') kelmadi++;
      }
    });

    const rate = total > 0 ? Math.round((keldi / total) * 100) : 100;
    return { total, keldi, kelmadi, rate };
  }, [attendance, studentInfo]);

  const chartData = useMemo(() => {
    return [...uniqueHistory].reverse().map((item, index) => {
      const dateStr = item.createdAt?.toDate 
        ? formatDateUZ(item.createdAt.toDate(), false)
        : `Vazifa ${index + 1}`;
      return {
        name: dateStr,
        score: item.score
      };
    });
  }, [uniqueHistory]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg">
          <BarChart2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">To'liq Statistika</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">O'zlashtirish, davomat va to'lov hisobotlari</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">O'rtacha ball</h3>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{averageScore} / 100</div>
          {history.length > 0 && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <span>A'lo natija!</span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Vazifalar</h3>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{completedTasks} / {Math.max(studentTasks.length, completedTasks)}</div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Bajarilgan vazifalar soni
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Davomat ko'rsatkichi</h3>
          <div className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-teal-400">{attendanceStats.rate}%</div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {attendanceStats.keldi} ta darsda qatnashgan
          </p>
        </div>

        {/* 4. To'lov holati ko'rsatilgan qism (bosilganda to'lovlar tarixi oynasi ochiladi) */}
        <div 
          onClick={() => setIsPaymentHistoryOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsPaymentHistoryOpen(true);
            }
          }}
          title="O'quvchi ro'yxatdan o'tgan sanasidan boshlab barcha to'lovlar tarixini ko'rish uchun bosing"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Jami to'lovlar
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
              <History className="w-3.5 h-3.5" />
              <span>Tarix</span>
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {formatSom(totalPaidSum)}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{myPayments.length} ta to'lov amalga oshirilgan</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">O'zlashtirish grafigi</h3>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Hozircha grafik ko'rsatish uchun ma'lumot yo'q</p>
          </div>
        )}
      </div>
      
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">So'nggi baholangan vazifalar</h3>
        {uniqueHistory.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Hech qanday baholangan vazifa yo'q.</p>
        ) : (
          <div className="space-y-4">
            {uniqueHistory.slice(0, 5).map((result, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Vazifa yechimi</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {result.createdAt?.toDate ? formatDateUZ(result.createdAt.toDate(), false) : "Yaqinda"}
                  </p>
                </div>
                <div className={`px-4 py-1.5 text-center rounded-full text-sm font-bold w-fit ${
                  result.score >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  result.score >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                }`}>
                  {result.score} ball
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* O'quvchi ro'yxatdan o'tgan sanasidan boshlab to'lovlar tarixi modali */}
      {studentInfo && (
        <StudentPaymentHistoryModal
          isOpen={isPaymentHistoryOpen}
          onClose={() => setIsPaymentHistoryOpen(false)}
          student={studentInfo}
          groupDetails={groupDetails}
          payments={payments}
        />
      )}
    </div>
  );
}
