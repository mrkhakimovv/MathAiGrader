import { Payment, PaymentMethod, AttendanceStatus, Group, Student } from '../types';

/**
 * Raqamni "450 000 so'm" ko'rinishida formatlash
 */
export function formatSom(n: number | string | undefined | null): string {
  if (n === undefined || n === null || n === '') return "0 so'm";
  const num = typeof n === 'number' ? n : Number(n);
  if (isNaN(num)) return "0 so'm";
  
  const isNegative = num < 0;
  const absVal = Math.abs(Math.round(num));
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${isNegative ? '-' : ''}${formatted} so'm`;
}

/**
 * Sanadan "YYYY-MM" kalitini olish
 */
export function monthKey(date?: Date | number | string): string {
  let d: Date;
  if (!date) {
    d = new Date();
  } else if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'number') {
    d = new Date(date);
  } else {
    // string, could be "YYYY-MM" or "YYYY-MM-DD"
    if (/^\d{4}-\d{2}$/.test(date)) return date;
    d = new Date(date);
    if (isNaN(d.getTime())) d = new Date();
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

/**
 * "2026-09" -> "Sentyabr 2026"
 */
export function monthLabelUZ(key: string): string {
  if (!key || !key.includes('-')) return key || '';
  const [yearStr, monthStr] = key.split('-');
  const mIndex = parseInt(monthStr, 10) - 1;
  const monthName = UZ_MONTHS[mIndex] || monthStr;
  return `${monthName} ${yearStr}`;
}

/**
 * Oldingi oy kalitini olish ("2026-09" -> "2026-08")
 */
export function getPreviousMonth(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 2, 1);
  return monthKey(d);
}

/**
 * Keyingi oy kalitini olish ("2026-09" -> "2026-10")
 */
export function getNextMonth(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month, 1);
  return monthKey(d);
}

/**
 * O'quvchi a'zo bo'lgan guruh obyektlari ro'yxatini qaytaradi
 */
export function getStudentGroups(student: any, groupDetails: any[]): any[] {
  if (!student || !Array.isArray(groupDetails)) return [];
  return groupDetails.filter(
    (g) => student.group === g.name || (student.groups && student.groups.includes(g.name))
  );
}

/**
 * O'quvchi dasturga yoki guruhga qaysi oyda qo'shilganini aniqlash ("YYYY-MM")
 */
export function getStudentJoinMonth(student: any): string {
  if (!student) return monthKey(new Date());
  if (student.joinMonth && /^\d{4}-\d{2}$/.test(student.joinMonth)) {
    return student.joinMonth;
  }
  let startMs = Date.now();
  if (student?.createdAt?.seconds) {
    startMs = student.createdAt.seconds * 1000;
  } else if (student?.createdAt?.toDate) {
    startMs = student.createdAt.toDate().getTime();
  } else if (typeof student?.createdAt === 'number') {
    startMs = student.createdAt;
  } else if (typeof student?.createdAt === 'string') {
    const parsed = new Date(student.createdAt).getTime();
    if (!isNaN(parsed)) startMs = parsed;
  }
  return monthKey(new Date(startMs));
}

/**
 * Ushbu o'quvchi ko'rsatilgan oyda yangi qo'shilgan o'quvchi hisoblanadimi?
 */
export function isNewStudentInMonth(student: any, group: any, month: string): boolean {
  if (!student) return false;
  const groupId = typeof group === 'string' ? group : group?.id;

  // Agar guruh bo'yicha maxsus dastlabki oy belgilangan bo'lsa
  if (groupId && student.initialFeeMonths?.[groupId]) {
    return student.initialFeeMonths[groupId] === month;
  }

  // Agar umumiy initialFeeMonth belgilangan bo'lsa
  if (student.initialFeeMonth) {
    return student.initialFeeMonth === month;
  }

  // Agar o'quvchining dastlabki to'lovi kiritilgan bo'lsa va uning joinMonth shu oyga teng bo'lsa
  const jm = student.joinMonth || getStudentJoinMonth(student);
  return jm === month;
}

/**
 * O'quvchining shu guruhdagi oylik to'lovi:
 * - Dasturga yangi qo'shilgan o'quvchi uchun (qo'shilgan oyida) kiritilgan maxsus summa;
 * - Keyingi oylardan boshlab biriktirilgan guruh summasi hisoblanadi.
 */
export function getMonthlyDue(student: any, group: any, month?: string): number {
  if (!group || !group.monthlyFee) return 0;
  const targetMonth = month || monthKey(new Date());

  const base = Number(group.monthlyFee) || 0;
  const discount = Number(student?.discounts?.[group.id]) || 0;
  const standardDue = Math.max(0, base - discount);

  if (!student) return standardDue;

  // Guruh IDsi
  const gId = group.id;

  // Ushbu oyda o'quvchi yangi qo'shilganmi va dastlabki oy to'lovi kiritilganmi?
  const isNew = isNewStudentInMonth(student, group, targetMonth);
  const specificInitial = student.initialFees?.[gId];
  const generalInitial = student.initialFee;

  // Agar yangi o'quvchi bo'lsa va ushbu qismga summa kiritilgan bo'lsa:
  if (isNew) {
    if (specificInitial !== undefined && specificInitial !== null && specificInitial !== '') {
      const num = Number(specificInitial);
      if (!isNaN(num) && num >= 0) return num;
    }
    if (generalInitial !== undefined && generalInitial !== null && generalInitial !== '') {
      const num = Number(generalInitial);
      if (!isNaN(num) && num >= 0) return num;
    }
  }

  // Keyingi oylardan boshlab biriktirilgan guruh summasi (chegirma bilan) hisoblanadi
  return standardDue;
}

/**
 * Muayyan oy uchun shu guruh bo'yicha to'langan summa
 */
export function getPaidForMonth(
  payments: Payment[],
  studentId: string,
  groupId: string,
  month: string
): number {
  if (!Array.isArray(payments)) return 0;
  return payments
    .filter(
      (p) =>
        p.studentId === studentId &&
        p.groupId === groupId &&
        p.month === month
    )
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export type MonthStatus = 'tolangan' | 'qisman' | 'tolanmagan' | 'tolov_belgilanmagan';

/**
 * O'quvchining shu oy bo'yicha to'lov holati
 */
export function getMonthStatus(
  student: any,
  group: any,
  payments: Payment[],
  month: string
): MonthStatus {
  if (!group?.monthlyFee || group.monthlyFee <= 0) {
    return 'tolov_belgilanmagan';
  }
  const due = getMonthlyDue(student, group, month);
  if (due === 0) {
    return 'tolangan';
  }
  const paid = getPaidForMonth(payments, student.id, group.id, month);
  if (paid >= due) {
    return 'tolangan';
  }
  if (paid > 0) {
    return 'qisman';
  }
  return 'tolanmagan';
}

/**
 * O'quvchining umumiy qarzdorligi (yoki haqdorligi):
 * O'quvchi qo'shilgan oydan joriy oygacha har bir oy uchun hisoblangan to'lovlar yig'indisi
 * minus shu guruh bo'yicha jami barcha to'lovlar.
 * Ijobiy: qarz, Manfiy: oldindan to'lov (haqdorlik).
 */
export function getTotalDebt(
  student: any,
  group: any,
  payments: Payment[],
  currentMonthKey?: string
): number {
  if (!group || !group.monthlyFee || group.monthlyFee <= 0) return 0;

  const current = currentMonthKey || monthKey(new Date());
  const [curY, curM] = current.split('-').map(Number);

  // O'quvchi qo'shilgan oyi
  const joinM = student?.joinMonth || getStudentJoinMonth(student);
  const [sY, sM] = (joinM && joinM.includes('-') ? joinM : current).split('-').map(Number);

  let startY = sY;
  let startM = sM;

  // Agar start kelajakda bo'lsa
  if (startY > curY || (startY === curY && startM > curM)) {
    startY = curY;
    startM = curM;
  }

  // Har bir oy uchun alohida kutilgan to'lovni yig'ish (1-oy uchun dastlabki to'lov, keyingi oylarda guruh to'lovi)
  let totalExpected = 0;
  let y = startY;
  let m = startM;

  while (y < curY || (y === curY && m <= curM)) {
    const iterMonthKey = `${y}-${String(m).padStart(2, '0')}`;
    totalExpected += getMonthlyDue(student, group, iterMonthKey);

    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  // Barcha to'lovlar (shu guruh bo'yicha)
  const totalPaid = (payments || [])
    .filter((p) => p.studentId === student.id && p.groupId === group.id)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return totalExpected - totalPaid;
}

/**
 * Kun kodlari xaritasi:
 * Yak=0, Dush=1, Sesh=2, Chor=3, Pay=4, Juma=5, Shan=6
 */
export function parseGroupDays(daysStr?: string): number[] {
  if (!daysStr || typeof daysStr !== 'string') return [];
  const normalized = daysStr.toLowerCase().trim();
  if (!normalized) return [];

  // Maxsus iboralar (presets)
  if (normalized.includes('toq')) {
    // Dushanba, Chorshanba, Juma
    return [1, 3, 5];
  }
  if (normalized.includes('juft')) {
    // Seshanba, Payshanba, Shanba
    return [2, 4, 6];
  }
  if (normalized.includes('har kun') || normalized.includes('harkun') || normalized.includes('har kuni')) {
    // Dushanbadan Shanbagacha
    return [1, 2, 3, 4, 5, 6];
  }
  if (normalized.includes('dam olish')) {
    // Shanba, Yakshanba
    return [6, 0];
  }

  const res = new Set<number>();

  // Tokenlar bo'yicha ajratish (har qanday tinish belgilari yoki bo'sh joy)
  const tokens = normalized
    .split(/[^a-z0-9а-яёўқғҳ]+/i)
    .map(t => t.trim())
    .filter(Boolean);

  for (const token of tokens) {
    // Dushanba (1)
    if (token.startsWith('dush') || token === 'du' || token.startsWith('mon')) {
      res.add(1);
    }
    // Seshanba (2)
    else if (token.startsWith('sesh') || token === 'se' || token.startsWith('tue')) {
      res.add(2);
    }
    // Chorshanba (3)
    else if (token.startsWith('chor') || token === 'ch' || token === 'cho' || token.startsWith('wed')) {
      res.add(3);
    }
    // Payshanba (4)
    else if (token.startsWith('pay') || token === 'pa' || token.startsWith('thu')) {
      res.add(4);
    }
    // Juma (5)
    else if (token.startsWith('jum') || token === 'ju' || token.startsWith('fri')) {
      res.add(5);
    }
    // Shanba (6) - muhim: 'dush' yoki 'chorshanba' kabi so'zlardagi 'sh' bilan adashtirmaslik
    else if (token.startsWith('shan') || token === 'sh' || token.startsWith('sat')) {
      res.add(6);
    }
    // Yakshanba (0)
    else if (token.startsWith('yak') || token === 'ya' || token.startsWith('sun')) {
      res.add(0);
    }
  }

  // Tartiblab qaytarish: 1, 2, 3, 4, 5, 6, 0
  return Array.from(res).sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
}

/**
 * Haftaning qisqa nomi: Du, Se, Ch, Pa, Ju, Sh, Ya
 */
export function getWeekdayShortName(dateOrDay: Date | string | number): string {
  let dayNum: number;
  if (typeof dateOrDay === 'number') {
    dayNum = dateOrDay;
  } else if (typeof dateOrDay === 'string') {
    const parts = dateOrDay.split('-').map(Number);
    if (parts.length === 3) {
      dayNum = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    } else {
      dayNum = new Date(dateOrDay).getDay();
    }
  } else {
    dayNum = dateOrDay.getDay();
  }
  const map = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
  return map[dayNum] ?? '';
}

/**
 * Haftaning to'liq nomi: Dushanba, Seshanba, ...
 */
export function getWeekdayFullName(dateOrDay: Date | string | number): string {
  let dayNum: number;
  if (typeof dateOrDay === 'number') {
    dayNum = dateOrDay;
  } else if (typeof dateOrDay === 'string') {
    const parts = dateOrDay.split('-').map(Number);
    if (parts.length === 3) {
      dayNum = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    } else {
      dayNum = new Date(dateOrDay).getDay();
    }
  } else {
    dayNum = dateOrDay.getDay();
  }
  const map = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  return map[dayNum] ?? '';
}

/**
 * Guruh `days` bo'yicha berilgan oydagi barcha dars kunlari ("YYYY-MM-DD")
 */
export function groupLessonDates(group: any, month: string): string[] {
  if (!group?.days || !month || !month.includes('-')) return [];
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(m)) return [];

  const allowedDays = parseGroupDays(group.days);
  if (allowedDays.length === 0) return [];

  const daysInMonth = new Date(year, m, 0).getDate();
  const dates: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, m - 1, day);
    if (allowedDays.includes(d.getDay())) {
      const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(dateStr);
    }
  }

  return dates;
}

/**
 * Berilgan sana guruh dars kuni ekanligini tekshirish
 */
export function isLessonDay(group: any, date: Date | string): boolean {
  if (!group?.days) return false;
  let d: Date;
  if (typeof date === 'string') {
    const parts = date.split('-').map(Number);
    if (parts.length === 3) {
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }
  if (isNaN(d.getTime())) return false;
  const allowed = parseGroupDays(group.days);
  return allowed.includes(d.getDay());
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'naqd', label: 'Naqd' },
  { id: 'karta', label: 'Plastik karta' },
  { id: 'click', label: 'Click' },
  { id: 'payme', label: 'Payme' },
  { id: 'otkazma', label: "Bank o'tkazmasi" },
];

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const found = PAYMENT_METHODS.find((m) => m.id === method);
  return found ? found.label : method;
}
