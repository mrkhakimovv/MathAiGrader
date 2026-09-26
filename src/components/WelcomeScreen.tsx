import React, { useState, useEffect, useRef } from 'react';
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
  Check
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { subscribeToCollection } from '../lib/db';
import { db } from '../lib/firebase';
import { formatDateUZ } from '../lib/utils';

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
      <section id="home" className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        {/* Subtle Ambient Glow & Grid Backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines, Chips, CTAs (7 columns) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Top Micro-Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Almath 3.0
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                Aqlli matematika ekotizimi <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
                Vazifalarni{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                    ishonch
                  </span>
                  {/* Modern dynamic highlight underline */}
                  <svg className="absolute -bottom-2.5 left-0 w-full h-3.5 text-indigo-500/70" viewBox="0 0 100 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 9C28 3 72 3 98 9" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                  </svg>
                </span>{' '}
                bilan tekshiring
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
                O'qituvchilar uchun avtomatlashtirilgan tekshirish, batafsil tahlil va shaxsiy statistika — hammasi yagona zamonaviy muhitda.
              </p>
            </motion.div>

            {/* 4 Feature Chips */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-2.5 sm:gap-3"
            >
              {/* Chip 1 */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/80 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Avtomatik tekshiruv</span>
              </div>

              {/* Chip 2 */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/80 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Sun'iy intellekt</span>
              </div>

              {/* Chip 3 */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-950/80 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all">
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Shaxsiy tahlil</span>
              </div>

              {/* Chip 4 */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-950/80 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all">
                <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Aniq reyting</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <button 
                onClick={onLoginClick} 
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Tizimga kirish</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a 
                href="https://t.me/panji_soatov" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 font-bold text-sm shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Offline darslar uchun ro'yxatdan o'tish</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </a>
            </motion.div>
          </div>

          {/* Right Column: High-End 3D Hero Visual (5 columns) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative group"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-600/25 via-blue-500/20 to-violet-600/25 rounded-[44px] blur-3xl opacity-60 group-hover:opacity-85 transition-opacity"></div>
            
            {/* Main Visual Box */}
            <div className="relative rounded-[36px] p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white dark:border-slate-800 shadow-2xl shadow-indigo-500/10 overflow-hidden">
              <img 
                src="/hero.png" 
                alt="ALMATH Hero" 
                className="w-full h-auto rounded-[28px] object-cover transform group-hover:scale-[1.015] transition-transform duration-700" 
              />

              {/* Floating Badge 1 - Top Left: 99.4% Aniqlik */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 left-6 hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-xl"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">99.4% Aniqlik</div>
                  <div className="text-[10px] font-medium text-slate-500">AI Tekshiruv</div>
                </div>
              </motion.div>

              {/* Floating Badge 2 - Bottom Right: 2.4s Tezkor Tekshiruv */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-6 right-6 hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-xl"
              >
                <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">2.4 soniya</div>
                  <div className="text-[10px] font-medium text-slate-500">Baholash tezligi</div>
                </div>
              </motion.div>
            </div>
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
      {/* 4. NEWS & ANNOUNCEMENTS (if any)                             */}
      {/* ============================================================ */}
      {news.length > 0 && (
        <section className="py-16 px-5 sm:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="md:w-1/3 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold text-xs">
                <Newspaper className="w-3.5 h-3.5" />
                <span>E'lonlar va Yangiliklar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                So'nggi yangiliklardan xabardor bo'ling
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ALMATH platformasidagi eng so'nggi yangiliklar, o'zgarishlar va e'lonlar.
              </p>
            </div>

            <div className="md:w-2/3 grid gap-4 sm:grid-cols-2">
              {news.sort((a, b) => b.createdAt - a.createdAt).slice(0, 4).map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
                >
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 block">
                    {item.createdAt ? formatDateUZ(item.createdAt) : item.date}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Panji Soatov */}
          <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="h-80 sm:h-96 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img 
                src="/xodim1.png" 
                alt="Panji Soatov" 
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = '/xodim1.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Asoschi & CEO</span>
              </div>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <h4 className="text-2xl font-black">Panji Soatov</h4>
                <p className="text-indigo-200 text-xs font-semibold mt-0.5">Asoschi va Bosh Ijrochi Direktor</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 w-fit px-3 py-1 rounded-lg">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Pedagogik tajriba va ta'lim boshqaruvi</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Almath ta'lim platformasining g'oya muallifi va boshqaruvchisi. Yuzlab o'quvchilarni Prezident va ixtisoslashtirilgan maktablar, matematika olimpiadalari hamda Milliy Sertifikat (A+) imtihonlariga tayyorlagan.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Oliy matematika</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Milliy sertifikat (A+)</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Ta'lim menejmenti</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <a 
                  href="https://t.me/panji_soatov" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Telegram orqali bog'lanish</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{panjiViews} ko'rildi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quvonchbek Hakimov */}
          <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="h-80 sm:h-96 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img 
                src="/xodim2.png" 
                alt="Quvonchbek Hakimov" 
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = '/xodim2.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Code className="w-3.5 h-3.5" />
                <span>CTO & Tizim me'mori</span>
              </div>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <h4 className="text-2xl font-black">Quvonchbek Hakimov</h4>
                <p className="text-indigo-200 text-xs font-semibold mt-0.5">Texnik Rahbar (CTO) | Bosh Arxitektor</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 w-fit px-3 py-1 rounded-lg">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Sun'iy Intellekt va zamonaviy Full-Stack arxitektura</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sun'iy intellekt (AI Grader), zamonaviy bulutli tizimlar va raqamli ta'lim bo'yicha yetakchi IT mutaxassisi. Qo'lyozma vazifalarni avtomatlashtirilgan sun'iy intellekt orqali tekshirish tizimini noldan ishlab chiqqan.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Sun'iy Intellekt (AI Grader)</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Full-Stack Arxitektura</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Bulutli Infratuzilma</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <a 
                  href="https://t.me/quvonchbek_hakimov" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Telegram orqali bog'lanish</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>{quvonchbekViews} ko'rildi</span>
                </div>
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
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center gap-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Manzil</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Surxondaryo viloyati, Sho'rchi tumani, Cambridge School o'quv markazi
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center gap-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Telefon</h3>
            <a href="tel:+998711234567" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              +998 71 123-45-67
            </a>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center gap-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Telegram</h3>
            <a href="https://t.me/almath_uz" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              @almath_uz
            </a>
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
