import React, { useState } from 'react';
import { 
  Users, 
  Star, 
  GraduationCap, 
  Zap, 
  Award, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Send, 
  ExternalLink,
  Heart,
  MessageCircle,
  Eye,
  Layers,
  Brain,
  Lightbulb
} from 'lucide-react';

export function TeamView() {
  const [panjiLikes, setPanjiLikes] = useState(() => {
    return parseInt(localStorage.getItem('almath_panji_likes') || '142', 10);
  });
  const [quvonchbekLikes, setQuvonchbekLikes] = useState(() => {
    return parseInt(localStorage.getItem('almath_quvonchbek_likes') || '168', 10);
  });
  const [hasLikedPanji, setHasLikedPanji] = useState(false);
  const [hasLikedQuvonchbek, setHasLikedQuvonchbek] = useState(false);

  const handleLikePanji = () => {
    if (!hasLikedPanji) {
      const next = panjiLikes + 1;
      setPanjiLikes(next);
      setHasLikedPanji(true);
      localStorage.setItem('almath_panji_likes', next.toString());
    }
  };

  const handleLikeQuvonchbek = () => {
    if (!hasLikedQuvonchbek) {
      const next = quvonchbekLikes + 1;
      setQuvonchbekLikes(next);
      setHasLikedQuvonchbek(true);
      localStorage.setItem('almath_quvonchbek_likes', next.toString());
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ALMATH Yetakchilari va Ustozlari</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Bizning jamoa
          </h1>

          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-2xl">
            Matematika fanini chuqur o'rganish va ilg'or sun'iy intellekt (AI) texnologiyalarini birlashtirib,
            har bir o'quvchiga individual hamda sifatli ta'lim imkoniyatini taqdim etuvchi asoschilar va mutaxassislar.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15">
              <div className="text-xl sm:text-2xl font-black">50,000+</div>
              <div className="text-xs text-indigo-200">Faol o'quvchilar</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15">
              <div className="text-xl sm:text-2xl font-black">200+</div>
              <div className="text-xs text-indigo-200">Video & Testlar</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15">
              <div className="text-xl sm:text-2xl font-black">99.4%</div>
              <div className="text-xs text-indigo-200">AI Tekshiruv aniqligi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15">
              <div className="text-xl sm:text-2xl font-black">8+ Yil</div>
              <div className="text-xs text-indigo-200">Metodik tajriba</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Team Members Grid */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Panji Soatov</h2>
                  <p className="text-indigo-200 text-sm font-medium mt-0.5">Asoschi va Bosh Ijrochi Direktor (CEO)</p>
                </div>
                <button
                  onClick={handleLikePanji}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    hasLikedPanji
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
                  }`}
                  title="Tashakkur bildirish"
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLikedPanji ? 'fill-current' : ''}`} />
                  <span>{panjiLikes}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-900/50">
                <GraduationCap className="w-4 h-4" />
                <span>8+ yillik pedagogik va metodik faoliyat</span>
              </div>

              <div className="space-y-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                <p>
                  <strong>Panji Soatov</strong> — Almath innovatsion matematika platformasining asoschisi va rahbari. Nufuzli ta'lim dargohlarida 8 yildan ziyod faoliyat yuritib, yuzlab o'quvchilarni Prezident va ixtisoslashtirilgan maktablar, Respublika hamda xalqaro matematika olimpiadalari, shuningdek Milliy Sertifikat (A+) imtihonlariga muvaffaqiyatli tayyorlagan.
                </p>
                <p>
                  Murakkab matematik teoremalar va tushunchalarni sodda, ko'rgazmali va mantiqiy usulda tushuntirish bo'yicha maxsus mualliflik metodikasi muallifi. Har bir o'quvchida mustaqil fikrlash va tahlil qilish salohiyatini yuksaltirishga intiladi.
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
                    Mualliflik metodikasi
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

            {/* Contacts & Social */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                @panji_soatov
              </span>
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Quvonchbek Hakimov</h2>
                  <p className="text-indigo-200 text-sm font-medium mt-0.5">Bosh tizim arxitektori va CTO</p>
                </div>
                <button
                  onClick={handleLikeQuvonchbek}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    hasLikedQuvonchbek
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
                  }`}
                  title="Tashakkur bildirish"
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLikedQuvonchbek ? 'fill-current' : ''}`} />
                  <span>{quvonchbekLikes}</span>
                </button>
              </div>
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

            {/* Contacts & Social */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                @hakimov_matematika
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Values & Principles Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Bizning asosiy prinsiplarimiz
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Almath jamoasining har bir a'zosi amal qiladigan qadriyatlar
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Ilmiy asoslangan innovatsiya</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Biz texnologiyalarni shunchaki qo'llamaymiz, balki ularni pedagogik maqsadlarga moslashtirib, o'quvchining haqiqiy tushunishiga erishamiz.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Shaffoflik va adolat</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Baholash, testlar va reyting tizimida to'liq xolislik ta'minlanadi. Har bir mehnat o'z vaqtida e'tirof etiladi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Doimiy rivojlanish</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Platforma har kuni yangilanadi, o'quvchilar va ustozlarning takliflari asosida yangi qulayliklar joriy etiladi.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-indigo-900/50 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <h4 className="text-lg sm:text-xl font-bold">Jamoamiz bilan bog'lanmoqchimisiz?</h4>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Takliflar, savollar yoki hamkorlik masalalari bo'yicha bizning jamoamiz doimo sizga yordam berishga tayyor.
          </p>
        </div>
        <a
          href="https://t.me/quvonchbek_hakimov"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Telegram orqali yozish</span>
        </a>
      </div>
    </div>
  );
}
