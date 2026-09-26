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

// ==========================================
// MILLIY SERTIFIKAT TIPLARI
// ==========================================

export interface CertSubAnswer {
  label: 'a' | 'b';
  correctAnswerText: string;
}

export interface CertQuestion {
  id: string;
  text: string; // LaTeX ('full' rejimda)
  imageUrl?: string;
  options: string[];
  correctOptionIndex: number; // -1 = belgilanmagan
  isOpenEnded?: boolean;
  subAnswers?: [CertSubAnswer, CertSubAnswer];
}

export interface CertTest {
  id: string;
  teacherUsername: string;
  title: string;
  mode: 'full' | 'fast' | 'special';
  questions: CertQuestion[]; // 45 ta savol
  isEnded?: boolean;
  isClosed?: boolean;
  status?: 'active' | 'completed';
  endedAt?: string | null;
  createdAt: string; // ISO
}

export interface CertExam {
  id: string;
  teacherUsername: string;
  testId: string;
  title: string;
  subject: string;
  groupIds: string[];
  groupNames: string[];
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  duration: number; // daqiqa
  status: 'active' | 'ended';
  finalizedAt?: string;
  raschReport?: any; // RaschReport
  syntheticEnabled: boolean;
  syntheticCount: number;
  allowedRetakes?: string[]; // studentId lar
  createdAt: string;
}

export interface CertResult {
  id?: string;
  examId: string;
  testId: string;
  teacherUsername: string;
  studentId: string;
  studentUsername: string;
  studentName: string;
  score: number; // to'g'ri birliklar soni
  total: number; // 55
  raschItems: number[]; // 55 ta birlik (0/1)
  answers: Record<string, any>;
  timeSpent: number; // soniya
  attempts: number;
  submittedAt: string; // ISO
}

export interface CertSpecialBrowserInfo {
  browser: string;
  os: string;
  deviceType: string;
  userAgent: string;
  language: string;
  screen: string;
  viewport: string;
  referrer: string;
}

export interface CertSpecialResult {
  id?: string;
  testId: string;
  teacherUsername: string;
  testTitle: string;
  studentName: string;
  score: number;
  total: number;
  ball: number;
  grade: string;
  theta: number;
  percentile: number;
  rank: number;
  items: number[];
  answers: Record<string, any>;
  platform: 'web';
  browserInfo: CertSpecialBrowserInfo;
  submittedAt: string; // ISO
}

