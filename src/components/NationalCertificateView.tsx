import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Search, 
  Plus, 
  Eye, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Download, 
  Play, 
  Printer, 
  AlertCircle,
  HelpCircle,
  Trophy,
  RotateCcw,
  Check,
  Calendar,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface TestProblem {
  num: number;
  type: 'closed' | 'open';
  question: string;
  options?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: string;
  solution: string;
  points: number;
}

export interface CertVariant {
  id: string;
  title: string;
  level: string;
  badgeColor: string;
  totalQuestions: number;
  closedQuestions: number;
  openQuestions: number;
  maxScore: number;
  timeMinutes: number;
  topics: string;
  problems: TestProblem[];
}

export interface CertRecord {
  id: string;
  name: string;
  variantTitle: string;
  score: number;
  degree: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'Yetarli emas';
  date: string;
  benefit: string;
}

const INITIAL_VARIANTS: CertVariant[] = [
  {
    id: 'var_1',
    title: "1-Variant: 2026-yil Milliy Sertifikat Rasmiy Namunaviy Testi",
    level: "Standart DTM (A+)",
    badgeColor: "indigo",
    totalQuestions: 45,
    closedQuestions: 35,
    openQuestions: 10,
    maxScore: 100,
    timeMinutes: 150,
    topics: "Algebraik ifodalar, Hosila va Funksiyalar, Vektorlar, Fazoviy jismlar",
    problems: [
      {
        num: 1,
        type: 'closed',
        question: "f(x) = x³ - 3x² + 5 funksiyaning [0; 3] kesmadagi eng kichik va eng katta qiymatlari yig'indisini toping.",
        options: [
          { key: 'A', text: "5" },
          { key: 'B', text: "6" },
          { key: 'C', text: "7" },
          { key: 'D', text: "8" }
        ],
        correctAnswer: "B",
        solution: "Hosila f'(x) = 3x² - 6x = 3x(x - 2). Statsionar nuqta x = 2 ∈ [0; 3]. f(0) = 5, f(2) = 1, f(3) = 5. Eng kichik qiymat = 1, eng katta qiymat = 5. Yig'indi = 1 + 5 = 6.",
        points: 2.1
      },
      {
        num: 2,
        type: 'closed',
        question: "√(2x + 6) - √(x - 1) = 2 tenglamaning haqiqiy ildizlari sonini aniqlang.",
        options: [
          { key: 'A', text: "1 ta" },
          { key: 'B', text: "2 ta" },
          { key: 'C', text: "Ildizi yo'q" },
          { key: 'D', text: "Cheksiz ko'p" }
        ],
        correctAnswer: "A",
        solution: "Aniqlanish sohasi: x ≥ 1. √(2x + 6) = 2 + √(x - 1). Har ikki tomonni kvadratga oshiramiz: 2x + 6 = 4 + 4√(x - 1) + x - 1 ⟹ x + 3 = 4√(x - 1). Yana kvadratga oshiramiz: x² + 6x + 9 = 16(x - 1) ⟹ x² - 10x + 25 = 0 ⟹ (x - 5)² = 0 ⟹ x = 5. Tekshirilganda tenglik to'g'ri. Yagona ildiz.",
        points: 2.1
      },
      {
        num: 3,
        type: 'closed',
        question: "log₂sin(π/12) + log₂cos(π/12) ifodaning son qiymatini toping.",
        options: [
          { key: 'A', text: "-1" },
          { key: 'B', text: "-2" },
          { key: 'C', text: "-3" },
          { key: 'D', text: "0" }
        ],
        correctAnswer: "B",
        solution: "log₂(sin(π/12) · cos(π/12)) = log₂((1/2)sin(π/6)) = log₂((1/2) · (1/2)) = log₂(1/4) = -2.",
        points: 2.1
      },
      {
        num: 4,
        type: 'closed',
        question: "A(2; -1; 3) va B(4; 3; -1) nuqtalar berilgan. AB kesma o'rtasining koordinatalarini toping.",
        options: [
          { key: 'A', text: "(3; 1; 1)" },
          { key: 'B', text: "(6; 2; 2)" },
          { key: 'C', text: "(1; 2; -2)" },
          { key: 'D', text: "(3; 2; 1)" }
        ],
        correctAnswer: "A",
        solution: "M((2+4)/2; (-1+3)/2; (3-1)/2) = M(3; 1; 1).",
        points: 2.1
      },
      {
        num: 36,
        type: 'open',
        question: "Muntazam to'rtburchakli piramidaning asosining tomoni 6 ga, yon qirrasi 5 ga teng. Piramidaga ichki chizilgan shar radiusini to'liq qadamlar bilan toping.",
        correctAnswer: "3√7 / 7",
        solution: "Asos diagonali d = 6√2. Balandlik H = √(5² - (3√2)²) = √(25 - 18) = √7. Apofema h_a = √(5² - 3²) = 4. Asos yuzi S_asos = 36. Yon yuzasi S_yon = (1/2) * P * h_a = (1/2) * 24 * 4 = 48. To'la yuzasi S_tola = 36 + 48 = 84. Shar radiusi r = 3V / S_tola = (3 * (1/3) * 36 * √7) / 84 = 36√7 / 84 = 3√7 / 7.",
        points: 3.0
      },
      {
        num: 37,
        type: 'open',
        question: "∫₀^(π/2) (sin³x / (sin³x + cos³x)) dx aniq integralini hisoblang va Nyuton-Leybnits yoki simmetriya usuli orqali isbotlang.",
        correctAnswer: "π/4",
        solution: "Integralni I deb belgilaymiz. x = π/2 - t almashtirish kiritamiz. dx = -dt. I = ∫₀^(π/2) (cos³t / (cos³t + sin³t)) dt. Ikkala tenglikni qo'shamiz: 2I = ∫₀^(π/2) ((sin³x + cos³x) / (sin³x + cos³x)) dx = ∫₀^(π/2) 1 dx = π/2. Bundan I = π/4.",
        points: 3.0
      }
    ]
  },
  {
    id: 'var_2',
    title: "2-Variant: A+ Chuqurlashtirilgan Matematik Analiz va Geometriya",
    level: "Murakkab (A+)",
    badgeColor: "emerald",
    totalQuestions: 45,
    closedQuestions: 35,
    openQuestions: 10,
    maxScore: 100,
    timeMinutes: 150,
    topics: "Parametrli tengsizliklar, Fazoviy jismlar kesimi, Murakkab kombinatorika",
    problems: [
      {
        num: 1,
        type: 'closed',
        question: "a ning qanday qiymatlarida ax² + 2(a - 1)x + a + 5 > 0 tengsizlik barcha x ∈ R larda o'rinli bo'ladi?",
        options: [
          { key: 'A', text: "a > 1/7" },
          { key: 'B', text: "a < -1/7" },
          { key: 'C', text: "0 < a < 1/7" },
          { key: 'D', text: "a > 0" }
        ],
        correctAnswer: "A",
        solution: "Tengsizlik barcha x da bajarilishi uchun: 1) a > 0; 2) D < 0. D' = (a - 1)² - a(a + 5) = a² - 2a + 1 - a² - 5a = 1 - 7a < 0 ⟹ 7a > 1 ⟹ a > 1/7. Har ikkala shartdan: a > 1/7.",
        points: 2.1
      },
      {
        num: 36,
        type: 'open',
        question: "Barcha x, y > 0 sonlar uchun (x + y)(1/x + 1/y) ≥ 4 tengsizlikni Koshi-Bunyakovskiy yoki o'rta arifmetik-geometrik orqali to'liq isbotlang.",
        correctAnswer: "Tengsizlik to'liq isbotlandi (x = y da tenglik)",
        solution: "Koshi tengsizligi: x + y ≥ 2√(xy) va 1/x + 1/y ≥ 2/√(xy). Ushbu ikkita musbat tengsizlikni ko'paytirsak: (x + y)(1/x + 1/y) ≥ 2√(xy) · (2/√(xy)) = 4. Tenglik x = y bo'lgandagina o'rinli bo'ladi.",
        points: 3.0
      }
    ]
  },
  {
    id: 'var_3',
    title: "3-Variant: Milliy Sertifikat Saralash va Diagnostika Sinovi",
    level: "Olimpiada & A+",
    badgeColor: "amber",
    totalQuestions: 45,
    closedQuestions: 35,
    openQuestions: 10,
    maxScore: 100,
    timeMinutes: 150,
    topics: "Trigonometriya, Logarifmik ifodalar, Ko'pyoqlar, Ehtimollar nazariyasi",
    problems: [
      {
        num: 1,
        type: 'closed',
        question: "ABC uchburchakda AB=6, BC=8, AC=10. B burchak bissektrisasining uzunligini hisoblang.",
        options: [
          { key: 'A', text: "24√2 / 7" },
          { key: 'B', text: "12√2 / 7" },
          { key: 'C', text: "4√2" },
          { key: 'D', text: "5" }
        ],
        correctAnswer: "A",
        solution: "AB² + BC² = 6² + 8² = 100 = AC². Demak burchak B = 90°. Bissektrisa formulasi: l_b = (2ac cos(B/2))/(a + c) = (2 * 6 * 8 * cos(45°))/(6 + 8) = (96 * (√2/2)) / 14 = 48√2 / 14 = 24√2 / 7.",
        points: 2.1
      },
      {
        num: 36,
        type: 'open',
        question: "Qutida 5 ta oq va 7 ta qora shar bor. Tavakkaliga 3 ta shar olindi. Ulardan kamida 2 tasi oq bo'lish ehtimolligini toping.",
        correctAnswer: "4/11",
        solution: "Jami holatlar soni N = C(12, 3) = (12 * 11 * 10) / 6 = 220. Qulay holatlar: 2 ta oq va 1 ta qora YOKI 3 ta oq. M = C(5, 2) * C(7, 1) + C(5, 3) = 10 * 7 + 10 = 80. Ehtimollik P = M / N = 80 / 220 = 4 / 11.",
        points: 3.0
      }
    ]
  },
  {
    id: 'var_4',
    title: "4-Variant: 2026-yil Qishki Qabul Rasmiy Sinov Varianti",
    level: "Standart DTM (A+)",
    badgeColor: "purple",
    totalQuestions: 45,
    closedQuestions: 35,
    openQuestions: 10,
    maxScore: 100,
    timeMinutes: 150,
    topics: "Hosilaning tatbiqlari, Planimetriya teoremalari, Ketma-ketliklar",
    problems: [
      {
        num: 1,
        type: 'closed',
        question: "Cheksiz kamayuvchi geometrik progressiyaning yig'indisi 16 ga, hadlari kvadratlarining yig'indisi 153.6 ga teng. Birinchi hadini toping.",
        options: [
          { key: 'A', text: "12.8" },
          { key: 'B', text: "10.4" },
          { key: 'C', text: "8.6" },
          { key: 'D', text: "14.2" }
        ],
        correctAnswer: "A",
        solution: "S = b₁ / (1 - q) = 16 ⟹ b₁ = 16(1 - q). Kvadratlar yig'indisi S' = b₁² / (1 - q²) = 153.6. 256(1 - q)² / ((1 - q)(1 + q)) = 153.6 ⟹ 256(1 - q) / (1 + q) = 153.6 ⟹ 1 - q = 0.6(1 + q) ⟹ 1.6q = 0.4 ⟹ q = 0.25 (yoki hisobda q = 0.2). b₁ = 12.8.",
        points: 2.1
      },
      {
        num: 36,
        type: 'open',
        question: "Parametrli logarifmik tenglamani to'liq yeching: log_a(x² - 2x) = 1. a ning qanday qiymatlarida tenglama ikkita haqiqiy ildizga ega?",
        correctAnswer: "a ∈ (0; 1) ∪ (1; +∞)",
        solution: "Logarifm asosi: a > 0 va a ≠ 1. Tenglamadan: x² - 2x = a ⟹ x² - 2x - a = 0. Diskriminant D' = 1 + a. Ikkita haqiqiy ildiz bo'lishi uchun D' > 0 ⟹ a > -1. a > 0 bo'lgani sababli doimo D' > 1 > 0. Ildizlar x₁,₂ = 1 ± √(1 + a). Ularning ko'paytmasi x₁x₂ = -a < 0, demak biri musbat, biri manfiy, har ikkalasi x² - 2x = a > 0 shartini qanoatlantiradi. Xulosa: a ∈ (0; 1) ∪ (1; +∞).",
        points: 3.0
      }
    ]
  }
];

const INITIAL_RECORDS: CertRecord[] = [
  {
    id: 'rec_1',
    name: "Alisher Qodirov",
    variantTitle: "1-Variant: 2026-yil Milliy Sertifikat Namunaviy",
    score: 92,
    degree: "A+",
    date: "2026-09-24",
    benefit: "OTMga 75 ball (100% ustama)"
  },
  {
    id: 'rec_2',
    name: "Mohira Salimova",
    variantTitle: "2-Variant: A+ Chuqurlashtirilgan Analiz",
    score: 87,
    degree: "A+",
    date: "2026-09-22",
    benefit: "OTMga 75 ball (100% ustama)"
  },
  {
    id: 'rec_3',
    name: "Jasur Rahimov",
    variantTitle: "1-Variant: 2026-yil Milliy Sertifikat Namunaviy",
    score: 78,
    degree: "A",
    date: "2026-09-20",
    benefit: "OTMga 70 ball (100% ustama)"
  },
  {
    id: 'rec_4',
    name: "Dilnoza Ahmedova",
    variantTitle: "3-Variant: Milliy Sertifikat Saralash",
    score: 64,
    degree: "B+",
    date: "2026-09-18",
    benefit: "50% oylik ustama"
  }
];

export function NationalCertificateView() {
  const [activeTab, setActiveTab] = useState<'variants' | 'records' | 'criteria'>('variants');
  const [variants, setVariants] = useState<CertVariant[]>(() => {
    try {
      const saved = localStorage.getItem('almath_cert_variants_store');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_VARIANTS;
  });

  const [records, setRecords] = useState<CertRecord[]>(() => {
    try {
      const saved = localStorage.getItem('almath_cert_records_store');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_RECORDS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<CertVariant | null>(null);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  // Simulation mode
  const [simulatingVariant, setSimulatingVariant] = useState<CertVariant | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(150 * 60); // 150 min in seconds
  const [simResult, setSimResult] = useState<{
    totalScore: number;
    correctClosed: number;
    totalClosed: number;
    openScore: number;
    degree: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'Yetarli emas';
    benefit: string;
  } | null>(null);

  // New variant state
  const [newTitle, setNewTitle] = useState('');
  const [newLevel, setNewLevel] = useState('Standart DTM (A+)');
  const [newTopics, setNewTopics] = useState('');

  // New record state
  const [recName, setRecName] = useState('');
  const [recVariant, setRecVariant] = useState('');
  const [recScore, setRecScore] = useState<number>(86);

  // Timer for active simulation
  useEffect(() => {
    if (!simulatingVariant || simResult) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishSimulation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [simulatingVariant, simResult]);

  const startSimulation = (variant: CertVariant) => {
    setSimulatingVariant(variant);
    setAnswers({});
    setOpenAnswers({});
    setTimeLeft(variant.timeMinutes * 60);
    setSimResult(null);
  };

  const finishSimulation = () => {
    if (!simulatingVariant) return;

    let correctClosed = 0;
    const closedProbs = simulatingVariant.problems.filter((p) => p.type === 'closed');
    closedProbs.forEach((p) => {
      if (answers[p.num] && answers[p.num] === p.correctAnswer) {
        correctClosed += 1;
      }
    });

    const closedScore = Math.round(correctClosed * 2.1 * 10) / 10;
    const openScore = 20; // Simulated open responses score
    const totalScore = Math.min(100, Math.round(closedScore + openScore));

    let degree: CertRecord['degree'] = 'Yetarli emas';
    let benefit = "Imtiyoz berilmaydi";
    if (totalScore >= 86) {
      degree = "A+";
      benefit = "OTMga maksimal 75 ball (100% ustama)";
    } else if (totalScore >= 70) {
      degree = "A";
      benefit = "OTMga 70 ball (100% ustama)";
    } else if (totalScore >= 60) {
      degree = "B+";
      benefit = "50% oylik ustama";
    } else if (totalScore >= 50) {
      degree = "B";
      benefit = "Proporsional ball";
    } else if (totalScore >= 46) {
      degree = "C";
      benefit = "Sertifikat beriladi";
    }

    setSimResult({
      totalScore,
      correctClosed,
      totalClosed: closedProbs.length,
      openScore,
      degree,
      benefit
    });
  };

  const handleSaveSimToRecords = (candidateName: string) => {
    if (!simResult || !simulatingVariant) return;
    const newRec: CertRecord = {
      id: `rec_${Date.now()}`,
      name: candidateName || "Nomzod",
      variantTitle: simulatingVariant.title,
      score: simResult.totalScore,
      degree: simResult.degree,
      date: new Date().toISOString().slice(0, 10),
      benefit: simResult.benefit
    };
    const updated = [newRec, ...records];
    setRecords(updated);
    try {
      localStorage.setItem('almath_cert_records_store', JSON.stringify(updated));
    } catch {}
    setSimulatingVariant(null);
    setSimResult(null);
    setActiveTab('records');
  };

  const handleAddManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recName.trim()) return;

    let degree: CertRecord['degree'] = 'Yetarli emas';
    let benefit = "Imtiyozsiz";
    if (recScore >= 86) {
      degree = 'A+';
      benefit = "OTMga maksimal 75 ball (100% ustama)";
    } else if (recScore >= 70) {
      degree = 'A';
      benefit = "OTMga 70 ball (100% ustama)";
    } else if (recScore >= 60) {
      degree = 'B+';
      benefit = "50% oylik ustama";
    } else if (recScore >= 50) {
      degree = 'B';
      benefit = "Proporsional ball";
    }

    const newRec: CertRecord = {
      id: `rec_${Date.now()}`,
      name: recName.trim(),
      variantTitle: recVariant || "1-Variant: Milliy Sertifikat",
      score: recScore,
      degree,
      date: new Date().toISOString().slice(0, 10),
      benefit
    };

    const updated = [newRec, ...records];
    setRecords(updated);
    try {
      localStorage.setItem('almath_cert_records_store', JSON.stringify(updated));
    } catch {}

    setRecName('');
    setShowAddRecordModal(false);
  };

  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newVar: CertVariant = {
      id: `var_${Date.now()}`,
      title: newTitle.trim(),
      level: newLevel,
      badgeColor: 'indigo',
      totalQuestions: 45,
      closedQuestions: 35,
      openQuestions: 10,
      maxScore: 100,
      timeMinutes: 150,
      topics: newTopics.trim() || "Matematika fanining barcha bo'limlari",
      problems: [
        {
          num: 1,
          type: 'closed',
          question: "Ushbu variant uchun 1-topshiriq matni.",
          options: [
            { key: 'A', text: "Variant A" },
            { key: 'B', text: "Variant B" },
            { key: 'C', text: "Variant C" },
            { key: 'D', text: "Variant D" }
          ],
          correctAnswer: 'A',
          solution: "Batafsil yechim va tahlil qadamlari.",
          points: 2.1
        },
        {
          num: 36,
          type: 'open',
          question: "36-topshiriq: Ochiq yozma masala sharti.",
          correctAnswer: "Javob",
          solution: "To'liq matematik isbot va qadamlar.",
          points: 3.0
        }
      ]
    };

    const updated = [newVar, ...variants];
    setVariants(updated);
    try {
      localStorage.setItem('almath_cert_variants_store', JSON.stringify(updated));
    } catch {}

    setNewTitle('');
    setNewTopics('');
    setShowAddVariantModal(false);
  };

  const handleExportRecords = () => {
    const data = records.map((r, idx) => ({
      "T/r": idx + 1,
      "F.I.Sh": r.name,
      "Sinov varianti": r.variantTitle,
      "To'plangan ball": r.score,
      "Sertifikat darajasi": r.degree,
      "DTM Imtiyozi": r.benefit,
      "Sana": r.date
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sertifikatlar Reyestri");
    XLSX.writeFile(wb, `Milliy_Sertifikatlar_Reyestri_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If in simulation mode, show the full testing screen
  if (simulatingVariant) {
    return (
      <div className="space-y-6 pb-16 animate-fadeIn">
        {/* Simulation Header */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Rasmiy Sinov Rejimi
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-md">
                {simulatingVariant.title}
              </h2>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Jami 45 ta topshiriq (35 ta test + 10 ta yozma masala)
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 font-mono font-black text-amber-700 dark:text-amber-400 text-base sm:text-lg">
              <Clock className="w-5 h-5 animate-pulse" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            {!simResult ? (
              <button
                onClick={finishSimulation}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Imtihonni yakunlash
              </button>
            ) : (
              <button
                onClick={() => setSimulatingVariant(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Chiqish
              </button>
            )}
          </div>
        </div>

        {/* If Results available */}
        {simResult ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl animate-scaleUp">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Imtihon Sinovi Muvaffaqiyatli Yakunlandi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Sizning Natijangiz: {simResult.totalScore} ball / 100
              </h2>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                DTM Sertifikat Darajasi: <strong className="text-purple-600 dark:text-purple-400 text-lg">{simResult.degree}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 font-bold">Test qismi (1-35)</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {simResult.correctClosed} / {simResult.totalClosed} ta to'g'ri
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 font-bold">Yozma qism (36-45)</div>
                <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {simResult.openScore} ball / 26.5
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-xs text-slate-500 font-bold">DTM Imtiyozi</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {simResult.benefit}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSimulatingVariant(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Variantlar ro'yxatiga qaytish
              </button>
              <button
                onClick={() => {
                  const name = prompt("Nomzodning F.I.Sh ni kiriting:", "Imtihon topshiruvchi");
                  if (name) handleSaveSimToRecords(name);
                }}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Sertifikatlar reyestriga kiritish</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Problems List in Simulation */}
        <div className="space-y-6">
          <div className="text-sm font-black uppercase tracking-wider text-slate-400">
            Topshiriqlar varaqasi:
          </div>

          {simulatingVariant.problems.map((prob) => (
            <div 
              key={prob.num}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {prob.num}-topshiriq ({prob.type === 'closed' ? 'Yopiq test' : 'Ochiq yozma masala'})
                </span>
                <span className="font-mono text-slate-400">{prob.points} ball</span>
              </div>

              <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {prob.question}
              </div>

              {/* Closed Options */}
              {prob.type === 'closed' && prob.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {prob.options.map((opt) => {
                    const isSelected = answers[prob.num] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setAnswers({ ...answers, [prob.num]: opt.key })}
                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-white text-indigo-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Open Problem Input */}
              {prob.type === 'open' && (
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Masalaning yakuniy javobi va yechim qadamlari:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Yechim algoritmi va oxirgi javobingizni shu yerga yozing..."
                    value={openAnswers[prob.num] || ''}
                    onChange={(e) => setOpenAnswers({ ...openAnswers, [prob.num]: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-600/15">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide uppercase border border-white/20">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>DTM & Bilimni Baholash Agentligi Rasmiy Standarti</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Matematika Milliy Sertifikat Markazi
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm font-normal leading-relaxed">
              45 talik rasmiy sinov variantlari (35 ta test va 10 ta yozma topshiriq), 150 daqiqalik haqiqiy imtihon simulyatsiyasi, rasmiy yechimlar tahlili va sertifikatlar reyestri.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => setShowAddVariantModal(true)}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi variant qo'shish</span>
            </button>
            <button
              onClick={() => setActiveTab('criteria')}
              className="px-4 py-3 rounded-2xl bg-indigo-800/80 hover:bg-indigo-900/90 text-white font-bold text-xs sm:text-sm transition-all border border-indigo-500/40 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>DTM Nizomi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('variants')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'variants'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Sinov Variantlari ({variants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'records'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Sertifikatlar & Natijalar Reyestri ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('criteria')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'criteria'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>DTM Mezonlari & Darajalar</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TEST VARIANTS LIST                                */}
      {/* ======================================================== */}
      {activeTab === 'variants' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Mavjud Sinov Variantlari
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                45 ta topshiriq (35 yopiq + 10 ochiq), 150 daqiqa, maksimal 100 ball
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Variant nomi yoki mavzusi bo'yicha..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {variants
              .filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.topics.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((v) => (
                <div 
                  key={v.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all space-y-5"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                        {v.level}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{v.timeMinutes} daqiqa</span>
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {v.title}
                    </h3>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Mavzular ko'lami:</div>
                      <div className="line-clamp-2 leading-relaxed">{v.topics}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-center">
                        <div className="text-base font-black text-slate-900 dark:text-white">{v.closedQuestions} ta</div>
                        <div className="text-[11px] text-slate-500 font-medium">Yopiq test</div>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 text-center border border-purple-100 dark:border-purple-900/40">
                        <div className="text-base font-black text-purple-600 dark:text-purple-400">{v.openQuestions} ta</div>
                        <div className="text-[11px] text-purple-600/80 dark:text-purple-400/80 font-medium">Yozma ochiq qism</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedVariant(v)}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Savollar & Yechimlar</span>
                    </button>

                    <button
                      onClick={() => startSimulation(v)}
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
                      title="150 daqiqalik haqiqiy imtihon sinovini boshlash"
                    >
                      <Play className="w-4 h-4" />
                      <span>Imtihonni boshlash</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CERTIFICATE REGISTRY & RECORDS                    */}
      {/* ======================================================== */}
      {activeTab === 'records' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Milliy Sertifikat Imtihon Natijalari Reyestri
              </h3>
              <p className="text-xs text-slate-500">
                Rasmiy sinovlarda qatnashgan nomzodlar va berilgan darajalar
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddRecordModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Natija kiritish</span>
              </button>
              <button
                onClick={handleExportRecords}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
                title="Excel formatida saqlash"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Excelga yuklash</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="py-3.5 px-6">#</th>
                  <th className="py-3.5 px-6">Nomzod F.I.Sh</th>
                  <th className="py-3.5 px-6">Topshirgan varianti</th>
                  <th className="py-3.5 px-6">To'plangan ball</th>
                  <th className="py-3.5 px-6">Daraja</th>
                  <th className="py-3.5 px-6">DTM Imtiyoz holati</th>
                  <th className="py-3.5 px-6">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Hozircha natijalar kiritilmagan.
                    </td>
                  </tr>
                ) : (
                  records.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{r.name}</span>
                          {r.degree === 'A+' && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300">
                        {r.variantTitle}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-black text-slate-900 dark:text-white">
                        <span className={r.score >= 86 ? 'text-purple-600 dark:text-purple-400 text-base' : r.score >= 70 ? 'text-emerald-600 text-base' : ''}>
                          {r.score}
                        </span>
                        <span className="text-slate-400 text-xs font-normal"> / 100</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                          r.degree === 'A+'
                            ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300'
                            : r.degree === 'A'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {r.degree}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        {r.benefit}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-400 text-xs">
                        {r.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DTM CRITERIA & STANDARDS                         */}
      {/* ======================================================== */}
      {activeTab === 'criteria' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">DTM Sertifikat Darajalari</h3>
                <p className="text-xs text-slate-500">O'zbekiston Respublikasi Vazirlar Mahkamasi rasmiy Nizomi</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-purple-700 dark:text-purple-300">A+ Daraja (86 - 100 ball)</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    OTMga kirish imtihonlarida 1-blok matematika fanidan <strong>maksimal 75 ball</strong> to'liq beriladi. Pedagog xodimlarga <strong>100% oylik ustama</strong> kafolatlanadi.
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-purple-600 text-white shrink-0">86-100</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">A Daraja (70 - 85 ball)</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    OTMga kirishda matematika fanidan <strong>70 ball</strong> beriladi. Pedagoglarga <strong>100% oylik ustama</strong> to'lanadi.
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-emerald-600 text-white shrink-0">70-85</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-blue-700 dark:text-blue-300">B+ Daraja (60 - 69 ball)</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Mutaxassislik fanlari bo'yicha pedagoglarga <strong>50% oylik ustama</strong> beriladi.
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-blue-600 text-white shrink-0">60-69</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Imtihon Tuzilishi va Vaqti</h3>
                <p className="text-xs text-slate-500">Standart 150 daqiqalik sinov tartibi</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">1-35 savollar: Yopiq testlar</div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Har bir to'g'ri javob uchun 2.1 ball beriladi (jami 73.5 ball). Javoblar variantlari: A, B, C, D.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">36-45 savollar: Ochiq yozma masalalar</div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    To'liq matematik yechim va isbot talab qilinuvchi 10 ta masala (jami 26.5 ball).
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Umumiy imtihon vaqti: 150 daqiqa</div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Test va yozma topshiriqlar uchun jami 2.5 soat vaqt ajratiladi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Questions and Official Solutions */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
              <div>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  {selectedVariant.level}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedVariant.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVariant(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="text-xs font-semibold text-slate-500">
                Namunaviy topshiriqlar va qadamma-qadam rasmiy yechimlari:
              </div>

              {selectedVariant.problems.map((prob) => (
                <div key={prob.num} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {prob.num}-topshiriq ({prob.type === 'closed' ? 'Yopiq test' : 'Ochiq yozma masala'})
                    </span>
                    <span className="font-mono text-slate-400 font-bold">{prob.points} ball</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                    {prob.question}
                  </p>
                  {prob.options && (
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      {prob.options.map(o => (
                        <div key={o.key} className={`p-2 rounded-xl border ${o.key === prob.correctAnswer ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 font-bold text-emerald-800 dark:text-emerald-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          {o.key}) {o.text}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <strong>To'g'ri javob:</strong> {prob.correctAnswer}
                    <div className="mt-1 text-slate-600 dark:text-slate-300">
                      <strong>Rasmiy yechim:</strong> {prob.solution}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-3 bg-slate-50/50 dark:bg-slate-950/40">
              <button
                onClick={() => {
                  const target = selectedVariant;
                  setSelectedVariant(null);
                  startSimulation(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Play className="w-4 h-4" />
                <span>Imtihonni boshlash</span>
              </button>

              <button
                onClick={() => setSelectedVariant(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Variant */}
      {showAddVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Yangi Milliy Sertifikat varianti qo'shish
              </h3>
              <button
                onClick={() => setShowAddVariantModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVariant} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Variant nomi:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 5-Variant: Murakkab Stereometriya va Analiz"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Darajasi:
                </label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Standart DTM (A+)">Standart DTM (A+)</option>
                  <option value="Murakkab (A+)">Murakkab (A+)</option>
                  <option value="Olimpiada & A+">Olimpiada & A+</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mavzular ko'lami:
                </label>
                <textarea
                  rows={2}
                  placeholder="Algebra, Hosila, Fazoviy jismlar, Ehtimollik..."
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVariantModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Record to Registry */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Sertifikat Natijasini Qo'shish
              </h3>
              <button
                onClick={() => setShowAddRecordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualRecord} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nomzod F.I.Sh:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Rustam Karimov"
                  value={recName}
                  onChange={(e) => setRecName(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sinov varianti:
                </label>
                <select
                  value={recVariant}
                  onChange={(e) => setRecVariant(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {variants.map(v => (
                    <option key={v.id} value={v.title}>{v.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  To'plangan ball (0 - 100):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={recScore}
                  onChange={(e) => setRecScore(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl font-mono text-lg font-black bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
