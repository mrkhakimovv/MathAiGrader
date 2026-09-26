import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Trash2, 
  X, 
  Tag, 
  ArrowUpRight,
  User,
  CreditCard,
  Building2,
  DollarSign,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import { Payment, PaymentMethod, Group, Student } from '../types';
import { 
  formatSom, 
  monthKey, 
  monthLabelUZ, 
  getPreviousMonth, 
  getNextMonth, 
  getMonthlyDue, 
  getPaidForMonth, 
  getMonthStatus, 
  getTotalDebt, 
  isNewStudentInMonth,
  PAYMENT_METHODS, 
  getPaymentMethodLabel 
} from '../lib/finance';
import { addPayment, deletePayment, updateStudentDiscounts, updateStudentInitialFee } from '../lib/db';
import { formatDateUZ } from '../lib/utils';

interface PaymentsViewProps {
  groups: any[];
  students: any[];
  payments: Payment[];
  teacherUsername: string;
  onNavigateToGroups?: () => void;
}

interface PaymentChartPoint {
  key: string;
  name: string;
  monthName: string;
  daromad: number;
  qarz: number;
  kutilgan: number;
  foiz: number;
}

interface StudentGroupRow {
  student: any;
  group: any;
  monthlyDue: number;
  paidThisMonth: number;
  status: 'tolangan' | 'qisman' | 'tolanmagan' | 'tolov_belgilanmagan';
  totalDebt: number;
}

export function PaymentsView({
  groups,
  students,
  payments,
  teacherUsername,
  onNavigateToGroups,
}: PaymentsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => monthKey(new Date()));
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyDebtors, setOnlyDebtors] = useState(false);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<{ student: any; group: any } | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<{ student: any; group: any } | null>(null);

  // In-page Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Payment modal form state
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('naqd');
  const [payDate, setPayDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote] = useState('');
  const [payMonths, setPayMonths] = useState<string[]>([selectedMonth]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Discount form state in history modal
  const [discountAmount, setDiscountAmount] = useState<number | ''>('');
  const [isSavingDiscount, setIsSavingDiscount] = useState(false);

  // Initial fee inline state for newly added students
  const [initialFeeInputs, setInitialFeeInputs] = useState<{ [key: string]: string }>({});
  const [manualNewStudentKeys, setManualNewStudentKeys] = useState<{ [key: string]: boolean }>({});
  const [savingFeeKey, setSavingFeeKey] = useState<string | null>(null);

  const handleInitialFeeChange = (key: string, value: string) => {
    setInitialFeeInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleEnableNewStudentMode = (studentId: string, groupId: string) => {
    const key = `${studentId}_${groupId}`;
    setManualNewStudentKeys((prev) => ({ ...prev, [key]: true }));
  };

  const handleSaveInitialFee = async (student: any, group: any, month: string) => {
    const key = `${student.id}_${group.id}`;
    const rawVal = initialFeeInputs[key];
    if (rawVal === undefined) return;

    const trimmed = rawVal.trim();
    const cleanNum = trimmed === '' ? null : Number(trimmed.replace(/\s+/g, ''));
    if (cleanNum !== null && (isNaN(cleanNum) || cleanNum < 0)) {
      showToast("Noto'g'ri summa kiritildi");
      return;
    }

    try {
      setSavingFeeKey(key);
      await updateStudentInitialFee(student.id, group.id, cleanNum, month);

      // Optimistically update student object
      if (!student.initialFees) student.initialFees = {};
      if (!student.initialFeeMonths) student.initialFeeMonths = {};
      if (cleanNum === null) {
        delete student.initialFees[group.id];
        delete student.initialFeeMonths[group.id];
      } else {
        student.initialFees[group.id] = cleanNum;
        student.initialFeeMonths[group.id] = month;
        student.initialFee = cleanNum;
        student.initialFeeMonth = month;
        student.joinMonth = student.joinMonth || month;
      }

      showToast(
        cleanNum !== null
          ? `${student.firstName} uchun birinchi oy to'lovi: ${formatSom(cleanNum)} saqlandi!`
          : `${student.firstName} uchun standart guruh to'lovi tiklandi!`
      );
    } catch (e) {
      console.error(e);
      showToast("To'lov summasini saqlashda xatolik yuz berdi");
    } finally {
      setSavingFeeKey(null);
    }
  };

  // Active filtered groups
  const filteredGroups = useMemo(() => {
    if (selectedGroupId === 'all') return groups;
    return groups.filter((g) => g.id === selectedGroupId);
  }, [groups, selectedGroupId]);

  // Selected single group object (if not 'all')
  const activeSingleGroup = useMemo(() => {
    if (selectedGroupId === 'all') return null;
    return groups.find((g) => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  // Compute student × group rows
  const allRows: StudentGroupRow[] = useMemo(() => {
    const rows: StudentGroupRow[] = [];

    students.forEach((student) => {
      filteredGroups.forEach((group) => {
        // Group membership check: student.group === group.name || student.groups?.includes(group.name)
        const isMember =
          student.group === group.name ||
          (Array.isArray(student.groups) && student.groups.includes(group.name));

        if (isMember) {
          const monthlyDue = getMonthlyDue(student, group, selectedMonth);
          const paidThisMonth = getPaidForMonth(payments, student.id, group.id, selectedMonth);
          const status = getMonthStatus(student, group, payments, selectedMonth);
          const totalDebt = getTotalDebt(student, group, payments, selectedMonth);

          rows.push({
            student,
            group,
            monthlyDue,
            paidThisMonth,
            status,
            totalDebt,
          });
        }
      });
    });

    return rows;
  }, [students, filteredGroups, payments, selectedMonth, initialFeeInputs]);

  // Filtered rows by search and onlyDebtors
  const displayRows = useMemo(() => {
    return allRows.filter((row) => {
      if (onlyDebtors) {
        // Student is a debtor if totalDebt > 0 or status is 'qisman' / 'tolanmagan' (when fee > 0)
        const isDebtor =
          row.totalDebt > 0 ||
          (row.status !== 'tolangan' && row.status !== 'tolov_belgilanmagan');
        if (!isDebtor) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${row.student.firstName || ''} ${row.student.lastName || ''}`.toLowerCase();
        const phone = (row.student.phone || '').toLowerCase();
        const uname = (row.student.username || '').toLowerCase();
        const groupName = (row.group.name || '').toLowerCase();

        return (
          fullName.includes(q) ||
          phone.includes(q) ||
          uname.includes(q) ||
          groupName.includes(q)
        );
      }

      return true;
    });
  }, [allRows, onlyDebtors, searchQuery]);

  // Statistics for selected month across filtered groups
  const stats = useMemo(() => {
    let expectedTotal = 0;
    let collectedTotal = 0;
    let debtorsCount = 0;

    allRows.forEach((row) => {
      expectedTotal += row.monthlyDue;
      collectedTotal += row.paidThisMonth;
      if (
        row.status !== 'tolangan' &&
        row.status !== 'tolov_belgilanmagan' &&
        row.monthlyDue > 0
      ) {
        debtorsCount++;
      }
    });

    const remainingDebt = Math.max(0, expectedTotal - collectedTotal);
    const percentage = expectedTotal > 0 ? Math.min(100, Math.round((collectedTotal / expectedTotal) * 100)) : 0;

    return {
      expectedTotal,
      collectedTotal,
      remainingDebt,
      debtorsCount,
      percentage,
    };
  }, [allRows]);

  // Chart view mode: 'monthly' (oxirgi 6 oy dinamikasi) or 'groups' (guruhlar kesimida)
  const [chartMode, setChartMode] = useState<'monthly' | 'groups'>('monthly');
  const [isChartVisible, setIsChartVisible] = useState(true);

  // 1. Monthly dynamics data for the last 6 months (up to selectedMonth)
  const monthlyChartData: PaymentChartPoint[] = useMemo(() => {
    const monthsList: string[] = [];
    let cur = selectedMonth;
    for (let i = 0; i < 6; i++) {
      monthsList.unshift(cur);
      cur = getPreviousMonth(cur);
    }

    return monthsList.map((m) => {
      // Calculate collected for month m
      let daromad = 0;
      payments.forEach((p) => {
        if (p.month === m) {
          if (selectedGroupId === 'all' || p.groupId === selectedGroupId) {
            daromad += Number(p.amount) || 0;
          }
        }
      });

      // Calculate expected dues for month m
      let kutilgan = 0;
      students.forEach((student) => {
        filteredGroups.forEach((group) => {
          const isMember =
            student.group === group.name ||
            (Array.isArray(student.groups) && student.groups.includes(group.name));
          if (isMember) {
            kutilgan += getMonthlyDue(student, group, m);
          }
        });
      });

      const qarz = Math.max(0, kutilgan - daromad);
      const foiz = kutilgan > 0 ? Math.min(100, Math.round((daromad / kutilgan) * 100)) : 0;

      const [year, monthNum] = m.split('-');
      const shortMonthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sent', 'Okt', 'Noy', 'Dek'];
      const mIdx = parseInt(monthNum, 10) - 1;
      const shortName = `${shortMonthNames[mIdx] || monthNum} '${year.slice(2)}`;

      return {
        key: m,
        monthName: monthLabelUZ(m),
        name: shortName,
        daromad,
        qarz,
        kutilgan,
        foiz,
      };
    });
  }, [selectedMonth, payments, selectedGroupId, students, filteredGroups]);

  // 2. Group by group chart data for selectedMonth
  const groupsChartData: PaymentChartPoint[] = useMemo(() => {
    return filteredGroups.map((g) => {
      // Group collected this month
      const daromad = payments
        .filter((p) => p.groupId === g.id && p.month === selectedMonth)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Group expected dues this month
      let kutilgan = 0;
      students.forEach((student) => {
        const isMember =
          student.group === g.name ||
          (Array.isArray(student.groups) && student.groups.includes(g.name));
        if (isMember) {
          kutilgan += getMonthlyDue(student, g, selectedMonth);
        }
      });

      const qarz = Math.max(0, kutilgan - daromad);
      const foiz = kutilgan > 0 ? Math.min(100, Math.round((daromad / kutilgan) * 100)) : 0;

      return {
        key: g.id,
        name: g.name,
        monthName: `${g.name} guruhi (${monthLabelUZ(selectedMonth)})`,
        daromad,
        qarz,
        kutilgan,
        foiz,
      };
    });
  }, [filteredGroups, payments, selectedMonth, students]);

  const activeChartData = useMemo(() => {
    return chartMode === 'monthly' ? monthlyChartData : groupsChartData;
  }, [chartMode, monthlyChartData, groupsChartData]);

  // Y-axis value formatter (e.g. 1.2 mln, 400 ming)
  const formatYAxisValue = (value: any) => {
    const num = Number(value) || 0;
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)} mln`;
    }
    if (num >= 1_000) {
      return `${Math.round(num / 1_000)} ming`;
    }
    return String(num);
  };

  // Open payment modal
  const handleOpenPayment = (student: any, group: any) => {
    setPaymentTarget({ student, group });
    const paid = getPaidForMonth(payments, student.id, group.id, selectedMonth);
    const due = getMonthlyDue(student, group, selectedMonth);
    const remaining = Math.max(0, due - paid);
    
    // Default amount: remaining for this month, or group fee, or 0
    setPayAmount(remaining > 0 ? remaining : (group.monthlyFee || ''));
    setPayMethod('naqd');
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayNote('');
    setPayMonths([selectedMonth]);
    setIsPaymentModalOpen(true);
  };

  // Open history modal
  const handleOpenHistory = (student: any, group: any) => {
    setHistoryTarget({ student, group });
    const curDiscount = student.discounts?.[group.id];
    setDiscountAmount(curDiscount !== undefined && curDiscount !== null ? curDiscount : '');
    setIsHistoryModalOpen(true);
  };

  // Submit payment
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTarget || payAmount === '' || Number(payAmount) <= 0 || payMonths.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const singleAmount = Math.round(Number(payAmount) / payMonths.length);
      const paidTimestamp = new Date(payDate).getTime() || Date.now();

      for (const m of payMonths) {
        const paymentPayload: any = {
          teacherUsername: teacherUsername || '',
          studentId: paymentTarget.student.id,
          studentUsername: paymentTarget.student.username || '',
          studentName: `${paymentTarget.student.firstName || ''} ${paymentTarget.student.lastName || ''}`.trim(),
          groupId: paymentTarget.group.id,
          groupName: paymentTarget.group.name || '',
          month: m,
          amount: singleAmount,
          method: payMethod,
          paidAt: paidTimestamp,
        };

        const trimmedNote = payNote.trim();
        if (trimmedNote) {
          paymentPayload.note = trimmedNote;
        }

        await addPayment(paymentPayload);
      }

      setIsPaymentModalOpen(false);
      showToast(`${paymentTarget.student.firstName} uchun to'lov muvaffaqiyatli saqlandi!`);
    } catch (err: any) {
      console.error(err);
      showToast("To'lovni saqlashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete payment with confirmation
  const handleDeletePayment = async (id?: string) => {
    if (!id) return;
    const ok = window.confirm("Rostdan ham ushbu to'lov yozuvini o'chirmoqchimisiz?");
    if (!ok) return;

    try {
      await deletePayment(id);
      showToast("To'lov yozuvi o'chirildi");
    } catch (err) {
      console.error(err);
      showToast("O'chirishda xatolik yuz berdi");
    }
  };

  // Save student discount for group
  const handleSaveDiscount = async () => {
    if (!historyTarget) return;
    setIsSavingDiscount(true);
    try {
      const curDiscounts = historyTarget.student.discounts || {};
      const newDiscounts = { ...curDiscounts };

      const numVal = discountAmount === '' ? 0 : Number(discountAmount);
      if (numVal <= 0) {
        delete newDiscounts[historyTarget.group.id];
      } else {
        newDiscounts[historyTarget.group.id] = numVal;
      }

      await updateStudentDiscounts(historyTarget.student.id, newDiscounts);
      // update local state
      historyTarget.student.discounts = newDiscounts;
      showToast("Chegirma muvaffaqiyatli saqlandi!");
    } catch (err) {
      console.error(err);
      showToast("Chegirmani saqlashda xatolik yuz berdi");
    } finally {
      setIsSavingDiscount(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = displayRows.map((r, idx) => {
      const discount = r.student.discounts?.[r.group.id] || 0;
      let statusLabel = "To'lanmagan";
      if (r.status === 'tolangan') statusLabel = "To'langan";
      else if (r.status === 'qisman') statusLabel = "Qisman to'langan";
      else if (r.status === 'tolov_belgilanmagan') statusLabel = "To'lov belgilanmagan";

      return {
        'T/r': idx + 1,
        'Ism': r.student.firstName || '',
        'Familiya': r.student.lastName || '',
        'Telefon': r.student.phone || '-',
        'Guruh': r.group.name || '',
        'Oylik to\'lov (so\'m)': r.group.monthlyFee || 0,
        'Chegirma (so\'m)': discount,
        'To\'lanishi kerak (so\'m)': r.monthlyDue,
        'Shu oy to\'langan (so\'m)': r.paidThisMonth,
        'Holati': statusLabel,
        'Jami qarz / haqdorlik': r.totalDebt > 0 ? `${formatSom(r.totalDebt)} qarz` : r.totalDebt < 0 ? `${formatSom(Math.abs(r.totalDebt))} haqdor` : 'Qarzsiz',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'To\'lovlar');

    const groupNameSlug = selectedGroupId === 'all' ? 'barcha_guruhlar' : (activeSingleGroup?.name || 'guruh').replace(/\s+/g, '_');
    const fileName = `Tolashlar_${groupNameSlug}_${selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Target student payment history
  const studentPayments = useMemo(() => {
    if (!historyTarget) return [];
    return payments
      .filter(
        (p) =>
          p.studentId === historyTarget.student.id &&
          p.groupId === historyTarget.group.id
      )
      .sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));
  }, [payments, historyTarget]);

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

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Wallet className="w-6 h-6" />
            </div>
            To'lovlar va Qarzdorlik
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            O'quvchilar to'lovlarini hisobga olish va oylik hisobotlar
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setSelectedMonth(getPreviousMonth(selectedMonth))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Oldingi oy"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-3 py-1 text-sm font-bold text-slate-800 dark:text-slate-100 min-w-[130px] text-center flex items-center justify-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {monthLabelUZ(selectedMonth)}
          </div>
          <button
            onClick={() => setSelectedMonth(getNextMonth(selectedMonth))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Keyingi oy"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Group Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedGroupId('all')}
          className={`px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
            selectedGroupId === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Barcha guruhlar ({groups.length})
        </button>
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroupId(g.id)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
              selectedGroupId === g.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Warning if selected group has no monthlyFee set */}
      {activeSingleGroup && (!activeSingleGroup.monthlyFee || activeSingleGroup.monthlyFee <= 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-300"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm">
              <span className="font-semibold">"{activeSingleGroup.name}"</span> guruhi uchun oylik to'lov summasi belgilanmagan.
            </p>
          </div>
          {onNavigateToGroups && (
            <button
              onClick={onNavigateToGroups}
              className="text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-200 dark:bg-amber-800/50 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
            >
              Guruhni tahrirlash
            </button>
          )}
        </motion.div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kutilgan tushum */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs md:text-sm font-medium">Kutilgan tushum</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">
            {formatSom(stats.expectedTotal)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {monthLabelUZ(selectedMonth)} uchun
          </p>
        </motion.div>

        {/* Yig'ilgan summa */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs md:text-sm font-medium">Yig'ilgan summa</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatSom(stats.collectedTotal)}
          </div>
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {stats.percentage}%
            </span>
          </div>
        </motion.div>

        {/* Qolgan qarz */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs md:text-sm font-medium">Qolgan qarz</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg md:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatSom(stats.remainingDebt)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Shu oy bo'yicha to'lanmagan
          </p>
        </motion.div>

        {/* Qarzdorlar soni */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs md:text-sm font-medium">Qarzdorlar</span>
            <User className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg md:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.debtorsCount} ta
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            To'liq to'lamagan o'quvchilar
          </p>
        </motion.div>
      </div>

      {/* Visual Analytics Chart Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                  Daromad va qarz holati
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  Vizual diagramma
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {chartMode === 'monthly'
                  ? "Oxirgi 6 oy davomidagi tushum va qarzlar dinamikasi"
                  : `Guruhlar bo'yicha ${monthLabelUZ(selectedMonth)} ko'rsatkichlari`}
              </p>
            </div>
          </div>

          {/* Mode Selector & Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartMode('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chartMode === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Oylik dinamika
              </button>
              <button
                type="button"
                onClick={() => setChartMode('groups')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chartMode === 'groups'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Guruhlar kesimida
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsChartVisible(!isChartVisible)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isChartVisible ? "Diagrammani yashirish" : "Diagrammani ko'rsatish"}
            >
              {isChartVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Chart Content */}
        {isChartVisible && (
          <div>
            <div className="w-full h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={activeChartData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.15} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1', strokeOpacity: 0.3 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatYAxisValue}
                  />
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        const dataItem = payload[0]?.payload;
                        const fullName = dataItem?.monthName || dataItem?.name || label;
                        const foiz = dataItem?.foiz ?? 0;

                        return (
                          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 min-w-[210px]">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{fullName}</span>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                {foiz}% yig'ildi
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {payload.map((entry: any, index: number) => (
                                <div key={`tip-${index}`} className="flex items-center justify-between gap-4">
                                  <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                    {entry.name}:
                                  </span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {formatSom(entry.value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: 16, fontSize: 12, fontWeight: 600 }}
                  />
                  <Bar
                    name="Yig'ilgan daromad"
                    dataKey="daromad"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    name="Qarz holati"
                    dataKey="qarz"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Line
                    type="monotone"
                    name="Kutilgan reja"
                    dataKey="kutilgan"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Summary Badges */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                    Shu oy daromadi
                  </span>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {formatSom(stats.collectedTotal)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-rose-50/70 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200/50 dark:border-rose-800/30">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                    Shu oy qolgan qarz
                  </span>
                  <div className="text-sm font-bold text-rose-700 dark:text-rose-400">
                    {formatSom(stats.remainingDebt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-indigo-50/70 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-indigo-800 dark:text-indigo-300 font-medium">
                    Reja bajarilishi
                  </span>
                  <div className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                    {stats.percentage}% yig'ildi
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="O'quvchi ismi yoki telefoni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Only debtors toggle */}
          <button
            onClick={() => setOnlyDebtors(!onlyDebtors)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              onlyDebtors
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Faqat qarzdorlar
          </button>
        </div>

        {/* Excel Export Button */}
        <button
          onClick={handleExportExcel}
          disabled={displayRows.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs md:text-sm font-bold shadow-sm transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          Excel yuklab olish
        </button>
      </div>

      {/* Main Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {displayRows.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Hech qanday ma'lumot topilmadi
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Qidiruv yoki filtrlarni o'zgartirib ko'ring
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">O'quvchi</th>
                  <th className="py-3.5 px-4">Guruh</th>
                  <th className="py-3.5 px-4">Oylik to'lov</th>
                  <th className="py-3.5 px-4">Holati</th>
                  <th className="py-3.5 px-4">Jami hisob</th>
                  <th className="py-3.5 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {displayRows.map((row) => {
                  const discount = row.student.discounts?.[row.group.id] || 0;
                  const originalFee = row.group.monthlyFee || 0;
                  const rowKey = `${row.student.id}_${row.group.id}`;
                  const isNew = isNewStudentInMonth(row.student, row.group, selectedMonth) || !!manualNewStudentKeys[rowKey];
                  const hasCustomInitial = row.student.initialFees?.[row.group.id] !== undefined || (isNew && row.student.initialFee !== undefined);

                  return (
                    <tr
                      key={rowKey}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* O'quvchi info */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleOpenHistory(row.student, row.group)}
                          className="flex items-center gap-3 text-left group"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-100 dark:border-indigo-900/50 shrink-0 bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            {row.student.firstName ? `${row.student.firstName[0]}${row.student.lastName ? row.student.lastName[0] : ''}`.toUpperCase() : (row.student.username ? row.student.username[0].toUpperCase() : 'O')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                              {row.student.firstName} {row.student.lastName}
                              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-xs text-slate-400">
                              {row.student.phone || row.student.username}
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Guruh */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {row.group.name}
                        </span>
                      </td>

                      {/* Oylik to'lov */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatSom(row.monthlyDue)}
                            </span>
                            {isNew && hasCustomInitial && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                                1-oy to'lovi
                              </span>
                            )}
                          </div>
                          {discount > 0 && !hasCustomInitial && (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                              <span className="line-through text-slate-400">
                                {formatSom(originalFee)}
                              </span>
                              <span className="bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.2 rounded font-semibold">
                                -{formatSom(discount)} chegirma
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Holati */}
                      <td className="py-3.5 px-4">
                        {row.status === 'tolangan' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            To'langan
                          </span>
                        )}
                        {row.status === 'qisman' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                            <Clock className="w-3.5 h-3.5" />
                            Qisman
                          </span>
                        )}
                        {row.status === 'tolanmagan' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                            <AlertCircle className="w-3.5 h-3.5" />
                            To'lanmagan
                          </span>
                        )}
                        {row.status === 'tolov_belgilanmagan' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Belgilanmagan
                          </span>
                        )}
                      </td>

                      {/* Jami qarz */}
                      <td className="py-3.5 px-4">
                        {row.totalDebt > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {formatSom(row.totalDebt)} qarz
                          </span>
                        ) : row.totalDebt < 0 ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatSom(Math.abs(row.totalDebt))} haqdor
                          </span>
                        ) : (
                          <span className="font-medium text-slate-400">
                            Qarzsiz
                          </span>
                        )}
                      </td>

                      {/* To'lov qabul qilish tugmasi */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenPayment(row.student, row.group)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          To'lov
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* TO'LOV QABUL QILISH MODALI                                     */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isPaymentModalOpen && paymentTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    To'lov qabul qilish
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {paymentTarget.student.firstName} {paymentTarget.student.lastName} ({paymentTarget.group.name})
                  </p>
                </div>
              </div>

              <form onSubmit={handleSavePayment} className="space-y-4">
                {/* Oylar tanlovi (oldindan bir necha oyni tanlash imkoni) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Qaysi oy(lar) uchun to'lov
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      selectedMonth,
                      getNextMonth(selectedMonth),
                      getNextMonth(getNextMonth(selectedMonth)),
                    ].map((m) => {
                      const isSelected = payMonths.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (payMonths.length > 1) {
                                setPayMonths(payMonths.filter((x) => x !== m));
                              }
                            } else {
                              setPayMonths([...payMonths, m]);
                            }
                          }}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          {monthLabelUZ(m)}
                        </button>
                      );
                    })}
                  </div>
                  {payMonths.length > 1 && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                      {payMonths.length} ta oy tanlandi. Summa teng taqsimlanadi.
                    </p>
                  )}
                </div>

                {/* To'lov summasi */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    To'lov summasi (so'm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-base font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      placeholder="Masalan: 350000"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      UZS
                    </div>
                  </div>
                </div>

                {/* To'lov usuli */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    To'lov usuli
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPayMethod(pm.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          payMethod === pm.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sana */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    To'lov sanasi
                  </label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Izoh */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Izoh (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="Masalan: Kvitansiya raqami yoki eslatma"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Saqlanmoqda...' : 'To\'lovni qabul qilish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* O'QUVCHI TO'LOVLAR TARIXI VA CHEGIRMA MODALI                  */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isHistoryModalOpen && historyTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-indigo-100 dark:border-indigo-900/50 shrink-0 bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  {historyTarget.student.firstName ? `${historyTarget.student.firstName[0]}${historyTarget.student.lastName ? historyTarget.student.lastName[0] : ''}`.toUpperCase() : (historyTarget.student.username ? historyTarget.student.username[0].toUpperCase() : 'O')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {historyTarget.student.firstName} {historyTarget.student.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Guruh: <span className="font-semibold">{historyTarget.group.name}</span>
                  </p>
                </div>
              </div>

              {/* Chegirma belgilash bo'limi */}
              <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    Shu guruh bo'yicha oylik chegirma
                  </div>
                  <span className="text-xs text-slate-400">
                    Standart: {formatSom(historyTarget.group.monthlyFee)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Chegirma summasi (masalan: 50000)"
                      className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
                      so'm
                    </div>
                  </div>
                  <button
                    onClick={handleSaveDiscount}
                    disabled={isSavingDiscount}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                  >
                    {isSavingDiscount ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
                {discountAmount !== '' && Number(discountAmount) > 0 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
                    Yangi to'lov: {formatSom(Math.max(0, (historyTarget.group.monthlyFee || 0) - Number(discountAmount)))} / oy
                  </p>
                )}
              </div>

              {/* To'lovlar tarixi ro'yxati */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  To'lovlar tarixi ({studentPayments.length})
                </h4>
                <button
                  onClick={() => {
                    setIsHistoryModalOpen(false);
                    handleOpenPayment(historyTarget.student, historyTarget.group);
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Yangi to'lov
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {studentPayments.length === 0 ? (
                  <p className="text-center py-8 text-sm text-slate-400">
                    Hozircha to'lovlar kiritilmagan
                  </p>
                ) : (
                  studentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatSom(p.amount)}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                            {getPaymentMethodLabel(p.method)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <span>Oy: {monthLabelUZ(p.month)}</span>
                          <span>•</span>
                          <span>{p.paidAt ? formatDateUZ(p.paidAt) : '-'}</span>
                          {p.note && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-500">"{p.note}"</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePayment(p.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0"
                        title="To'lovni o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
