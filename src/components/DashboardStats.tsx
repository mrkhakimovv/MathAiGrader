import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Wallet, 
  CalendarCheck, 
  BarChart3, 
  Trophy, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Newspaper,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Payment, AttendanceRecord, GradingResult } from '../types';
import { formatSom, monthKey, monthLabelUZ } from '../lib/finance';
import { formatDateUZ } from '../lib/utils';
import { subscribeToCollection } from '../lib/db';

interface Props {
  groupDetails: any[];
  students: any[];
  tasks: any[];
  payments?: Payment[];
  attendance?: AttendanceRecord[];
  history?: GradingResult[];
  teacherName?: string | null;
  onNavigate?: (view: any) => void;
}

export function DashboardStats({ 
  groupDetails = [], 
  students = [], 
  tasks = [], 
  payments = [], 
  attendance = [],
  history = [],
  teacherName,
  onNavigate 
}: Props) {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const unsub = subscribeToCollection('news', setNews);
    return () => unsub();
  }, []);

  const totalGroups = groupDetails.length;
  const totalStudents = students.length;
  const totalTasks = tasks.length;
  
  // Current month key & localized label
  const curMonth = useMemo(() => monthKey(new Date()), []);
  const currentMonthLabel = useMemo(() => monthLabelUZ(curMonth), [curMonth]);

  // Current month income
  const currentMonthPayments = useMemo(() => {
    return (payments || []).filter((p) => p.month === curMonth);
  }, [payments, curMonth]);

  const currentMonthIncome = useMemo(() => {
    return currentMonthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [currentMonthPayments]);

  // Attendance calculations
  const { avgAttendance, totalPresent, totalRecords } = useMemo(() => {
    let present = 0;
    let records = 0;
    (attendance || []).forEach((a) => {
      if (a.records) {
        Object.values(a.records).forEach((st) => {
          records++;
          if (st === 'keldi' || st === 'kechikdi') present++;
        });
      }
    });
    const avg = records > 0 ? Math.round((present / records) * 100) : 100;
    return { avgAttendance: avg, totalPresent: present, totalRecords: records };
  }, [attendance]);

  // Greeting by hour of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Xayrli tong';
    if (hour >= 12 && hour < 18) return 'Xayrli kun';
    return 'Xayrli kech';
  }, []);

  // Today's formatted date
  const todayFormatted = useMemo(() => {
    const now = new Date();
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'
    ];
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    return `${dateNum}-${monthName}, ${year}-yil · ${dayName}`;
  }, []);

  // Current day index for matching schedule
  const todayDayIndex = useMemo(() => new Date().getDay(), []);

  // Today's groups
  const todayGroups = useMemo(() => {
    return groupDetails.filter((g) => {
      const daysStr = (g.days || '').toLowerCase();
      if (daysStr.includes('har kuni')) return true;
      if (todayDayIndex === 1 && (daysStr.includes('du') || daysStr.includes('toq'))) return true;
      if (todayDayIndex === 2 && (daysStr.includes('se') || daysStr.includes('juft'))) return true;
      if (todayDayIndex === 3 && (daysStr.includes('cho') || daysStr.includes('toq'))) return true;
      if (todayDayIndex === 4 && (daysStr.includes('pay') || daysStr.includes('juft'))) return true;
      if (todayDayIndex === 5 && (daysStr.includes('jum') || daysStr.includes('toq'))) return true;
      if (todayDayIndex === 6 && (daysStr.includes('sha') || daysStr.includes('juft'))) return true;
      if (todayDayIndex === 0 && daysStr.includes('yak')) return true;
      return false;
    });
  }, [groupDetails, todayDayIndex]);

  // Students in groups distribution
  const groupStats = useMemo(() => {
    return groupDetails.map((group) => {
      const groupStudents = students.filter(
        (s) => s.group === group.name || (Array.isArray(s.groups) && s.groups.includes(group.name))
      );
      const count = groupStudents.length;
      const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
      return {
        ...group,
        count,
        percentage
      };
    }).sort((a, b) => b.count - a.count);
  }, [groupDetails, students, totalStudents]);

  // Active students leaderboard
  const topStudents = useMemo(() => {
    const scoresMap = new Map<string, { totalScore: number; taskCount: number }>();
    
    (history || []).forEach((h) => {
      if (!h.studentUsername) return;
      const current = scoresMap.get(h.studentUsername) || { totalScore: 0, taskCount: 0 };
      scoresMap.set(h.studentUsername, {
        totalScore: current.totalScore + (Number(h.score) || 0),
        taskCount: current.taskCount + 1
      });
    });

    const list = students.map((student) => {
      const stats = scoresMap.get(student.username) || { totalScore: 0, taskCount: 0 };
      const avgScore = stats.taskCount > 0 ? Math.round(stats.totalScore / stats.taskCount) : 0;
      
      const groupName = student.groups && student.groups.length > 0 
        ? student.groups.join(', ') 
        : (student.group || 'Guruhsiz');

      return {
        ...student,
        avgScore,
        taskCount: stats.taskCount,
        groupName
      };
    });

    // Sort by taskCount or avgScore, then fallback to firstName
    return list
      .sort((a, b) => {
        if (b.taskCount !== a.taskCount) return b.taskCount - a.taskCount;
        if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
        return a.firstName.localeCompare(b.firstName);
      })
      .slice(0, 5);
  }, [students, history]);

  // Students assigned to at least one group
  const studentsInGroupsCount = useMemo(() => {
    return students.filter(s => s.group || (s.groups && s.groups.length > 0)).length;
  }, [students]);

  // Average students per group
  const avgStudentsPerGroup = totalGroups > 0 ? Math.round(totalStudents / totalGroups) : 0;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* 1. HERO HEADER: Greeting, Date & Quick Actions               */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>O'qituvchi Boshqaruv Markazi</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {greeting}, {teacherName ? teacherName : 'Ustoz'}! 👋
            </h1>
            
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-2xl">
              Almath platformasida bugungi darslar, o'quvchilar ko'rsatkichlari va oylik moliyaviy tahlil bilan tanishing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium text-white shadow-xs">
              <Calendar className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>{todayFormatted}</span>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('create-task')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Vazifa yaratish</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TOP METRIC CARDS (5 KPI Cards with 0 truncation)          */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Umumiy ko'rsatkichlar</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {currentMonthLabel}
            </span>
          </h2>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Card 1: Guruhlar */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            onClick={() => onNavigate && onNavigate('all-groups')}
            className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Guruhlar</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {totalGroups} <span className="text-base font-semibold text-slate-400">ta</span>
              </h3>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>O'rtacha {avgStudentsPerGroup} nafar</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">Barchasi</span>
            </div>
          </motion.div>

          {/* Card 2: O'quvchilar */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={() => onNavigate && onNavigate('all-students')}
            className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">O'quvchilar</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {totalStudents} <span className="text-base font-semibold text-slate-400">nafar</span>
              </h3>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{studentsInGroupsCount} nafari guruhda</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">Ro'yxat</span>
            </div>
          </motion.div>

          {/* Card 3: Vazifalar */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            onClick={() => onNavigate && onNavigate('grade-task')}
            className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700/60 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/60 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Vazifalar</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {totalTasks} <span className="text-base font-semibold text-slate-400">ta</span>
              </h3>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Tekshirish & Baholash</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 group-hover:underline">Kirish</span>
            </div>
          </motion.div>

          {/* Card 4: Oy tushumi (NO TRUNCATION) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={() => onNavigate && onNavigate('teacher-payments')}
            className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700/60 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform duration-300">
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-violet-600 group-hover:bg-violet-50 dark:group-hover:bg-violet-950/60 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Oy tushumi</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight break-words">
                {formatSom(currentMonthIncome)}
              </h3>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{currentMonthPayments.length} ta to'lov</span>
              <span className="font-semibold text-violet-600 dark:text-violet-400 group-hover:underline">Hisobot</span>
            </div>
          </motion.div>

          {/* Card 5: Davomat */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            onClick={() => onNavigate && onNavigate('teacher-attendance')}
            className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700/60 transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform duration-300">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/60 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Davomat</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {avgAttendance}%
              </h3>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{totalPresent} ta qatnashuv</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400 group-hover:underline">Jurnal</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN ANALYTICS: Groups Distribution & Top Students        */}
      {/* ============================================================ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Guruhlar taqsimoti */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Guruhlar bo'yicha o'quvchilar
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    O'quvchilar soni va guruhlar sig'imi
                  </p>
                </div>
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('all-groups')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
                >
                  <span>Barchasi</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {groupStats.length > 0 ? (
                groupStats.map((group, index) => {
                  const maxCount = Math.max(...groupStats.map((g) => g.count), 1);
                  const barWidth = Math.round((group.count / maxCount) * 100);

                  return (
                    <div 
                      key={group.id || group.name}
                      onClick={() => onNavigate && onNavigate('all-groups')}
                      className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {group.name}
                          </span>
                          {group.days && (
                            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                              · {group.days}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {group.count} <span className="font-normal text-slate-400">o'quvchi</span>
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {group.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Visual progress bar */}
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + (index * 0.05) }}
                          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm">Hozircha guruhlar mavjud emas</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Jami: <strong>{totalGroups} ta</strong> guruh</span>
            <span>Guruhlarda: <strong>{studentsInGroupsCount} nafar</strong> o'quvchi</span>
          </div>
        </div>

        {/* Right: Faol o'quvchilar */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Faol o'quvchilar
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Eng yuqori faollik va natijalar
                  </p>
                </div>
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('teacher-rating')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
                >
                  <span>To'liq reyting</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {topStudents.length > 0 ? (
                topStudents.map((student, index) => {
                  const rankIcons = ['🥇', '🥈', '🥉'];
                  const isTopThree = index < 3;
                  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() || 'O';

                  return (
                    <div 
                      key={student.id || student.username}
                      onClick={() => onNavigate && onNavigate('all-students')}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                          index === 0 
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                            : index === 1
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            : index === 2
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
                            : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                        }`}>
                          {isTopThree ? rankIcons[index] : `#${index + 1}`}
                        </div>

                        {/* Student Initials Avatar */}
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-slate-800 dark:to-indigo-950/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black text-sm shrink-0 border border-indigo-100/80 dark:border-slate-700/80 shadow-2xs">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {student.groupName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {student.taskCount > 0 ? (
                          <div className="text-right">
                            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                              {student.taskCount} vazifa
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Faol
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <Trophy className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm">O'quvchilar ro'yxati shakllanmoqda</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Jami: <strong>{totalStudents} nafar</strong> o'quvchi</span>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('teacher-rating')} 
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reyting jadvalini ochish →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. OPERATIONAL HUB: Today's Schedule & Quick Management      */}
      {/* ============================================================ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bugungi darslar (1-ustun) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Bugungi dars jadvali
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bugun dars o'tiladigan guruhlar ro'yxati
                </p>
              </div>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('teacher-attendance')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors border border-teal-200 dark:border-teal-800"
              >
                Davomat olish
              </button>
            )}
          </div>

          <div className="space-y-3">
            {todayGroups.length > 0 ? (
              todayGroups.map((group) => {
                const groupStudentCount = students.filter(
                  (s) => s.group === group.name || (Array.isArray(s.groups) && s.groups.includes(group.name))
                ).length;

                return (
                  <div
                    key={group.id || group.name}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shadow-2xs">
                        {group.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {group.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {group.time || 'Vaqt belgilanmagan'}
                          </span>
                          <span>·</span>
                          <span>{groupStudentCount} nafar o'quvchi</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('teacher-attendance')}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          Davomat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Bugun rejalashtirilgan darslar yo'q
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Barcha darslar belgilangan kun tartibi asosida olib boriladi.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tezkor amallar (2-ustun) */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Tezkor amallar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kundalik vazifalarga tezkor o'tish
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => onNavigate && onNavigate('create-task')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Yangi vazifa yaratish
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      O'quvchilarga topshiriq yuklash
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('all-students')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      O'quvchi qo'shish / Qabul
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Yangi o'quvchilarni ro'yxatga olish
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('teacher-payments')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-left border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      Oylik to'lovlar jurnali
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Kvitansiyalar va qarzdorliklar
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('grade-task')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      AI Vazifa tekshiruvchi
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Qo'lyozmalarni tezkor baholash
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. NEWS / ANNOUNCEMENTS SECTION (if any news exists)         */}
      {/* ============================================================ */}
      {news.length > 0 && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Platforma yangiliklari va e'lonlar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ALMATH yangilanishlari va muhim xabarlar
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mb-1.5">
                    {item.createdAt ? formatDateUZ(item.createdAt) : item.date}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
