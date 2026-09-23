import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  GraduationCap,
  CalendarCheck
} from 'lucide-react';
import { AttendanceRecord, Group } from '../types';
import { 
  getStudentGroups, 
  groupLessonDates, 
  parseGroupDays, 
  getWeekdayFullName, 
  monthKey, 
  monthLabelUZ 
} from '../lib/finance';
import { formatDateUZ } from '../lib/utils';

interface StudentScheduleViewProps {
  studentInfo?: any;
  groupDetails?: any[];
  attendance?: AttendanceRecord[];
}

const WEEK_DAYS = [
  { dayNum: 1, name: 'Dushanba', short: 'Du' },
  { dayNum: 2, name: 'Seshanba', short: 'Se' },
  { dayNum: 3, name: 'Chorshanba', short: 'Ch' },
  { dayNum: 4, name: 'Payshanba', short: 'Pa' },
  { dayNum: 5, name: 'Juma', short: 'Ju' },
  { dayNum: 6, name: 'Shanba', short: 'Sh' },
  { dayNum: 0, name: 'Yakshanba', short: 'Ya' },
];

export function StudentScheduleView({ 
  studentInfo, 
  groupDetails = [], 
  attendance = [] 
}: StudentScheduleViewProps) {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'weekly' | 'dates'>('weekly');
  
  // Month selector for monthly dates view
  const [currentMonth, setCurrentMonth] = useState<string>(() => monthKey(new Date()));

  // Resolve student enrolled groups
  const enrolledGroups = useMemo(() => {
    if (!studentInfo) return [];
    return getStudentGroups(studentInfo, groupDetails);
  }, [studentInfo, groupDetails]);

  // Filtered groups based on selection
  const activeGroups = useMemo(() => {
    if (selectedGroupFilter === 'all') return enrolledGroups;
    return enrolledGroups.filter((g) => g.id === selectedGroupFilter || g.name === selectedGroupFilter);
  }, [enrolledGroups, selectedGroupFilter]);

  // Today's info
  const today = useMemo(() => new Date(), []);
  const todayDayNum = today.getDay(); // 0 is Sunday, 1 is Monday...
  const todayDateStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  // Check today's lessons
  const todayLessons = useMemo(() => {
    const list: { group: Group; allowedDays: number[] }[] = [];
    enrolledGroups.forEach((g) => {
      const allowedDays = parseGroupDays(g.days || '');
      if (allowedDays.includes(todayDayNum)) {
        list.push({ group: g, allowedDays });
      }
    });
    return list;
  }, [enrolledGroups, todayDayNum]);

  // Next upcoming lesson if not today
  const nextLesson = useMemo(() => {
    if (todayLessons.length > 0 || enrolledGroups.length === 0) return null;
    
    // Look ahead 7 days
    for (let offset = 1; offset <= 7; offset++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() + offset);
      const checkDayNum = checkDate.getDay();

      for (const g of enrolledGroups) {
        const allowedDays = parseGroupDays(g.days || '');
        if (allowedDays.includes(checkDayNum)) {
          return {
            group: g,
            date: checkDate,
            dayName: getWeekdayFullName(checkDayNum),
            daysLeft: offset,
          };
        }
      }
    }
    return null;
  }, [todayLessons, enrolledGroups, today]);

  // Dates for current week (Monday to Sunday)
  const currentWeekDates = useMemo(() => {
    const d = new Date(today);
    const currentDay = d.getDay();
    // distance to Monday: if Sunday (0), distance is -6, else 1 - currentDay
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);

    const weekDatesMap = new Map<number, { dateStr: string; displayDate: string }>();
    const monthNames = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      const dayNum = cur.getDay();
      const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      const displayDate = `${cur.getDate()}-${monthNames[cur.getMonth()]}`;
      weekDatesMap.set(dayNum, { dateStr, displayDate });
    }
    return weekDatesMap;
  }, [today]);

  // Weekly schedule map: dayNum -> array of groups
  const weeklySchedule = useMemo(() => {
    const map = new Map<number, { group: Group; time: string }[]>();
    for (let i = 0; i <= 6; i++) {
      map.set(i, []);
    }

    activeGroups.forEach((g) => {
      const allowedDays = parseGroupDays(g.days || '');
      allowedDays.forEach((dayNum) => {
        const currentList = map.get(dayNum) || [];
        currentList.push({
          group: g,
          time: g.time || 'Vaqt belgilanmagan',
        });
        map.set(dayNum, currentList);
      });
    });

    return map;
  }, [activeGroups]);

  // Monthly lesson dates with attendance
  const monthlyLessons = useMemo(() => {
    const allLessonDates: {
      date: string;
      group: Group;
      attendanceStatus?: 'keldi' | 'kelmadi' | 'kechikdi' | 'sababli' | 'none';
      isPast: boolean;
      isToday: boolean;
    }[] = [];

    activeGroups.forEach((g) => {
      const dates = groupLessonDates(g, currentMonth);
      dates.forEach((dateStr) => {
        // Find attendance record for this group and date
        const attRecord = attendance.find(
          (a) => (a.groupId === g.id || a.groupName === g.name) && a.date === dateStr
        );
        const status = attRecord && studentInfo?.id && attRecord.records
          ? attRecord.records[studentInfo.id]
          : undefined;

        allLessonDates.push({
          date: dateStr,
          group: g,
          attendanceStatus: status || 'none',
          isPast: dateStr < todayDateStr,
          isToday: dateStr === todayDateStr,
        });
      });
    });

    return allLessonDates.sort((a, b) => a.date.localeCompare(b.date));
  }, [activeGroups, currentMonth, attendance, studentInfo, todayDateStr]);

  // Navigate month
  const handlePrevMonth = () => {
    const [yStr, mStr] = currentMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setCurrentMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = currentMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setCurrentMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-5xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dars jadvali
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Siz biriktirilgan guruhlar bo'yicha haftalik dars vaqtlari va sanalari
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Haftalik jadval
          </button>
          <button
            onClick={() => setActiveTab('dates')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'dates'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Oylik taqvim
          </button>
        </div>
      </div>

      {/* Enrolled groups pills / filter */}
      {enrolledGroups.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Guruhlar:
          </span>
          <button
            onClick={() => setSelectedGroupFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedGroupFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            Barcha guruhlar ({enrolledGroups.length})
          </button>
          {enrolledGroups.map((g) => (
            <button
              key={g.id || g.name}
              onClick={() => setSelectedGroupFilter(g.id || g.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedGroupFilter === (g.id || g.name)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span>{g.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                selectedGroupFilter === (g.id || g.name)
                  ? 'bg-white/20 text-white'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              }`}>
                {g.time || 'Vaqt yo\'q'}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">
            Hozircha biriktirilgan guruhlar topilmadi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Siz hali biron guruhga qo'shilmagansiz yoki o'qituvchingiz profilingizni guruhga biriktirishi kutilmoqda.
          </p>
        </div>
      )}

      {/* Today's Highlight Banner */}
      {enrolledGroups.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs mb-1.5 text-indigo-100">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Bugun: {getWeekdayFullName(todayDayNum)}, {formatDateUZ(todayDateStr)}</span>
                </div>
                {todayLessons.length > 0 ? (
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
                      Bugun sizda dars bor!
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {todayLessons.map((item, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-bold flex items-center gap-2"
                        >
                          <span className="text-white">{item.group.name}</span>
                          <span className="text-indigo-200">|</span>
                          <span className="text-yellow-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.group.time || 'Vaqt belgilanmagan'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1">
                      Bugun darsingiz yo'q (dam olish kuni)
                    </h3>
                    {nextLesson ? (
                      <p className="text-xs sm:text-sm text-indigo-100 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>Keyingi dars:</span>
                        <strong className="text-white underline decoration-yellow-400">
                          {nextLesson.dayName} ({nextLesson.daysLeft === 1 ? 'ertaga' : `${nextLesson.daysLeft} kundan keyin`})
                        </strong>
                        <span>— {nextLesson.group.name} ({nextLesson.group.time})</span>
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                        Dars kunlari bo'yicha ma'lumotlar quyidagi jadvalda keltirilgan.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick group summary card pill */}
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs text-indigo-200 font-medium">Biriktirilgan guruhlar soni</span>
              <span className="text-2xl font-black text-white">{enrolledGroups.length} ta guruh</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: WEEKLY TIMETABLE */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Haftalik dars taqvimi
            </h2>
            <span className="text-xs font-medium text-slate-400">
              Du - Ya tartibida
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
            {WEEK_DAYS.map((wd) => {
              const lessons = weeklySchedule.get(wd.dayNum) || [];
              const hasLessons = lessons.length > 0;
              const isToday = wd.dayNum === todayDayNum;
              const weekDateInfo = currentWeekDates.get(wd.dayNum);

              return (
                <div
                  key={wd.dayNum}
                  className={`rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between transition-all border ${
                    isToday
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-sm ring-1 ring-indigo-500/25'
                      : hasLessons
                      ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-2xs'
                      : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-80'
                  }`}
                >
                  {/* Day header: Day Name + Date */}
                  <div className="mb-2.5">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {wd.short}
                      </span>
                      {weekDateInfo && (
                        <span className={`text-[11px] font-bold ${
                          isToday 
                            ? 'text-indigo-600 dark:text-indigo-400' 
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {weekDateInfo.displayDate}
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm font-bold truncate ${
                      isToday ? 'text-indigo-700 dark:text-indigo-300 font-extrabold' : 'text-slate-900 dark:text-white'
                    }`}>
                      {wd.name}
                    </h4>
                  </div>

                  {/* Lessons list for this day */}
                  <div className="space-y-2 mt-auto">
                    {hasLessons ? (
                      lessons.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 shadow-2xs"
                        >
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {item.group.name}
                          </div>
                          {/* Full time display without truncation */}
                          <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5 leading-snug">
                            <Clock className="w-3 h-3 shrink-0 text-indigo-500" />
                            <span className="font-mono whitespace-nowrap tracking-tight">{item.time}</span>
                          </div>
                          {item.group.teacherUsername && (
                            <div className="text-[10px] text-slate-400 mt-1 truncate">
                              Ustoz: {item.group.teacherUsername}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center">
                        <span className="text-xs text-slate-400 font-medium">
                          Dars yo'q
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY DATES WITH ATTENDANCE */}
      {activeTab === 'dates' && (
        <div className="space-y-4">
          {/* Month Navigator Header */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Oldingi oy"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                {monthLabelUZ(currentMonth)}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Keyingi oy"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Jami darslar: <strong className="text-indigo-600 dark:text-indigo-400">{monthlyLessons.length} ta</strong>
            </div>
          </div>

          {/* Lessons Dates Grid / Table */}
          {monthlyLessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {monthlyLessons.map((item, idx) => {
                const parts = item.date.split('-').map(Number);
                const itemDate = new Date(parts[0], parts[1] - 1, parts[2]);
                const dayName = getWeekdayFullName(itemDate.getDay());

                return (
                  <div
                    key={`${item.date}-${item.group.id}-${idx}`}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      item.isToday
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-2xs'
                    }`}
                  >
                    <div>
                      {/* Top: Date & Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {formatDateUZ(item.date)}
                          </span>
                        </div>
                        {item.isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white">
                            Bugun
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dayName}</span>
                      </div>

                      {/* Group info */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 mb-3">
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {item.group.name}
                        </div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.group.time || 'Vaqt ko\'rsatilmagan'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Attendance / status badge */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Davomat holati:
                      </span>
                      {item.attendanceStatus === 'keldi' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Kelgan
                        </span>
                      ) : item.attendanceStatus === 'kechikdi' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60 text-[11px]">
                          <Clock className="w-3 h-3" /> Kechikkan
                        </span>
                      ) : item.attendanceStatus === 'sababli' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800/60 text-[11px]">
                          <AlertCircle className="w-3 h-3" /> Sababli
                        </span>
                      ) : item.attendanceStatus === 'kelmadi' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800/60 text-[11px]">
                          <XCircle className="w-3 h-3" /> Kelmadi
                        </span>
                      ) : item.isPast ? (
                        <span className="text-[11px] text-slate-400 italic">
                          Belgilanmagan
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          Rejadagi dars
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ushbu oy uchun rejalashtirilgan darslar mavjud emas.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Group Details summary cards */}
      {enrolledGroups.length > 0 && (
        <div className="mt-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Biriktirilgan guruhlar tafsilotlari
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledGroups.map((g) => (
              <div 
                key={g.id || g.name}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {g.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                      Faol guruh
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Dars kunlari:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{g.days || "Noma'lum"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Dars vaqti:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{g.time || "Noma'lum"}</span>
                    </div>
                    {g.teacherUsername && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">O'qituvchi:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{g.teacherUsername}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
