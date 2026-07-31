import fs from 'fs';
const content = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf-8');

const targetStr = `        {/* Growth Timeline */}
        <div className="py-section-gap bg-surface dark:bg-inverse-surface">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              <div className="md:w-1/3 sticky top-32">
                <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg mb-6 text-on-background dark:text-inverse-on-surface">Rivojlanish yo'limiz</h2>
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
        </div>`;

const newContent = content.replace(targetStr, '');
fs.writeFileSync('src/components/WelcomeScreen.tsx', newContent);
console.log("Timeline deleted");
