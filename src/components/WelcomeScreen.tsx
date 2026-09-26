import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Sun, 
  ArrowRight, 
  Star, 
  Trophy, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Zap, 
  ShieldCheck, 
  Eye, 
  Sparkles, 
  Code, 
  CheckCircle2, 
  TrendingUp, 
  Lightbulb,
  Brain,
  BarChart3,
  User,
  Phone,
  MapPin,
  Send,
  School,
  ArrowUpRight,
  Menu,
  X,
  Newspaper,
  Check,
  ThumbsUp,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Calculator,
  ScanLine,
  Cpu,
  Calendar,
  Clock,
  Bell
} from 'lucide-react';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { subscribeToCollection } from '../lib/db';
import { db, auth } from '../lib/firebase';
import { formatDateUZ } from '../lib/utils';

const getClientId = (): string => {
  if (typeof window === 'undefined') return 'guest';
  const authUid = auth.currentUser?.uid;
  if (authUid) return authUid;
  let id = localStorage.getItem('almath_device_like_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    localStorage.setItem('almath_device_like_id', id);
  }
  return id;
};

interface WelcomeScreenProps {
  onLoginClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function WelcomeScreen({ onLoginClick, isDarkMode, toggleDarkMode }: WelcomeScreenProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [panjiViews, setPanjiViews] = useState<number>(0);
  const [quvonchbekViews, setQuvonchbekViews] = useState<number>(0);
  const [news, setNews] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  // Curated and Firestore blended news items for rich and balanced presentation
  const displayNews = useMemo(() => {
    const firestoreFormatted = news.map((item, idx) => {
      let dateStr = "Yaqinda e'lon qilingan";
      if (item.createdAt) {
        dateStr = formatDateUZ(item.createdAt);
      } else if (item.date && item.date !== '-') {
        dateStr = item.date;
      }

      // Smart category detection
      let category = item.category || "E'lon";
      let categoryColor = "blue";
      const titleLower = (item.title || "").toLowerCase();
      if (titleLower.includes("dastur") || titleLower.includes("ishlash") || titleLower.includes("tuzat") || titleLower.includes("texnik")) {
        category = "Platforma yangilanishi";
        categoryColor = "indigo";
      } else if (titleLower.includes("olimpiada") || titleLower.includes("musobaqa")) {
        category = "Olimpiada";
        categoryColor = "amber";
      } else if (titleLower.includes("sertifikat") || titleLower.includes("kurs") || titleLower.includes("dars")) {
        category = "Ta'lim dasturi";
        categoryColor = "emerald";
      }

      return {
        id: item.id || `fs_${idx}`,
        title: item.title || "Yangi e'lon",
        content: item.content || "Tafsilotlar tez kunda to'liq yangilanadi.",
        date: dateStr,
        category,
        categoryColor,
        readTime: "2 daqiqa",
        isPinned: true
      };
    });

    const curatedNews = [
      {
        id: "curated_ai_3",
        title: "Almath 3.0: Sun'iy intellekt moduli to'liq ishga tushirildi",
        content: "Platformamizda qo'lyozma matematik vazifalarni tekshirish tezligi 1.4 soniyagacha oshirildi va murakkab geometriya hamda integral ifodalarni aniqlash darajasi 99.4% ga yetkazildi. O'quvchilar endi har bir qadam bo'yicha batafsil izoh va ko'rsatmalar oladilar.",
        date: "24-Sentabr, 2026",
        category: "Platforma yangiligi",
        categoryColor: "indigo",
        readTime: "2 daqiqa",
        isPinned: false
      },
      {
        id: "curated_milliy_cert",
        title: "Milliy Sertifikat (A+) imtihonlariga saralash diagnostika testlari",
        content: "Matematika fani bo'yicha Milliy Sertifikat imtihonlariga tayyorlanayotgan abituriyentlar va o'qituvchilar uchun 45 ta amaliy diagnostik test to'plami tizimga joylashtirildi. Natijalar DTM mezonlari asosida avtomatik hisoblanadi.",
        date: "20-Sentabr, 2026",
        category: "Ta'lim dasturi",
        categoryColor: "emerald",
        readTime: "3 daqiqa",
        isPinned: false
      },
      {
        id: "curated_olimpiada",
        title: "Prezident va ixtisoslashtirilgan maktablar olimpiadasi",
        content: "Sho'rchi tuman Cambridge School o'quv markazida navbatdagi matematika olimpiadasi saralash bosqichi boshlandi. G'olib o'quvchilar uchun Almath platformasidan bepul foydalanish va maxsus mukofotlar taqdim etiladi.",
        date: "16-Sentabr, 2026",
        category: "Musobaqa & E'lon",
        categoryColor: "amber",
        readTime: "2 daqiqa",
        isPinned: false
      }
    ];

    const combined = [...firestoreFormatted];
    for (const c of curatedNews) {
      if (combined.length < 3 && !combined.some(item => item.title === c.title)) {
        combined.push(c);
      }
    }
    return combined;
  }, [news]);

  // Team Likes (Firestore synced, starts from 0)
  const [panjiLikes, setPanjiLikes] = useState<number>(0);
  const [quvonchbekLikes, setQuvonchbekLikes] = useState<number>(0);
  const [hasLikedPanji, setHasLikedPanji] = useState<boolean>(false);
  const [hasLikedQuvonchbek, setHasLikedQuvonchbek] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.removeItem('almath_panji_likes');
      localStorage.removeItem('almath_quvonchbek_likes');
    } catch {
      // ignore
    }

    const clientId = getClientId();

    const panjiRef = doc(db, 'team_likes', 'panji');
    const unsubPanji = onSnapshot(panjiRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const users: string[] = Array.isArray(data.users) ? data.users : [];
        setPanjiLikes(users.length);
        setHasLikedPanji(users.includes(clientId));
      } else {
        setPanjiLikes(0);
        setHasLikedPanji(false);
      }
    }, (error) => {
      console.warn("Panji likes Firestore error:", error);
    });

    const quvonchbekRef = doc(db, 'team_likes', 'quvonchbek');
    const unsubQuvonchbek = onSnapshot(quvonchbekRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const users: string[] = Array.isArray(data.users) ? data.users : [];
        setQuvonchbekLikes(users.length);
        setHasLikedQuvonchbek(users.includes(clientId));
      } else {
        setQuvonchbekLikes(0);
        setHasLikedQuvonchbek(false);
      }
    }, (error) => {
      console.warn("Quvonchbek likes Firestore error:", error);
    });

    return () => {
      unsubPanji();
      unsubQuvonchbek();
    };
  }, []);

  const handleLikePanji = async () => {
    const clientId = getClientId();
    const panjiRef = doc(db, 'team_likes', 'panji');

    if (hasLikedPanji) {
      setHasLikedPanji(false);
      setPanjiLikes((prev) => Math.max(0, prev - 1));
      try {
        const snap = await getDoc(panjiRef);
        if (snap.exists()) {
          const currentUsers: string[] = snap.data().users || [];
          const updated = currentUsers.filter(u => u !== clientId);
          await setDoc(panjiRef, { count: updated.length, users: updated }, { merge: true });
        }
      } catch (err) {
        console.error("Error unliking Panji:", err);
      }
    } else {
      setHasLikedPanji(true);
      setPanjiLikes((prev) => prev + 1);
      try {
        const snap = await getDoc(panjiRef);
        if (snap.exists()) {
          const currentUsers: string[] = snap.data().users || [];
          if (!currentUsers.includes(clientId)) {
            const updated = [...currentUsers, clientId];
            await setDoc(panjiRef, { count: updated.length, users: updated }, { merge: true });
          }
        } else {
          await setDoc(panjiRef, { count: 1, users: [clientId] });
        }
      } catch (err) {
        console.error("Error liking Panji:", err);
      }
    }
  };

  const handleLikeQuvonchbek = async () => {
    const clientId = getClientId();
    const quvonchbekRef = doc(db, 'team_likes', 'quvonchbek');

    if (hasLikedQuvonchbek) {
      setHasLikedQuvonchbek(false);
      setQuvonchbekLikes((prev) => Math.max(0, prev - 1));
      try {
        const snap = await getDoc(quvonchbekRef);
        if (snap.exists()) {
          const currentUsers: string[] = snap.data().users || [];
          const updated = currentUsers.filter(u => u !== clientId);
          await setDoc(quvonchbekRef, { count: updated.length, users: updated }, { merge: true });
        }
      } catch (err) {
        console.error("Error unliking Quvonchbek:", err);
      }
    } else {
      setHasLikedQuvonchbek(true);
      setQuvonchbekLikes((prev) => prev + 1);
      try {
        const snap = await getDoc(quvonchbekRef);
        if (snap.exists()) {
          const currentUsers: string[] = snap.data().users || [];
          if (!currentUsers.includes(clientId)) {
            const updated = [...currentUsers, clientId];
            await setDoc(quvonchbekRef, { count: updated.length, users: updated }, { merge: true });
          }
        } else {
          await setDoc(quvonchbekRef, { count: 1, users: [clientId] });
        }
      } catch (err) {
        console.error("Error liking Quvonchbek:", err);
      }
    }
  };

  useEffect(() => {
    const unsub = subscribeToCollection("news", setNews);
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchViews = async (personId: string, setViews: React.Dispatch<React.SetStateAction<number>>) => {
      try {
        const docRef = doc(db, 'team_views', personId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const viewers = docSnap.data().viewers || [];
          setViews(viewers.length);
        }
      } catch (error) {
        console.warn("Could not fetch views:", error);
      }
    };
    
    fetchViews('panji', setPanjiViews);
    fetchViews('quvonchbek', setQuvonchbekViews);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 1. TOP NAVBAR                                                */}
      {/* ============================================================ */}
      <header 
        ref={headerRef} 
        className="sticky top-0 z-50 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/80 transition-all duration-300"
      >
        <nav className="flex justify-between items-center w-full px-5 sm:px-8 py-3.5 max-w-7xl mx-auto">
          {/* Brand Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Almath logo" className="w-full h-full object-cover rounded-[14px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white leading-none">
                Almath
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-0.5">
                AI Platform
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/70 dark:bg-slate-900/70 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-800">
            <a 
              href="#home" 
              className="text-xs font-bold px-4 py-1.5 rounded-full bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs transition-all"
            >
              Bosh sahifa
            </a>
            <a 
              href="#kurslar" 
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
            >
              Kurslar
            </a>
            <a 
              href="#testlar" 
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
            >
              Testlar
            </a>
            <a 
              href="#biz-haqimizda" 
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
            >
              Biz haqimizda
            </a>
            <a 
              href="#aloqa" 
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
            >
              Aloqa
            </a>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleDarkMode} 
              aria-label="Rang rejimini o'zgartirish"
              className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Kabinet Button */}
            <button 
              onClick={onLoginClick} 
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all active:scale-95 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Kabinet</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              aria-label="Menyu"
              className="lg:hidden w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 px-6 py-5 flex flex-col gap-3 shadow-xl"
          >
            <a 
              href="#home" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-sm font-bold px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
            >
              Bosh sahifa
            </a>
            <a 
              href="#kurslar" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-sm font-semibold px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Kurslar
            </a>
            <a 
              href="#testlar" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-sm font-semibold px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Testlar
            </a>
            <a 
              href="#biz-haqimizda" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-sm font-semibold px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Biz haqimizda
            </a>
            <a 
              href="#aloqa" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="text-sm font-semibold px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Aloqa
            </a>
            
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }} 
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
              >
                <User className="w-4 h-4" />
                <span>Kabinetga kirish</span>
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section id="home" className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        {/* Subtle Ambient Mathematical Grid & Glow */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-3xl rounded-full"></div>
          <div className="absolute top-24 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          {/* Subtle math grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-5 sm:px-8 flex flex-col items-center text-center space-y-7">
          
          {/* Live Status Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold shadow-2xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-black text-slate-800 dark:text-slate-200 tracking-wider uppercase text-[11px]">
              ALMATH 3.0
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              Sun'iy intellekt matematika ekotizimi
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.div 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
              Matematik yechimlarni{' '}
              <span className="relative inline-block whitespace-nowrap">
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  sun'iy intellekt
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-500/70" viewBox="0 0 100 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 9C28 3 72 3 98 9" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </span>{' '}
              bilan mukammal baholang
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Qo'lyozma daftardagi har bir qadamni soniyalar ichida aniqlovchi, xatolarni ko'rsatib, to'g'ri yechim metodikasini o'rgatuvchi intellektual ta'lim muhiti.
            </p>
          </motion.div>

          {/* Clean Value Metric Strips */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-6 sm:gap-12 pt-2 text-left"
          >
            <div className="border-l-2 border-indigo-600 dark:border-indigo-400 pl-3.5 space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">&lt; 2 sek</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">Tekshiruv tezligi</div>
            </div>
            <div className="border-l-2 border-emerald-500 pl-3.5 space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">99.4%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">Qo'lyozma aniqligi</div>
            </div>
            <div className="border-l-2 border-cyan-500 pl-3.5 space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">120k+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">Baholangan vazifa</div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3 w-full sm:w-auto"
          >
            <button 
              onClick={onLoginClick} 
              className="w-full sm:w-auto group px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Tizimga kirish</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a 
              href="https://t.me/panji_soatov" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto group px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 font-bold text-sm shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Offline darslarga yozilish</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </a>
          </motion.div>

          {/* Social Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
              O'qituvchi va o'quvchilar uchun
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
              Olimpiada va Milliy sertifikat (A+)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
              Avtomatik reyting
            </span>
          </motion.div>

        </div>

        {/* ============================================================ */}
        {/* 3. TRUST & METRICS STRIP                                     */}
        {/* ============================================================ */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-16 lg:mt-24">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">50k+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Faol foydalanuvchilar</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">200+</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Matematika kurslari</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">99.4%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">AI Tekshirish aniqligi</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">24/7</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Uzluksiz ekotizim</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. NEWS & ANNOUNCEMENTS SECTION                              */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 px-5 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/70 dark:border-slate-800">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-100 dark:border-indigo-900/50">
              <Newspaper className="w-3.5 h-3.5" />
              <span>E'lonlar va Yangiliklar</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              So'nggi yangiliklardan xabardor bo'ling
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              ALMATH platformasidagi eng so'nggi yangiliklar, tizim takomillashuvi va muhim e'lonlar.
            </p>
          </div>

          <a 
            href="https://t.me/panji_soatov" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span>Telegram orqali kuzatish</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {/* Dynamic Balanced Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayNews.map((item: any) => {
            const isEmerald = item.categoryColor === 'emerald';
            const isAmber = item.categoryColor === 'amber';
            const isIndigo = item.categoryColor === 'indigo';

            const badgeBg = isEmerald 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
              : isAmber
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
              : isIndigo
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';

            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedNews(item)}
                className="group bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
              >
                {/* Subtle top card glow line on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="space-y-3.5">
                  {/* Category and Date meta bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badgeBg}`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                    </span>
                  </div>

                  {/* News Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* News Content Preview */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Bottom Meta & Read More CTA */}
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.readTime || "2 daqiqa"}</span>
                  </span>

                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    <span>Batafsil o'qish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* News Detail Modal */}
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div 
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative animate-scaleUp max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                      {selectedNews.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedNews.date}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {selectedNews.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-7 overflow-y-auto space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="whitespace-pre-line">
                  {selectedNews.content}
                </p>
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3 text-xs text-indigo-800 dark:text-indigo-300">
                  <Bell className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span>Platformadagi yangiliklarni o'z vaqtida kuzatib borish uchun e'lonlar bo'limini muntazam tekshirib turing.</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
                <a 
                  href="https://t.me/panji_soatov" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram orqali savol yo'llash</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Tushunarli
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 5. COURSES SECTION                                           */}
      {/* ============================================================ */}
      <section id="kurslar" className="py-20 px-5 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/70 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Mukammal ta'lim
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Matematika Kurslari
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Boshlang'ich darajadan to oliy matematikagacha bo'lgan to'liq, tizimli va interaktiv ta'lim dasturlari.
            </p>
          </div>
          <a 
            href="#kurslar" 
            className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:underline"
          >
            <span>Barcha kurslar</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Course 1 */}
          <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-xl transition-all duration-300">
            <div className="relative h-52 w-full overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="Milliy sertifikat" 
                src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=600" 
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  Boshlang'ich
                </span>
                <span className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                  Ommabop
                </span>
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Milliy sertifikat
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  Arifmetika, kasrlar, foizlar va sodda tenglamalar. Matematikani noldan o'rganishni istaganlar uchun eng yaxshi tanlov.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">A+ darajaga kafolat</span>
                <button className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Course 2 */}
          <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-xl transition-all duration-300">
            <div className="relative h-52 w-full overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="SAT" 
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600" 
              />
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  O'rta daraja
                </span>
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  SAT Matematika
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  Funksiyalar, hosila, integral va ularning tatbiqlari. OTM va xalqaro universitetlarga tayyorlanuvchilar uchun intensiv kurs.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Xalqaro standart</span>
                <button className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Course 3 */}
          <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-xl transition-all duration-300">
            <div className="relative h-52 w-full overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="Attestatsiya" 
                src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600" 
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  Murakkab
                </span>
                <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  Yangi
                </span>
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  Attestatsiya (O'qituvchilar uchun)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  Chiziqli algebra, analitik geometriya va differensial tenglamalar. Ustozlar va mutaxassislar uchun chuqurlashtirilgan dastur.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Mutaxassislik kursi</span>
                <button className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. TESTS SECTION                                             */}
      {/* ============================================================ */}
      <section id="testlar" className="py-20 px-5 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/70 dark:border-slate-800">
        <div className="mb-12 space-y-2">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            Imtihonlarga tayyorgarlik
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Test Turlari
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Qaysi imtihonga tayyorlanayotgan bo'lsangiz — bizda siz uchun maxsus xalqaro va davlat standartlariga mos testlar mavjud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Milliy Sertifikat</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Milliy Sertifikat imtihoniga maxsus tayyorlangan test to'plamlari va moslashtirilgan o'quv materiallari.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Muntazam yangilanadi</span>
              <span className="text-indigo-600 dark:text-indigo-400">Kirish →</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Attestatsiya</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                O'qituvchilar uchun attestatsiya imtihoniga tayyorgarlik testlari. Bilimni baholash standarti.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">2 ta faol test</span>
              <span className="text-blue-600 dark:text-blue-400">Kirish →</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-5">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">SAT Matematika</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                SAT imtihoniga yo'naltirilgan matematika testlari. Xalqaro talablar va standartlar asosida.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Ingliz tilida</span>
              <span className="text-violet-600 dark:text-violet-400">Kirish →</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">DTM Majburiy & Fan</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Davlat Test Markazi imtihoniga to'liq tayyorgarlik. Majburiy matematika bloki va maxsus fan testlari.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Rasmiy format</span>
              <span className="text-amber-600 dark:text-amber-400">Kirish →</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. ABOUT & TEAM SECTION                                      */}
      {/* ============================================================ */}
      <section id="biz-haqimizda" className="py-20 px-5 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/70 dark:border-slate-800">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biz haqimizda</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Kelajak ta'limi va <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">matematik tafakkur</span> maskani
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Almath — bu matematikani chuqur mantiq, ilmiy tahlil va zavq bilan o'rganish, ilg'or metodikalar hamda sun'iy intellekt texnologiyalarini birlashtirgan ta'lim ekotizimidir.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Member 1: Panji Soatov */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
            {/* Card Top / Photo Header */}
            <div className="relative h-72 sm:h-80 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src="/xodim1.png"
                alt="Panji Soatov"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/xodim1.jpg';
                }}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
              
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Asoschi & CEO</span>
                </span>
              </div>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Panji Soatov</h2>
                <p className="text-indigo-200 text-sm font-medium mt-0.5">Asoschi va Bosh Ijrochi Direktor (CEO)</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-900/50">
                  <GraduationCap className="w-4 h-4" />
                  <span>Pedagogik tajriba va ta'lim boshqaruvi</span>
                </div>

                <div className="space-y-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  <p>
                    <strong>Panji Soatov</strong> — Almath innovatsion matematika platformasining asoschisi va rahbari. Yuzlab o'quvchilarni Prezident va ixtisoslashtirilgan maktablar, Respublika hamda xalqaro matematika olimpiadalari, shuningdek Milliy Sertifikat (A+) imtihonlariga muvaffaqiyatli tayyorlagan.
                  </p>
                  <p>
                    Murakkab matematik teoremalar va tushunchalarni sodda, ko'rgazmali va mantiqiy usulda tushuntirish metodikasi ustasi. Har bir o'quvchida mustaqil fikrlash va tahlil qilish salohiyatini yuksaltirishga intiladi.
                  </p>
                </div>

                {/* Specializations */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mutaxassislik yo'nalishlari</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Oliy matematika
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Olimpiada masalalari
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Milliy sertifikat (A+)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Ta'lim menejmenti
                    </span>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Tayyorlagan o'quvchilari</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">1,500+ nafar</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Olimpiada g'oliblari</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">45+ medal</div>
                  </div>
                </div>
              </div>

              {/* Contacts & Social & Like */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <a
                    href="https://t.me/panji_soatov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-white hover:bg-[#0088cc] transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
                    title="Telegram orqali bog'lanish"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com/almath_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
                    title="Instagram profil"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline ml-1">
                    @panji_soatov
                  </span>
                </div>

                {/* Like / Tashakkur tugmasi 👍 */}
                <button
                  type="button"
                  onClick={handleLikePanji}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer border active:scale-95 ${
                    hasLikedPanji
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Tashakkur bildirish"
                >
                  <ThumbsUp className={`w-4 h-4 ${hasLikedPanji ? 'fill-current' : ''}`} />
                  <span>{panjiLikes}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Member 2: Quvonchbek Hakimov */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
            {/* Card Top / Photo Header */}
            <div className="relative h-72 sm:h-80 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src="/xodim2.png"
                alt="Quvonchbek Hakimov"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/xodim2.jpg';
                }}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
              
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-600/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Texnik rahbar (CTO)</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium backdrop-blur-md border border-white/20">
                  AI Arxitektor
                </span>
              </div>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Quvonchbek Hakimov</h2>
                <p className="text-indigo-200 text-sm font-medium mt-0.5">Bosh tizim arxitektori va CTO</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-900/50">
                  <Zap className="w-4 h-4" />
                  <span>4+ yillik IT, Sun'iy Intellekt va ta'lim tajribasi</span>
                </div>

                <div className="space-y-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  <p>
                    <strong>Quvonchbek Hakimov</strong> — Sun'iy intellekt (AI), zamonaviy bulutli arxitektura va raqamli ta'lim tizimlari bo'yicha yetakchi dasturiy muhandis hamda 4 yillik tajribaga ega matematika o'qituvchisi. Almath platformasining to'liq texnologik infratuzilmasi muallifi.
                  </p>
                  <p>
                    Platformada o'quvchilarning qo'lyozma matematik yechimlarini sun'iy intellekt orqali sekundlar ichida tekshirish (AI Grader), real vaqtda davomat va to'lovlar nazorati, o'quvchi reytingi va xatolar tahlili algoritmlarini noldan ishlab chiqqan.
                  </p>
                </div>

                {/* Specializations */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Mutaxassislik yo'nalishlari</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      AI & Mashinali o'rganish
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Full-Stack Web (React & Node)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Bulutli Infratuzilma
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Ta'lim Algoritmlari
                    </span>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">AI Tekshirgan vazifalar</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">120,000+ ta</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Tizim barqarorligi</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">99.9% Uptime</div>
                  </div>
                </div>
              </div>

              {/* Contacts & Social & Like */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <a
                    href="https://t.me/quvonchbek_hakimov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-white hover:bg-[#0088cc] transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
                    title="Telegram orqali bog'lanish"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com/hakimov_matematika"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
                    title="Instagram profil"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline ml-1">
                    @hakimov_matematika
                  </span>
                </div>

                {/* Like / Tashakkur tugmasi 👍 */}
                <button
                  type="button"
                  onClick={handleLikeQuvonchbek}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer border active:scale-95 ${
                    hasLikedQuvonchbek
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Tashakkur bildirish"
                >
                  <ThumbsUp className={`w-4 h-4 ${hasLikedQuvonchbek ? 'fill-current' : ''}`} />
                  <span>{quvonchbekLikes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. CONTACT SECTION                                           */}
      {/* ============================================================ */}
      <section id="aloqa" className="py-20 px-5 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/70 dark:border-slate-800">
        <div className="mb-14 text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Biz bilan bog'laning</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Savollaringiz bormi? Jamoamiz sizga yordam berishga va platformamiz bo'yicha to'liq ma'lumot berishga doim tayyor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="https://maps.app.goo.gl/fvLVGPUPqPTvJq6Q7"
            target="_blank"
            rel="noopener noreferrer"
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-3 shadow-xs group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Manzil</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Surxondaryo viloyati, Sho'rchi tumani, Cambridge School o'quv markazi
            </p>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline mt-1 flex items-center gap-1">
              Google Xaritada ko'rish <ArrowUpRight className="w-3 h-3" />
            </span>
          </a>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-3 shadow-xs group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Telefon</h3>
            <a href="tel:+998970753003" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              +998 97 075-30-03
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Qo'ng'iroqlar va SMS uchun
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-3 shadow-xs group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#0088cc] group-hover:text-white transition-all duration-300">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Telegram</h3>
            <a href="https://t.me/panji_soatov" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>@panji_soatov</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tezkor aloqa va savollar uchun
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FOOTER                                                    */}
      {/* ============================================================ */}
      <footer className="border-t border-slate-200/70 dark:border-slate-800 py-10 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white overflow-hidden shadow-xs">
              <img src="/logo.png" alt="Almath logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-lg text-slate-950 dark:text-white">Almath</span>
            <span className="text-xs text-slate-400">© 2026 Almath. Barcha huquqlar himoyalangan.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <a href="#kurslar" className="hover:text-indigo-600 transition-colors">Kurslar</a>
            <a href="#testlar" className="hover:text-indigo-600 transition-colors">Testlar</a>
            <a href="#biz-haqimizda" className="hover:text-indigo-600 transition-colors">Biz haqimizda</a>
            <a href="#aloqa" className="hover:text-indigo-600 transition-colors">Aloqa</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
