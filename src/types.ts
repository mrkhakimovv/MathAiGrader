export interface GradingResult {
  id?: string;
  transcription: string;
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  score: number;
  feedback: string;
  errorSteps: string[];
  createdAt?: any;
  studentUsername?: string;
  taskId?: string;
  inputTokens?: number;
  outputTokens?: number;
  thinkingTokens?: number;
  cachedTokens?: number;
  totalTokens?: number;
}

export type PaymentMethod = 'naqd' | 'karta' | 'click' | 'payme' | 'otkazma';

export interface Payment {
  id?: string;
  teacherUsername: string;
  studentId: string;
  studentUsername?: string;
  studentName?: string;
  groupId: string;
  groupName?: string; // faqat ko'rsatish uchun nusxa
  month: string; // "YYYY-MM" (qaysi oy uchun)
  amount: number; // so'm
  method: PaymentMethod;
  note?: string;
  paidAt: number; // ms
  createdAt?: any;
}

export type AttendanceStatus = 'keldi' | 'kelmadi' | 'kechikdi' | 'sababli';

export interface AttendanceRecord {
  id?: string;
  teacherUsername: string;
  groupId: string;
  groupName?: string;
  date: string; // "YYYY-MM-DD"
  records: { [studentId: string]: AttendanceStatus };
  updatedAt: number;
}

export interface Group {
  id: string;
  name: string;
  days: string;
  time: string;
  teacherUsername?: string;
  monthlyFee?: number;
}

export interface Student {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  group?: string;
  groups?: string[];
  phone?: string;
  avatar?: string;
  teacherUsername?: string;
  discounts?: { [groupId: string]: number };
  initialFee?: number;
  initialFees?: { [groupId: string]: number };
  initialFeeMonth?: string;
  initialFeeMonths?: { [groupId: string]: string };
  joinMonth?: string;
  createdAt?: any;
}
