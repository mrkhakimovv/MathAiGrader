import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  CalendarCheck, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { AttendanceRecord, Group } from '../types';
import { monthKey, monthLabelUZ, parseGroupDays, groupLessonDates } from '../lib/finance';
import { formatDateUZ } from '../lib/utils';

interface StudentAttendanceCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  groups: any[];
  attendance: AttendanceRecord[];
}

const WEEKDAYS = [
  { short: 'Du', full: 'Dushanba' },
  { short: 'Se', full: 'Seshanba' },
  { short: 'Ch', full: 'Chorshanba' },
  { short: 'Pa', full: 'Payshanba' },
  { short: 'Ju', full: 'Juma' },
  { short: 'Sh', full: 'Shanba' },
  { short: 'Ya', full: 'Yakshanba' },
];

export function StudentAttendanceCalendarModal({
  isOpen,
  onClose,
  student,
  groups = [],
  attendance = []
}: StudentAttendanceCalendarModalProps) {
  // Current active month in "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey(new Date()));

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset to current month when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMonth(monthKey(new Date()));
    }
  }, [isOpen]);

  // Navigation handlers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    let newM = m - 1;
    let newY = y;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    let newM = m + 1;
    let newY = y;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleTodayMonth = () => {
    setSelectedMonth(monthKey(new Date()));
  };

  // Student's matching groups
  const myGroups = useMemo(() => {
    if (!student || !Array.isArray(groups)) return [];
    return groups.filter((g) => {
      if (student.group === g.name || student.group === g.id) return true;
      if (Array.isArray(student.groups)) {
        return student.groups.includes(g.name) || student.groups.includes(g.id);
      }
      return false;
    });
  }, [student, groups]);

  // Today's date string "YYYY-MM-DD"
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  // Calendar structure calculations
  const [year, month] = useMemo(() => {
    const [yStr, mStr] = selectedMonth.split('-');
    return [parseInt(yStr, 10), parseInt(mStr, 10)];
  }, [selectedMonth]);

  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);

  // Day offset for Monday-first: 0 = Mon, 6 = Sun
  const firstDayOffset = useMemo(() => {
    const jsDay = new Date(year, month - 1, 1).getDay(); // Sun=0, Mon=1...
    return jsDay === 0 ? 6 : jsDay - 1;
  }, [year, month]);

  // Scheduled lesson dates for this month
  const scheduledDatesMap = useMemo(() => {
    const map = new Map<string, any[]>();
    myGroups.forEach((g) => {
      const dates = groupLessonDates(g, selectedMonth);
      dates.forEach((d) => {
        if (!map.has(d)) map.set(d, []);
        map.get(d)!.push(g);
      });
    });
    return map;
  }, [myGroups, selectedMonth]);

  // Attendance records map for this student: date -> { status, groupName, record }
  const studentAttendanceMap = useMemo(() => {
    const map = new Map<string, { status: 'keldi' | 'kelmadi' | 'kechikdi' | 'sababli'; groupName?: string }>();
    if (!student) return map;

    attendance.forEach((rec) => {
      if (!rec.date || !rec.date.startsWith(selectedMonth)) return;

      const st =
        (student.id && rec.records?.[student.id]) ||
        (student.username && rec.records?.[student.username]);

      if (st) {
        map.set(rec.date, {
          status: st,
          groupName: rec.groupName,
        });
      }
    });

    return map;
  }, [attendance, selectedMonth, student]);

  // Summary statistics for the selected month
  const stats = useMemo(() => {
    let keldi = 0;
    let kelmadi = 0;
    let kechikdi = 0;
    let sababli = 0;

    studentAttendanceMap.forEach(({ status }) => {
      if (status === 'keldi') keldi++;
      else if (status === 'kelmadi') kelmadi++;
      else if (status === 'kechikdi') kechikdi++;
      else if (status === 'sababli') sababli++;
    });

    const totalRecorded = studentAttendanceMap.size;
    const attended = keldi + kechikdi;
    const rate = totalRecorded > 0 ? Math.round((attended / totalRecorded) * 100) : 100;

    return {
      keldi,
      kelmadi,
      kechikdi,
      sababli,
      totalRecorded,
      rate,
      totalPlanned: scheduledDatesMap.size,
    };
  }, [studentAttendanceMap, scheduledDatesMap]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Davomat taqvimi
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                  {student?.firstName} {student?.lastName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oylik darslar va davomat tarixi hisoboti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Month Switcher Controls */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Oldingi oy"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleTodayMonth}
                className="px-3 py-1 rounded-xl text-xs font-black text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap min-w-[120px] text-center"
              >
                {monthLabelUZ(selectedMonth)}
              </button>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Keyingi oy"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Summary Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Keldi: {stats.keldi}</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800/50 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Kelmadi: {stats.kelmadi}</span>
            </span>
            {stats.kechikdi > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/50 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Kechikdi: {stats.kechikdi}</span>
              </span>
            )}
            {stats.sababli > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800/50 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Sababli: {stats.sababli}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {stats.totalPlanned > 0 && (
              <span className="text-slate-500 dark:text-slate-400 font-semibold hidden md:inline">
                Rejada: <strong className="text-slate-800 dark:text-slate-200">{stats.totalPlanned} dars</strong>
              </span>
            )}
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-slate-500 dark:text-slate-400">Davomat ko'rsatkichi:</span>
              <span className={`text-sm font-black ${
                stats.totalRecorded === 0 
                  ? 'text-slate-400' 
                  : stats.rate >= 80 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : stats.rate >= 60 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {stats.rate}%
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/30">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center">
            {WEEKDAYS.map((wd, i) => (
              <div 
                key={wd.short}
                className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl ${
                  i === 6 
                    ? 'text-rose-500 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20' 
                    : 'text-slate-500 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-800/50'
                }`}
              >
                <span className="hidden sm:inline">{wd.full}</span>
                <span className="sm:hidden">{wd.short}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOffset }).map((_, idx) => (
              <div 
                key={`empty-${idx}`} 
                className="min-h-[75px] sm:min-h-[95px] rounded-2xl border border-dashed border-slate-200/50 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-900/20 opacity-40"
              />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;
              
              const attRecord = studentAttendanceMap.get(dateStr);
              const scheduledGroups = scheduledDatesMap.get(dateStr);
              const isScheduled = !!scheduledGroups && scheduledGroups.length > 0;

              return (
                <div
                  key={dateStr}
                  className={`min-h-[75px] sm:min-h-[95px] p-2 rounded-2xl flex flex-col justify-between transition-all border ${
                    isToday
                      ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                      : ''
                  } ${
                    attRecord?.status === 'keldi'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/80 shadow-2xs'
                      : attRecord?.status === 'kelmadi'
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/80 shadow-2xs'
                      : attRecord?.status === 'kechikdi'
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 shadow-2xs'
                      : attRecord?.status === 'sababli'
                      ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/80 shadow-2xs'
                      : isScheduled
                      ? isFuture
                        ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/60 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50'
                  }`}
                >
                  {/* Day header (Number + today badge) */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-black ${
                      isToday 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : attRecord?.status === 'keldi'
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : attRecord?.status === 'kelmadi'
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {dayNum}
                    </span>

                    {isToday && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 ring-2 ring-indigo-200" title="Bugun" />
                    )}
                  </div>

                  {/* Lesson & Attendance Indicator */}
                  <div className="mt-auto pt-1">
                    {attRecord ? (
                      <div className="space-y-0.5">
                        <div className={`px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black flex items-center justify-center gap-1 shadow-2xs ${
                          attRecord.status === 'keldi'
                            ? 'bg-emerald-600 text-white'
                            : attRecord.status === 'kelmadi'
                            ? 'bg-rose-600 text-white'
                            : attRecord.status === 'kechikdi'
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {attRecord.status === 'keldi' && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                          {attRecord.status === 'kelmadi' && <XCircle className="w-3 h-3 shrink-0" />}
                          {attRecord.status === 'kechikdi' && <Clock className="w-3 h-3 shrink-0" />}
                          {attRecord.status === 'sababli' && <AlertCircle className="w-3 h-3 shrink-0" />}
                          <span className="capitalize">{attRecord.status}</span>
                        </div>
                        {attRecord.groupName && (
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate text-center font-medium">
                            {attRecord.groupName}
                          </div>
                        )}
                      </div>
                    ) : isScheduled ? (
                      <div className="space-y-0.5">
                        <div className={`px-1.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold text-center border ${
                          isFuture
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {isFuture ? "Rejadagi dars" : "Belgilanmagan"}
                        </div>
                        {scheduledGroups && scheduledGroups[0]?.time && (
                          <div className="text-[9px] text-slate-400 text-center truncate font-mono">
                            {scheduledGroups[0].time}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with Legend */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 flex-wrap">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              Keldi
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              Kelmadi
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              Kechikdi
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
              Sababli
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-3 h-3 rounded-full bg-indigo-200 dark:bg-indigo-800 shrink-0" />
              Rejadagi dars
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer ml-auto"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
