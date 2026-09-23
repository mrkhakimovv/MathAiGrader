import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  CreditCard, 
  Receipt, 
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { Payment } from '../types';
import { 
  formatSom, 
  monthLabelUZ, 
  monthKey, 
  getStudentJoinMonth, 
  getStudentGroups, 
  getMonthlyDue, 
  getPaymentMethodLabel 
} from '../lib/finance';
import { formatDateUZ } from '../lib/utils';

interface StudentPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  groupDetails: any[];
  payments: Payment[];
}

export function StudentPaymentHistoryModal({
  isOpen,
  onClose,
  student,
  groupDetails,
  payments
}: StudentPaymentHistoryModalProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

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

  // Current month key
  const currentMonthKey = useMemo(() => monthKey(new Date()), []);

  // Student joined month key
  const joinMonthKey = useMemo(() => {
    return getStudentJoinMonth(student);
  }, [student]);

  // Formatted join date string
  const joinDateDisplay = useMemo(() => {
    if (!student) return '';
    if (student.createdAt?.seconds) {
      return formatDateUZ(new Date(student.createdAt.seconds * 1000));
    }
    if (student.createdAt?.toDate) {
      return formatDateUZ(student.createdAt.toDate());
    }
    if (typeof student.createdAt === 'string' || typeof student.createdAt === 'number') {
      const d = new Date(student.createdAt);
      if (!isNaN(d.getTime())) return formatDateUZ(d);
    }
    return monthLabelUZ(joinMonthKey);
  }, [student, joinMonthKey]);

  // Student's enrolled groups
  const myGroups = useMemo(() => {
    return getStudentGroups(student, groupDetails);
  }, [student, groupDetails]);

  // All student payments
  const studentPayments = useMemo(() => {
    if (!student) return [];
    return (payments || []).filter(
      (p) =>
        p.studentId === student.id ||
        (student.username && p.studentUsername?.toLowerCase() === student.username.toLowerCase())
    );
  }, [payments, student]);

  // Generate list of all months from joinMonthKey to currentMonthKey in reverse chronological order
  const monthlyHistory = useMemo(() => {
    if (!student) return [];

    const [startYear, startMonth] = (joinMonthKey && joinMonthKey.includes('-') ? joinMonthKey : currentMonthKey)
      .split('-')
      .map(Number);
    const [curYear, curMonth] = currentMonthKey.split('-').map(Number);

    const result = [];
    let y = curYear;
    let m = curMonth;

    // Loop backward from current month to join month
    while (y > startYear || (y === startYear && m >= startMonth)) {
      const mKey = `${y}-${String(m).padStart(2, '0')}`;
      const mLabel = monthLabelUZ(mKey);
      const isCurrentMonth = mKey === currentMonthKey;

      // Calculate dues for this month across all groups
      let monthDue = 0;
      myGroups.forEach((g) => {
        monthDue += getMonthlyDue(student, g, mKey);
      });

      // Transactions made for this month
      const transactions = studentPayments
        .filter((p) => p.month === mKey)
        .sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));

      const monthPaid = transactions.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Determine month status
      let status: 'tolangan' | 'qisman' | 'tolanmagan' | 'bepul';
      if (monthDue === 0 && monthPaid > 0) {
        status = 'tolangan';
      } else if (monthDue === 0 && monthPaid === 0) {
        status = 'bepul';
      } else if (monthPaid >= monthDue) {
        status = 'tolangan';
      } else if (monthPaid > 0) {
        status = 'qisman';
      } else {
        status = 'tolanmagan';
      }

      const debt = Math.max(0, monthDue - monthPaid);

      result.push({
        monthKey: mKey,
        monthLabel: mLabel,
        isCurrentMonth,
        due: monthDue,
        paid: monthPaid,
        debt,
        status,
        transactions,
      });

      m--;
      if (m < 1) {
        m = 12;
        y--;
      }
    }

    return result;
  }, [student, joinMonthKey, currentMonthKey, myGroups, studentPayments]);

  // Filtered list
  const filteredMonths = useMemo(() => {
    if (filterStatus === 'all') return monthlyHistory;
    if (filterStatus === 'unpaid') {
      return monthlyHistory.filter((m) => m.status === 'tolanmagan' || m.status === 'qisman');
    }
    if (filterStatus === 'paid') {
      return monthlyHistory.filter((m) => m.status === 'tolangan');
    }
    return monthlyHistory;
  }, [monthlyHistory, filterStatus]);

  const toggleMonth = (mKey: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [mKey]: !prev[mKey],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  To'lovlar tarixi
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  {student?.firstName} {student?.lastName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Dasturdan ro'yxatdan o'tgan:</span>
                <strong className="text-slate-700 dark:text-slate-300 font-semibold">{joinDateDisplay}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Oylar ro'yxati:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Barchasi ({monthlyHistory.length})
              </button>
              <button
                onClick={() => setFilterStatus('unpaid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === 'unpaid'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Qarzdor oylar ({monthlyHistory.filter((m) => m.status === 'tolanmagan' || m.status === 'qisman').length})
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === 'paid'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                To'langanlar ({monthlyHistory.filter((m) => m.status === 'tolangan').length})
              </button>
            </div>
          </div>

        {/* Scrollable Monthly Breakdown List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredMonths.length > 0 ? (
            filteredMonths.map((item) => {
              const isExpanded = expandedMonths[item.monthKey] ?? (item.isCurrentMonth || item.transactions.length > 0);

              return (
                <div 
                  key={item.monthKey} 
                  className={`pt-3 first:pt-0 rounded-2xl transition-all ${
                    item.isCurrentMonth ? 'bg-indigo-50/40 dark:bg-indigo-950/20 p-3 sm:p-4 border border-indigo-200/60 dark:border-indigo-800/40' : ''
                  }`}
                >
                  {/* Month Row Header */}
                  <div 
                    onClick={() => toggleMonth(item.monthKey)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.status === 'tolangan'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : item.status === 'qisman'
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                          : item.status === 'bepul'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                            {item.monthLabel}
                          </h3>
                          {item.isCurrentMonth && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-2xs">
                              Joriy oy
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Kutilgan: <strong>{formatSom(item.due)}</strong></span>
                          <span>&bull;</span>
                          <span>To'langan: <strong className={item.paid > 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>{formatSom(item.paid)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs ${
                        item.status === 'tolangan'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          : item.status === 'qisman'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                          : item.status === 'bepul'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                      }`}>
                        {item.status === 'tolangan' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {item.status === 'qisman' && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                        {item.status === 'tolanmagan' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        <span>
                          {item.status === 'tolangan'
                            ? "To'langan"
                            : item.status === 'qisman'
                            ? `Qisman (${formatSom(item.debt)} qarz)`
                            : item.status === 'bepul'
                            ? "To'lov belgilanmagan"
                            : "To'lanmagan"}
                        </span>
                      </span>

                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Transactions for this Month */}
                  {isExpanded && (
                    <div className="mt-3 pl-0 sm:pl-13 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.transactions.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            Amalga oshirilgan to'lovlar ({item.transactions.length} ta)
                          </span>
                          <div className="space-y-1.5">
                            {item.transactions.map((tx, idx) => (
                              <div
                                key={tx.id || idx}
                                className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <CreditCard className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                                      {formatSom(tx.amount)}
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                                      <span>{formatDateUZ(tx.paidAt || tx.createdAt, true)}</span>
                                      {tx.groupName && (
                                        <>
                                          <span>&bull;</span>
                                          <span className="font-medium">{tx.groupName}</span>
                                        </>
                                      )}
                                      {tx.note && (
                                        <>
                                          <span>&bull;</span>
                                          <span className="italic text-slate-400">"{tx.note}"</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0 text-right">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                    {getPaymentMethodLabel(tx.method)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>Ushbu oy uchun to'lov kiritilmagan.</span>
                          {item.due > 0 && (
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              Qarz: {formatSom(item.due)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              Tanlangan holat bo'yicha oylar topilmadi.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Jami oylar tarixi: <strong className="text-slate-800 dark:text-slate-200">{monthlyHistory.length} ta oy</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
