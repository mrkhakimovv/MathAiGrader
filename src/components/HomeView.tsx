import React, { useState, useEffect } from 'react';
import { Info, Newspaper, ArrowRight, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function HomeView({ role, username }: { role: string | null, username: string | null }) {
  const [panjiViews, setPanjiViews] = useState<number>(0);
  const [quvonchbekViews, setQuvonchbekViews] = useState<number>(0);

  useEffect(() => {
    const trackAndFetchViews = async (personId: string, setViews: React.Dispatch<React.SetStateAction<number>>) => {
      try {
        const docRef = doc(db, 'team_views', personId);
        const docSnap = await getDoc(docRef);
        
        let viewers: string[] = [];
        if (docSnap.exists()) {
          viewers = docSnap.data().viewers || [];
        }

        if (username) {
          if (!viewers.includes(username)) {
            if (docSnap.exists()) {
              await updateDoc(docRef, { viewers: arrayUnion(username) });
            } else {
              await setDoc(docRef, { viewers: [username] });
            }
            setViews(viewers.length + 1);
          } else {
            setViews(viewers.length);
          }
        } else {
          setViews(viewers.length);
        }
      } catch (error) {
        console.warn("Could not track views:", error);
      }
    };

    trackAndFetchViews('panji', setPanjiViews);
    trackAndFetchViews('quvonchbek', setQuvonchbekViews);
  }, [username]);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-12">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Xush kelibsiz{username ? `, ${username}` : ''}!</h1>
        <p className="text-slate-600 dark:text-slate-400">ALMATH platformasining asosiy sahifasiga xush kelibsiz.</p>
      </header>

      <div className="w-full">
        {/* News Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Newspaper className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yangiliklar</h2>
          </div>
          
          <div className="space-y-6">
            <div className="group cursor-pointer bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800/50 font-serif">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 mb-1 block uppercase tracking-wider">Diqqat!</span>
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Texnik ishlar olib borilmoqda</h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-2">Dasturga bir nechta o'zgarishlar kiritilayotganligi sababli dastur ishlashida ba'zi bir uzilishlar va to'xtalishlar kuzatilishi mumkin. Agar ushbu muammolarga duch kelsangiz, biroz kuting va biroz vaqt o'tib qaytadan urinib ko'ring.</p>
            </div>
            
            <div className="group cursor-pointer">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 block">31 Iyul, 2026</span>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">ALMATH yangi versiyasi ishga tushirildi!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">Endilikda platformamiz orqali vazifalarni yanada oson tekshirishingiz va o'quvchilar o'zlashtirishini kuzatib borishingiz mumkin.</p>
            </div>
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>
            <div className="group cursor-pointer">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 block">28 Iyul, 2026</span>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Yangi vazifalar to'plami qo'shildi</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">O'quvchilar uchun matematika fanidan yangi va qiziqarli masalalar to'plami tizimga kiritildi. O'qituvchilar ulardan foydalanishlari mumkin.</p>
            </div>
            
            <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-4">
              Barcha yangiliklar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Bizning jamoamiz</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Muvaffaqiyatimiz ortida turgan tajribali ustozlar va texnologiya ixlosmandlari bilan tanishing.</p>
        </motion.div>
          
        <div className="grid sm:grid-cols-2 gap-8">
          {/* Team Member 1 */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50"
          >
            <div className="h-72 overflow-hidden relative">
              <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Panji Soatov" src="/xodim1.jpg"/>
            </div>
            <div className="p-8 relative">
              <div className="absolute -top-6 right-8 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500">
                <span className="material-symbols-outlined">star</span>
              </div>
              <h4 className="text-xl mb-1 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors font-bold">Panji Soatov</h4>
              <p className="text-blue-600 dark:text-blue-400 text-sm mb-4 uppercase tracking-wider font-semibold">Asoschi va CEO</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Ta'lim sohasida 8 yillik tajribaga ega. Almath platformasining g'oya muallifi va boshqaruvchisi.</p>
              <div className="flex justify-between items-center mt-auto">
                <div className="flex gap-3">
                  <a className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#0088cc] hover:text-white transition-all duration-300" href="https://t.me/panji_soatov" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                    <i className="bi bi-telegram text-lg"></i>
                  </a>
                  <a className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-all duration-300" href="https://instagram.com/soatov_matematika" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i className="bi bi-instagram text-lg"></i>
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  <span>{panjiViews}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Team Member 2 */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50"
          >
            <div className="h-72 overflow-hidden relative">
              <div className="absolute inset-0 bg-indigo-500/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Quvonchbek Hakimov" src="/xodim2.jpg"/>
            </div>
            <div className="p-8 relative">
              <div className="absolute -top-6 right-8 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500">
                <span className="material-symbols-outlined">code</span>
              </div>
              <h4 className="text-xl mb-1 text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors font-bold">Quvonchbek Hakimov</h4>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm mb-4 uppercase tracking-wider font-semibold">Texnik rahbar (CTO)</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Sun'iy intellekt va zamonaviy web texnologiyalar bo'yicha mutaxassis. Tizim arxitekturasi muallifi.</p>
              <div className="flex justify-between items-center mt-auto">
                <div className="flex gap-3">
                  <a className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#0088cc] hover:text-white transition-all duration-300" href="https://t.me/quvonchbek_hakimov" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                    <i className="bi bi-telegram text-lg"></i>
                  </a>
                  <a className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-all duration-300" href="https://instagram.com/hakimov_matematika" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i className="bi bi-instagram text-lg"></i>
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  <span>{quvonchbekViews}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
