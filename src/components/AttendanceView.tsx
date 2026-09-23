import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Download,
  Save,
  Users,
  Calendar as CalendarIcon,
  CalendarDays,
  Edit2,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { 
  monthKey, 
  monthLabelUZ, 
  getPreviousMonth, 
  getNextMonth, 
  groupLessonDates, 
  getWeekdayShortName,
  getWeekdayFullName
} from '../lib/finance';
import { saveAttendance } from '../lib/db';
import { formatDateUZ } from '../lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AttendanceViewProps {
  groups: any[];
  students: any[];
  attendance: AttendanceRecord[];
  teacherUsername: string;
  onEditGroup?: (id: string, group: { name?: string; days?: string; time?: string; monthlyFee?: number }) => Promise<void>;
}

export function AttendanceView({
  groups,
  students,
  attendance,
  teacherUsername,
  onEditGroup,
}: AttendanceViewProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => groups[0]?.id || '');

  // Schedule edit modal state
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [scheduleStartTime, setScheduleStartTime] = useState('08:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('10:00');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Monthly mode state
  const [selectedMonth, setSelectedMonth] = useState<string>(() => monthKey(new Date()));
  const [localMonthlyOverrides, setLocalMonthlyOverrides] = useState<{
    [cellKey: string]: AttendanceStatus | null;
  }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active group object
  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || groups[0] || null;
  }, [groups, selectedGroupId]);

  // Sync selectedGroupId if not set or groups changed
  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  // Clear local overrides when activeGroup or selectedMonth changes
  useEffect(() => {
    setLocalMonthlyOverrides({});
  }, [activeGroup?.id, selectedMonth]);

  // Students belonging to activeGroup
  const groupStudents = useMemo(() => {
    if (!activeGroup) return [];
    return students.filter(
      (s) =>
        s.group === activeGroup.name ||
        s.group === activeGroup.id ||
        (Array.isArray(s.groups) && (s.groups.includes(activeGroup.name) || s.groups.includes(activeGroup.id)))
    );
  }, [activeGroup, students]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync schedule modal state when activeGroup changes or modal opens
  useEffect(() => {
    if (activeGroup) {
      if (activeGroup.days) {
        setScheduleDays(activeGroup.days.split(',').map((d: string) => d.trim()).filter(Boolean));
      } else {
        setScheduleDays(['Dush', 'Chor', 'Juma']);
      }
      if (activeGroup.time && activeGroup.time.includes('-')) {
        const [st, et] = activeGroup.time.split('-');
        setScheduleStartTime(st ? st.trim() : '08:00');
        setScheduleEndTime(et ? et.trim() : '10:00');
      }
    }
  }, [activeGroup, isEditScheduleOpen]);

  const handleSaveSchedule = async () => {
    if (!activeGroup) return;
    if (scheduleDays.length === 0) {
      showToast("Kamida bitta dars kunini tanlang!");
      return;
    }
    if (!scheduleStartTime || !scheduleEndTime) {
      showToast("Dars boshlanish va tugash soatini kiriting!");
      return;
    }
    setIsSavingSchedule(true);
    try {
      const updatedDays = scheduleDays.join(', ');
      const updatedTime = `${scheduleStartTime} - ${scheduleEndTime}`;
      if (onEditGroup) {
        await onEditGroup(activeGroup.id, {
          name: activeGroup.name,
          days: updatedDays,
          time: updatedTime,
        });
      } else {
        await updateDoc(doc(db, 'groups', activeGroup.id), {
          days: updatedDays,
          time: updatedTime,
          updatedAt: Date.now(),
        });
      }
      showToast(`${activeGroup.name} guruhi dars jadvali yangilandi!`);
      setIsEditScheduleOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Dars jadvalini saqlashda xatolik yuz berdi");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Lesson dates for selected month - dynamically generated via groupLessonDates
  const monthLessonDates = useMemo(() => {
    if (!activeGroup || !selectedMonth) return [];
    // 1. Dinamik dars kunlarini groupLessonDates orqali hisoblash
    const plannedDates = groupLessonDates(activeGroup, selectedMonth);

    // 2. Ushbu oyda mazkur guruh uchun amalda yozilgan davomat sanalarini ham qo'shish
    const recordedDates = new Set<string>();
    attendance.forEach((rec) => {
      const isGroupMatch =
        rec.groupId === activeGroup.id ||
        rec.groupName === activeGroup.name ||
        rec.groupId === activeGroup.name;

      if (
        isGroupMatch &&
        rec.date &&
        rec.date.startsWith(selectedMonth) &&
        rec.records &&
        Object.keys(rec.records).length > 0
      ) {
        recordedDates.add(rec.date);
      }
    });

    const combined = Array.from(new Set([...plannedDates, ...recordedDates]));
    combined.sort();
    return combined;
  }, [activeGroup, selectedMonth, attendance]);

  // Group attendance records for this month
  const monthAttendanceMap = useMemo(() => {
    const map = new Map<string, { [studentId: string]: AttendanceStatus }>();
    if (!activeGroup) return map;

    attendance.forEach((rec) => {
      const isGroupMatch =
        rec.groupId === activeGroup.id ||
        rec.groupName === activeGroup.name ||
        rec.groupId === activeGroup.name;

      if (isGroupMatch && rec.date && rec.date.startsWith(selectedMonth)) {
        const existing = map.get(rec.date) || {};
        map.set(rec.date, { ...existing, ...(rec.records || {}) });
      }
    });
    return map;
  }, [activeGroup, selectedMonth, attendance]);

  // Har bir o'quvchining muayyan sana bo'yicha davomat holatini aniqlash (id va username bo'yicha)
  const getStudentDayStatus = (student: any, dateStr: string): AttendanceStatus | undefined => {
    const overrideKey = `${dateStr}_${student.id}`;
    if (localMonthlyOverrides[overrideKey] !== undefined) {
      const val = localMonthlyOverrides[overrideKey];
      return val === null ? undefined : val;
    }
    if (student.username) {
      const userKey = `${dateStr}_${student.username}`;
      if (localMonthlyOverrides[userKey] !== undefined) {
        const val = localMonthlyOverrides[userKey];
        return val === null ? undefined : val;
      }
    }
    const recs = monthAttendanceMap.get(dateStr);
    if (!recs) return undefined;
    return recs[student.id] || (student.username ? recs[student.username] : undefined);
  };

  // Oylik jadval katakchasini bosganda davomatni o'zgartirish va Firebase ga saqlash
  const handleToggleMonthlyCell = async (student: any, dateStr: string) => {
    if (!activeGroup) return;

    const currentStatus = getStudentDayStatus(student, dateStr);
    // Aylanish ketma-ketligi: belgilanmagan -> keldi -> kelmadi -> kechikdi -> sababli -> belgilanmagan
    const nextStatus: AttendanceStatus | null =
      currentStatus === undefined ? 'keldi' :
      currentStatus === 'keldi' ? 'kelmadi' :
      currentStatus === 'kelmadi' ? 'kechikdi' :
      currentStatus === 'kechikdi' ? 'sababli' : null;

    const cellKey = `${dateStr}_${student.id}`;
    // Optimistik holat (UI darhol o'zgarishi uchun)
    setLocalMonthlyOverrides((prev) => ({
      ...prev,
      [cellKey]: nextStatus,
    }));

    try {
      const existingRec = attendance.find(
        (a) =>
          (a.groupId === activeGroup.id || a.groupName === activeGroup.name || a.groupId === activeGroup.name) &&
          a.date === dateStr
      );

      const baseRecords: { [studentId: string]: AttendanceStatus } = {
        ...(existingRec?.records || monthAttendanceMap.get(dateStr) || {}),
      };

      if (nextStatus === null) {
        delete baseRecords[student.id];
        if (student.username) delete baseRecords[student.username];
      } else {
        baseRecords[student.id] = nextStatus;
      }

      await saveAttendance(activeGroup.id, dateStr, {
        teacherUsername,
        groupId: activeGroup.id,
        groupName: activeGroup.name,
        date: dateStr,
        records: baseRecords,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error(err);
      // Xatolik yuz bersa orqaga qaytarish
      setLocalMonthlyOverrides((prev) => {
        const copy = { ...prev };
        delete copy[cellKey];
        return copy;
      });
      showToast("Davomatni saqlashda xatolik yuz berdi");
    }
  };

  // Oylik hisobot umumiy statistikasi
  const { totalMonthKeldi, totalMonthKelmadi, overallMonthPercent } = useMemo(() => {
    let k = 0;
    let q = 0;
    let kch = 0;
    groupStudents.forEach((s) => {
      monthLessonDates.forEach((dateStr) => {
        const st = getStudentDayStatus(s, dateStr);
        if (st === 'keldi') k++;
        else if (st === 'kelmadi') q++;
        else if (st === 'kechikdi') kch++;
      });
    });
    const totalPossible = groupStudents.length * monthLessonDates.length;
    const attended = k + kch;
    const pct = totalPossible > 0 ? Math.round((attended / totalPossible) * 100) : 0;
    return { totalMonthKeldi: k, totalMonthKelmadi: q, overallMonthPercent: pct };
  }, [groupStudents, monthLessonDates, monthAttendanceMap, localMonthlyOverrides]);

  // Export Monthly Attendance to Excel
  const handleExportMonthExcel = () => {
    if (!activeGroup) return;

    const data = groupStudents.map((s, idx) => {
      const row: Record<string, any> = {
        'T/r': idx + 1,
        'F.I.SH': `${s.firstName || ''} ${s.lastName || ''}`.trim(),
        'Telefon': s.phone || '-',
      };

      let keldiCount = 0;
      let kelmadiCount = 0;
      let kechikdiCount = 0;
      let sababliCount = 0;

      monthLessonDates.forEach((dateStr) => {
        const dayStr = dateStr.slice(8); // "DD"
        const status = getStudentDayStatus(s, dateStr);

        if (status === 'keldi') {
          row[dayStr] = 'K';
          keldiCount++;
        } else if (status === 'kelmadi') {
          row[dayStr] = 'Q';
          kelmadiCount++;
        } else if (status === 'kechikdi') {
          row[dayStr] = 'Kch';
          keldiCount++; // or count separately
          kechikdiCount++;
        } else if (status === 'sababli') {
          row[dayStr] = 'S';
          sababliCount++;
        } else {
          row[dayStr] = '-';
        }
      });

      row['Jami darslar'] = monthLessonDates.length;
      row['Keldi'] = keldiCount;
      row['Kelmadi'] = kelmadiCount;
      row['Kechikdi'] = kechikdiCount;
      row['Sababli'] = sababliCount;

      const attended = keldiCount + kechikdiCount;
      const rate = monthLessonDates.length > 0 ? Math.round((attended / monthLessonDates.length) * 100) : 0;
      row['Davomat (%)'] = `${rate}%`;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Davomat');

    const fileName = `Davomat_${activeGroup.name.replace(/\s+/g, '_')}_${selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (groups.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
        <CalendarCheck className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Guruhlar topilmadi
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Davomat yuritish uchun avval kamida bitta guruh yarating va o'quvchilarni biriktiring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500 font-medium text-sm"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            O'quvchilar Davomati
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Guruhlar bo'yicha oylik davomat jurnali va hisobotlar
          </p>
        </div>

        {/* Month Selector & Export Excel */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <div className="flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setSelectedMonth(getPreviousMonth(selectedMonth))}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Oldingi oy"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-3 py-1 text-sm font-bold text-slate-800 dark:text-slate-100 min-w-[130px] text-center flex items-center justify-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {monthLabelUZ(selectedMonth)}
            </div>
            <button
              onClick={() => setSelectedMonth(getNextMonth(selectedMonth))}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Keyingi oy"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleExportMonthExcel}
            disabled={groupStudents.length === 0 || monthLessonDates.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs md:text-sm font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Excel yuklash</span>
          </button>
        </div>
      </div>

      {/* Group Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((g) => {
          const count = students.filter(
            (s) => s.group === g.name || (Array.isArray(s.groups) && s.groups.includes(g.name))
          ).length;

          return (
            <button
              key={g.id}
              onClick={() => setSelectedGroupId(g.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                selectedGroupId === g.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{g.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                selectedGroupId === g.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Group info banner */}
      {activeGroup && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              Dars kunlari: <span className="font-bold text-slate-800 dark:text-slate-200">{activeGroup.days || 'Kiritilmagan'}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-indigo-500" />
              Vaqt: <span className="font-bold text-slate-800 dark:text-slate-200">{activeGroup.time || 'Kiritilmagan'}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-indigo-500" />
              O'quvchilar: <span className="font-bold text-slate-800 dark:text-slate-200">{groupStudents.length} ta</span>
            </span>
            <button
              type="button"
              onClick={() => setIsEditScheduleOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-800/80 cursor-pointer shadow-2xs"
              title="Guruh dars kunlari va soatini sozlash"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Dars jadvalini sozlash</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="hidden sm:inline font-medium">
              Rejadagi darslar: <strong className="text-slate-800 dark:text-slate-200">{monthLessonDates.length} ta</strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> K (Keldi)
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Q (Kelmadi)
              </span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Kch
              </span>
              <span className="flex items-center gap-1 text-blue-500 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> S (Sababli)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {monthLessonDates.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Ushbu oyda rejalashtirilgan dars kunlari yo'q
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Guruh dars kunlari to'g'ri sozlanganligini tekshiring
            </p>
            <button
              type="button"
              onClick={() => setIsEditScheduleOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              Dars kunlari va vaqtini kiritish
            </button>
          </div>
        ) : groupStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Ushbu guruhda o'quvchilar yo'q
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              O'quvchilar ro'yxatidan ushbu guruhga o'quvchi qo'shing
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-3 w-8 sticky left-0 bg-slate-50 dark:bg-slate-950/80 z-20">#</th>
                  <th className="py-3 px-3 min-w-[170px] sticky left-8 bg-slate-50 dark:bg-slate-950/80 z-20 font-bold">
                    O'quvchi
                  </th>
                  {monthLessonDates.map((dateStr) => {
                    const day = dateStr.slice(8);
                    const weekday = getWeekdayShortName(dateStr);
                    const isToday = dateStr === new Date().toISOString().slice(0, 10);
                    return (
                      <th
                        key={dateStr}
                        className={`py-2 px-1 text-center min-w-[38px] font-bold border-l border-slate-100 dark:border-slate-800/60 transition-colors ${
                          isToday ? 'bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : ''
                        }`}
                        title={`${formatDateUZ(dateStr, false)} (${getWeekdayFullName(dateStr)}) • ${activeGroup?.time || ''}`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-[10px] uppercase font-semibold ${
                            isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {weekday}
                          </span>
                          <span className={`text-xs ${
                            isToday 
                              ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs font-bold' 
                              : 'text-slate-700 dark:text-slate-200 font-bold'
                          }`}>
                            {day}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-3 px-2 text-center min-w-[45px] font-bold border-l border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/40 text-emerald-600 dark:text-emerald-400">
                    Keldi
                  </th>
                  <th className="py-3 px-2 text-center min-w-[45px] font-bold border-l border-slate-100 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-rose-600 dark:text-rose-400">
                    Kelmadi
                  </th>
                  <th className="py-3 px-2 text-center min-w-[55px] font-bold border-l border-slate-100 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-indigo-600 dark:text-indigo-400">
                    Foiz
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {groupStudents.map((s, idx) => {
                  let keldiCount = 0;
                  let kelmadiCount = 0;
                  let kechikdiCount = 0;
                  let sababliCount = 0;

                  monthLessonDates.forEach((dateStr) => {
                    const st = getStudentDayStatus(s, dateStr);
                    if (st === 'keldi') keldiCount++;
                    else if (st === 'kelmadi') kelmadiCount++;
                    else if (st === 'kechikdi') kechikdiCount++;
                    else if (st === 'sababli') sababliCount++;
                  });

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 sticky left-0 bg-white dark:bg-slate-900 font-medium text-slate-400 z-10">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 sticky left-8 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white z-10 whitespace-nowrap">
                        {s.firstName} {s.lastName}
                      </td>

                      {monthLessonDates.map((dateStr) => {
                        const st = getStudentDayStatus(s, dateStr);

                        return (
                          <td
                            key={dateStr}
                            className="py-1 px-0.5 text-center border-l border-slate-100 dark:border-slate-800/60"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleMonthlyCell(s, dateStr)}
                              className="w-full min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all cursor-pointer group"
                              title={`${s.firstName} ${s.lastName} • ${dateStr} • ${
                                st === 'keldi' ? "Keldi (K) - O'zgartirish uchun bosing" :
                                st === 'kelmadi' ? "Qatnashmadi (Q) - O'zgartirish uchun bosing" :
                                st === 'kechikdi' ? "Kechikdi (Kch) - O'zgartirish uchun bosing" :
                                st === 'sababli' ? "Sababli (S) - O'zgartirish uchun bosing" : "Belgilanmagan (Bosib 'Keldi' qiling)"
                              }`}
                            >
                              {st === 'keldi' && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold text-[11px] shadow-2xs border border-emerald-200 dark:border-emerald-800/60">
                                  K
                                </span>
                              )}
                              {st === 'kelmadi' && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 font-bold text-[11px] shadow-2xs border border-rose-200 dark:border-rose-800/60">
                                  Q
                                </span>
                              )}
                              {st === 'kechikdi' && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 font-bold text-[11px] shadow-2xs border border-amber-200 dark:border-amber-800/60">
                                  Kch
                                </span>
                              )}
                              {st === 'sababli' && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-bold text-[11px] shadow-2xs border border-blue-200 dark:border-blue-800/60">
                                  S
                                </span>
                              )}
                              {!st && (
                                <span className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-400 group-hover:scale-125 transition-all text-xs font-semibold">
                                  -
                                </span>
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Keldi count */}
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-600 dark:text-emerald-400 border-l border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                        {keldiCount}
                      </td>
                      {/* Kelmadi count */}
                      <td className="py-2.5 px-2 text-center font-bold text-rose-600 dark:text-rose-400 border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        {kelmadiCount}
                      </td>
                      {/* Davomat foizi */}
                      <td className="py-2.5 px-2 text-center font-bold border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        {(() => {
                          const attended = keldiCount + kechikdiCount;
                          const rate = monthLessonDates.length > 0
                            ? Math.round((attended / monthLessonDates.length) * 100)
                            : 0;
                          return (
                            <span className={rate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : rate >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                              {rate}%
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-950/80 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <tr>
                  <td colSpan={2} className="py-2.5 px-3 sticky left-0 bg-slate-50 dark:bg-slate-950/80 z-20 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Jami qatnashganlar:
                  </td>
                  {monthLessonDates.map((dateStr) => {
                    let dayAttended = 0;
                    let dayRecorded = 0;
                    groupStudents.forEach((s) => {
                      const st = getStudentDayStatus(s, dateStr);
                      if (st === 'keldi' || st === 'kechikdi') dayAttended++;
                      if (st) dayRecorded++;
                    });
                    return (
                      <td
                        key={dateStr}
                        className="py-2 px-1 text-center border-l border-slate-100 dark:border-slate-800/60 text-[11px]"
                        title={`${dateStr}: ${dayAttended} / ${groupStudents.length} ta o'quvchi qatnashdi`}
                      >
                        {dayRecorded > 0 ? (
                          <span className={dayAttended === groupStudents.length ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                            {dayAttended}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 font-light">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-2 text-center text-emerald-600 dark:text-emerald-400 border-l border-slate-200 dark:border-slate-700 font-bold">
                    {totalMonthKeldi}
                  </td>
                  <td className="py-2.5 px-2 text-center text-rose-600 dark:text-rose-400 border-l border-slate-100 dark:border-slate-800 font-bold">
                    {totalMonthKelmadi}
                  </td>
                  <td className="py-2.5 px-2 text-center text-indigo-600 dark:text-indigo-400 border-l border-slate-100 dark:border-slate-800 font-bold">
                    {overallMonthPercent}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: DARS KUNLARI VA VAQTINI SOZLASH */}
      {isEditScheduleOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditScheduleOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Dars jadvalini sozlash
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{activeGroup.name}</span> guruhi dars kunlari va vaqtlarini tanlang
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Tayyor andozalar (Presets):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: 'Toq kunlar', days: ['Dush', 'Chor', 'Juma'] },
                  { name: 'Juft kunlar', days: ['Sesh', 'Pay', 'Shan'] },
                  { name: 'Har kuni', days: ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'] },
                  { name: 'Dam olish', days: ['Shan', 'Yak'] },
                ].map((p) => {
                  const isMatch = p.days.length === scheduleDays.length && p.days.every(d => scheduleDays.includes(d));
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setScheduleDays([...p.days])}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left flex flex-col justify-between cursor-pointer ${
                        isMatch
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold">{p.name}</span>
                      <span className={`text-[11px] ${isMatch ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {p.days.length} kun
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day Selector Pills */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Hafta kunlarini tanlash:
              </label>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {[
                  { id: 'Dush', label: 'Du', full: 'Dush' },
                  { id: 'Sesh', label: 'Se', full: 'Sesh' },
                  { id: 'Chor', label: 'Ch', full: 'Chor' },
                  { id: 'Pay', label: 'Pa', full: 'Pay' },
                  { id: 'Juma', label: 'Ju', full: 'Juma' },
                  { id: 'Shan', label: 'Sh', full: 'Shan' },
                  { id: 'Yak', label: 'Ya', full: 'Yak' },
                ].map((d) => {
                  const isSelected = scheduleDays.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setScheduleDays((prev) =>
                          prev.includes(d.id)
                            ? prev.filter((x) => x !== d.id)
                            : [...prev, d.id]
                        );
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      <span className="text-[10px] opacity-75">{d.label}</span>
                      <span className="text-xs">{d.full}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lesson Time inputs */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Dars soati:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  required
                  value={scheduleStartTime}
                  onChange={(e) => setScheduleStartTime(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="time"
                  required
                  value={scheduleEndTime}
                  onChange={(e) => setScheduleEndTime(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditScheduleOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={isSavingSchedule || scheduleDays.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs md:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSavingSchedule ? 'Saqlanmoqda...' : 'Jadvalni saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
