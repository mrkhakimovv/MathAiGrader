#!/bin/bash
cat << 'INNER_EOF' > /tmp/patch_biz_haqimizda.tsx
      <section id="biz-haqimizda" className="pt-24 pb-section-gap overflow-x-hidden border-t border-outline-variant/20 bg-background dark:bg-inverse-surface">
        
        {/* Hero Section */}
        <div className="relative min-h-[70vh] flex items-center px-gutter py-section-gap">
          <div className="relative z-10 max-w-container-max mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1 bg-primary-container/10 text-primary dark:text-primary-fixed-dim rounded-full font-label-sm text-label-sm uppercase tracking-wider">Kelajak ta'limi</span>
              <h2 className="font-display-xl text-display-xl text-on-background dark:text-inverse-on-surface leading-tight">Bilim sari yangi <br/><span className="text-primary dark:text-primary-fixed-dim">matematik yo'l</span></h2>
              <p className="text-on-surface-variant dark:text-surface-variant font-body-lg text-body-lg max-w-xl">Almath — bu shunchaki platforma emas, bu matematik tafakkurni shakllantirish va murakkab masalalarni sodda hamda interaktiv usulda o'rganish makonidir.</p>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              <img className="w-full h-full object-cover" alt="Almath ta'lim" src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000"/>
            </div>
          </div>
        </div>

        {/* Bizning missiyamiz */}
        <div className="bg-surface-container-low dark:bg-surface-container-highest py-section-gap">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg mb-4 text-on-background dark:text-inverse-on-surface">Bizning missiyamiz</h2>
              <div className="h-1.5 w-24 bg-primary dark:bg-primary-fixed-dim mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-effect p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-secondary-container dark:bg-secondary-container/20 flex items-center justify-center rounded-2xl mb-6">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">lightbulb</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-4 text-on-surface dark:text-inverse-on-surface">Innovatsiya</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Eng so'nggi texnologiyalar va pedagogik metodikalarni birlashtirib, o'quvchilarga dunyo miqyosidagi bilim berish.</p>
              </div>
              <div className="glass-effect p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-secondary-container dark:bg-secondary-container/20 flex items-center justify-center rounded-2xl mb-6">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">verified</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-4 text-on-surface dark:text-inverse-on-surface">Sifat</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Har bir kurs va test materiallari ekspertlar tomonidan sinchkovlik bilan tekshirilib, yuqori sifat standartlariga muvofiqlashtiriladi.</p>
              </div>
              <div className="glass-effect p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-secondary-container dark:bg-secondary-container/20 flex items-center justify-center rounded-2xl mb-6">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-3xl">groups</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-4 text-on-surface dark:text-inverse-on-surface">Hamjamiyat</h3>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Matematika ixlosmandlarini birlashtiruvchi, bir-birini qo'llab-quvvatlovchi global o'quv muhitini yaratish.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Timeline */}
        <div className="py-section-gap bg-surface dark:bg-inverse-surface">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              <div className="md:w-1/3 sticky top-32">
                <h2 className="font-headline-lg text-headline-lg mb-6 text-on-background dark:text-inverse-on-surface">Rivojlanish yo'limiz</h2>
                <p className="text-on-surface-variant dark:text-surface-variant font-body-lg text-body-lg">G'oyadan platformagacha bo'lgan masofani biz qat'iyat va bilimga bo'lgan muhabbat bilan bosib o'tdik.</p>
                <div className="mt-8 flex gap-4">
                  <div className="p-4 bg-primary-container/10 dark:bg-primary-container/20 rounded-2xl">
                    <div className="text-primary dark:text-primary-fixed-dim font-bold text-headline-md">50k+</div>
                    <div className="text-on-surface-variant dark:text-surface-variant text-label-sm uppercase">O'quvchilar</div>
                  </div>
                  <div className="p-4 bg-primary-container/10 dark:bg-primary-container/20 rounded-2xl">
                    <div className="text-primary dark:text-primary-fixed-dim font-bold text-headline-md">200+</div>
                    <div className="text-on-surface-variant dark:text-surface-variant text-label-sm uppercase">Kurslar</div>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3 space-y-12">
                <div className="relative pl-12 border-l-2 border-primary-container/30 dark:border-primary-container/20 pb-12">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-primary dark:bg-primary-fixed-dim rounded-full outline outline-8 outline-primary-container/10 dark:outline-primary-container/20"></div>
                  <span className="text-primary dark:text-primary-fixed-dim font-bold font-headline-md">2021 — Poydevor</span>
                  <h4 className="font-headline-md text-headline-md mt-2 mb-4 text-on-background dark:text-inverse-on-surface">Birinchi qadamlar</h4>
                  <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Kichik bir jamoaning matematika ta'limini raqamlashtirish haqidagi orzusi va birinchi interaktiv darsliklarning yaratilishi.</p>
                </div>
                <div className="relative pl-12 border-l-2 border-primary-container/30 dark:border-primary-container/20 pb-12">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-primary dark:bg-primary-fixed-dim rounded-full opacity-60"></div>
                  <span className="text-primary dark:text-primary-fixed-dim font-bold font-headline-md">2022 — Kengayish</span>
                  <h4 className="font-headline-md text-headline-md mt-2 mb-4 text-on-background dark:text-inverse-on-surface">Platformaning ishga tushishi</h4>
                  <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Almath Beta versiyasi ishga tushirildi. Birinchi 10,000 foydalanuvchi va 50 ta fundamental kurs platformaga yuklandi.</p>
                </div>
                <div className="relative pl-12 border-l-2 border-primary-container/30 dark:border-primary-container/20 pb-12">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-primary dark:bg-primary-fixed-dim rounded-full opacity-40"></div>
                  <span className="text-primary dark:text-primary-fixed-dim font-bold font-headline-md">2023 — E'tirof</span>
                  <h4 className="font-headline-md text-headline-md mt-2 mb-4 text-on-background dark:text-inverse-on-surface">Yil ta'lim startapi</h4>
                  <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Milliy miqyosdagi mukofotlar va xalqaro oliygohlar bilan hamkorlik shartnomalarining imzolanishi.</p>
                </div>
                <div className="relative pl-12 border-l-2 border-primary-container/30 dark:border-primary-container/20">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-primary dark:bg-primary-fixed-dim rounded-full opacity-20"></div>
                  <span className="text-primary dark:text-primary-fixed-dim font-bold font-headline-md">2024 — Bugun</span>
                  <h4 className="font-headline-md text-headline-md mt-2 mb-4 text-on-background dark:text-inverse-on-surface">Global platforma</h4>
                  <p className="text-on-surface-variant dark:text-surface-variant font-body-md text-body-md">Sun'iy intellekt yordamida shaxsiylashtirilgan o'qitish tizimining joriy etilishi va Markaziy Osiyo bo'ylab yetakchilik.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Jamoamiz */}
        <div className="py-section-gap bg-surface-container-low dark:bg-surface-container-highest relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-gutter relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg mb-4 text-on-background dark:text-inverse-on-surface">Bizning jamoamiz</h2>
              <p className="text-on-surface-variant dark:text-surface-variant font-body-lg text-body-lg max-w-2xl mx-auto">Muvaffaqiyatimiz ortida turgan tajribali ustozlar va texnologiya ixlosmandlari bilan tanishing.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Team Member 1 */}
              <div className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="h-64 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Team member" src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"/>
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
              <div className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="h-64 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Team member" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"/>
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
              <div className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="h-64 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Team member" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600"/>
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
              <div className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="h-64 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Team member" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600"/>
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
              <h2 className="font-headline-lg text-headline-lg text-on-primary">Siz ham jamoamizning bir qismiga aylaning</h2>
              <p className="text-on-primary-container font-body-lg text-body-lg">Biz bilan birga kelajak ta'limini yarating va matematika dunyosini o'zgartiring.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-on-primary text-primary px-8 py-4 rounded-2xl font-label-md text-label-md hover:scale-105 transition-transform active:scale-95">Hozir boshlang</button>
                <button className="bg-transparent border-2 border-on-primary text-on-primary px-8 py-4 rounded-2xl font-label-md text-label-md hover:bg-on-primary/10 transition-colors active:scale-95">Biz bilan bog'lanish</button>
              </div>
            </div>
          </div>
        </div>
      </section>
INNER_EOF
