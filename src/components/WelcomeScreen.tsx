import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Calculator, Moon, Sun, ArrowRight, Star, Check, Trophy, Users, Search, BookOpen, GraduationCap, Award, Book, Youtube, Instagram, Send, ChevronLeft, ChevronRight, ChevronDown, Target, Zap, Shield, MessageCircle, Eye, Sparkles, Code, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { subscribeToCollection } from '../lib/db';
import { Newspaper } from 'lucide-react';
import { db } from '../lib/firebase';
import { formatDateUZ } from '../lib/utils';

interface WelcomeScreenProps {
  onLoginClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function WelcomeScreen({ onLoginClick, isDarkMode, toggleDarkMode }: WelcomeScreenProps) {
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [isContactFormSubmitted, setIsContactFormSubmitted] = useState(false);
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

  useEffect(() => {
    // Header shadow on scroll
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (headerRef.current) {
        if (currentScroll <= 0) {
          headerRef.current.classList.remove('shadow-lg');
          headerRef.current.classList.remove('shadow-md');
        } else if (currentScroll > lastScroll) {
          headerRef.current.classList.add('shadow-md');
        }
      }
      lastScroll = currentScroll;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Fade in animation
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll('.animate-fade-in');
      elements.forEach((el: Element, index: number) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.opacity = '0';
        htmlEl.style.transform = 'translateY(20px)';
        htmlEl.style.transition = 'all 0.8s ease-out';
        setTimeout(() => {
          htmlEl.style.opacity = '1';
          htmlEl.style.transform = 'translateY(0)';
        }, index * 200 + 100);
      });
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container relative">
      {/* TopNavBar */}
      <header ref={headerRef} className="bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-xl border-b border-outline-variant/30 dark:border-outline/20 sticky top-0 z-50 shadow-sm dark:shadow-none">
        <nav className="flex justify-between items-center w-full px-6 py-4 max-w-container-max mx-auto relative">
          <div className="flex items-center gap-stack-md">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg overflow-hidden">
              <img src="/logo.png" alt="Almath logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-headline-md font-headline-md font-extrabold text-on-surface dark:text-inverse-on-surface">Almath</span>
          </div>
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            <a href="#home" className="text-primary dark:text-inverse-primary bg-primary-container/20 dark:bg-primary-container/10 rounded-full px-4 py-1 font-label-md text-label-md">Bosh sahifa</a>
            <a href="#kurslar" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-1 transition-colors font-label-md text-label-md">Kurslar</a>
            <a href="#testlar" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-1 transition-colors font-label-md text-label-md">Testlar</a>
            <a href="#biz-haqimizda" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-1 transition-colors font-label-md text-label-md">Biz haqimizda</a>
            <a href="#aloqa" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-1 transition-colors font-label-md text-label-md">Aloqa</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all duration-300">
              <span className="material-symbols-outlined text-on-surface-variant">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button onClick={onLoginClick} className="hidden md:flex items-center gap-2 px-6 py-2 rounded-full border-2 border-primary text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-95 duration-200">
              <span className="material-symbols-outlined">person</span>
              Kabinet
            </button>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden p-2 flex items-center justify-center rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all duration-300"
            >
              <span className="material-symbols-outlined text-on-surface-variant">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </nav>
        {/* Mobile Nav Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-surface/95 dark:bg-inverse-surface/95 backdrop-blur-xl border-b border-outline-variant/30 dark:border-outline/20 shadow-lg px-6 py-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto z-40">
            <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="text-primary dark:text-inverse-primary bg-primary-container/20 dark:bg-primary-container/10 rounded-lg px-4 py-3 font-label-md text-label-md">Bosh sahifa</a>
            <a href="#kurslar" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-3 transition-colors font-label-md text-label-md">Kurslar</a>
            <a href="#testlar" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-3 transition-colors font-label-md text-label-md">Testlar</a>
            <a href="#biz-haqimizda" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-3 transition-colors font-label-md text-label-md">Biz haqimizda</a>
            <a href="#aloqa" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-3 transition-colors font-label-md text-label-md">Aloqa</a>
            
            <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col gap-3">
              <button onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }} className="flex md:hidden items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-all active:scale-95 duration-200">
                <span className="material-symbols-outlined">person</span>
                Kabinetga kirish
              </button>
            </div>
          </div>
        )}
      </header>

      <main ref={heroRef} className="hero-gradient" id="home">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-stack-lg animate-fade-in">

            
            {/* Headlines */}
            <div className="space-y-4">
              <h1 className="text-headline-lg-mobile md:text-display-xl font-display-xl leading-tight text-on-surface">
                Vazifalarni <span className="relative inline-block text-primary">
                  ishonch
                  <svg className="underline-svg" preserveAspectRatio="none" viewBox="0 0 100 20">
                    <path className="opacity-30" d="M0,15 C30,5 70,25 100,15" fill="transparent" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                  </svg>
                </span> bilan tekshiring
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl">
                O'qituvchilar uchun avtomatlashtirilgan tekshirish, batafsil tahlil va shaxsiy statistika — hammasi bir joyda.
              </p>
            </div>
            
            {/* Chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect shadow-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="text-label-md font-label-md text-on-surface-variant">Avtomatik tekshiruv</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect shadow-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                <span className="text-label-md font-label-md text-on-surface-variant">Sun'iy intellekt</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect shadow-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                <span className="text-label-md font-label-md text-on-surface-variant">Shaxsiy tahlil</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect shadow-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
                <span className="text-label-md font-label-md text-on-surface-variant">Aniq reyting</span>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={onLoginClick} className="px-10 py-4 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-3 hover:bg-primary-fixed-variant transition-all shadow-xl hover:shadow-2xl active:scale-95 group">
                Tizimga kirish
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <a href="https://t.me/panji_soatov" target="_blank" rel="noopener noreferrer" className="px-10 py-4 rounded-full bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 text-on-surface dark:text-inverse-on-surface font-label-md text-label-md flex items-center justify-center gap-3 hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all shadow-sm active:scale-95 group">
                Offline darslar uchun ro'yxatdan o'tish
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
          </div>
          
          {/* Hero Image Container */}
          <div className="relative group mt-12 lg:mt-0">
            <div className="absolute -inset-4 bg-primary/10 rounded-[40px] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative glass-effect rounded-[40px] overflow-hidden shadow-2xl p-4 border border-white/50">
              <img src="/hero.png" alt="ALMATH Hero" className="w-full h-auto rounded-[32px] transform group-hover:scale-[1.02] transition-transform duration-700" />
              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-12 left-12 w-16 h-16 bg-secondary/10 rounded-full blur-xl animate-bounce delay-700"></div>
            </div>
          </div>
        </section>
        
      </main>

      
      {news.length > 0 && (
        <section className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-surface dark:bg-inverse-surface">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold text-sm mb-6">
                <Newspaper className="w-4 h-4" /> E'lonlar va Yangiliklar
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface dark:text-inverse-on-surface mb-4">So'nggi yangiliklardan xabardor bo'ling</h2>
              <p className="text-on-surface-variant dark:text-inverse-on-surface-variant mb-6 text-lg">ALMATH platformasidagi eng so'nggi yangiliklar, o'zgarishlar va e'lonlar.</p>
            </div>
            <div className="md:w-2/3 grid gap-6">
              {news.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3).map((item) => (
                <div key={item.id} className="bg-surface-container-low dark:bg-surface-container-highest p-6 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 block">{item.createdAt ? formatDateUZ(item.createdAt) : item.date}</span>
                  <h3 className="text-xl font-bold text-on-surface dark:text-inverse-on-surface mb-3">{item.title}</h3>
                  <p className="text-on-surface-variant dark:text-inverse-on-surface-variant whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sections for Navigation Links */}
      <section id="kurslar" className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-surface dark:bg-inverse-surface">
        
        {/* Animated Courses Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-section-gap"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-primary font-label-md uppercase tracking-wider mb-2 block">Mukammal ta'lim</span>
              <h2 className="font-headline-md md:text-headline-lg text-headline-md md:text-headline-lg text-on-surface dark:text-inverse-on-surface mb-4">
                Matematika Kurslari
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant">
                Boshlang'ich darajadan to oliy matematikagacha bo'lgan to'liq, tizimli va interaktiv video darsliklar to'plami.
              </p>
            </div>
            <a className="text-primary font-label-md flex items-center gap-2 hover:bg-primary/10 px-6 py-3 rounded-full transition-colors whitespace-nowrap" href="#">
              Barcha kurslar
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group flex flex-col bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-primary/50 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Asosiy matematika" 
                  src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=600" 
                />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md">Boshlang'ich</span>
                  <span className="bg-surface/90 text-on-surface px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md backdrop-blur-sm">Ommabop</span>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="font-headline-md text-2xl mb-3 text-on-surface dark:text-inverse-on-surface group-hover:text-primary transition-colors">Milliy sertifikat</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-8 line-clamp-2">
                  Arifmetika, kasrlar, foizlar va sodda tenglamalar. Matematikani noldan o'rganishni istaganlar uchun eng yaxshi tanlov.
                </p>
                <div className="mt-auto pt-6 flex items-center justify-end">
                  <button className="w-12 h-12 rounded-full bg-primary-container/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                    <span className="material-symbols-outlined transform group-hover:rotate-45 transition-transform">arrow_outward</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Course 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group flex flex-col bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-tertiary/50 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-tertiary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Algebra va Analiz" 
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600" 
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md">O'rta daraja</span>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="font-headline-md text-2xl mb-3 text-on-surface dark:text-inverse-on-surface group-hover:text-tertiary transition-colors">SAT</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-8 line-clamp-2">
                  Funksiyalar, hosila, integral va ularning tatbiqlari. OTM ga tayyorlanuvchilar uchun maxsus intensiv kurs.
                </p>
                <div className="mt-auto pt-6 flex items-center justify-end">
                  <button className="w-12 h-12 rounded-full bg-tertiary-container/20 text-tertiary flex items-center justify-center group-hover:bg-tertiary group-hover:text-on-tertiary transition-all duration-300">
                    <span className="material-symbols-outlined transform group-hover:rotate-45 transition-transform">arrow_outward</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Course 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group flex flex-col bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-secondary/50 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-secondary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt="Oliy Matematika" 
                  src="https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600" 
                />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md">Murakkab</span>
                  <span className="bg-error text-on-error px-3 py-1 rounded-full text-label-sm font-label-sm shadow-md">Yangi</span>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="font-headline-md text-2xl mb-3 text-on-surface dark:text-inverse-on-surface group-hover:text-secondary transition-colors">Attestatsiya</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-8 line-clamp-2">
                  Chiziqli algebra, analitik geometriya va differensial tenglamalar. Talabalar va mutaxassislar uchun chuqurlashtirilgan dastur.
                </p>
                <div className="mt-auto pt-6 flex items-center justify-end">
                  <button className="w-12 h-12 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-300">
                    <span className="material-symbols-outlined transform group-hover:rotate-45 transition-transform">arrow_outward</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </section>
      {/* Animated Tests Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        id="testlar" 
        className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto bg-background dark:bg-inverse-surface border-t border-outline-variant/20"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-3xl">
            <span className="text-primary font-label-md uppercase tracking-wider mb-2 block">Imtihonlarga tayyorgarlik</span>
            <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-background dark:text-inverse-on-surface mb-4">
              Test turlari
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant">
              Qaysi imtihonga tayyorlanayotgan bo'lsangiz — bizda siz uchun maxsus, xalqaro va davlat standartlariga mos testlar mavjud.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Milliy Sertifikat */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/30 hover:border-primary/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary/5 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-primary-fixed-dim mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">workspace_premium</span>
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface dark:text-inverse-on-surface mb-3 group-hover:text-primary transition-colors">Milliy Sertifikat</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8 flex-grow">
                Milliy Sertifikat imtihoniga maxsus tayyorlangan test to'plamlari va moslashtirilgan o'quv materiallari.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container/20 text-primary dark:text-primary-fixed-dim font-label-sm text-label-sm">
                  0 ta test
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-primary hover:text-on-primary">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Attestatsiya */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/30 hover:border-tertiary/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-tertiary/5 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-tertiary/5 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary/10 text-tertiary dark:text-tertiary-fixed-dim mb-6 group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface dark:text-inverse-on-surface mb-3 group-hover:text-tertiary transition-colors">Attestatsiya</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8 flex-grow">
                O'qituvchilar uchun attestatsiya imtihoniga tayyorgarlik testlari. Bilimni baholash standarti.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-tertiary-container/20 text-tertiary dark:text-tertiary-fixed-dim font-label-sm text-label-sm">
                  2 ta test
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-tertiary hover:text-on-tertiary">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* SAT */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/30 hover:border-secondary/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-secondary/5 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary dark:text-secondary-fixed-dim mb-6 group-hover:bg-secondary group-hover:text-on-secondary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">public</span>
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface dark:text-inverse-on-surface mb-3 group-hover:text-secondary transition-colors">SAT</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8 flex-grow">
                SAT imtihoniga yo'naltirilgan matematika testlari. Xalqaro standartlar va talablar asosida.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-container/20 text-secondary dark:text-secondary-fixed-dim font-label-sm text-label-sm">
                  0 ta test
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-secondary hover:text-on-secondary">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* DTM */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group relative bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/30 hover:border-primary/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary/5 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-primary-fixed-dim mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
                <span className="material-symbols-outlined text-3xl">calculate</span>
              </div>
              <h3 className="font-headline-md text-2xl text-on-surface dark:text-inverse-on-surface mb-3 group-hover:text-primary transition-colors">DTM</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8 flex-grow">
                Davlat Test Markazi imtihoniga to'liq tayyorgarlik. Majburiy matematika bloki va maxsus fan testlari.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-container/20 text-primary dark:text-primary-fixed-dim font-label-sm text-label-sm">
                  1 ta test
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-primary hover:text-on-primary">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section id="biz-haqimizda" className="pt-24 pb-section-gap overflow-x-hidden border-t border-outline-variant/20 bg-background dark:bg-inverse-surface">
        
        {/* Yuqori Kirish Qismi */}
        <div className="relative py-16 px-gutter max-w-container-max mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:text-primary-fixed-dim text-sm font-semibold tracking-wide border border-primary/20"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>Biz haqimizda</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-black text-on-background dark:text-inverse-on-surface tracking-tight leading-tight"
            >
              Kelajak ta'limi va <span className="text-primary dark:text-primary-fixed-dim bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">matematik tafakkur</span> maskani
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-on-surface-variant dark:text-surface-variant font-body-lg text-base md:text-lg leading-relaxed"
            >
              Almath — bu shunchaki raqamli platforma emas. Bu matematikani chuqur mantiq, ilmiy tahlil va zavq bilan o'rganish, eng so'nggi pedagogik metodikalar hamda sun'iy intellekt texnologiyalarini birlashtirgan ilg'or ta'lim ekotizimidir.
            </motion.p>
          </div>

          {/* Asosiy ko'rsatkichlar / Metrikalar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-5 rounded-2xl bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/30 text-center shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-primary dark:text-primary-fixed-dim tracking-tight">50k+</div>
              <div className="text-xs md:text-sm font-medium text-on-surface-variant dark:text-surface-variant mt-1">Faol o'quvchilar</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="p-5 rounded-2xl bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/30 text-center shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">200+</div>
              <div className="text-xs md:text-sm font-medium text-on-surface-variant dark:text-surface-variant mt-1">Kurs va testlar</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="p-5 rounded-2xl bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/30 text-center shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">98%</div>
              <div className="text-xs md:text-sm font-medium text-on-surface-variant dark:text-surface-variant mt-1">Muvaffaqiyat ko'rsatkichi</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="p-5 rounded-2xl bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/30 text-center shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">24/7</div>
              <div className="text-xs md:text-sm font-medium text-on-surface-variant dark:text-surface-variant mt-1">Aqlli AI baholash</div>
            </motion.div>
          </div>
        </div>

        {/* Bizning missiyamiz - Animated */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-surface-container-low dark:bg-surface-container-highest py-section-gap relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

          <div className="max-w-container-max mx-auto px-gutter relative z-10">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg mb-4 text-on-background dark:text-inverse-on-surface">Bizning missiyamiz</h2>
              <div className="h-1.5 w-24 bg-primary dark:bg-primary-fixed-dim mx-auto rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileInView={{ x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full w-full bg-tertiary dark:bg-tertiary-fixed-dim"
                ></motion.div>
              </div>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Innovatsiya */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-16 h-16 bg-primary-container/30 dark:bg-primary-container/10 flex items-center justify-center rounded-full mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-primary/20">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-4xl">lightbulb</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-4 text-on-surface dark:text-inverse-on-surface group-hover:text-primary transition-colors">Innovatsiya</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md leading-relaxed">
                  Eng so'nggi texnologiyalar va ilg'or pedagogik metodikalarni birlashtirib, o'quvchilarga dunyo miqyosidagi zamonaviy bilim berish.
                </p>
              </motion.div>

              {/* Sifat */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 hover:border-tertiary/40 hover:shadow-xl hover:shadow-tertiary/5 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-16 h-16 bg-tertiary-container/30 dark:bg-tertiary-container/10 flex items-center justify-center rounded-full mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-tertiary/20">
                  <span className="material-symbols-outlined text-tertiary dark:text-tertiary-fixed-dim text-4xl">verified</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-4 text-on-surface dark:text-inverse-on-surface group-hover:text-tertiary transition-colors">Sifat</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md leading-relaxed">
                  Har bir o'quv kursi va test materiallari ekspertlar tomonidan sinchkovlik bilan tekshirilib, yuqori ta'lim standartlariga qat'iy muvofiqlashtiriladi.
                </p>
              </motion.div>

              {/* Hamjamiyat */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="w-16 h-16 bg-secondary-container/30 dark:bg-secondary-container/10 flex items-center justify-center rounded-full mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-secondary/20">
                  <span className="material-symbols-outlined text-secondary dark:text-secondary-fixed-dim text-4xl">groups</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-4 text-on-surface dark:text-inverse-on-surface group-hover:text-secondary transition-colors">Hamjamiyat</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md leading-relaxed">
                  Matematika ixlosmandlari va mutaxassislarni birlashtiruvchi, bir-birini qo'llab-quvvatlovchi va rivojlantiruvchi global o'quv muhitini yaratish.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Growth Timeline - Rivojlanish Yo'limiz (Qayta tiklangan va mukammallashtirilgan qism) */}
        <div className="py-section-gap bg-surface dark:bg-inverse-surface border-y border-outline-variant/20">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="md:w-1/3 md:sticky md:top-32 space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-primary-fixed-dim text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Bosqichma-bosqich</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-on-background dark:text-inverse-on-surface leading-tight">
                  Rivojlanish <br className="hidden md:inline"/>yo'limiz
                </h2>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-lg text-base leading-relaxed">
                  G'oyadan bugungi to'liq avtomatlashtirilgan raqamli platformagacha bo'lgan masofani biz qat'iyat, izlanish va ta'limga bo'lgan cheksiz muhabbat bilan bosib o'tdik.
                </p>
                <div className="flex gap-4 pt-2">
                  <div className="p-4 bg-primary-container/20 dark:bg-primary-container/10 border border-primary/20 rounded-2xl flex-1 text-center">
                    <div className="text-primary dark:text-primary-fixed-dim font-black text-2xl md:text-3xl">50k+</div>
                    <div className="text-on-surface-variant dark:text-surface-variant text-xs uppercase font-semibold mt-1">O'quvchilar</div>
                  </div>
                  <div className="p-4 bg-primary-container/20 dark:bg-primary-container/10 border border-primary/20 rounded-2xl flex-1 text-center">
                    <div className="text-primary dark:text-primary-fixed-dim font-black text-2xl md:text-3xl">200+</div>
                    <div className="text-on-surface-variant dark:text-surface-variant text-xs uppercase font-semibold mt-1">Kurslar</div>
                  </div>
                </div>
              </motion.div>

              <div className="md:w-2/3 space-y-10 relative">
                {/* 2021 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative pl-10 md:pl-12 border-l-2 border-primary/40 pb-8"
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 bg-primary dark:bg-primary-fixed-dim rounded-full outline outline-8 outline-primary/20 shadow-md"></div>
                  <span className="text-primary dark:text-primary-fixed-dim font-bold text-sm tracking-wide uppercase">2021 — Poydevor</span>
                  <h4 className="text-xl md:text-2xl font-bold mt-1.5 mb-3 text-on-background dark:text-inverse-on-surface">Birinchi qadamlar va innovatsion g'oya</h4>
                  <p className="text-on-surface-variant dark:text-surface-variant font-body-md leading-relaxed">
                    Kichik bir ustozlar jamoasining matematika ta'limini raqamlashtirish haqidagi orzusi va birinchi interaktiv darsliklar hamda mashg'ulotlarning yo'lga qo'yilishi.
                  </p>
                </motion.div>

                {/* 2022 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative pl-10 md:pl-12 border-l-2 border-primary/30 pb-8"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-primary/80 dark:bg-primary-fixed-dim rounded-full shadow-sm"></div>
                  <span className="text-primary dark:text-primary-fixed-dim font-bold text-sm tracking-wide uppercase">2022 — Kengayish</span>
                  <h4 className="text-xl md:text-2xl font-bold mt-1.5 mb-3 text-on-background dark:text-inverse-on-surface">Platformaning ilk versiyasi ishga tushishi</h4>
                  <p className="text-on-surface-variant dark:text-surface-variant font-body-md leading-relaxed">
                    Almath platformasi ilk talqini ishga tushirildi. Dastlabki 10,000 foydalanuvchi qamrab olindi va fundamental matematika bo'yicha maxsus sinov testlari platformaga yuklandi.
                  </p>
                </motion.div>

                {/* 2023 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative pl-10 md:pl-12 border-l-2 border-primary/20 pb-8"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-primary/60 dark:bg-primary-fixed-dim rounded-full shadow-sm"></div>
                  <span className="text-primary dark:text-primary-fixed-dim font-bold text-sm tracking-wide uppercase">2023 — E'tirof</span>
                  <h4 className="text-xl md:text-2xl font-bold mt-1.5 mb-3 text-on-background dark:text-inverse-on-surface">Olimpiada va sertifikatlarda yetakchilik</h4>
                  <p className="text-on-surface-variant dark:text-surface-variant font-body-md leading-relaxed">
                    O'quvchilarimiz Milliy sertifikat va xalqaro olimpiadalarda rekord darajada A va A+ natijalarni qayd etishdi. O'quv markazlari bilan integratsiya kengaytirildi.
                  </p>
                </motion.div>

                {/* 2024 - Bugun */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative pl-10 md:pl-12 border-l-2 border-emerald-500/30"
                >
                  <div className="absolute -left-2.5 top-0 w-5 h-5 bg-emerald-500 rounded-full outline outline-8 outline-emerald-500/20 shadow-md"></div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wide uppercase">2024 — Bugun</span>
                  <h4 className="text-xl md:text-2xl font-bold mt-1.5 mb-3 text-on-background dark:text-inverse-on-surface">Sun'iy intellekt davri va global ekotizim</h4>
                  <p className="text-on-surface-variant dark:text-surface-variant font-body-md leading-relaxed">
                    Sun'iy intellekt yordamida o'quvchilar daftardagi qo'lyozma yechimlarini tahlil qiluvchi AI baholash, real vaqtda davomat va to'lovlar tahlili hamda shaxsiylashtirilgan o'qitish tizimi to'liq joriy qilindi.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Jamoamiz - Batafsil Ta'rif va xodim1.png hamda xodim2.png rasmlari bilan */}
        <div className="py-section-gap bg-surface-container-low dark:bg-surface-container-highest relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-gutter relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary dark:text-primary-fixed-dim text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>Asoschilar va Yetakchilar</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-on-background dark:text-inverse-on-surface tracking-tight">
                Bizning jamoamiz
              </h2>
              <p className="text-on-surface-variant dark:text-surface-variant font-body-lg text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Muvaffaqiyatimiz poydevorida turgan tajribali ustozlar, metodistlar va ilg'or axborot texnologiyalari muhandislari bilan batafsil tanishing.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {/* Xodim 1: Panji Soatov */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-outline-variant/30 hover:border-primary/50 flex flex-col"
              >
                {/* Rasm va Vizual Qism */}
                <div className="h-80 sm:h-96 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <img 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out" 
                    alt="Panji Soatov" 
                    src="/xodim1.png"
                    onError={(e) => {
                      // Fallback agar png yuklanmasa jpg ga o'tish
                      (e.target as HTMLImageElement).src = '/xodim1.jpg';
                    }}
                  />
                  {/* Nishon / Badge */}
                  <div className="absolute top-4 left-4 z-20 bg-primary/90 text-on-primary backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Asoschi & CEO</span>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6 z-20 text-white">
                    <h4 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-sm">Panji Soatov</h4>
                    <p className="text-indigo-200 text-sm font-semibold mt-0.5">Asoschi va Bosh Ijrochi Direktor (CEO)</p>
                  </div>
                </div>

                {/* Batafsil Ta'rif Matni */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-primary-fixed-dim bg-primary/10 dark:bg-primary-container/20 w-fit px-3 py-1 rounded-lg">
                      <GraduationCap className="w-4 h-4" />
                      <span>8+ yillik pedagogik va metodik tajriba</span>
                    </div>

                    <p className="text-on-surface-variant dark:text-surface-variant text-sm md:text-base leading-relaxed">
                      Almath ta'lim platformasining g'oya muallifi va boshqaruvchisi. Nufuzli ta'lim dargohlarida 8 yildan ziyod faoliyat yuritib, yuzlab o'quvchilarni Prezident va ixtisoslashtirilgan maktablar, xalqaro hamda respublika matematika olimpiadalari, shuningdek Milliy Sertifikat (A+) imtihonlariga muvaffaqiyatli tayyorlagan.
                    </p>

                    <p className="text-on-surface-variant dark:text-surface-variant text-sm md:text-base leading-relaxed">
                      Murakkab matematik qonuniyatlarni sodda, ko'rgazmali va mantiqiy usulda tushuntirish bo'yicha maxsus mualliflik metodikasi yaratuvchisi. O'quvchilarda nafaqat formulalarni yodlash, balki chuqur mantiqiy tafakkur va mustaqil yechim topish qobiliyatini tarbiyalashni oliy maqsad deb biladi.
                    </p>

                    {/* Mutaxassislik yorliqlari */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container dark:bg-surface-container-highest text-on-surface">Oliy matematika</span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container dark:bg-surface-container-highest text-on-surface">Olimpiada masalalari</span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container dark:bg-surface-container-highest text-on-surface">Milliy sertifikat (A+)</span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container dark:bg-surface-container-highest text-on-surface">Ta'lim menejmenti</span>
                    </div>
                  </div>

                  {/* Ijtimoiy havolalar va Ko'rishlar soni */}
                  <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center mt-auto">
                    <div className="flex gap-2.5">
                      <a 
                        className="group/btn w-10 h-10 rounded-xl bg-surface-container-highest dark:bg-surface-container flex items-center justify-center text-on-surface-variant dark:text-surface-variant hover:bg-[#0088cc] dark:hover:bg-[#0088cc] hover:text-white dark:hover:text-white transition-all duration-300 shadow-xs hover:shadow-md border border-outline-variant/20 hover:border-transparent" 
                        href="https://t.me/panji_soatov" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label="Telegram: @panji_soatov"
                        title="Telegram orqali bog'lanish"
                      >
                        <i className="bi bi-telegram text-lg group-hover/btn:scale-110 group-hover/btn:-rotate-6 transition-transform duration-300"></i>
                      </a>
                      <a 
                        className="group/btn w-10 h-10 rounded-xl bg-surface-container-highest dark:bg-surface-container flex items-center justify-center text-on-surface-variant dark:text-surface-variant hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white dark:hover:text-white transition-all duration-300 shadow-xs hover:shadow-md border border-outline-variant/20 hover:border-transparent" 
                        href="https://instagram.com/soatov_matematika" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label="Instagram: @soatov_matematika"
                        title="Instagram sahifasini kuzatish"
                      >
                        <i className="bi bi-instagram text-lg group-hover/btn:scale-110 transition-transform duration-300"></i>
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant dark:text-surface-variant text-xs font-semibold bg-surface-container/60 px-3 py-1.5 rounded-full border border-outline-variant/20">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <span>{panjiViews} ko'rildi</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Xodim 2: Quvonchbek Hakimov */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="group relative bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-outline-variant/30 hover:border-indigo-500/50 flex flex-col"
              >
                {/* Rasm va Vizual Qism */}
                <div className="h-80 sm:h-96 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <img 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out" 
                    alt="Quvonchbek Hakimov" 
                    src="/xodim2.png"
                    onError={(e) => {
                      // Fallback agar png yuklanmasa jpg ga o'tish
                      (e.target as HTMLImageElement).src = '/xodim2.jpg';
                    }}
                  />
                  {/* Nishon / Badge */}
                  <div className="absolute top-4 left-4 z-20 bg-indigo-600/90 text-white backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <Code className="w-3.5 h-3.5" />
                    <span>CTO & Tizim me'mori</span>
                  </div>
                  <div className="absolute bottom-4 left-6 right-6 z-20 text-white">
                    <h4 className="text-2xl md:text-3xl font-black tracking-tight drop-shadow-sm">Quvonchbek Hakimov</h4>
                    <p className="text-indigo-200 text-sm font-semibold mt-0.5">Texnik Rahbar (CTO) | Bosh Tizim Arxitektori</p>
                  </div>
                </div>

                {/* Batafsil Ta'rif Matni */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 w-fit px-3 py-1 rounded-lg">
                      <Zap className="w-4 h-4" />
                      <span>4+ yillik IT, Sun'iy Intellekt va ta'lim tajribasi</span>
                    </div>

                    <p className="text-on-surface-variant dark:text-surface-variant text-sm md:text-base leading-relaxed">
                      Sun'iy intellekt (AI), zamonaviy bulutli arxitektura va raqamli ta'lim tizimlari bo'yicha yetakchi IT mutaxassisi hamda 4 yillik tajribaga ega matematika o'qituvchisi. Almath platformasining to'liq texnologik infratuzilmasi bosh me'mori.
                    </p>

                    <p className="text-on-surface-variant dark:text-surface-variant text-sm md:text-base leading-relaxed">
                      Platformada qo'lyozma vazifalar va testlarni avtomatlashtirilgan sun'iy intellekt yordamida tekshirish (AI Grader), real vaqtda davomat nazorati, to'lovlar tahlili va ko'p foydalanuvchili hisoblar tizimini noldan ishlab chiqqan. Zamonaviy IT imkoniyatlari orqali ta'limni har bir o'quvchi uchun qulay va shaffof qilish ustida ishlaydi.
                    </p>

                    {/* Mutaxassislik yorliqlari */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container dark:bg-surface-container-highest text-on-surface">Sun'iy Intellekt (AI Grader)</span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container dark:bg-surface-container-highest text-on-surface">Full-Stack Arxitektura</span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container dark:bg-surface-container-highest text-on-surface">Bulutli Infratuzilma</span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container dark:bg-surface-container-highest text-on-surface">UI/UX Muhandisligi</span>
                    </div>
                  </div>

                  {/* Ijtimoiy havolalar va Ko'rishlar soni */}
                  <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center mt-auto">
                    <div className="flex gap-2.5">
                      <a 
                        className="group/btn w-10 h-10 rounded-xl bg-surface-container-highest dark:bg-surface-container flex items-center justify-center text-on-surface-variant dark:text-surface-variant hover:bg-[#0088cc] dark:hover:bg-[#0088cc] hover:text-white dark:hover:text-white transition-all duration-300 shadow-xs hover:shadow-md border border-outline-variant/20 hover:border-transparent" 
                        href="https://t.me/quvonchbek_hakimov" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label="Telegram: @quvonchbek_hakimov"
                        title="Telegram orqali bog'lanish"
                      >
                        <i className="bi bi-telegram text-lg group-hover/btn:scale-110 group-hover/btn:-rotate-6 transition-transform duration-300"></i>
                      </a>
                      <a 
                        className="group/btn w-10 h-10 rounded-xl bg-surface-container-highest dark:bg-surface-container flex items-center justify-center text-on-surface-variant dark:text-surface-variant hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white dark:hover:text-white transition-all duration-300 shadow-xs hover:shadow-md border border-outline-variant/20 hover:border-transparent" 
                        href="https://instagram.com/hakimov_matematika" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label="Instagram: @hakimov_matematika"
                        title="Instagram sahifasini kuzatish"
                      >
                        <i className="bi bi-instagram text-lg group-hover/btn:scale-110 transition-transform duration-300"></i>
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 text-on-surface-variant dark:text-surface-variant text-xs font-semibold bg-surface-container/60 px-3 py-1.5 rounded-full border border-outline-variant/20">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{quvonchbekViews} ko'rildi</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Zamonaviy CTA Section (Chaqiruv Bo'limi) */}
        <div className="py-section-gap px-gutter bg-background dark:bg-inverse-surface">
          <div className="max-w-container-max mx-auto bg-gradient-to-br from-indigo-700 via-primary to-indigo-900 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-block px-4 py-1.5 bg-white/15 text-white rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                Birga yuksalaylik
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Siz ham jamoamizning bir qismiga aylaning
              </h2>
              <p className="text-indigo-100 font-body-lg text-base md:text-lg leading-relaxed">
                Biz bilan birga kelajak ta'limini yarating, matematik tafakkurni rivojlantiring va o'z orzuingizdagi natijalarga erishing.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <button 
                  onClick={onLoginClick}
                  className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl text-base shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Hozir boshlang
                </button>
                <a 
                  href="#aloqa"
                  className="bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all inline-flex items-center justify-center cursor-pointer"
                >
                  Biz bilan bog'lanish
                </a>
              </div>
            </div>
          </div>
        </div>

      </section>
      <section id="aloqa" className="pt-24 pb-section-gap bg-background dark:bg-inverse-surface border-t border-outline-variant/20">
        <div className="px-gutter max-w-container-max mx-auto">
          {/* Header Section */}
          <div className="mb-16 text-center animate-fade-in">
            <h2 className="font-display-md md:font-display-xl text-headline-lg-mobile md:text-display-xl text-on-background dark:text-inverse-on-surface mb-4 leading-tight">Biz bilan bog'laning</h2>
            <p className="font-body-lg text-body-lg text-secondary dark:text-secondary-fixed max-w-2xl mx-auto">
                Savollaringiz bormi? Bizning jamoamiz sizga yordam berishga va platformamiz bo'yicha har qanday ma'lumotni taqdim etishga tayyor.
            </p>
          </div>
          
          {/* Bento Contact Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              <div className="glass-effect p-8 rounded-xl flex flex-col items-center text-center gap-4 shadow-sm border border-outline-variant/30 hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 mb-2">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">location_on</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface dark:text-inverse-on-surface mb-2">Manzil</p>
                    <p className="font-body-md text-body-md text-secondary dark:text-secondary-fixed">Surxondaryo viloyati, Sho'rchi tumani, Cambridge School o'quv markazi</p>
                  </div>
              </div>

              <div className="glass-effect p-8 rounded-xl flex flex-col items-center text-center gap-4 shadow-sm border border-outline-variant/30 hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 mb-2">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">call</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface dark:text-inverse-on-surface mb-2">Telefon</p>
                    <a className="font-body-md text-body-md text-secondary dark:text-secondary-fixed hover:text-primary dark:hover:text-primary-fixed-dim transition-colors block" href="tel:+998711234567">+998 71 123-45-67</a>
                  </div>
              </div>

              <div className="glass-effect p-8 rounded-xl flex flex-col items-center text-center gap-4 shadow-sm border border-outline-variant/30 hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 mb-2">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">send</span>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg text-on-surface dark:text-inverse-on-surface mb-2">Telegram</p>
                    <a className="font-body-md text-body-md text-secondary dark:text-secondary-fixed hover:text-primary dark:hover:text-primary-fixed-dim transition-colors block" href="https://t.me/almath_uz">@almath_uz</a>
                  </div>
              </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-surface-container-lowest border-t border-outline-variant/20 py-12">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter flex flex-col md:flex-row justify-between items-center gap-stack-md">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-stack-md">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary overflow-hidden">
                <img src="/logo.png" alt="Almath logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-headline-md font-headline-md text-on-surface dark:text-inverse-on-surface">Almath</span>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant text-center md:text-left">© 2024 Almath. Barcha huquqlar himoyalangan.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary underline transition-all text-label-sm font-label-sm">Xavfsizlik</a>
            <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary underline transition-all text-label-sm font-label-sm">Maxfiylik siyosati</a>
            <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary underline transition-all text-label-sm font-label-sm">Foydalanish shartlari</a>
            <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary underline transition-all text-label-sm font-label-sm">Yordam markazi</a>
          </div>
          
          <div className="flex gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/30 hover:bg-primary/5 transition-all focus:outline-none ring-2 ring-primary ring-offset-2 ring-opacity-0 focus:ring-opacity-100">
              <span className="material-symbols-outlined text-primary">public</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/30 hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-primary">alternate_email</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
