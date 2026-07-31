import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Calculator, Moon, Sun, ArrowRight, Star, Check, Trophy, Users, Search, BookOpen, GraduationCap, Award, Book, Youtube, Instagram, Send, ChevronLeft, ChevronRight, ChevronDown, Target, Zap, Shield, MessageCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onLoginClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const faqData = [
  {
    category: "Kurslar haqida",
    color: "bg-primary",
    items: [
      { q: "Kurslarni qanday boshlash mumkin?", a: "Kursni boshlash uchun avval ro'yxatdan o'ting, so'ngra \"Kurslar\" bo'limidan o'zingizga ma'qul bo'lgan kursni tanlab, \"Sotib olish\" tugmasini bosing. To'lov tasdiqlangach, kurs materiallari avtomatik ravishda shaxsiy kabinetingizda paydo bo'ladi." },
      { q: "Sertifikat beriladimi?", a: "Ha, kursni to'liq tamomlagan va yakuniy imtihonlarni muvaffaqiyatli topshirgan barcha talabalarga Almath platformasining rasmiy elektron sertifikati taqdim etiladi." }
    ]
  },
  {
    category: "To'lov tizimi",
    color: "bg-tertiary-container",
    items: [
      { q: "Qanday to'lov usullari mavjud?", a: "Biz Click, Payme, Uzum va Visa/Mastercard kabi barcha ommabop to'lov tizimlarini qabul qilamiz. Shuningdek, xalqaro foydalanuvchilar uchun Stripe va PayPal tizimlari ham mavjud." },
      { q: "To'lovdan keyin qaytarib berish kafolati bormi?", a: "Ha, agar kurs sizga ma'qul kelmasa, birinchi 3 kun ichida to'lovni 100% qaytarib olishingiz mumkin. Bunda hech qanday ortiqcha savollar berilmaydi." }
    ]
  },
  {
    category: "Texnik yordam",
    color: "bg-secondary",
    items: [
      { q: "Videolar yuklanmay qolsa nima qilish kerak?", a: "Birinchi navbatda internet tezligingizni tekshiring. Muammo davom etsa, brauzer keshini tozalang yoki boshqa brauzer orqali kirib ko'ring. Agar bu ham yordam bermasa, texnik guruhimizga yozing." }
    ]
  }
];

function FaqAccordionItem({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div className={`glass-effect rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-primary/20' : ''}`}>
      <button className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors group focus:outline-none" onClick={onClick}>
        <span className="font-body-lg text-body-lg font-semibold text-on-surface-variant dark:text-surface-variant group-hover:text-primary transition-colors">{question}</span>
        <span className={`material-symbols-outlined transition-transform duration-300 text-outline ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="font-body-md text-body-md text-secondary dark:text-secondary-fixed">{answer}</p>
      </div>
    </div>
  );
}

export function WelcomeScreen({ onLoginClick, isDarkMode, toggleDarkMode }: WelcomeScreenProps) {
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [searchFaq, setSearchFaq] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>(null);
  const [isContactFormSubmitted, setIsContactFormSubmitted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg overflow-hidden">
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
            <a href="#faq" className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-1 transition-colors font-label-md text-label-md">FAQ</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-all duration-300">
              <span className="material-symbols-outlined text-on-surface-variant">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button onClick={onLoginClick} className="hidden md:flex items-center gap-2 px-6 py-2 rounded-full border-2 border-primary text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-95 duration-200">
              <span className="material-symbols-outlined">person</span>
              Kabinet
            </button>
            <button className="hidden sm:block p-2 rounded-full bg-primary text-on-primary shadow-md hover:shadow-lg transition-all active:scale-95 duration-200">
              <span className="material-symbols-outlined">search</span>
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
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary px-4 py-3 transition-colors font-label-md text-label-md">FAQ</a>
            
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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/10 border border-primary/20 text-primary-container font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span>Real testlar · Real natijalar</span>
            </div>
            
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
              <button className="px-10 py-4 rounded-full bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 text-on-surface dark:text-inverse-on-surface font-label-md text-label-md flex items-center justify-center gap-3 hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-all shadow-sm active:scale-95 group">
                Bepul ro'yxatdan o'tish
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
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
                <div className="flex items-center gap-4 text-label-sm text-on-surface-variant dark:text-surface-variant mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">play_circle</span> 42 dars</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span> 18 soat</span>
                  <span className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 4.9</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-3 text-on-surface dark:text-inverse-on-surface group-hover:text-primary transition-colors">Matematika Asoslari</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-8 line-clamp-2">
                  Arifmetika, kasrlar, foizlar va sodda tenglamalar. Matematikani noldan o'rganishni istaganlar uchun eng yaxshi tanlov.
                </p>
                <div className="mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Ali+Valiyev&background=e0e3e5&color=191c1e" alt="Instructor" className="w-10 h-10 rounded-full border-2 border-surface" />
                    <div>
                      <div className="text-label-sm font-bold text-on-surface dark:text-inverse-on-surface">Ali Valiyev</div>
                      <div className="text-[11px] text-on-surface-variant dark:text-surface-variant">Oliy toifali o'qituvchi</div>
                    </div>
                  </div>
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
                <div className="flex items-center gap-4 text-label-sm text-on-surface-variant dark:text-surface-variant mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">play_circle</span> 64 dars</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span> 32 soat</span>
                  <span className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 4.8</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-3 text-on-surface dark:text-inverse-on-surface group-hover:text-tertiary transition-colors">Algebra va Analiz</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-8 line-clamp-2">
                  Funksiyalar, hosila, integral va ularning tatbiqlari. OTM ga tayyorlanuvchilar uchun maxsus intensiv kurs.
                </p>
                <div className="mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Malika+Azizova&background=e0e3e5&color=191c1e" alt="Instructor" className="w-10 h-10 rounded-full border-2 border-surface" />
                    <div>
                      <div className="text-label-sm font-bold text-on-surface dark:text-inverse-on-surface">Malika Azizova</div>
                      <div className="text-[11px] text-on-surface-variant dark:text-surface-variant">PhD, Professor</div>
                    </div>
                  </div>
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
                <div className="flex items-center gap-4 text-label-sm text-on-surface-variant dark:text-surface-variant mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">play_circle</span> 85 dars</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">schedule</span> 45 soat</span>
                  <span className="flex items-center gap-1 text-primary"><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 5.0</span>
                </div>
                <h3 className="font-headline-md text-2xl mb-3 text-on-surface dark:text-inverse-on-surface group-hover:text-secondary transition-colors">Oliy Matematika</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md mb-8 line-clamp-2">
                  Chiziqli algebra, analitik geometriya va differensial tenglamalar. Talabalar va mutaxassislar uchun chuqurlashtirilgan dastur.
                </p>
                <div className="mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://ui-avatars.com/api/?name=Rustam+Umarov&background=e0e3e5&color=191c1e" alt="Instructor" className="w-10 h-10 rounded-full border-2 border-surface" />
                    <div>
                      <div className="text-label-sm font-bold text-on-surface dark:text-inverse-on-surface">Rustam Umarov</div>
                      <div className="text-[11px] text-on-surface-variant dark:text-surface-variant">Xalqaro ekspert</div>
                    </div>
                  </div>
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-primary-fixed-dim mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary dark:text-tertiary-fixed-dim mb-6 group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors duration-300 shadow-sm">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary dark:text-secondary-fixed-dim mb-6 group-hover:bg-secondary group-hover:text-on-secondary transition-colors duration-300 shadow-sm">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:text-primary-fixed-dim mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
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
                <div className="w-16 h-16 bg-primary-container/30 dark:bg-primary-container/10 flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-primary/20">
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
                <div className="w-16 h-16 bg-tertiary-container/30 dark:bg-tertiary-container/10 flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-tertiary/20">
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
                <div className="w-16 h-16 bg-secondary-container/30 dark:bg-secondary-container/10 flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-secondary/20">
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



        {/* Jamoamiz */}
        <div className="py-section-gap bg-surface-container-low dark:bg-surface-container-highest relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-gutter relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg mb-4 text-on-background dark:text-inverse-on-surface">Bizning jamoamiz</h2>
              <p className="text-on-surface-variant dark:text-surface-variant font-body-lg text-body-lg max-w-2xl mx-auto">Muvaffaqiyatimiz ortida turgan tajribali ustozlar va texnologiya ixlosmandlari bilan tanishing.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Team Member 1 */}
              <div className="group relative bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="h-64 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Team member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBrLsUeyTzhqhPzdUGBFB3DfiUe2kIV-D5zRIKIH08uEp6CDaE86dJywgdkUh-g652UH1D427E8rHSistdcupfgX-8-tiZsYlPQY8lMMKbozvTn6Hxiz34RyDAkL8v1cCUAUUYBGpw7jWR7kSKUY6R-bppzvPptaTYIh18aWM_C57_sT3IYKFcD4rGZBZQf2U7X0FiN27JP9fHZKXM37QLcGW8E4pWfGv2HdQTFnkUUUGUMV18sQt_"/>
                </div>
                <div className="p-6">
                  <h4 className="font-headline-md text-headline-md mb-1 text-on-background dark:text-inverse-on-surface">Akmal Salimov</h4>
                  <p className="text-primary dark:text-primary-fixed-dim font-label-md text-label-md mb-4">Asoschi va CEO</p>
                  <div className="flex gap-3">
                    <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#"><span className="material-symbols-outlined text-xl">language</span></a>
                    <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#"><span className="material-symbols-outlined text-xl">mail</span></a>
                  </div>
                </div>
              </div>
              {/* Team Member 2 */}
              <div className="group relative bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="h-64 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Team member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhPpDJjfCWMwtx7NuyaK7KripkK-8bgy1sQWsqZsij2t1SPYw5_-LtEuLnyKVH7DG11cWzcth1DYXQERJc3zsotbIjCADs5kYe5slfX9U8tNwmThBCH76I-Ia58UM1ZaQgckEL6kWYBUU5yY0Nc3dp2dYgqxxmN7wO_DaBDbp-qpbTj3Ihym0GAn9Ff5S2xIbJbpg6b7dIIo1T_NR282CfONfFXW8KFiYkWLCJnthQ-64CNaxZA3q7"/>
                </div>
                <div className="p-6">
                  <h4 className="font-headline-md text-headline-md mb-1 text-on-background dark:text-inverse-on-surface">Diyora Omonova</h4>
                  <p className="text-primary dark:text-primary-fixed-dim font-label-md text-label-md mb-4">Bosh metodist</p>
                  <div className="flex gap-3">
                    <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#"><span className="material-symbols-outlined text-xl">language</span></a>
                    <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#"><span className="material-symbols-outlined text-xl">mail</span></a>
                  </div>
                </div>
              </div>
              {/* Team Member 3 */}
              <div className="group relative bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="h-64 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Team member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA44RHNV6_OPf-FmbVjW3M3YmSo3Jc8SqS3COUw9x44TxtaQMNFYE7Hx326KjqJg8ASfN0fXsw-Nq9UE9TeVtsHDJ3paEQp0auB_qcHXVdwykMcBR2wOZwUaBvBT9ww0Snf36Cj6ZSTpDqxAF8MQA1cWP1CguxlJjR84JTts6fOLN9uxnnka_j6JqU8yS40qEH9zzP8xUnHoPP1uBhHYG1n9RaV0tBpArQYrFZuX_AMT92VVvsCcPgr"/>
                </div>
                <div className="p-6">
                  <h4 className="font-headline-md text-headline-md mb-1 text-on-background dark:text-inverse-on-surface">Rustam Shokirov</h4>
                  <p className="text-primary dark:text-primary-fixed-dim font-label-md text-label-md mb-4">Akademik maslahatchi</p>
                  <div className="flex gap-3">
                    <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#"><span className="material-symbols-outlined text-xl">language</span></a>
                    <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#"><span className="material-symbols-outlined text-xl">mail</span></a>
                  </div>
                </div>
              </div>
              {/* Team Member 4 */}
              <div className="group relative bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="h-64 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Team member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaMjpMXQWcBT0v2PWAPPRNTswMxjtptVkAgE-pECYj7255NvMHRN8MvwYZIPJS4NqP-LYIbrjAhVEUKhE7GNeK64cXSDRF1OI0ug364eh_aD917gbOaP1qZyGLfRSfbPM40ezAM3dQIohkghGcw0odCDpT6Sw55c6wQn_MJQSuOF06I-zTV9MM8SkwOqs3BfLwZbxXz60QW86R1AAxHy0bGeK0IyMfOycB7vSalIcnfB_y1tr6qGM9"/>
                </div>
                <div className="p-6">
                  <h4 className="font-headline-md text-headline-md mb-1 text-on-background dark:text-inverse-on-surface">Jasur Alimov</h4>
                  <p className="text-primary dark:text-primary-fixed-dim font-label-md text-label-md mb-4">Dizayn rahbari</p>
                  <div className="flex gap-3">
                    <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#"><span className="material-symbols-outlined text-xl">language</span></a>
                    <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="#"><span className="material-symbols-outlined text-xl">mail</span></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* CTA Section */}
        <div className="py-section-gap px-gutter bg-background dark:bg-inverse-surface">
          <div className="max-w-container-max mx-auto bg-primary rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-primary">Siz ham jamoamizning bir qismiga aylaning</h2>
              <p className="text-on-primary-container font-body-lg text-body-lg">Biz bilan birga kelajak ta'limini yarating va matematika dunyosini o'zgartiring.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-on-primary text-primary px-8 py-4 rounded-2xl font-label-md text-label-md hover:scale-105 transition-transform active:scale-95">Hozir boshlang</button>
                <button className="bg-transparent border-2 border-on-primary text-on-primary px-8 py-4 rounded-2xl font-label-md text-label-md hover:bg-on-primary/10 transition-colors active:scale-95">Biz bilan bog'lanish</button>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
             {/* Contact Info Column (Bento Left) */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Contact Card */}
              <div className="glass-effect p-8 rounded-xl flex flex-col gap-6 shadow-sm border border-outline-variant/30">
                <h3 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim">Aloqa ma'lumotlari</h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">location_on</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface dark:text-inverse-on-surface">Manzil</p>
                    <p className="font-body-md text-body-md text-secondary dark:text-secondary-fixed">Toshkent shahri, Yunusobod tumani, Amir Temur ko'chasi 108-uy</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">call</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface dark:text-inverse-on-surface">Telefon</p>
                    <a className="font-body-md text-body-md text-secondary dark:text-secondary-fixed hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="tel:+998711234567">+998 71 123-45-67</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">mail</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface dark:text-inverse-on-surface">Email</p>
                    <a className="font-body-md text-body-md text-secondary dark:text-secondary-fixed hover:text-primary dark:hover:text-primary-fixed-dim transition-colors" href="mailto:info@almath.uz">info@almath.uz</a>
                  </div>
                </div>
              </div>
              
              {/* Social Media Card */}
              <div className="glass-effect p-8 rounded-xl shadow-sm border border-outline-variant/30">
                <h3 className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim mb-6">Ijtimoiy tarmoqlarimiz</h3>
                <div className="flex gap-4">
                  <a className="w-12 h-12 rounded-full bg-surface-container dark:bg-surface-container-highest flex items-center justify-center hover:bg-primary dark:hover:bg-primary-fixed-dim hover:text-on-primary dark:hover:text-on-primary-fixed transition-all duration-300" href="#">
                    <span className="material-symbols-outlined text-on-surface dark:text-inverse-on-surface group-hover:text-inherit">alternate_email</span>
                  </a>
                  <a className="w-12 h-12 rounded-full bg-surface-container dark:bg-surface-container-highest flex items-center justify-center hover:bg-primary dark:hover:bg-primary-fixed-dim hover:text-on-primary dark:hover:text-on-primary-fixed transition-all duration-300" href="#">
                    <span className="material-symbols-outlined text-on-surface dark:text-inverse-on-surface group-hover:text-inherit">send</span>
                  </a>
                  <a className="w-12 h-12 rounded-full bg-surface-container dark:bg-surface-container-highest flex items-center justify-center hover:bg-primary dark:hover:bg-primary-fixed-dim hover:text-on-primary dark:hover:text-on-primary-fixed transition-all duration-300" href="#">
                    <span className="material-symbols-outlined text-on-surface dark:text-inverse-on-surface group-hover:text-inherit">public</span>
                  </a>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="glass-effect p-8 rounded-xl shadow-sm border border-outline-variant/30 flex-grow">
                <h3 className="font-label-md text-label-md text-primary dark:text-primary-fixed-dim mb-4">Ish vaqti</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between font-body-md">
                    <span className="text-secondary dark:text-secondary-fixed">Dushanba - Juma</span>
                    <span className="text-on-surface dark:text-inverse-on-surface font-semibold">09:00 - 18:00</span>
                  </li>
                  <li className="flex justify-between font-body-md">
                    <span className="text-secondary dark:text-secondary-fixed">Shanba</span>
                    <span className="text-on-surface dark:text-inverse-on-surface font-semibold">10:00 - 15:00</span>
                  </li>
                  <li className="flex justify-between font-body-md">
                    <span className="text-secondary dark:text-secondary-fixed">Yakshanba</span>
                    <span className="text-error font-semibold">Yopiq</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Contact Form (Bento Center-Right) */}
            <div className="lg:col-span-8 glass-effect p-8 md:p-12 rounded-xl shadow-sm border border-outline-variant/30 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
              <h3 className="font-headline-md text-headline-md text-on-background dark:text-inverse-on-surface mb-8 relative z-10">Bizga xabar qoldiring</h3>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10" onSubmit={(e) => {
                e.preventDefault();
                setIsContactFormSubmitted(true);
              }}>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant" htmlFor="name">Ismingiz</label>
                  <input className="w-full bg-surface-container-lowest/50 dark:bg-surface-container-highest/50 border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline-variant text-on-surface dark:text-inverse-on-surface" id="name" placeholder="Ismingizni kiriting" required type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant" htmlFor="email">Email manzilingiz</label>
                  <input className="w-full bg-surface-container-lowest/50 dark:bg-surface-container-highest/50 border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline-variant text-on-surface dark:text-inverse-on-surface" id="email" placeholder="example@mail.com" required type="email" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant" htmlFor="subject">Mavzu</label>
                  <input className="w-full bg-surface-container-lowest/50 dark:bg-surface-container-highest/50 border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline-variant text-on-surface dark:text-inverse-on-surface" id="subject" placeholder="Qanday masala bo'yicha bog'lanyapsiz?" required type="text" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant" htmlFor="message">Xabar matni</label>
                  <textarea className="w-full bg-surface-container-lowest/50 dark:bg-surface-container-highest/50 border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline-variant text-on-surface dark:text-inverse-on-surface" id="message" placeholder="Xabaringizni bu yerga yozing..." required rows={5}></textarea>
                </div>
                <div className="md:col-span-2 mt-4">
                  <button className="w-full md:w-auto bg-primary text-on-primary px-10 py-4 rounded-lg font-label-md flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] transition-all duration-200" type="submit" disabled={isContactFormSubmitted}>
                    Xabarni yuborish
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </form>

              {/* Success Message */}
              {isContactFormSubmitted && (
                <div className="absolute inset-0 bg-surface/95 dark:bg-inverse-surface/95 backdrop-blur flex flex-col items-center justify-center text-center p-8 z-20 animate-fade-in">
                  <div className="w-20 h-20 bg-primary-container/20 text-primary rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'wght' 600" }}>check_circle</span>
                  </div>
                  <h4 className="font-headline-md text-headline-md text-on-background dark:text-inverse-on-surface mb-2">Rahmat!</h4>
                  <p className="font-body-md text-body-md text-secondary dark:text-secondary-fixed">Xabaringiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog'lanamiz.</p>
                  <button className="mt-8 text-primary dark:text-primary-fixed-dim font-label-md hover:underline" onClick={() => setIsContactFormSubmitted(false)}>Yangi xabar yuborish</button>
                </div>
              )}
            </div>
          </div>
          
          {/* Map Section */}
          <div className="mt-section-gap">
            <div className="glass-effect rounded-2xl overflow-hidden shadow-lg border border-outline-variant/30 h-[450px] relative group">
              {/* Location Label Overlay */}
              <div className="absolute top-6 left-6 z-10 bg-surface-container-lowest/90 dark:bg-surface-container-low/90 backdrop-blur p-4 rounded-xl shadow-md border border-outline-variant/20 max-w-xs">
                <p className="font-label-md text-primary dark:text-primary-fixed-dim mb-1">Bizning ofisimiz</p>
                <p className="font-body-md text-on-surface dark:text-inverse-on-surface text-sm">Almath bosh ofisi zamonaviy markazda joylashgan.</p>
              </div>
              
              {/* Map Placeholder Image */}
              <div className="w-full h-full bg-surface-container-highest dark:bg-surface-container relative">
                <img className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700 opacity-80" alt="Map" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMSvc9TxVqctJn0c7saXAKw-LQ8KQGt6azf-1VMFNr2CA1pmv2ovI6kvHxjSML5pPSIilhjGk4VGW1kB4VXtzQ1VAyXPELtbBsTVKtSmDkFI5742VijzkJXbXmfSli7yopa312BrWD9yqsiuTBZJq71JfPK3gEpDNiDqLSBH8au1LtcyJYaPQ6tBEWGkNKlkV2fn3ZNrmG6uLqABpV76A3Uvw5VRivWppA1eWQKuwQikDO6kLUSz9t" />
                {/* Atmospheric Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 dark:from-inverse-surface/80 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="faq" className="pt-24 pb-section-gap bg-surface dark:bg-inverse-surface border-t border-outline-variant/20">
        <div className="max-w-[900px] mx-auto px-margin-mobile md:px-gutter">
          {/* Hero Section & Search */}
          <div className="text-center mb-stack-lg">
            <h2 className="font-display-md md:font-display-xl text-headline-lg-mobile md:text-display-xl text-on-background dark:text-inverse-on-surface mb-4 leading-tight">Qanday yordam bera olamiz?</h2>
            <p className="font-body-lg text-body-lg text-secondary dark:text-secondary-fixed max-w-2xl mx-auto mb-10">Almath platformasi haqida ko'p beriladigan savollarga javoblarni shu yerdan topishingiz mumkin.</p>
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                type="text" 
                value={searchFaq}
                onChange={(e) => setSearchFaq(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-none ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all bg-surface-container-lowest dark:bg-surface-container shadow-sm font-body-md text-body-md text-on-surface dark:text-inverse-on-surface" 
                placeholder="Savolingizni yozing..." 
              />
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-section-gap">
            <button className="px-6 py-3 rounded-full glass-effect hover:bg-primary-container/10 text-primary font-label-md transition-all active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">school</span> Kurslar
            </button>
            <button className="px-6 py-3 rounded-full glass-effect hover:bg-primary-container/10 text-secondary dark:text-secondary-fixed font-label-md transition-all active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">payments</span> To'lovlar
            </button>
            <button className="px-6 py-3 rounded-full glass-effect hover:bg-primary-container/10 text-secondary dark:text-secondary-fixed font-label-md transition-all active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">support_agent</span> Texnik yordam
            </button>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqData.map((group, groupIndex) => {
              const filteredItems = group.items.filter(item => 
                item.q.toLowerCase().includes(searchFaq.toLowerCase()) || 
                item.a.toLowerCase().includes(searchFaq.toLowerCase())
              );
              
              if (filteredItems.length === 0) return null;
              
              return (
                <div key={groupIndex} className="mb-10 animate-fade-in">
                  <h3 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface mb-6 flex items-center gap-3">
                    <span className={`w-1 h-8 ${group.color} rounded-full`}></span> {group.category}
                  </h3>
                  <div className="space-y-3">
                    {filteredItems.map((item, itemIndex) => {
                      const id = `${groupIndex}-${itemIndex}`;
                      return (
                        <FaqAccordionItem 
                          key={id}
                          question={item.q}
                          answer={item.a}
                          isOpen={openFaqIndex === id}
                          onClick={() => setOpenFaqIndex(openFaqIndex === id ? null : id)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-20 p-10 rounded-3xl bg-primary-container text-on-primary-container relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-md">
              <h4 className="font-headline-md text-headline-md font-bold mb-4">Hali ham savollaringiz bormi?</h4>
              <p className="font-body-md text-body-md opacity-90">Bizning qo'llab-quvvatlash jamoamiz haftasiga 7 kun, kuniga 24 soat xizmatingizda.</p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 rounded-full bg-on-primary-container text-primary font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">chat</span> Bizga yozing
              </button>
              <button className="px-8 py-4 rounded-full border-2 border-on-primary-container/30 hover:bg-on-primary-container/10 transition-colors font-bold">
                Aloqa sahifasi
              </button>
            </div>
            {/* Abstract light circles for effect */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-surface-container-lowest border-t border-outline-variant/20 py-12">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter flex flex-col md:flex-row justify-between items-center gap-stack-md">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-stack-md">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary overflow-hidden">
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
