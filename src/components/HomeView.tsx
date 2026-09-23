import React, { useState, useEffect, useMemo } from "react";
import { subscribeToCollection } from "../lib/db";
import { 
  Newspaper, 
  ArrowRight, 
  Wallet, 
  CalendarCheck, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Sparkles,
  History
} from 'lucide-react';
import { formatDateUZ } from '../lib/utils';
import { Payment, AttendanceRecord } from '../types';
import { StudentPaymentHistoryModal } from './StudentPaymentHistoryModal';
import { 
  monthKey, 
  monthLabelUZ, 
  formatSom, 
  getMonthlyDue, 
  getTotalDebt, 
  groupLessonDates 
} from '../lib/finance';

interface HomeViewProps {
  role: string | null;
  username: string | null;
  studentInfo?: any;
  students?: any[];
  groupDetails?: any[];
  payments?: Payment[];
  attendance?: AttendanceRecord[];
}

export function HomeView({ 
  role, 
  username, 
  studentInfo,
  students = [],
  groupDetails = [],
  payments = [],
  attendance = []
}: HomeViewProps) {
  const [news, setNews] = useState<any[]>([]);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCollection("news", setNews);
    return () => unsub();
  }, []);

  // Current student object resolution
  const currentStudent = useMemo(() => {
    if (studentInfo) return studentInfo;
    if (!username || !Array.isArray(students)) return null;
    return students.find(
      (s) =>
        s.username === username ||
        `${s.firstName} ${s.lastName}`.trim().toLowerCase() === username.trim().toLowerCase()
    ) || null;
  }, [studentInfo, username, students]);

  // Current month key and localized label
  const currentMonth = useMemo(() => monthKey(new Date()), []);
  const currentMonthLabel = useMemo(() => monthLabelUZ(currentMonth), [currentMonth]);

  // Groups belonging to this student
  const myGroups = useMemo(() => {
    if (!currentStudent || !Array.isArray(groupDetails)) return [];
    return groupDetails.filter((g) => {
      if (currentStudent.group === g.name || currentStudent.group === g.id) return true;
      if (Array.isArray(currentStudent.groups)) {
        return currentStudent.groups.includes(g.name) || currentStudent.groups.includes(g.id);
      }
      return false;
    });
  }, [currentStudent, groupDetails]);

  // Payment status for the current month
  const paymentStats = useMemo(() => {
    if (!currentStudent) {
      return { totalDue: 0, totalPaid: 0, totalDebt: 0, status: 'tolanmagan' as const, percent: 0, isPaid: false };
    }

    let totalDue = 0;
    let totalPaid = 0;
    let totalDebt = 0;

    myGroups.forEach((g) => {
      const due = getMonthlyDue(currentStudent, g, currentMonth);
      totalDue += due;

      const paid = payments
        .filter((p) => {
          const isStudentMatch =
            p.studentId === currentStudent.id ||
            p.studentUsername === currentStudent.username ||
            (currentStudent.username && p.studentUsername?.toLowerCase() === currentStudent.username.toLowerCase());
          const isGroupMatch =
            p.groupId === g.id ||
            p.groupId === g.name ||
            p.groupName === g.name;
          const isMonthMatch = p.month === currentMonth;
          return isStudentMatch && isGroupMatch && isMonthMatch;
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      totalPaid += paid;
      totalDebt += getTotalDebt(currentStudent, g, payments, currentMonth);
    });

    // Also check any payments for this student for the current month in case groupId is slightly different
    const studentPaymentsThisMonth = payments
      .filter((p) => {
        const isStudentMatch =
          p.studentId === currentStudent.id ||
          p.studentUsername === currentStudent.username ||
          (currentStudent.username && p.studentUsername?.toLowerCase() === currentStudent.username.toLowerCase());
        return isStudentMatch && p.month === currentMonth;
      })
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const effectivePaid = Math.max(totalPaid, studentPaymentsThisMonth);
    const isPaid = (totalDue > 0 && effectivePaid >= totalDue) || (totalDue === 0 && effectivePaid > 0);

    let status: 'tolangan' | 'qisman' | 'tolanmagan' = 'tolanmagan';
    if (isPaid) {
      status = 'tolangan';
    } else if (effectivePaid > 0) {
      status = 'qisman';
    } else {
      status = 'tolanmagan';
    }

    const percent = totalDue > 0 ? Math.min(100, Math.round((effectivePaid / totalDue) * 100)) : (isPaid ? 100 : 0);

    return { totalDue, totalPaid: effectivePaid, totalDebt, status, percent, isPaid };
  }, [currentStudent, myGroups, payments, currentMonth]);

  // Attendance stats for the current month
  const attendanceStats = useMemo(() => {
    if (!currentStudent) {
      return { total: 0, keldi: 0, kelmadi: 0, kechikdi: 0, sababli: 0, rate: 100, plannedLessons: 0 };
    }

    let keldi = 0;
    let kelmadi = 0;
    let kechikdi = 0;
    let sababli = 0;
    const recordedDates = new Set<string>();

    let plannedCount = 0;
    myGroups.forEach((g) => {
      const dates = groupLessonDates(g, currentMonth);
      plannedCount += dates.length;
    });

    attendance.forEach((rec) => {
      if (!rec.date || !rec.date.startsWith(currentMonth)) return;

      const isMyGroup = myGroups.some(
        (g) =>
          g.id === rec.groupId ||
          g.name === rec.groupName ||
          g.name === rec.groupId
      ) || (currentStudent.group && (rec.groupName === currentStudent.group || rec.groupId === currentStudent.group));

      const status =
        rec.records?.[currentStudent.id] ||
        (currentStudent.username ? rec.records?.[currentStudent.username] : undefined);

      if (status && (isMyGroup || Object.keys(rec.records || {}).length > 0)) {
        recordedDates.add(rec.date);
        if (status === 'keldi') keldi++;
        else if (status === 'kelmadi') kelmadi++;
        else if (status === 'kechikdi') kechikdi++;
        else if (status === 'sababli') sababli++;
      }
    });

    const totalRecorded = recordedDates.size;
    const attended = keldi + kechikdi;
    const rate = totalRecorded > 0 ? Math.round((attended / totalRecorded) * 100) : 100;

    return {
      total: totalRecorded,
      keldi,
      kelmadi,
      kechikdi,
      sababli,
      rate,
      plannedLessons: plannedCount,
    };
  }, [currentStudent, myGroups, attendance, currentMonth]);

  // Attendance RGB glow color calculation: 100% -> Green, transitioning to Red at 50% (and below)
  const attendanceGlow = useMemo(() => {
    const rate = typeof attendanceStats.rate === 'number' ? attendanceStats.rate : 100;
    // clamp between 50% and 100%
    const clampedRate = Math.max(50, Math.min(100, rate));
    // normalized factor: 0 (at 50%) to 1 (at 100%)
    const t = (clampedRate - 50) / 50;

    // Green: (34, 197, 94) at t = 1.0 (100%)
    // Yellow: (234, 179, 8) at t = 0.5 (75%)
    // Red: (239, 68, 68) at t = 0 (50% and below)
    let r: number, g: number, b: number;
    if (t >= 0.5) {
      const k = (t - 0.5) / 0.5; // 0 to 1
      r = Math.round(234 + (34 - 234) * k);
      g = Math.round(179 + (197 - 179) * k);
      b = Math.round(8 + (94 - 8) * k);
    } else {
      const k = t / 0.5; // 0 to 1
      r = Math.round(239 + (234 - 239) * k);
      g = Math.round(68 + (179 - 68) * k);
      b = Math.round(68 + (8 - 68) * k);
    }

    return {
      r,
      g,
      b,
      rgbColor: `rgb(${r}, ${g}, ${b})`,
    };
  }, [attendanceStats.rate]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto pb-12">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Xush kelibsiz{username ? `, ${username}` : ''}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          ALMATH platformasining asosiy sahifasiga xush kelibsiz.
        </p>
      </header>

      {/* ============================================================ */}
      {/* O'QUVCHI UCHUN: SHU OY TO'LOV HOLATI VA DAVOMAT FOIZI        */}
      {/* ============================================================ */}
      {role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* 1. To'lov holati kartochkasi */}
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
            title="To'lovlar tarixini ko'rish uchun bosing"
            className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group ${
            paymentStats.isPaid
              ? 'border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              : 'border-2 border-rose-500 animate-pulse-border-red'
          }`}>
            <div
              className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-30 ${
                paymentStats.isPaid
                  ? 'bg-emerald-500'
                  : paymentStats.status === 'qisman'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${
                      paymentStats.isPaid
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : paymentStats.status === 'qisman'
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Shu oy to'lovi
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {currentMonthLabel}
                    </h3>
                  </div>
                </div>

                {/* Status Badge & Click Hint */}
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
                      paymentStats.isPaid
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                        : paymentStats.status === 'qisman'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    {paymentStats.isPaid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {paymentStats.status === 'qisman' && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    {!paymentStats.isPaid && paymentStats.status !== 'qisman' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                    <span>
                      {paymentStats.isPaid
                        ? "To'langan"
                        : paymentStats.status === 'qisman'
                        ? "Qisman to'langan"
                        : "To'lanmagan"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amounts display */}
              <div className="space-y-1 mb-4">
                {paymentStats.isPaid ? (
                  <>
                    <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 inline-block shrink-0" />
                      <span>{paymentStats.totalPaid > 0 ? formatSom(paymentStats.totalPaid) : "To'langan"}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Oylik to'lov to'liq amalga oshirilgan
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-500 tracking-tight flex items-center gap-2">
                      <span>To'lanmagan</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {paymentStats.status === 'qisman'
                        ? `Qisman to'langan: ${formatSom(paymentStats.totalPaid)} / ${formatSom(paymentStats.totalDue)}`
                        : paymentStats.totalDue > 0
                        ? `To'lov miqdori: ${formatSom(paymentStats.totalDue)}`
                        : "Ushbu oy uchun to'lov amalga oshirilmagan"}
                    </p>
                  </>
                )}
              </div>

              {/* Progress bar */}
              {paymentStats.totalDue > 0 && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      paymentStats.isPaid
                        ? 'bg-emerald-500'
                        : paymentStats.status === 'qisman'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${paymentStats.percent}%` }}
                  />
                </div>
              )}
            </div>

            {/* Bottom info */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-2">
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Guruh:</span>
                <span className="truncate">
                  {myGroups.length > 0 ? myGroups.map((g) => g.name).join(', ') : (currentStudent?.group || "Belgilanmagan")}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {paymentStats.totalDebt > 0 ? (
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    Qarzdorlik: {formatSom(paymentStats.totalDebt)}
                  </span>
                ) : paymentStats.status === 'tolangan' ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Qarzdorlik yo'q
                  </span>
                ) : null}
                
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  <History className="w-3 h-3" /> Tarix
                </span>
              </div>
            </div>
          </div>

          {/* 2. Davomat foizi kartochkasi */}
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all animate-pulse-border-attendance"
            style={{
              '--att-r': attendanceGlow.r,
              '--att-g': attendanceGlow.g,
              '--att-b': attendanceGlow.b,
            } as React.CSSProperties}
          >
            <div
              className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-25 transition-all duration-500"
              style={{ backgroundColor: attendanceGlow.rgbColor }}
            />

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs transition-colors duration-500"
                    style={{
                      backgroundColor: `rgba(${attendanceGlow.r}, ${attendanceGlow.g}, ${attendanceGlow.b}, 0.15)`,
                      color: attendanceGlow.rgbColor,
                    }}
                  >
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Shu oy davomati
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {currentMonthLabel}
                    </h3>
                  </div>
                </div>

                {/* Attendance Rating Badge */}
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold shadow-2xs transition-colors duration-500 border"
                  style={{
                    backgroundColor: `rgba(${attendanceGlow.r}, ${attendanceGlow.g}, ${attendanceGlow.b}, 0.12)`,
                    borderColor: `rgba(${attendanceGlow.r}, ${attendanceGlow.g}, ${attendanceGlow.b}, 0.35)`,
                    color: attendanceGlow.rgbColor,
                  }}
                >
                  {attendanceStats.total === 0
                    ? "Boshlanmagan"
                    : attendanceStats.rate >= 85
                    ? "A'lo davomat"
                    : attendanceStats.rate >= 70
                    ? "Yaxshi"
                    : "Qatnashish past"}
                </div>
              </div>

              {/* Percentage display */}
              <div className="space-y-1 mb-4">
                <div className="flex items-baseline gap-2">
                  <span 
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors duration-500"
                    style={{ color: attendanceGlow.rgbColor }}
                  >
                    {attendanceStats.rate}%
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {attendanceStats.total > 0
                      ? `${attendanceStats.keldi + attendanceStats.kechikdi} / ${attendanceStats.total} ta darsda qatnashgan`
                      : "Hozircha davomat belgilanmagan"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {attendanceStats.total > 0
                    ? `Ushbu oyda o'tkazilgan ${attendanceStats.total} ta darsdan`
                    : "Shu oy uchun hali darslar o'tkazilmagan yoki yozilmagan"}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${attendanceStats.total > 0 ? attendanceStats.rate : 100}%`,
                    backgroundColor: attendanceGlow.rgbColor
                  }}
                />
              </div>
            </div>

            {/* Status breakdown pills */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-1.5 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-900/40">
                  Keldi: {attendanceStats.keldi}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-100 dark:border-rose-900/40">
                  Kelmadi: {attendanceStats.kelmadi}
                </span>
                {attendanceStats.kechikdi > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-100 dark:border-amber-900/40">
                    Kechikdi: {attendanceStats.kechikdi}
                  </span>
                )}
                {attendanceStats.sababli > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-900/40">
                    Sababli: {attendanceStats.sababli}
                  </span>
                )}
              </div>

              {attendanceStats.plannedLessons > 0 && (
                <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
                  Rejada: {attendanceStats.plannedLessons} dars
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {/* News Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Newspaper className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yangiliklar</h2>
          </div>
          
          <div className="space-y-6">
            {news.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">Hozircha yangiliklar yo'q.</p>
            ) : (
              news.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3).map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 block">
                    {item.createdAt ? formatDateUZ(item.createdAt) : item.date}
                  </span>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              ))
            )}
                        
            <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-4">
              Barcha yangiliklar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* To'lovlar tarixi modali */}
      {currentStudent && (
        <StudentPaymentHistoryModal
          isOpen={isPaymentHistoryOpen}
          onClose={() => setIsPaymentHistoryOpen(false)}
          student={currentStudent}
          groupDetails={groupDetails}
          payments={payments}
        />
      )}
    </div>
  );
}
