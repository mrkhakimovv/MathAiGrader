import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Receipt, 
  Calendar, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ArrowRightLeft, 
  Search, 
  RotateCw, 
  CheckCircle2, 
  FileText,
  Filter,
  Layers,
  ChevronDown
} from 'lucide-react';
import { collection, query, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Payment, PaymentMethod } from '../types';
import { formatSom, monthLabelUZ, getPaymentMethodLabel } from '../lib/finance';
import { formatDateUZ } from '../lib/utils';

export interface StudentPaymentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  fallbackPayments?: Payment[];
}

export function StudentPaymentListModal({
  isOpen,
  onClose,
  student,
  fallbackPayments = []
}: StudentPaymentListModalProps) {
  const [firestorePayments, setFirestorePayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Firestore real-time listener & fetch
  useEffect(() => {
    if (!isOpen || !student) return;

    setIsLoading(true);

    const q = query(collection(db, 'payments'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const studentId = student.id;
        const studentUsername = student.username?.toLowerCase();

        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Payment[];

        const filtered = docs
          .filter((p) => {
            const matchesId = studentId && p.studentId === studentId;
            const matchesUsername =
              studentUsername &&
              p.studentUsername &&
              p.studentUsername.toLowerCase() === studentUsername;
            return matchesId || matchesUsername;
          })
          .sort((a, b) => {
            const timeA =
              a.paidAt ||
              (a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0) ||
              0;
            const timeB =
              b.paidAt ||
              (b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0) ||
              0;
            return timeB - timeA;
          });

        setFirestorePayments(filtered);
        setIsLoading(false);
        setLastSyncedAt(new Date());
      },
      (error) => {
        console.error('Firestore payments fetch error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, student]);

  // Manual refresh handler
  const handleRefresh = async () => {
    if (!student) return;
    setIsLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'payments')));
      const studentId = student.id;
      const studentUsername = student.username?.toLowerCase();

      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Payment[];

      const filtered = docs
        .filter((p) => {
          const matchesId = studentId && p.studentId === studentId;
          const matchesUsername =
            studentUsername &&
            p.studentUsername &&
            p.studentUsername.toLowerCase() === studentUsername;
          return matchesId || matchesUsername;
        })
        .sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));

      setFirestorePayments(filtered);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Manual refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge Firestore data with fallback
  const activePayments = useMemo(() => {
    if (firestorePayments.length > 0) return firestorePayments;
    if (!student) return [];
    return fallbackPayments
      .filter((p) => {
        const matchesId = student.id && p.studentId === student.id;
        const matchesUsername =
          student.username &&
          p.studentUsername &&
          p.studentUsername.toLowerCase() === student.username.toLowerCase();
        return matchesId || matchesUsername;
      })
      .sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));
  }, [firestorePayments, fallbackPayments, student]);

  // Filtered payments by search and method
  const filteredPayments = useMemo(() => {
    return activePayments.filter((p) => {
      // Method filter
      if (selectedMethod !== 'all' && p.method !== selectedMethod) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const queryStr = searchQuery.toLowerCase();
        const groupMatch = p.groupName?.toLowerCase().includes(queryStr);
        const noteMatch = p.note?.toLowerCase().includes(queryStr);
        const monthMatch = p.month?.toLowerCase().includes(queryStr);
        const methodMatch = getPaymentMethodLabel(p.method).toLowerCase().includes(queryStr);
        const amountMatch = String(p.amount).includes(queryStr);
        if (!groupMatch && !noteMatch && !monthMatch && !methodMatch && !amountMatch) {
          return false;
        }
      }
      return true;
    });
  }, [activePayments, selectedMethod, searchQuery]);

  // Overall financial summary
  const summary = useMemo(() => {
    const total = activePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const count = activePayments.length;
    const avg = count > 0 ? Math.round(total / count) : 0;
    return { total, count, avg };
  }, [activePayments]);

  // Helper badge for payment method
  const renderMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'click':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
            <Smartphone className="w-3.5 h-3.5 text-sky-500" />
            Click
          </span>
        );
      case 'payme':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
            <CreditCard className="w-3.5 h-3.5 text-teal-500" />
            Payme
          </span>
        );
      case 'karta':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
            Plastik karta
          </span>
        );
      case 'otkazma':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
            Bank o'tkazmasi
          </span>
        );
      case 'naqd':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <Banknote className="w-3.5 h-3.5 text-emerald-500" />
            Naqd
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/60 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  To'lovlar tarixi
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {student?.firstName} {student?.lastName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firestore Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Firestore ma'lumotlar bazasidagi barcha rasmiylashtirilgan to'lovlar</span>
                {lastSyncedAt && (
                  <span className="text-[11px] text-slate-400">
                    &bull; So'nggi yangilanish: {lastSyncedAt.toLocaleTimeString('uz-UZ')}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Qayta yuklash"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Banner */}
        <div className="px-5 sm:px-6 py-4 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Jami to'langan summa
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {formatSom(summary.total)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                To'lovlar soni
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {summary.count} ta tranzaksiya
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                O'rtacha to'lov
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {formatSom(summary.avg)}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 flex-wrap">
          {/* Method Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            <button
              onClick={() => setSelectedMethod('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedMethod === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Barchasi ({activePayments.length})
            </button>
            <button
              onClick={() => setSelectedMethod('naqd')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedMethod === 'naqd'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Naqd
            </button>
            <button
              onClick={() => setSelectedMethod('click')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedMethod === 'click'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Click
            </button>
            <button
              onClick={() => setSelectedMethod('payme')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedMethod === 'payme'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Payme
            </button>
            <button
              onClick={() => setSelectedMethod('karta')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedMethod === 'karta'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Karta
            </button>
            <button
              onClick={() => setSelectedMethod('otkazma')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedMethod === 'otkazma'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              O'tkazma
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish (izoh, summa, oy)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Payments List (Tartibli ro'yxat) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40">
          {isLoading && activePayments.length === 0 ? (
            <div className="py-16 text-center">
              <RotateCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Firestore'dan to'lovlar yuklanmoqda...
              </p>
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="space-y-3">
              {/* Desktop table-like header */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <div className="col-span-1">№</div>
                <div className="col-span-3">To'lov sanasi</div>
                <div className="col-span-3">To'lov summasi</div>
                <div className="col-span-2">To'lov usuli</div>
                <div className="col-span-3">Oy &amp; Guruh / Izoh</div>
              </div>

              {/* Items List */}
              {filteredPayments.map((payment, index) => {
                const dateMs =
                  payment.paidAt ||
                  (payment.createdAt?.toMillis
                    ? payment.createdAt.toMillis()
                    : payment.createdAt?.seconds
                    ? payment.createdAt.seconds * 1000
                    : null);
                const dateDisplay = dateMs ? formatDateUZ(dateMs, true) : "Sana ko'rsatilmagan";
                const monthDisplay = payment.month ? monthLabelUZ(payment.month) : null;

                return (
                  <div
                    key={payment.id || `pay-${index}`}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all flex flex-col md:grid md:grid-cols-12 md:items-center gap-3"
                  >
                    {/* Index */}
                    <div className="col-span-1 hidden md:flex items-center">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-3 flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black flex items-center justify-center md:hidden shrink-0">
                        {index + 1}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          {dateDisplay}
                        </div>
                        {monthDisplay && (
                          <div className="text-[11px] text-slate-400 font-medium">
                            Davr: {monthDisplay}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-span-3 flex items-center justify-between md:justify-start">
                      <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        +{formatSom(payment.amount)}
                      </div>
                    </div>

                    {/* Method */}
                    <div className="col-span-2">
                      {renderMethodBadge(payment.method)}
                    </div>

                    {/* Group & Note */}
                    <div className="col-span-3 text-xs">
                      {payment.groupName && (
                        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{payment.groupName}</span>
                        </div>
                      )}
                      {payment.note ? (
                        <div className="italic text-slate-500 dark:text-slate-400 mt-0.5 truncate" title={payment.note}>
                          "{payment.note}"
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[11px]">Izoh qoldirilmagan</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                {searchQuery || selectedMethod !== 'all'
                  ? "Tanlangan filtrlar bo'yicha to'lovlar topilmadi"
                  : "To'lovlar tarixi mavjud emas"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery || selectedMethod !== 'all'
                  ? "Qidiruv so'zini yoki to'lov usulini o'zgartirib ko'ring."
                  : "Ushbu o'quvchi uchun Firestore bazasida hali hech qanday to'lov yozuvi kiritilmagan."}
              </p>
              {(searchQuery || selectedMethod !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedMethod('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Jami ro'yxat:</span>
            <strong className="text-slate-800 dark:text-slate-200 font-bold">
              {filteredPayments.length} ta to'lov
            </strong>
            {filteredPayments.length !== activePayments.length && (
              <span className="text-slate-400">({activePayments.length} tadan saralandi)</span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
