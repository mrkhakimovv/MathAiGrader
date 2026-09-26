import React, { useState, useEffect } from 'react';
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
  ThumbsUp,
  MessageCircle,
  Eye,
  Layers,
  Brain,
  Lightbulb
} from 'lucide-react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

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

export function TeamView() {
  const [panjiLikes, setPanjiLikes] = useState<number>(0);
  const [quvonchbekLikes, setQuvonchbekLikes] = useState<number>(0);
  const [hasLikedPanji, setHasLikedPanji] = useState<boolean>(false);
  const [hasLikedQuvonchbek, setHasLikedQuvonchbek] = useState<boolean>(false);

  useEffect(() => {
    // Eski soxta/qo'lda kiritilgan raqamlarni tozalash (0 dan boshlanishi uchun)
    try {
      localStorage.removeItem('almath_panji_likes');
      localStorage.removeItem('almath_quvonchbek_likes');
    } catch {
      // ignore
    }

    const clientId = getClientId();

    // 1. Panji Soatov likes listener (0 dan boshlanadi va har bir like real-time hisoblanadi)
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

    // 2. Quvonchbek Hakimov likes listener (0 dan boshlanadi va har bir like real-time hisoblanadi)
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
      // Like'ni qaytarib olish (-1)
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
      // Yangi like qo'shish (+1)
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
      // Like'ni qaytarib olish (-1)
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
      // Yangi like qo'shish (+1)
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
              <div className="text-xl sm:text-2xl font-black">10+ Yil</div>
              <div className="text-xs text-indigo-200">Ta'lim tajribasi</div>
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
